import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live }                  from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';
import { unsafeHTML }            from 'https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module';

// ─── Version ──────────────────────────────────────────────────────────────────
const CARD_VERSION = '0.0.5';

// ─── Version History ──────────────────────────────────────────────────────────
// v0.0.5: toggle-field back to horizontal (matches compass), remove toggle-field-switch,
//         row-show margins match compass field-toggles-grid, Add button as plain styled button
// v0.0.4: Fix panel header vertical centering (remove *:first-child rules, use
//         margin-top on row-name instead), fix toggle-field back to column,
//         add toggle-field-switch for ha-switch horizontal layout
// v0.0.3: Fix panel spacing, toggle-field layout horizontal, show on own row,
//         text align button group top-aligned with padding-top in text row
// v0.0.2: label→name, add show toggle, content on full row, typography reorder,
//         border reorder, border style as plain text field, card bg default transparent
// v0.0.1: Full editor UI, card render, numeric field handling, DEFAULT_FIELD.background_color fix
// v0.0.0: Initial skeleton — imports, version, constants, helper classes, empty editor and card classes

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-TEXT-CARD %c v${CARD_VERSION} `,
  'background-color: #2980b9; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_FIELD = {
  name:             '',
  show:             true,
  content:          '',
  color:            '#ffffff',
  font_size:        1.0,
  font_weight:      400,
  text_align:       'left',
  line_height:      1.4,
  background_color: '#00000000',
  border_width:     0,
  border_style:     'solid',
  border_color:     '#444444',
  border_radius:    0,
  padding_top:      8,
  padding_bottom:   8,
  padding_left:     8,
  padding_right:    8,
};

const DEFAULT_CONFIG = {
  background_color: '#00000000',
  border_width:     1,
  border_style:     'solid',
  border_color:     '#444444',
  border_radius:    8,
  padding_top:      0,
  padding_bottom:   0,
  padding_left:     0,
  padding_right:    0,
  box_shadow:       'none',
  fields: [
    {
      ...DEFAULT_FIELD,
      name:         'Title',
      content:      'Title',
      color:        '#aaaaaa',
      font_size:    1.1,
      font_weight:  500,
      text_align:   'center',
      padding_top:  10,
    },
    {
      ...DEFAULT_FIELD,
      name:         'Content',
      content:      'Content',
      color:        '#3498db',
      font_size:    1.5,
      font_weight:  600,
      text_align:   'center',
    },
  ],
};

// ─── Numeric keys ─────────────────────────────────────────────────────────────
// Used by _valueChanged and _fieldChanged to decide whether to parse as number.
const NUMERIC_CONFIG_KEYS = new Set([
  'border_width', 'border_radius',
  'padding_top', 'padding_bottom', 'padding_left', 'padding_right',
]);

const NUMERIC_FIELD_KEYS = new Set([
  'font_size', 'font_weight', 'line_height',
  'border_width', 'border_radius',
  'padding_top', 'padding_bottom', 'padding_left', 'padding_right',
]);

// ─── ctParseNumber ────────────────────────────────────────────────────────────
// Mirrors ha-form-float._handleInput logic exactly.
// Returns the parsed number, undefined if the value is empty,
// or null to signal "return early, do not fire config-changed".
function ctParseNumber(raw) {
  const v = String(raw).replace(',', '.');
  if (v === '-' || v === '-0' || v.endsWith('.')) return null;
  if (v.includes('.') && v.endsWith('0'))         return null;
  if (v === '')                                    return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ─── ctTextField ──────────────────────────────────────────────────────────────
function ctTextField(label, value, onChange, opts = {}) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <chrono-tc-textfield
        .value=${String(value ?? '')}
        type=${opts.type ?? 'text'}
        step=${opts.step ?? ''}
        min=${opts.min ?? ''}
        max=${opts.max ?? ''}
        @input=${onChange}
      ></chrono-tc-textfield>
    </div>
  `;
}

// ─── ctToggleField ────────────────────────────────────────────────────────────
function ctToggleField(label, checked, onChange, extraClass = '') {
  return html`
    <div class="toggle-field ${extraClass}">
      <label>${label}</label>
      <ha-switch .checked=${checked} @change=${onChange}></ha-switch>
    </div>
  `;
}

