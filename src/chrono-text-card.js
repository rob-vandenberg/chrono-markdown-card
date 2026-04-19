import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live }                  from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';
import { unsafeHTML }            from 'https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module';

// ─── Version ──────────────────────────────────────────────────────────────────
const CARD_VERSION = '0.0.0';

// ─── Version History ──────────────────────────────────────────────────────────
// v0.0.0: Initial skeleton — imports, version, constants, helper classes, empty editor and card classes

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-TEXT-CARD %c v${CARD_VERSION} `,
  'background-color: #2980b9; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_FIELD = {
  label:            '',
  content:          '',
  color:            '#ffffff',
  font_size:        1.0,
  font_weight:      400,
  text_align:       'left',
  background_color: 'transparent',
  border_width:     0,
  border_style:     'solid',
  border_color:     '#444444',
  border_radius:    0,
  padding_top:      8,
  padding_bottom:   8,
  padding_left:     8,
  padding_right:    8,
  line_height:      1.4,
};

const DEFAULT_CONFIG = {
  background_color: '#1c1c1c',
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
      label:        'Title',
      content:      'Title',
      color:        '#aaaaaa',
      font_size:    1.1,
      font_weight:  500,
      text_align:   'center',
      padding_top:  10,
    },
    {
      ...DEFAULT_FIELD,
      label:        'Content',
      content:      'Content',
      color:        '#3498db',
      font_size:    1.5,
      font_weight:  600,
      text_align:   'center',
    },
  ],
};

// ─── ctParseNumber ────────────────────────────────────────────────────────────
// Mirrors ha-form-float._handleInput logic exactly.
// Returns the parsed number, undefined if the value is incomplete/invalid,
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
function ctButtonPicker(label, value, options, onChange, align = '') {
  return html`
    <div class="toggle-field" style=${align === 'end' ? 'justify-self:end' : ''}>
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
    const value = e.target.value ?? e.detail?.value;
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _fieldChanged(index, key, e) {
    if (!this._config) return;
    const value  = e.target.value ?? e.detail?.value;
    const fields = this._config.fields.map((f, i) => i === index ? { ...f, [key]: value } : f);
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _addField() {
    const index  = (this._config.fields ?? []).length;
    const fields = [...(this._config.fields ?? []), { ...DEFAULT_FIELD, label: `Field ${index + 1}` }];
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  _removeField(index) {
    const fields = this._config.fields.filter((_, i) => i !== index);
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  static styles = css`
    /* Editor styles — to be filled in */
  `;

  render() {
    if (!this._config) return html``;
    // Editor UI — to be filled in
    return html`<div>Editor placeholder</div>`;
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
    this._config      = null;
    this._hass        = null;
    this._fieldValues = [];
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
    // Card and field rendering — to be filled in
    return html`
      <div class="text-container">
        <div class="text-layer">
          <!-- fields rendered here -->
        </div>
      </div>
    `;
  }
}
customElements.define('chrono-text-card', ChronoTextCard);
