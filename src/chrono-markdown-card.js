import { LitElement, html, css } from 'https://unpkg.com/lit@2.0.0/index.js?module';
import { live }                  from 'https://unpkg.com/lit@2.0.0/directives/live.js?module';
import { styleMap }              from 'https://unpkg.com/lit@2.0.0/directives/style-map.js?module';
import { unsafeHTML }            from 'https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module';
import { marked }                from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

// ─── Version ──────────────────────────────────────────────────────────────────
const CARD_VERSION = '0.4.43';

// ─── MDI icon paths ───────────────────────────────────────────────────────────
const mdiDragHorizontalVariant = 'M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z';

// ─── Version History ──────────────────────────────────────────────────────────
// v0.4.43: Set card and field padding defaults; add letter_spacing field;
//          set Title field font_size and padding_bottom defaults;
//          set card border defaults
// v0.4.42: Remove all explicit non-empty styling values from default fields;
//          all fields now start fully empty, falling back to HA defaults
// v0.4.41: All DEFAULT_FIELD numeric values set to ''; remove DEFAULT_CONFIG/
//          DEFAULT_FIELD merges from setConfig in both editor and card so empty
//          values are preserved and fall back to HA defaults
// v0.4.40: Allow empty values for all fields; empty numeric fields stored as ''
//          and omitted from styleMap; padding split into four individual
//          properties; cmParseNumber updated accordingly
// v0.3.37: Allow removing all fields including the last one
// v0.3.36: Replace ha-markdown-element with marked.js + unsafeHTML for full
//          HTML support including style attributes; Markdown, HTML and Jinja2
//          all fully supported without sanitization
// v0.2.35: Simplify cmColorPicker: remove CSS variable resolution, use #000000
//          as swatch fallback when value is empty, guard @change to prevent
//          #000000 from being written to config
// v0.2.34: Fix color swatch console error; resolve CSS variable fallback color
//          for swatch display when color field is empty
// v0.2.28: Unsubscribe type guard; fix line_breaks editor default; fix stale
//          WebSocket subscriptions on reconnect; smart content-aware re-subscription
//          guard in setConfig (only re-subscribes when a content field changes
//          and either old or new value contains a template); fix CmTextarea
//          cursor reset; replace panel header buttons with ha-sortable
//          drag-and-drop; add Remove field button; fix color swatch console error
// v0.1.25: Fix CmSelect: tab no longer opens dropdown; selected value written to
//          input; chevron click focuses input; tab-away closes dropdown
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