// ─── ctColorPicker ────────────────────────────────────────────────────────────
function ctColorPicker(label, value, onChange) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <div class="color-picker-row">
        <input type="color" .value=${value ?? '#ffffff'} @input=${onChange}>
        <chrono-tc-textfield
          .value=${String(value ?? '')}
          @input=${onChange}
        ></chrono-tc-textfield>
      </div>
    </div>
  `;
}

// ─── ctButtonPicker ───────────────────────────────────────────────────────────
function ctButtonPicker(label, value, options, onChange, align = '', extraClass = '') {
  return html`
    <div class="toggle-field ${extraClass}" style=${align === 'end' ? 'justify-self:end' : ''}>
      <label>${label}</label>
      <chrono-tc-button-toggle-group
        .value=${value}
        .options=${options}
        @change=${onChange}
      ></chrono-tc-button-toggle-group>
    </div>
  `;
}

// ─── ctTextfield component ────────────────────────────────────────────────────
class CtTextfield extends LitElement {
  static properties = {
    value:       { type: String },
    type:        { type: String },
    step:        { type: String },
    min:         { type: String },
    max:         { type: String },
    placeholder: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    input {
      display: block;
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      padding: 0 12px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      transition: border-bottom-color 0.2s;
    }
    input:focus {
      border-bottom: 2px solid var(--primary-color);
    }
  `;

  render() {
    return html`
      <input
        .value=${live(this.value ?? '')}
        type=${this.type ?? 'text'}
        step=${this.step ?? ''}
        min=${this.min ?? ''}
        max=${this.max ?? ''}
        placeholder=${this.placeholder ?? ''}
        @input=${e => {
          this.value = e.target.value;
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        }}
      >
    `;
  }
}
customElements.define('chrono-tc-textfield', CtTextfield);

// ─── ctButtonToggleGroup component ────────────────────────────────────────────
class CtButtonToggleGroup extends LitElement {
  static properties = {
    value:   { type: String },
    options: { type: Array },
  };

  static styles = css`
    :host {
      display: inline-flex;
    }
    button {
      min-width: 70px;
      height: 36px;
      padding: 0 12px;
      border: none;
      border-left: 1px solid var(--ha-color-border-neutral-quiet, #444);
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      color: var(--primary-text-color);
      background: var(--ha-color-fill-primary-normal-resting, #002e3e);
      transition: background 0.15s;
    }
    button:first-child {
      border-left: none;
      border-radius: 9999px 0 0 9999px;
    }
    button:last-child {
      border-radius: 0 9999px 9999px 0;
    }
    button.only {
      border-radius: 9999px;
    }
    button.active {
      background: var(--ha-color-fill-primary-loud-resting, #009ac7);
    }
    button:not(.active):hover {
      background: var(--ha-color-fill-primary-quiet-hover, #004156);
    }
  `;

  render() {
    const opts = this.options ?? [];
    return html`${opts.map((opt, i) => {
      const isFirst  = i === 0;
      const isLast   = i === opts.length - 1;
      const isOnly   = opts.length === 1;
      const isActive = opt.value === this.value;
      const cls = [
        isActive ? 'active' : '',
        isOnly   ? 'only'   : (isFirst ? 'first' : (isLast ? 'last' : '')),
      ].filter(Boolean).join(' ');
      return html`<button class="${cls}" @click=${() => this._select(opt.value)}>${opt.label}</button>`;
    })}`;
  }

  _select(value) {
    this.value = value;
    this.dispatchEvent(new CustomEvent('change', { detail: { value }, bubbles: true, composed: true }));
  }
}
customElements.define('chrono-tc-button-toggle-group', CtButtonToggleGroup);

