import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live }                  from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';
import { styleMap }              from 'https://unpkg.com/lit@2.0.0/directives/style-map.js?module';

// ─── Version ──────────────────────────────────────────────────────────────────
const CARD_VERSION = '0.1.24';

// ─── Version History ──────────────────────────────────────────────────────────
// v0.1.24: Replace inline cmSelectField with shadow DOM CmSelect custom element;
//          fixes cursor-reset-on-type; adds ▾/▴ chevron and keyboard navigation
// v0.1.22: Replace input with contenteditable div in combobox to fix width issue
// v0.1.21: Replace CmSelect custom element with inline Lit template combobox
//          to eliminate shadow DOM host sizing issues
// v0.1.20: Rebuild CmSelect as styled combobox (free text + dropdown options),
//          fix content textarea label, restore Title field default content
// v0.1.19: Add CmSelect component and cmSelectField helper; text-align and
//          border-style use select dropdowns instead of button group / text field
// v0.1.18: Register card with window.customCards for HA card picker, add getCardSize()
// v0.1.17: Remove hardcoded default colors in favor of HA CSS variable fallbacks;
//          add border-color fallback to .text-field
// v0.1.16: Split border shorthand into separate properties, add HA card CSS
//          variable fallbacks for background, border, radius, shadow
// v0.1.15: Switch to styleMap for dynamic styles, add link color CSS rule,
//          fix default content \n\n, empty color falls back to HA theme vars
// v0.1.14: Update all defaults to match HA markdown card styling exactly;
//          CmTextarea max-height 20 lines, resize: vertical
// v0.1.12: Replace CmTextarea textarea element with contenteditable div for
//          natural auto-growing without JavaScript
// v0.1.11: Textarea auto-resizes to content (max 8 lines), fix p margin to
//          preserve inter-paragraph spacing, update default Content field text
// v0.1.10: Project renamed to chrono-markdown-card; all ct- prefixes → cm-,
//          ChronoTextCard → ChronoMarkdownCard, chrono-text-card → chrono-markdown-card
// v0.1.9: Add line_breaks per-field toggle, Show+Line breaks on same row,
//         card settings wrapped in collapsible ha-expansion-panel open by default
// v0.1.8: Markdown support via ha-markdown-element; font-size inherits from
//         field container so headings scale relative to field font-size setting
// v0.0.7: Add chrono-cm-textarea component and cmTextArea helper, content field uses textarea
// v0.0.6: Add button-picker-field class (column layout) for cmButtonPicker,
//         toggle-field-in-text-row now targets button-picker-field
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
  `%c CHRONO-MARKDOWN-CARD %c v${CARD_VERSION} `,
  'background-color: #2980b9; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_FIELD = {
  name:             '',
  show:             true,
  line_breaks:      false,
  content:          '',
  color:            '',
  font_size:        1.0,
  font_weight:      400,
  text_align:       'left',
  line_height:      1.4,
  background_color: '',
  border_width:     0,
  border_style:     'solid',
  border_color:     '',
  border_radius:    12,
  padding_top:      8,
  padding_bottom:   8,
  padding_left:     8,
  padding_right:    8,
};