// ─── Console log ──────────────────────────────────────────────────────────────
console.info(
  `%c CHRONO-%cMARKDOWN%c-CARD %c v${CARD_VERSION} `,
  'background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 0 2px 4px; border-radius: 3px 0 0 3px;',
  'background-color: #101010; color: #4676d3; font-weight: bold; padding: 2px 0;',
  'background-color: #101010; color: #FFFFFF; font-weight: bold; padding: 2px 4px 2px 0;',
  'background-color: #1E1E1E; color: #FFFFFF; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;'
);

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_FIELD = {
  name:             '',
  show:             true,
  line_breaks:      false,
  content:          '',
  color:            '',
  font_size:        '',
  font_weight:      '',
  text_align:       '',
  line_height:      '',
  letter_spacing:   '-0.012em',
  background_color: '',
  border_width:     '',
  border_style:     '',
  border_color:     '',
  border_radius:    '',
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
  padding_top:      4,
  padding_bottom:   8,
  padding_left:     8,
  padding_right:    8,
  box_shadow:       '',
  fields: [
    {
      ...DEFAULT_FIELD,
      name:           'Title',
      show:           false,
      line_breaks:    false,
      content:        'Title',
      font_size:      1.7,
      padding_bottom: 12,
    },
    {
      ...DEFAULT_FIELD,
      name:        'Content',
      show:        true,
      line_breaks: false,
      content:     'The **Markdown** card allows you to write any text. You can style it **bold**, *italicized*, ~strikethrough~ etc. You can do images, links, and more.\n\nFor more information see the [Markdown Cheatsheet](https://commonmark.org/help).',
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
// Returns the parsed number, '' if the value is empty (stored as-is in config),
// or null to signal "return early, do not fire config-changed".
function cmParseNumber(raw) {
  const v = String(raw).replace(',', '.');
  if (v === '-' || v === '-0' || v.endsWith('.')) return null;
  if (v.includes('.') && v.endsWith('0'))         return null;
  if (v === '')                                    return '';
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ─── cmTextField ──────────────────────────────────────────────────────────────
function cmTextField(label, value, onChange, opts = {}) {
  return html`
    <div class="text-field">
      <label>${unsafeHTML(label)}</label>
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
      <label>${unsafeHTML(label)}</label>
      <ha-switch .checked=${checked} @change=${onChange}></ha-switch>
    </div>
  `;
}

// ─── cmColorPicker ────────────────────────────────────────────────────────────
function cmColorPicker(label, value, onChange) {
  const swatchValue = value || '#000000';
  return html`
    <div class="text-field">
      <label>${unsafeHTML(label)}</label>
      <div class="color-picker-row">
        <input type="color" .value=${swatchValue} @input=${onChange}
          @change=${(e) => { if (e.target.value !== '#000000') onChange(e); }}>
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
      <label>${unsafeHTML(label)}</label>
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
      <label>${unsafeHTML(label)}</label>
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
      <label>${unsafeHTML(label)}</label>
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
      if (el && el !== document.activeElement && el.innerText !== this.value) {
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
    this.value   = value;
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
          @blur=${() => { this._open = false; this._cursor = -1; }}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${() => { this._open = !this._open; this._cursor = -1; this.shadowRoot.querySelector('.combobox-input').focus(); }}
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
    this._config = config;
  }

  _valueChanged(key, e) {
    if (!this._config) return;
    const raw = e.target.value ?? e.detail?.value;
    let value;
    if (NUMERIC_CONFIG_KEYS.has(key)) {
      const parsed = cmParseNumber(raw);
      if (parsed === null) return;
      value = parsed;
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
      if (parsed === null) return;
      value = parsed;
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

  _fieldMoved(e) {
    e.stopPropagation();
    const { oldIndex, newIndex } = e.detail;
    const fields = [...this._config.fields];
    fields.splice(newIndex, 0, fields.splice(oldIndex, 1)[0]);
    this._config = { ...this._config, fields };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }

  static styles = css`

    /* ── Expansion panel spacing ───────────────────────────────────────────── */

    ha-expansion-panel {
      margin-top: 8px;
    }

    /* ── Grid rows ─────────────────────────────────────────────────────────── */

    .card-bg-color-padding {
      display: grid;
      grid-template-columns: 11fr 4fr 4fr 4fr 4fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .card-border-styling {
      display: grid;
      grid-template-columns: 12fr 5fr 5fr 8fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .field-name {
      display: NONE;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .field-show-toggles {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 16px;
      margin-bottom: 24px;
    }

    .field-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .field-typography {
      display: grid;
      grid-template-columns: 11fr 5fr 6fr 5fr 8fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .field-bg-color-padding {
      display: grid;
      grid-template-columns: 11fr 4fr 4fr 4fr 4fr;
      gap: 8px;
      align-items: end;
      margin-bottom: 8px;
    }

    .field-border-styling {
      display: grid;
      grid-template-columns: 12fr 5fr 5fr 8fr;
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
      white-space: pre-line;
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

    /* ── Add field button ──────────────────────────────────────────────────── */

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

    /* ── Drag handle ───────────────────────────────────────────────────────── */

    .handle {
      cursor: move;
      cursor: grab;
      padding: 0 4px;
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
    }

    .handle > * {
      pointer-events: none;
    }

    /* ── Remove field button ───────────────────────────────────────────────── */

    .remove-field-row {
      display: flex;
      justify-content: center;
      margin-top: 8px;
      margin-bottom: 4px;
    }

    .remove-field-btn {
      background: none;
      border: none;
      color: var(--error-color, #f44336);
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

    .remove-field-btn:hover:not(:disabled) {
      background: rgba(244, 67, 54, 0.08);
    }

    .remove-field-btn:disabled {
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

        <!-- Row 1: Background color / Padding -->
        <div class="card-bg-color-padding">
          ${cmColorPicker('Background color\n<i>leave empty for default</i>', c.background_color, e => this._valueChanged('background_color', e))}
          ${cmTextField('Padding\ntop (px)',    c.padding_top,    e => this._valueChanged('padding_top',    e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Padding bottom (px)', c.padding_bottom, e => this._valueChanged('padding_bottom', e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Padding left (px)',   c.padding_left,   e => this._valueChanged('padding_left',   e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Padding right (px)',  c.padding_right,  e => this._valueChanged('padding_right',  e), { type: 'number', step: '1', min: '0' })}
        </div>

        <!-- Row 2: Border — color, width, radius, style -->
        <div class="card-border-styling">
          ${cmColorPicker('Border color', c.border_color, e => this._valueChanged('border_color', e))}
          ${cmTextField('Width (px)', c.border_width, e => this._valueChanged('border_width', e), { type: 'number', step: '1', min: '0' })}
          ${cmTextField('Radius (px)', c.border_radius, e => this._valueChanged('border_radius', e), { type: 'number', step: '1', min: '0' })}
          ${cmSelectField('Border style', c.border_style, this._borderStyleOptions, e => this._valueChanged('border_style', e))}
        </div>

      </ha-expansion-panel>

      <!-- ── Fields section ───────────────────────────────────────────────── -->

      <ha-sortable handle-selector=".handle" @item-moved=${this._fieldMoved}>
        <div class="fields-list">
          ${fields.map((field, index) => html`
            <ha-expansion-panel outlined header=${field.name || `Field ${index + 1}`}>

              <div class="handle" slot="leading-icon">
                <ha-svg-icon .path=${mdiDragHorizontalVariant}></ha-svg-icon>
              </div>

              <!-- Row 1: Name (full width) -->
              <div class="field-name">
                ${cmTextField('Name', field.name, e => this._fieldChanged(index, 'name', e))}
              </div>

              <!-- Row 2: Show / Line breaks toggles -->
              <div class="field-show-toggles">
                ${cmToggleField('Show',        field.show        ?? true,  e => this._fieldToggled(index, 'show',        e))}
                ${cmToggleField('Line breaks', field.line_breaks ?? false, e => this._fieldToggled(index, 'line_breaks', e))}
              </div>

              <!-- Row 3: Content (full width, textarea) -->
              <div class="field-content">
                ${cmTextArea('Content (supports Markdown, HTML and Jinja2)', field.content, e => this._fieldChanged(index, 'content', e))}
              </div>

              <!-- Row 4: Typography — font color, font size, font weight, line height, text align -->
              <div class="field-typography">
                ${cmColorPicker('Font color', field.color, e => this._fieldChanged(index, 'color', e))}
                ${cmTextField('Font size',      field.font_size,   e => this._fieldChanged(index, 'font_size',   e), { type: 'number', step: '0.1', min: '0' })}
                ${cmTextField('Font weight',    field.font_weight, e => this._fieldChanged(index, 'font_weight', e), { type: 'number', step: '100', min: '100', max: '900' })}
                ${cmTextField('Line height',    field.line_height, e => this._fieldChanged(index, 'line_height', e), { type: 'number', step: '0.1', min: '0' })}
                ${cmSelectField('Text align', field.text_align, this._textAlignOptions, e => this._fieldChanged(index, 'text_align', e))}
              </div>

              <!-- Row 5: Background color and padding -->
              <div class="field-bg-color-padding">
                ${cmColorPicker('Background color', field.background_color, e => this._fieldChanged(index, 'background_color', e))}
                ${cmTextField('Padding\ntop (px)',    field.padding_top,    e => this._fieldChanged(index, 'padding_top',    e), { type: 'number', step: '1', min: '0' })}
                ${cmTextField('Padding bottom (px)', field.padding_bottom, e => this._fieldChanged(index, 'padding_bottom', e), { type: 'number', step: '1', min: '0' })}
                ${cmTextField('Padding left (px)',   field.padding_left,   e => this._fieldChanged(index, 'padding_left',   e), { type: 'number', step: '1', min: '0' })}
                ${cmTextField('Padding right (px)',  field.padding_right,  e => this._fieldChanged(index, 'padding_right',  e), { type: 'number', step: '1', min: '0' })}
              </div>

              <!-- Row 6: Border — color, width, radius, style -->
              <div class="field-border-styling">
                ${cmColorPicker('Border color', field.border_color,  e => this._fieldChanged(index, 'border_color', e))}
                ${cmTextField('Width (px)',     field.border_width,  e => this._fieldChanged(index, 'border_width',  e), { type: 'number', step: '1', min: '0' })}
                ${cmTextField('Radius (px)',    field.border_radius, e => this._fieldChanged(index, 'border_radius', e), { type: 'number', step: '1', min: '0' })}
                ${cmSelectField('Style',       field.border_style,  this._borderStyleOptions, e => this._fieldChanged(index, 'border_style',  e))}
              </div>

              <!-- Remove field button -->
              <div class="remove-field-row">
                <button
                  class="remove-field-btn"
                  @click=${() => this._removeField(index)}
                >Remove field</button>
              </div>

            </ha-expansion-panel>
          `)}
        </div>
      </ha-sortable>

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
    const prevConnection = this._hass?.connection;
    this._hass = hass;
    if (this._config) {
      if (hass.connection !== prevConnection || this._templateUnsubs.length === 0) {
        this._setupSubscriptions();
      }
    }
  }

  get hass() {
    return this._hass;
  }

  setConfig(config) {
    let needsResubscribe = this._templateUnsubs.length === 0;
    if (!needsResubscribe && this._config?.fields) {
      const oldFields = this._config.fields;
      for (let i = 0; i < oldFields.length; i++) {
        const oldContent = oldFields[i].content ?? '';
        if (!config.fields?.[i]) {
          // Field was removed — if it had a template, we must unsubscribe
          if (oldContent.includes('{{')) {
            needsResubscribe = true;
            break;
          }
        } else {
          const newContent = config.fields[i].content ?? '';
          if (newContent !== oldContent && (oldContent.includes('{{') || newContent.includes('{{'))) {
            needsResubscribe = true;
            break;
          }
        }
      }
    }
    this._config = config;
    if (this._hass && needsResubscribe) {
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
      if (typeof unsub !== 'function') return;
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
    .markdown-container {
      box-sizing: border-box;
      position: relative;
      background-color: var(--ha-card-background, var(--card-background-color, white));
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
      border-width: var(--ha-card-border-width, 1px);
      border-style: solid;
      box-shadow: var(--ha-card-box-shadow, none);
    }
    .markdown-layer {
      display: flex;
      flex-direction: column;
    }
    .text-field {
      box-sizing: border-box;
      color: var(--primary-text-color);
      background-color: transparent;
      border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
    }
    .markdown-field {
      font-size: inherit;
    }
    .markdown-field a {
      color: var(--markdown-link-color, var(--primary-color));
    }
    .markdown-field p:first-child {
      margin-top: 0;
    }
    .markdown-field p:last-child {
      margin-bottom: 0;
    }
  `;

  render() {
    if (!this._config) return html``;

    const c = this._config;

    const containerStyles = {
      'background-color': c.background_color || undefined,
      'border-width':     (c.border_width !== '' && c.border_width != null) ? `${c.border_width}px` : undefined,
      'border-style':     c.border_style  || undefined,
      'border-color':     c.border_color  || undefined,
      'border-radius':    (c.border_radius !== '' && c.border_radius != null) ? `${c.border_radius}px` : undefined,
      'padding-top':      (c.padding_top    !== '' && c.padding_top    != null) ? `${c.padding_top}px`    : undefined,
      'padding-bottom':   (c.padding_bottom !== '' && c.padding_bottom != null) ? `${c.padding_bottom}px` : undefined,
      'padding-left':     (c.padding_left   !== '' && c.padding_left   != null) ? `${c.padding_left}px`   : undefined,
      'padding-right':    (c.padding_right  !== '' && c.padding_right  != null) ? `${c.padding_right}px`  : undefined,
      'box-shadow':       c.box_shadow    || undefined,
    };

    const fields = c.fields ?? [];

    return html`
      <div class="markdown-container" style=${styleMap(containerStyles)}>
        <div class="markdown-layer">
          ${fields.map((field, i) => {
            const fieldStyles = {
              'display':          field.show === false ? 'none' : undefined,
              'color':            field.color            || undefined,
              'font-size':        (field.font_size   !== '' && field.font_size   != null) ? `${field.font_size}em`  : undefined,
              'font-weight':      (field.font_weight !== '' && field.font_weight != null) ? `${field.font_weight}`  : undefined,
              'text-align':       field.text_align       || undefined,
              'line-height':      (field.line_height !== '' && field.line_height != null) ? `${field.line_height}`  : undefined,
              'letter-spacing':   field.letter_spacing   || undefined,
              'background-color': field.background_color || undefined,
              'border-width':     (field.border_width !== '' && field.border_width != null) ? `${field.border_width}px` : undefined,
              'border-style':     field.border_style  || undefined,
              'border-color':     field.border_color  || undefined,
              'border-radius':    (field.border_radius !== '' && field.border_radius != null) ? `${field.border_radius}px` : undefined,
              'padding-top':      (field.padding_top    !== '' && field.padding_top    != null) ? `${field.padding_top}px`    : undefined,
              'padding-bottom':   (field.padding_bottom !== '' && field.padding_bottom != null) ? `${field.padding_bottom}px` : undefined,
              'padding-left':     (field.padding_left   !== '' && field.padding_left   != null) ? `${field.padding_left}px`   : undefined,
              'padding-right':    (field.padding_right  !== '' && field.padding_right  != null) ? `${field.padding_right}px`  : undefined,
            };

            return html`
              <div class="markdown-field text-field" style=${styleMap(fieldStyles)}>
                ${unsafeHTML(marked.parse(this._fieldValues[i] ?? '', { breaks: field.line_breaks !== false }))}
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