// ─── Editor ───────────────────────────────────────────────────────────────────
class ChronoTextCardEditor extends LitElement {
  static properties = {
    hass:    { attribute: false },
    _config: { state: true },
  };

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  _valueChanged(key, e) {
    if (!this._config) return;
    const raw = e.target.value ?? e.detail?.value;
    let value;
    if (NUMERIC_CONFIG_KEYS.has(key)) {
      const parsed = ctParseNumber(raw);
      if (parsed === null)      return;
      if (parsed === undefined) value = DEFAULT_CONFIG[key];
      else                      value = parsed;
    } else {
      value = raw;
    }
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _fieldChanged(index, key, e) {
    if (!this._config) return;
    const raw = e.target.value ?? e.detail?.value;
    let value;
    if (NUMERIC_FIELD_KEYS.has(key)) {
      const parsed = ctParseNumber(raw);
      if (parsed === null)      return;
      if (parsed === undefined) value = DEFAULT_FIELD[key];
      else                      value = parsed;
    } else {
      value = raw;
    }
    const fields = this._config.fields.map((f, i) => i === index ? { ...f, [key]: value } : f);
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _fieldToggled(index, key, e) {
    if (!this._config) return;
    const value  = e.target.checked;
    const fields = this._config.fields.map((f, i) => i === index ? { ...f, [key]: value } : f);
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _addField() {
    const index  = (this._config.fields ?? []).length;
    const fields = [...(this._config.fields ?? []), { ...DEFAULT_FIELD, name: `Field ${index + 1}` }];
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _removeField(index) {
    const fields = this._config.fields.filter((_, i) => i !== index);
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  static styles = css`

    /* ── Expansion panel spacing ───────────────────────────────────────────── */

    ha-expansion-panel {
      margin-top: 8px;
    }

    /* ── Grid rows ─────────────────────────────────────────────────────────── */

    .row-bg-shadow {
      display: grid;
      grid-template-columns: 3fr 1fr 3fr 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .row-border {
      display: grid;
      grid-template-columns: 3fr 1fr 1fr 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .row-padding {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .row-name {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .row-show {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 28px;
      margin-bottom: 16px;
    }

    .row-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .row-colors {
      display: grid;
      grid-template-columns: 3fr 1fr 3fr 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .row-typography {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    /* ── Section headings ──────────────────────────────────────────────────── */

    .section-title {
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 16px 0 8px 0;
    }

    /* ── Text fields ───────────────────────────────────────────────────────── */

    .text-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .text-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    /* ── Color picker row ──────────────────────────────────────────────────── */

    .color-picker-row {
      display: flex;
      align-items: stretch;
      gap: 6px;
    }

    .color-picker-row input[type="color"] {
      width: 40px;
      min-width: 40px;
      height: 56px;
      padding: 4px;
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      cursor: pointer;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .color-picker-row chrono-tc-textfield {
      flex: 1;
    }

    /* ── Toggle fields ─────────────────────────────────────────────────────── */

    .toggle-field {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
    }

    .toggle-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    /* ── Button picker in a text-field row (needs top alignment + padding) ── */

    .toggle-field-in-text-row {
      align-self: flex-start;
    }

    .toggle-field-in-text-row label {
      margin-bottom: 4px;
    }

    .toggle-field-in-text-row chrono-tc-button-toggle-group {
      padding-top: 10px;
    }

    /* ── Add / Remove field buttons ────────────────────────────────────────── */

    .add-field-row {
      display: flex;
      justify-content: center;
      margin-top: 12px;
      margin-bottom: 4px;
    }

    .add-field-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.875rem;
      font-weight: 500;
      font-family: inherit;
      letter-spacing: 0.0892857em;
      text-transform: uppercase;
      height: 36px;
      padding: 0 8px;
      cursor: pointer;
      border-radius: 4px;
    }

    .add-field-btn:hover {
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
    }

    /* ── Expansion panel header (remove button) ────────────────────────────── */

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .panel-header span {
      font-size: 14px;
    }

    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--secondary-text-color);
      padding: 4px 8px;
      font-size: 18px;
      line-height: 1;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }

    .remove-btn:hover:not(:disabled) {
      color: var(--error-color, #f44336);
      background: rgba(244, 67, 54, 0.08);
    }

    .remove-btn:disabled {
      opacity: 0.3;
      cursor: default;
    }

  `;

  // ── Option arrays (defined once, reused in render) ─────────────────────────
  _textAlignOptions = [
    { label: 'L', value: 'left'   },
    { label: 'C', value: 'center' },
    { label: 'R', value: 'right'  },
  ];

  render() {
    if (!this._config) return html``;

    const c      = this._config;
    const fields = c.fields ?? [];

    return html`

      <!-- ── Card section ─────────────────────────────────────────────────── -->

      <div class="section-title">Card</div>

      <!-- Row 1: Background color / Box shadow -->
      <div class="row-bg-shadow">
        ${ctColorPicker('Background color', c.background_color, e => this._valueChanged('background_color', e))}
        <div></div>
        ${ctTextField('Box shadow', c.box_shadow, e => this._valueChanged('box_shadow', e))}
        <div></div>
      </div>

      <!-- Row 2: Border — color, width, radius, style -->
      <div class="row-border">
        ${ctColorPicker('Border color', c.border_color, e => this._valueChanged('border_color', e))}
        ${ctTextField('Width (px)', c.border_width, e => this._valueChanged('border_width', e), { type: 'number', step: '1', min: '0' })}
        ${ctTextField('Radius (px)', c.border_radius, e => this._valueChanged('border_radius', e), { type: 'number', step: '1', min: '0' })}
        ${ctTextField('Style', c.border_style, e => this._valueChanged('border_style', e))}
      </div>

      <!-- Row 3: Padding -->
      <div class="row-padding">
        ${ctTextField('Padding top (px)',    c.padding_top,    e => this._valueChanged('padding_top',    e), { type: 'number', step: '1', min: '0' })}
        ${ctTextField('Padding bottom (px)', c.padding_bottom, e => this._valueChanged('padding_bottom', e), { type: 'number', step: '1', min: '0' })}
        ${ctTextField('Padding left (px)',   c.padding_left,   e => this._valueChanged('padding_left',   e), { type: 'number', step: '1', min: '0' })}
        ${ctTextField('Padding right (px)',  c.padding_right,  e => this._valueChanged('padding_right',  e), { type: 'number', step: '1', min: '0' })}
      </div>

      <!-- ── Fields section ───────────────────────────────────────────────── -->

      <div class="section-title">Fields</div>

      ${fields.map((field, index) => html`
        <ha-expansion-panel outlined>

          <div class="panel-header" slot="header">
            <span>${field.name || `Field ${index + 1}`}</span>
            <button
              class="remove-btn"
              ?disabled=${fields.length <= 1}
              @click=${e => { e.stopPropagation(); this._removeField(index); }}
            >✕</button>
          </div>

          <!-- Row 1: Name (full width) -->
          <div class="row-name">
            ${ctTextField('Name', field.name, e => this._fieldChanged(index, 'name', e))}
          </div>

          <!-- Row 2: Show toggle -->
          <div class="row-show">
            ${ctToggleField('Show', field.show ?? true, e => this._fieldToggled(index, 'show', e))}
          </div>

          <!-- Row 3: Content (full width) -->
          <div class="row-content">
            ${ctTextField('Content (HTML / Jinja2)', field.content, e => this._fieldChanged(index, 'content', e))}
          </div>

          <!-- Row 4 (was 3): Colors -->
          <div class="row-colors">
            ${ctColorPicker('Color', field.color, e => this._fieldChanged(index, 'color', e))}
            <div></div>
            ${ctColorPicker('Background color', field.background_color, e => this._fieldChanged(index, 'background_color', e))}
            <div></div>
          </div>

          <!-- Row 5 (was 4): Typography — font size, font weight, line height, text align -->
          <div class="row-typography">
            ${ctTextField('Font size (em)',  field.font_size,   e => this._fieldChanged(index, 'font_size',   e), { type: 'number', step: '0.1', min: '0' })}
            ${ctTextField('Font weight',     field.font_weight, e => this._fieldChanged(index, 'font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
            ${ctTextField('Line height',     field.line_height, e => this._fieldChanged(index, 'line_height', e), { type: 'number', step: '0.1', min: '0' })}
            ${ctButtonPicker('Text align', field.text_align, this._textAlignOptions, e => this._fieldChanged(index, 'text_align', e), '', 'toggle-field-in-text-row')}
          </div>

          <!-- Row 6 (was 5): Border — color, width, radius, style -->
          <div class="row-border">
            ${ctColorPicker('Border color', field.border_color, e => this._fieldChanged(index, 'border_color', e))}
            ${ctTextField('Width (px)',   field.border_width,  e => this._fieldChanged(index, 'border_width',  e), { type: 'number', step: '1', min: '0' })}
            ${ctTextField('Radius (px)', field.border_radius, e => this._fieldChanged(index, 'border_radius', e), { type: 'number', step: '1', min: '0' })}
            ${ctTextField('Style',       field.border_style,  e => this._fieldChanged(index, 'border_style',  e))}
          </div>

          <!-- Row 7 (was 6): Padding -->
          <div class="row-padding">
            ${ctTextField('Padding top (px)',    field.padding_top,    e => this._fieldChanged(index, 'padding_top',    e), { type: 'number', step: '1', min: '0' })}
            ${ctTextField('Padding bottom (px)', field.padding_bottom, e => this._fieldChanged(index, 'padding_bottom', e), { type: 'number', step: '1', min: '0' })}
            ${ctTextField('Padding left (px)',   field.padding_left,   e => this._fieldChanged(index, 'padding_left',   e), { type: 'number', step: '1', min: '0' })}
            ${ctTextField('Padding right (px)',  field.padding_right,  e => this._fieldChanged(index, 'padding_right',  e), { type: 'number', step: '1', min: '0' })}
          </div>

        </ha-expansion-panel>
      `)}

      <!-- ── Add field button ──────────────────────────────────────────────── -->

      <div class="add-field-row">
        <button class="add-field-btn" @click=${this._addField}>+ Add field</button>
      </div>

    `;
  }
}
customElements.define('chrono-text-card-editor', ChronoTextCardEditor);

// ─── Card ─────────────────────────────────────────────────────────────────────
class ChronoTextCard extends LitElement {
  static properties = {
    _config:      { attribute: false },
    _fieldValues: { state: true },
  };

  static getConfigElement() {
    return document.createElement('chrono-text-card-editor');
  }

  static getStubConfig() {
    return { ...DEFAULT_CONFIG };
  }

  constructor() {
    super();
    this._config         = null;
    this._hass           = null;
    this._fieldValues    = [];
    this._templateUnsubs = [];
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && this._templateUnsubs.length === 0) {
      this._setupSubscriptions();
    }
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    this._teardownSubscriptions();
    this._config = { ...DEFAULT_CONFIG, ...config };
    if (this._hass) {
      this._setupSubscriptions();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass && this._config && this._templateUnsubs.length === 0) {
      this._setupSubscriptions();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._teardownSubscriptions();
  }

  _setupSubscriptions() {
    this._teardownSubscriptions();
    const fields = this._config.fields ?? [];
    this._fieldValues = new Array(fields.length).fill('');

    const sub = (template, callback) => {
      const tmpl = String(template);
      if (!tmpl.includes('{{')) {
        callback(tmpl);
        return;
      }
      const unsub = this._hass.connection.subscribeMessage(
        (msg) => callback(msg.result),
        { type: 'render_template', template: tmpl }
      );
      this._templateUnsubs.push(unsub);
    };

    fields.forEach((field, i) => {
      sub(field.content, (value) => {
        this._fieldValues = this._fieldValues.map((v, idx) => idx === i ? value : v);
        this.requestUpdate();
      });
    });
  }

  _teardownSubscriptions() {
    this._templateUnsubs.forEach(unsub => {
      try {
        const result = unsub();
        if (result && typeof result.catch === 'function') {
          result.catch(() => {});
        }
      } catch (e) {}
    });
    this._templateUnsubs = [];
  }

  static styles = css`
    :host {
      display: block;
    }
    .text-container {
      box-sizing: border-box;
      position: relative;
    }
    .text-layer {
      display: flex;
      flex-direction: column;
    }
    .text-field {
      box-sizing: border-box;
    }
  `;

  render() {
    if (!this._config) return html``;

    const c = this._config;

    const containerStyle = [
      `background-color: ${c.background_color}`,
      `border: ${c.border_width}px ${c.border_style} ${c.border_color}`,
      `border-radius: ${c.border_radius}px`,
      `padding: ${c.padding_top}px ${c.padding_right}px ${c.padding_bottom}px ${c.padding_left}px`,
      `box-shadow: ${c.box_shadow}`,
    ].join('; ');

    const fields = c.fields ?? [];

    return html`
      <div class="text-container" style="${containerStyle}">
        <div class="text-layer">
          ${fields.map((field, i) => {
            const fieldStyle = [
              field.show === false ? 'display: none' : '',
              `color: ${field.color}`,
              `font-size: ${field.font_size}em`,
              `font-weight: ${field.font_weight}`,
              `text-align: ${field.text_align}`,
              `line-height: ${field.line_height}`,
              `background-color: ${field.background_color}`,
              `border: ${field.border_width}px ${field.border_style} ${field.border_color}`,
              `border-radius: ${field.border_radius}px`,
              `padding: ${field.padding_top}px ${field.padding_right}px ${field.padding_bottom}px ${field.padding_left}px`,
            ].filter(Boolean).join('; ');

            return html`
              <div class="text-field" style="${fieldStyle}">
                ${unsafeHTML(this._fieldValues[i] ?? '')}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}
customElements.define('chrono-text-card', ChronoTextCard);