const DEFAULT_CONFIG = {
  background_color: '',
  border_width:     1,
  border_style:     'solid',
  border_color:     '',
  border_radius:    12,
  padding_top:      8,
  padding_bottom:   8,
  padding_left:     8,
  padding_right:    8,
  box_shadow:       '',
  fields: [
    {
      ...DEFAULT_FIELD,
      name:        'Title',
      show:        false,
      line_breaks: false,
      content:     'Title',
      color:       '',
      font_size:   1.68,
      font_weight: 400,
      text_align:  'left',
    },
    {
      ...DEFAULT_FIELD,
      name:        'Content',
      show:        true,
      line_breaks: false,
      content:     'The **Markdown** card allows you to write any text. You can style it **bold**, *italicized*, ~strikethrough~ etc. You can do images, links, and more.\n\nFor more information see the [Markdown Cheatsheet](https://commonmark.org/help).',
      color:       '',
      font_size:   1.0,
      font_weight: 400,
      text_align:  'left',
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

// ─── cmParseNumber ────────────────────────────────────────────────────────────
// Mirrors ha-form-float._handleInput logic exactly.
// Returns the parsed number, undefined if the value is empty,
// or null to signal "return early, do not fire config-changed".
function cmParseNumber(raw) {
  const v = String(raw).replace(',', '.');
  if (v === '-' || v === '-0' || v.endsWith('.')) return null;
  if (v.includes('.') && v.endsWith('0'))         return null;
  if (v === '')                                    return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ─── cmTextField ──────────────────────────────────────────────────────────────
function cmTextField(label, value, onChange, opts = {}) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <chrono-cm-textfield
        .value=${String(value ?? '')}
        type=${opts.type ?? 'text'}
        step=${opts.step ?? ''}
        min=${opts.min ?? ''}
        max=${opts.max ?? ''}
        @input=${onChange}
      ></chrono-cm-textfield>
    </div>
  `;
}

// ─── cmToggleField ────────────────────────────────────────────────────────────
function cmToggleField(label, checked, onChange, extraClass = '') {
  return html`
    <div class="toggle-field ${extraClass}">
      <label>${label}</label>
      <ha-switch .checked=${checked} @change=${onChange}></ha-switch>
    </div>
  `;
}

// ─── cmColorPicker ────────────────────────────────────────────────────────────
function cmColorPicker(label, value, onChange) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <div class="color-picker-row">
        <input type="color" .value=${value ?? '#ffffff'} @input=${onChange}>
        <chrono-cm-textfield
          .value=${String(value ?? '')}
          @input=${onChange}
        ></chrono-cm-textfield>
      </div>
    </div>
  `;
}

// ─── cmButtonPicker ───────────────────────────────────────────────────────────
function cmButtonPicker(label, value, options, onChange, align = '', extraClass = '') {
  return html`
    <div class="button-picker-field ${extraClass}" style=${align === 'end' ? 'justify-self:end' : ''}>
      <label>${label}</label>
      <chrono-cm-button-toggle-group
        .value=${value}
        .options=${options}
        @change=${onChange}
      ></chrono-cm-button-toggle-group>
    </div>
  `;
}

// ─── cmTextArea ───────────────────────────────────────────────────────────────
function cmTextArea(label, value, onChange) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <chrono-cm-textarea
        .value=${String(value ?? '')}
        @input=${onChange}
      ></chrono-cm-textarea>
    </div>
  `;
}

// ─── cmSelectField ────────────────────────────────────────────────────────────
// Thin wrapper — delegates all combobox behaviour to the CmSelect custom element.
function cmSelectField(label, value, options, onChange) {
  return html`
    <div class="text-field">
      <label>${label}</label>
      <chrono-cm-select
        .value=${value ?? ''}
        .options=${options}
        @change=${onChange}
      ></chrono-cm-select>
    </div>
  `;
}

// ─── ctTextfield component ────────────────────────────────────────────────────
class CmTextfield extends LitElement {
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
customElements.define('chrono-cm-textfield', CmTextfield);

// ─── chrono-cm-textarea component ─────────────────────────────────────────────
class CmTextarea extends LitElement {
  static properties = {
    value:       { type: String },
    placeholder: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
    .editor {
      display: block;
      width: 100%;
      box-sizing: border-box;
      min-height: calc(1 * 1.5em + 24px);
      max-height: calc(20 * 1.5em + 24px);
      padding: 12px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      overflow-y: auto;
      resize: vertical;
      white-space: pre-wrap;
      word-wrap: break-word;
      transition: border-bottom-color 0.2s;
    }
    .editor:focus {
      border-bottom: 2px solid var(--primary-color);
    }
    .editor:empty:before {
      content: attr(data-placeholder);
      color: var(--secondary-text-color);
      pointer-events: none;
    }
  `;

  updated(changedProps) {
    if (changedProps.has('value')) {
      const el = this.shadowRoot.querySelector('.editor');
      if (el && el.innerText !== this.value) {
        el.innerText = this.value ?? '';
      }
    }
  }

  render() {
    return html`
      <div
        class="editor"
        contenteditable="true"
        data-placeholder=${this.placeholder ?? ''}
        @input=${e => {
          this.value = e.target.innerText;
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        }}
      ></div>
    `;
  }
}
customElements.define('chrono-cm-textarea', CmTextarea);

// ─── ctButtonToggleGroup component ────────────────────────────────────────────
class CmButtonToggleGroup extends LitElement {
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
customElements.define('chrono-cm-button-toggle-group', CmButtonToggleGroup);

// ─── CmSelect component ───────────────────────────────────────────────────────
// Shadow DOM combobox. Modelled on CmTextfield — host fills grid cell via
// :host { display: block; width: 100%; }. All CSS self-contained in static styles.
class CmSelect extends LitElement {
  static properties = {
    value:   { type: String },
    options: { type: Array },
    _open:   { state: true },
    _cursor: { state: true },
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      position: relative;
    }

    .combobox {
      display: flex;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      background: var(--input-fill-color, rgba(0,0,0,0.06));
      border: none;
      border-bottom: 1px solid var(--secondary-text-color, #888);
      border-radius: 4px 4px 0 0;
      transition: border-bottom-color 0.2s;
    }

    .combobox:focus-within,
    .combobox-open {
      border-bottom: 2px solid var(--primary-color);
    }

    .combobox-input {
      flex: 1;
      height: 100%;
      padding: 0 8px 0 12px;
      background: transparent;
      border: none;
      color: var(--primary-text-color);
      font-size: 16px;
      font-family: inherit;
      outline: none;
      min-width: 0;
      box-sizing: border-box;
    }

    .combobox-chevron {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 100%;
      cursor: pointer;
      color: var(--secondary-text-color);
      font-size: 12px;
      flex-shrink: 0;
      user-select: none;
    }

    .combobox-chevron:hover {
      color: var(--primary-text-color);
    }

    .combobox-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 9999;
      background: var(--card-background-color, #1c1c1c);
      border: 1px solid var(--divider-color, #444);
      border-radius: 0 0 4px 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      max-height: 240px;
      overflow-y: auto;
      margin-top: 1px;
    }

    .combobox-option {
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      color: var(--primary-text-color);
      cursor: pointer;
      transition: background 0.1s;
    }

    .combobox-option:hover {
      background: var(--secondary-background-color, rgba(255,255,255,0.08));
    }

    .combobox-option-selected {
      color: var(--primary-color);
    }

    .combobox-option-cursor {
      background: var(--secondary-background-color, rgba(255,255,255,0.08));
    }
  `;

  constructor() {
    super();
    this.value   = '';
    this.options = [];
    this._open   = false;
    this._cursor = -1;
    this._onOutsideClick = this._onOutsideClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onOutsideClick);
  }

  _onOutsideClick(e) {
    if (!this.shadowRoot.contains(e.composedPath()[0]) && e.composedPath()[0] !== this) {
      this._open   = false;
      this._cursor = -1;
    }
  }

  _select(value) {
    this._open   = false;
    this._cursor = -1;
    this.dispatchEvent(new CustomEvent('change', {
      detail:   { value },
      bubbles:  true,
      composed: true,
    }));
  }

  _handleKeyDown(e) {
    const opts = this.options ?? [];

    if (!this._open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this._open   = true;
        this._cursor = 0;
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      this._cursor = Math.min(this._cursor + 1, opts.length - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      this._cursor = Math.max(this._cursor - 1, 0);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (this._cursor >= 0 && this._cursor < opts.length) {
        this._select(opts[this._cursor].value);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      this._open   = false;
      this._cursor = -1;
      e.preventDefault();
    }
  }

  render() {
    const opts = this.options ?? [];

    return html`
      <div class="combobox ${this._open ? 'combobox-open' : ''}">
        <input
          class="combobox-input"
          .value=${live(this.value ?? '')}
          @input=${e => {
            this.dispatchEvent(new CustomEvent('change', {
              detail:   { value: e.target.value },
              bubbles:  true,
              composed: true,
            }));
          }}
          @focus=${() => { this._open = true; }}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${() => { this._open = !this._open; this._cursor = -1; }}
          aria-hidden="true"
        >${this._open ? '▴' : '▾'}</div>
      </div>

      ${this._open ? html`
        <div class="combobox-dropdown">
          ${opts.map((opt, i) => html`
            <div
              class="combobox-option
                     ${opt.value === this.value ? 'combobox-option-selected' : ''}
                     ${i === this._cursor       ? 'combobox-option-cursor'   : ''}"
              @mousedown=${(e) => { e.preventDefault(); this._select(opt.value); }}
            >${opt.label}</div>
          `)}
        </div>
      ` : ''}
    `;
  }
}
customElements.define('chrono-cm-select', CmSelect);

// ─── Editor ───────────────────────────────────────────────────────────────────
class ChronoMarkdownCardEditor extends LitElement {
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
      const parsed = cmParseNumber(raw);
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
      const parsed = cmParseNumber(raw);
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
    const fields = [...(this._config.fields ?? []), { ...DEFAULT_FIELD, name: `Field ${index + 1}`, content: `Field ${index + 1}` }];
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
      grid-template-columns: 8fr 13fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .row-border {
      display: grid;
      grid-template-columns: 8fr 4fr 4fr 4fr;
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
      display: NONE;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .row-show {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 24px;
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
      grid-template-columns: 1fr 1fr;
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

    .color-picker-row chrono-cm-textfield {
      flex: 1;
    }

    /* ── Toggle fields (ha-switch: label left, switch right) ───────────────── */

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

    /* ── Button picker fields (label top, buttons below) ───────────────────── */

    .button-picker-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .button-picker-field label {
      font-size: 12px;
      font-weight: 600;
      color: var(--secondary-text-color);
    }

    /* ── Button picker in a text-field row (needs top alignment + padding) ── */

    .toggle-field-in-text-row {
      align-self: flex-start;
    }

    .toggle-field-in-text-row chrono-cm-button-toggle-group {
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
    { label: 'Left',    value: 'left'    },
    { label: 'Center',  value: 'center'  },
    { label: 'Right',   value: 'right'   },
    { label: 'Justify', value: 'justify' },
  ];

  _borderStyleOptions = [
    { label: 'Solid',  value: 'solid'  },
    { label: 'Dashed', value: 'dashed' },
    { label: 'Dotted', value: 'dotted' },
    { label: 'Double', value: 'double' },
    { label: 'Groove', value: 'groove' },
    { label: 'Ridge',  value: 'ridge'  },
    { label: 'Inset',  value: 'inset'  },
    { label: 'Outset', value: 'outset' },
    { label: 'None',   value: 'none'   },
  ];

  render() {
    if (!this._config) return html``;

    const c      = this._config;
    const fields = c.fields ?? [];

    return html`

      <!-- ── Card section ─────────────────────────────────────────────────── -->

      <ha-expansion-panel header="Card" outlined .expanded=${true}>

        <!-- Row 1: Background color / Box shadow -->
        <div class="row-bg-shadow">
          ${cmColorPicker('Background color', c.background_color, e => this._valueChanged('background_color', e))}
          ${cmTextField('Box shadow', c.box_shadow, e => this._valueChanged('box_shadow', e))}
        </div>

        <!-- Row 2: Border — color, width, radius, style -->
        <div class="row-border">
          ${cmColorPicker('Border color', c.border_color, e => this._valueChanged('border_color', e))}
          ${cmTextField('Width (px)', c.border_width, e => this._valueChanged('border_width', e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Radius (px)', c.border_radius, e => this._valueChanged('border_radius', e), { type: 'number', step: '1', min: '0' })}
          ${cmSelectField('Style', c.border_style, this._borderStyleOptions, e => this._valueChanged('border_style', e))}
        </div>

        <!-- Row 3: Padding -->
        <div class="row-padding">
          ${cmTextField('Padding top',    c.padding_top,    e => this._valueChanged('padding_top',    e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Padding bottom', c.padding_bottom, e => this._valueChanged('padding_bottom', e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Padding left',   c.padding_left,   e => this._valueChanged('padding_left',   e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Padding right',  c.padding_right,  e => this._valueChanged('padding_right',  e), { type: 'number', step: '1', min: '0' })}
        </div>

      </ha-expansion-panel>

      <!-- ── Fields section ───────────────────────────────────────────────── -->

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
            ${cmTextField('Name', field.name, e => this._fieldChanged(index, 'name', e))}
          </div>

          <!-- Row 2: Show / Line breaks toggles -->
          <div class="row-show">
            ${cmToggleField('Show',        field.show        ?? true, e => this._fieldToggled(index, 'show',        e))}
            ${cmToggleField('Line breaks', field.line_breaks ?? true, e => this._fieldToggled(index, 'line_breaks', e))}
          </div>

          <!-- Row 3: Content (full width, textarea) -->
          <div class="row-content">
            ${cmTextArea('Content (Markdown / HTML / Jinja2)', field.content, e => this._fieldChanged(index, 'content', e))}
          </div>

          <!-- Row 4: Typography — font size, font weight, line height, text align -->
          <div class="row-typography">
            ${cmTextField('Font size',      field.font_size,   e => this._fieldChanged(index, 'font_size',   e), { type: 'number', step: '0.1', min: '0' })}
            ${cmTextField('Font weight',    field.font_weight, e => this._fieldChanged(index, 'font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
            ${cmTextField('Line height',    field.line_height, e => this._fieldChanged(index, 'line_height', e), { type: 'number', step: '0.1', min: '0' })}
            ${cmSelectField('Text align', field.text_align, this._textAlignOptions, e => this._fieldChanged(index, 'text_align', e))}
          </div>

          <!-- Row 5: Colors -->
          <div class="row-colors">
            ${cmColorPicker('Color', field.color, e => this._fieldChanged(index, 'color', e))}
            ${cmColorPicker('Background color', field.background_color, e => this._fieldChanged(index, 'background_color', e))}
          </div>

          <!-- Row 6: Border — color, width, radius, style -->
          <div class="row-border">
            ${cmColorPicker('Border color', field.border_color,  e => this._fieldChanged(index, 'border_color', e))}
            ${cmTextField('Width (px)',     field.border_width,  e => this._fieldChanged(index, 'border_width',  e), { type: 'number', step: '1', min: '0' })}
            ${cmTextField('Radius (px)',    field.border_radius, e => this._fieldChanged(index, 'border_radius', e), { type: 'number', step: '1', min: '0' })}
            ${cmSelectField('Style',       field.border_style,  this._borderStyleOptions, e => this._fieldChanged(index, 'border_style',  e))}
          </div>

          <!-- Row 7: Padding -->
          <div class="row-padding">
            ${cmTextField('Padding top (px)',    field.padding_top,    e => this._fieldChanged(index, 'padding_top',    e), { type: 'number', step: '1', min: '0' })}
            ${cmTextField('Padding bottom (px)', field.padding_bottom, e => this._fieldChanged(index, 'padding_bottom', e), { type: 'number', step: '1', min: '0' })}
            ${cmTextField('Padding left (px)',   field.padding_left,   e => this._fieldChanged(index, 'padding_left',   e), { type: 'number', step: '1', min: '0' })}
            ${cmTextField('Padding right (px)',  field.padding_right,  e => this._fieldChanged(index, 'padding_right',  e), { type: 'number', step: '1', min: '0' })}
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
customElements.define('chrono-markdown-card-editor', ChronoMarkdownCardEditor);

// ─── Card ─────────────────────────────────────────────────────────────────────
class ChronoMarkdownCard extends LitElement {
  static properties = {
    _config:      { attribute: false },
    _fieldValues: { state: true },
  };

  static getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('chrono-markdown-card-editor');
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
      background-color: var(--ha-card-background, var(--card-background-color, white));
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
      border-width: var(--ha-card-border-width, 1px);
      border-style: solid;
      box-shadow: var(--ha-card-box-shadow, none);
    }
    .text-layer {
      display: flex;
      flex-direction: column;
    }
    .text-field {
      box-sizing: border-box;
      color: var(--primary-text-color);
      background-color: transparent;
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    }
    ha-markdown-element {
      font-size: inherit;
    }
    ha-markdown-element a {
      color: var(--markdown-link-color, var(--primary-color));
    }
    ha-markdown-element p:first-child {
      margin-top: 0;
    }
    ha-markdown-element p:last-child {
      margin-bottom: 0;
    }
  `;

  render() {
    if (!this._config) return html``;

    const c = this._config;

    const containerStyles = {
      'background-color': c.background_color || undefined,
      'border-width':     c.border_width !== undefined ? `${c.border_width}px` : undefined,
      'border-style':     c.border_style  || undefined,
      'border-color':     c.border_color  || undefined,
      'border-radius':    c.border_radius !== undefined ? `${c.border_radius}px` : undefined,
      'padding':          `${c.padding_top}px ${c.padding_right}px ${c.padding_bottom}px ${c.padding_left}px`,
      'box-shadow':       c.box_shadow    || undefined,
    };

    const fields = c.fields ?? [];

    return html`
      <div class="text-container" style=${styleMap(containerStyles)}>
        <div class="text-layer">
          ${fields.map((field, i) => {
            const fieldStyles = {
              'display':          field.show === false ? 'none' : undefined,
              'color':            field.color            || undefined,
              'font-size':        `${field.font_size}em`,
              'font-weight':      `${field.font_weight}`,
              'text-align':       field.text_align       || undefined,
              'line-height':      `${field.line_height}`,
              'background-color': field.background_color || undefined,
              'border-width':     field.border_width !== undefined ? `${field.border_width}px` : undefined,
              'border-style':     field.border_style  || undefined,
              'border-color':     field.border_color  || undefined,
              'border-radius':    field.border_radius !== undefined ? `${field.border_radius}px` : undefined,
              'padding':          `${field.padding_top}px ${field.padding_right}px ${field.padding_bottom}px ${field.padding_left}px`,
            };

            return html`
              <div class="text-field" style=${styleMap(fieldStyles)}>
                <ha-markdown-element .content=${this._fieldValues[i] ?? ''} ?breaks=${field.line_breaks !== false}></ha-markdown-element>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}
customElements.define('chrono-markdown-card', ChronoMarkdownCard);

// ─── Card registration ────────────────────────────────────────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
  type:        'chrono-markdown-card',
  name:        'Chrono Markdown Card',
  description: 'A flexible multi-field text card. Each field is independently styled and supports Markdown, HTML, and live Jinja2 templates.',
  preview:     true,
});
