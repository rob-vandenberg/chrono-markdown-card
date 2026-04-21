import{LitElement,html,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";import{styleMap}from"https://unpkg.com/lit@2.0.0/directives/style-map.js?module";import{unsafeHTML}from"https://unpkg.com/lit@2.0.0/directives/unsafe-html.js?module";const CARD_VERSION="0.2.35",mdiDragHorizontalVariant="M9,3H11V5H9V3M13,3H15V5H13V3M9,7H11V9H9V7M13,7H15V9H13V7M9,11H11V13H9V11M13,11H15V13H13V11M9,15H11V17H9V15M13,15H15V17H13V15M9,19H11V21H9V19M13,19H15V21H13V19Z";console.info("%c CHRONO-MARKDOWN-CARD %c v0.2.35 ","background-color: #2980b9; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");const DEFAULT_FIELD={name:"",show:!0,line_breaks:!1,content:"",color:"",font_size:1,font_weight:400,text_align:"left",line_height:1.4,background_color:"",border_width:0,border_style:"solid",border_color:"",border_radius:12,padding_top:8,padding_bottom:8,padding_left:8,padding_right:8},DEFAULT_CONFIG={background_color:"",border_width:1,border_style:"solid",border_color:"",border_radius:12,padding_top:8,padding_bottom:8,padding_left:8,padding_right:8,box_shadow:"",fields:[{...DEFAULT_FIELD,name:"Title",show:!1,line_breaks:!1,content:"Title",color:"",font_size:1.68,font_weight:400,text_align:"left"},{...DEFAULT_FIELD,name:"Content",show:!0,line_breaks:!1,content:"The **Markdown** card allows you to write any text. You can style it **bold**, *italicized*, ~strikethrough~ etc. You can do images, links, and more.\n\nFor more information see the [Markdown Cheatsheet](https://commonmark.org/help).",color:"",font_size:1,font_weight:400,text_align:"left"}]},NUMERIC_CONFIG_KEYS=new Set(["border_width","border_radius","padding_top","padding_bottom","padding_left","padding_right"]),NUMERIC_FIELD_KEYS=new Set(["font_size","font_weight","line_height","border_width","border_radius","padding_top","padding_bottom","padding_left","padding_right"]);function cmParseNumber(e){const t=String(e).replace(",",".");if("-"===t||"-0"===t||t.endsWith("."))return null;if(t.includes(".")&&t.endsWith("0"))return null;if(""===t)return;const o=parseFloat(t);return isNaN(o)?null:o}function cmTextField(e,t,o,i={}){return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <chrono-cm-textfield
        .value=${String(t??"")}
        type=${i.type??"text"}
        step=${i.step??""}
        min=${i.min??""}
        max=${i.max??""}
        @input=${o}
      ></chrono-cm-textfield>
    </div>
  `}function cmToggleField(e,t,o,i=""){return html`
    <div class="toggle-field ${i}">
      <label>${unsafeHTML(e)}</label>
      <ha-switch .checked=${t} @change=${o}></ha-switch>
    </div>
  `}function cmColorPicker(e,t,o){const i=t||"#000000";return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <div class="color-picker-row">
        <input type="color" .value=${i} @input=${o}
          @change=${e=>{"#000000"!==e.target.value&&o(e)}}>
        <chrono-cm-textfield
          .value=${String(t??"")}
          @input=${o}
        ></chrono-cm-textfield>
      </div>
    </div>
  `}function cmButtonPicker(e,t,o,i,r="",n=""){return html`
    <div class="button-picker-field ${n}" style=${"end"===r?"justify-self:end":""}>
      <label>${unsafeHTML(e)}</label>
      <chrono-cm-button-toggle-group
        .value=${t}
        .options=${o}
        @change=${i}
      ></chrono-cm-button-toggle-group>
    </div>
  `}function cmTextArea(e,t,o){return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <chrono-cm-textarea
        .value=${String(t??"")}
        @input=${o}
      ></chrono-cm-textarea>
    </div>
  `}function cmSelectField(e,t,o,i){return html`
    <div class="text-field">
      <label>${unsafeHTML(e)}</label>
      <chrono-cm-select
        .value=${t??""}
        .options=${o}
        @change=${i}
      ></chrono-cm-select>
    </div>
  `}class CmTextfield extends LitElement{static properties={value:{type:String},type:{type:String},step:{type:String},min:{type:String},max:{type:String},placeholder:{type:String}};static styles=css`
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
  `;render(){return html`
      <input
        .value=${live(this.value??"")}
        type=${this.type??"text"}
        step=${this.step??""}
        min=${this.min??""}
        max=${this.max??""}
        placeholder=${this.placeholder??""}
        @input=${e=>{this.value=e.target.value,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}
      >
    `}}customElements.define("chrono-cm-textfield",CmTextfield);class CmTextarea extends LitElement{static properties={value:{type:String},placeholder:{type:String}};static styles=css`
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
  `;updated(e){if(e.has("value")){const e=this.shadowRoot.querySelector(".editor");e&&e!==document.activeElement&&e.innerText!==this.value&&(e.innerText=this.value??"")}}render(){return html`
      <div
        class="editor"
        contenteditable="true"
        data-placeholder=${this.placeholder??""}
        @input=${e=>{this.value=e.target.innerText,this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))}}
      ></div>
    `}}customElements.define("chrono-cm-textarea",CmTextarea);class CmButtonToggleGroup extends LitElement{static properties={value:{type:String},options:{type:Array}};static styles=css`
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
  `;render(){const e=this.options??[];return html`${e.map((t,o)=>{const i=0===o,r=o===e.length-1,n=1===e.length,d=[t.value===this.value?"active":"",n?"only":i?"first":r?"last":""].filter(Boolean).join(" ");return html`<button class="${d}" @click=${()=>this._select(t.value)}>${t.label}</button>`})}`}_select(e){this.value=e,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}}customElements.define("chrono-cm-button-toggle-group",CmButtonToggleGroup);class CmSelect extends LitElement{static properties={value:{type:String},options:{type:Array},_open:{state:!0},_cursor:{state:!0}};static styles=css`
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
  `;constructor(){super(),this.value="",this.options=[],this._open=!1,this._cursor=-1,this._onOutsideClick=this._onOutsideClick.bind(this)}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onOutsideClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onOutsideClick)}_onOutsideClick(e){this.shadowRoot.contains(e.composedPath()[0])||e.composedPath()[0]===this||(this._open=!1,this._cursor=-1)}_select(e){this.value=e,this._open=!1,this._cursor=-1,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}_handleKeyDown(e){const t=this.options??[];this._open?"ArrowDown"===e.key?(this._cursor=Math.min(this._cursor+1,t.length-1),e.preventDefault()):"ArrowUp"===e.key?(this._cursor=Math.max(this._cursor-1,0),e.preventDefault()):"Enter"===e.key?(this._cursor>=0&&this._cursor<t.length&&this._select(t[this._cursor].value),e.preventDefault()):"Escape"===e.key&&(this._open=!1,this._cursor=-1,e.preventDefault()):"ArrowDown"!==e.key&&"ArrowUp"!==e.key||(this._open=!0,this._cursor=0,e.preventDefault())}render(){const e=this.options??[];return html`
      <div class="combobox ${this._open?"combobox-open":""}">
        <input
          class="combobox-input"
          .value=${live(this.value??"")}
          @input=${e=>{this.dispatchEvent(new CustomEvent("change",{detail:{value:e.target.value},bubbles:!0,composed:!0}))}}
          @blur=${()=>{this._open=!1,this._cursor=-1}}
          @keydown=${this._handleKeyDown}
        >
        <div
          class="combobox-chevron"
          @click=${()=>{this._open=!this._open,this._cursor=-1,this.shadowRoot.querySelector(".combobox-input").focus()}}
          aria-hidden="true"
        >${this._open?"▴":"▾"}</div>
      </div>

      ${this._open?html`
        <div class="combobox-dropdown">
          ${e.map((e,t)=>html`
            <div
              class="combobox-option
                     ${e.value===this.value?"combobox-option-selected":""}
                     ${t===this._cursor?"combobox-option-cursor":""}"
              @mousedown=${t=>{t.preventDefault(),this._select(e.value)}}
            >${e.label}</div>
          `)}
        </div>
      `:""}
    `}}customElements.define("chrono-cm-select",CmSelect);class ChronoMarkdownCardEditor extends LitElement{static properties={hass:{attribute:!1},_config:{state:!0}};setConfig(e){this._config={...DEFAULT_CONFIG,...e}}_valueChanged(e,t){if(!this._config)return;const o=t.target.value??t.detail?.value;let i;if(NUMERIC_CONFIG_KEYS.has(e)){const t=cmParseNumber(o);if(null===t)return;i=void 0===t?DEFAULT_CONFIG[e]:t}else i=o;this._config={...this._config,[e]:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_fieldChanged(e,t,o){if(!this._config)return;const i=o.target.value??o.detail?.value;let r;if(NUMERIC_FIELD_KEYS.has(t)){const e=cmParseNumber(i);if(null===e)return;r=void 0===e?DEFAULT_FIELD[t]:e}else r=i;const n=this._config.fields.map((o,i)=>i===e?{...o,[t]:r}:o);this._config={...this._config,fields:n},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_fieldToggled(e,t,o){if(!this._config)return;const i=o.target.checked,r=this._config.fields.map((o,r)=>r===e?{...o,[t]:i}:o);this._config={...this._config,fields:r},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_addField(){const e=(this._config.fields??[]).length,t=[...this._config.fields??[],{...DEFAULT_FIELD,name:`Field ${e+1}`,content:`Field ${e+1}`}];this._config={...this._config,fields:t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_removeField(e){const t=this._config.fields.filter((t,o)=>o!==e);this._config={...this._config,fields:t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_fieldMoved(e){e.stopPropagation();const{oldIndex:t,newIndex:o}=e.detail,i=[...this._config.fields];i.splice(o,0,i.splice(t,1)[0]),this._config={...this._config,fields:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}static styles=css`

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

  `;_textAlignOptions=[{label:"Left",value:"left"},{label:"Center",value:"center"},{label:"Right",value:"right"},{label:"Justify",value:"justify"}];_borderStyleOptions=[{label:"Solid",value:"solid"},{label:"Dashed",value:"dashed"},{label:"Dotted",value:"dotted"},{label:"Double",value:"double"},{label:"Groove",value:"groove"},{label:"Ridge",value:"ridge"},{label:"Inset",value:"inset"},{label:"Outset",value:"outset"},{label:"None",value:"none"}];render(){if(!this._config)return html``;const e=this._config,t=e.fields??[];return html`

      <!-- ── Card section ─────────────────────────────────────────────────── -->

      <ha-expansion-panel header="Card" outlined .expanded=${!0}>

        <!-- Row 1: Background color / Padding -->
        <div class="card-bg-color-padding">
          ${cmColorPicker("Background color\n<i>leave empty for default</i>",e.background_color,e=>this._valueChanged("background_color",e))}
          ${cmTextField("Padding\ntop (px)",e.padding_top,e=>this._valueChanged("padding_top",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Padding bottom (px)",e.padding_bottom,e=>this._valueChanged("padding_bottom",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Padding left (px)",e.padding_left,e=>this._valueChanged("padding_left",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Padding right (px)",e.padding_right,e=>this._valueChanged("padding_right",e),{type:"number",step:"1",min:"0"})}
        </div>

        <!-- Row 2: Border — color, width, radius, style -->
        <div class="card-border-styling">
          ${cmColorPicker("Border color",e.border_color,e=>this._valueChanged("border_color",e))}
          ${cmTextField("Width (px)",e.border_width,e=>this._valueChanged("border_width",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Radius (px)",e.border_radius,e=>this._valueChanged("border_radius",e),{type:"number",step:"1",min:"0"})}
          ${cmSelectField("Border style",e.border_style,this._borderStyleOptions,e=>this._valueChanged("border_style",e))}
        </div>

      </ha-expansion-panel>

      <!-- ── Fields section ───────────────────────────────────────────────── -->

      <ha-sortable handle-selector=".handle" @item-moved=${this._fieldMoved}>
        <div class="fields-list">
          ${t.map((e,o)=>html`
            <ha-expansion-panel outlined header=${e.name||`Field ${o+1}`}>

              <div class="handle" slot="leading-icon">
                <ha-svg-icon .path=${mdiDragHorizontalVariant}></ha-svg-icon>
              </div>

              <!-- Row 1: Name (full width) -->
              <div class="field-name">
                ${cmTextField("Name",e.name,e=>this._fieldChanged(o,"name",e))}
              </div>

              <!-- Row 2: Show / Line breaks toggles -->
              <div class="field-show-toggles">
                ${cmToggleField("Show",e.show??!0,e=>this._fieldToggled(o,"show",e))}
                ${cmToggleField("Line breaks",e.line_breaks??!1,e=>this._fieldToggled(o,"line_breaks",e))}
              </div>

              <!-- Row 3: Content (full width, textarea) -->
              <div class="field-content">
                ${cmTextArea("Content (supports Markdown, HTML and Jinja2)",e.content,e=>this._fieldChanged(o,"content",e))}
              </div>

              <!-- Row 4: Typography — font color, font size, font weight, line height, text align -->
              <div class="field-typography">
                ${cmColorPicker("Font color",e.color,e=>this._fieldChanged(o,"color",e))}
                ${cmTextField("Font size",e.font_size,e=>this._fieldChanged(o,"font_size",e),{type:"number",step:"0.1",min:"0"})}
                ${cmTextField("Font weight",e.font_weight,e=>this._fieldChanged(o,"font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
                ${cmTextField("Line height",e.line_height,e=>this._fieldChanged(o,"line_height",e),{type:"number",step:"0.1",min:"0"})}
                ${cmSelectField("Text align",e.text_align,this._textAlignOptions,e=>this._fieldChanged(o,"text_align",e))}
              </div>

              <!-- Row 5: Background color and padding -->
              <div class="field-bg-color-padding">
                ${cmColorPicker("Background color",e.background_color,e=>this._fieldChanged(o,"background_color",e))}
                ${cmTextField("Padding\ntop (px)",e.padding_top,e=>this._fieldChanged(o,"padding_top",e),{type:"number",step:"1",min:"0"})}
                ${cmTextField("Padding bottom (px)",e.padding_bottom,e=>this._fieldChanged(o,"padding_bottom",e),{type:"number",step:"1",min:"0"})}
                ${cmTextField("Padding left (px)",e.padding_left,e=>this._fieldChanged(o,"padding_left",e),{type:"number",step:"1",min:"0"})}
                ${cmTextField("Padding right (px)",e.padding_right,e=>this._fieldChanged(o,"padding_right",e),{type:"number",step:"1",min:"0"})}
              </div>

              <!-- Row 6: Border — color, width, radius, style -->
              <div class="field-border-styling">
                ${cmColorPicker("Border color",e.border_color,e=>this._fieldChanged(o,"border_color",e))}
                ${cmTextField("Width (px)",e.border_width,e=>this._fieldChanged(o,"border_width",e),{type:"number",step:"1",min:"0"})}
                ${cmTextField("Radius (px)",e.border_radius,e=>this._fieldChanged(o,"border_radius",e),{type:"number",step:"1",min:"0"})}
                ${cmSelectField("Style",e.border_style,this._borderStyleOptions,e=>this._fieldChanged(o,"border_style",e))}
              </div>

              <!-- Remove field button -->
              <div class="remove-field-row">
                <button
                  class="remove-field-btn"
                  ?disabled=${t.length<=1}
                  @click=${()=>this._removeField(o)}
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

    `}}customElements.define("chrono-markdown-card-editor",ChronoMarkdownCardEditor);class ChronoMarkdownCard extends LitElement{static properties={_config:{attribute:!1},_fieldValues:{state:!0}};static getCardSize(){return 3}static getConfigElement(){return document.createElement("chrono-markdown-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG}}constructor(){super(),this._config=null,this._hass=null,this._fieldValues=[],this._templateUnsubs=[]}set hass(e){const t=this._hass?.connection;this._hass=e,this._config&&(e.connection===t&&0!==this._templateUnsubs.length||this._setupSubscriptions())}get hass(){return this._hass}setConfig(e){let t=0===this._templateUnsubs.length;if(!t&&this._config?.fields){const o=this._config.fields;for(let i=0;i<o.length;i++){const r=o[i].content??"";if(e.fields?.[i]){const o=e.fields[i].content??"";if(o!==r&&(r.includes("{{")||o.includes("{{"))){t=!0;break}}else if(r.includes("{{")){t=!0;break}}}this._config={...DEFAULT_CONFIG,...e},this._hass&&t&&this._setupSubscriptions()}connectedCallback(){super.connectedCallback(),this._hass&&this._config&&0===this._templateUnsubs.length&&this._setupSubscriptions()}disconnectedCallback(){super.disconnectedCallback(),this._teardownSubscriptions()}_setupSubscriptions(){this._teardownSubscriptions();const e=this._config.fields??[];this._fieldValues=new Array(e.length).fill("");const t=(e,t)=>{const o=String(e);if(!o.includes("{{"))return void t(o);const i=this._hass.connection.subscribeMessage(e=>t(e.result),{type:"render_template",template:o});this._templateUnsubs.push(i)};e.forEach((e,o)=>{t(e.content,e=>{this._fieldValues=this._fieldValues.map((t,i)=>i===o?e:t),this.requestUpdate()})})}_teardownSubscriptions(){this._templateUnsubs.forEach(e=>{if("function"==typeof e)try{const t=e();t&&"function"==typeof t.catch&&t.catch(()=>{})}catch(e){}}),this._templateUnsubs=[]}static styles=css`
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
  `;render(){if(!this._config)return html``;const e=this._config,t={"background-color":e.background_color||void 0,"border-width":void 0!==e.border_width?`${e.border_width}px`:void 0,"border-style":e.border_style||void 0,"border-color":e.border_color||void 0,"border-radius":void 0!==e.border_radius?`${e.border_radius}px`:void 0,padding:`${e.padding_top}px ${e.padding_right}px ${e.padding_bottom}px ${e.padding_left}px`,"box-shadow":e.box_shadow||void 0},o=e.fields??[];return html`
      <div class="text-container" style=${styleMap(t)}>
        <div class="text-layer">
          ${o.map((e,t)=>{const o={display:!1===e.show?"none":void 0,color:e.color||void 0,"font-size":`${e.font_size}em`,"font-weight":`${e.font_weight}`,"text-align":e.text_align||void 0,"line-height":`${e.line_height}`,"background-color":e.background_color||void 0,"border-width":void 0!==e.border_width?`${e.border_width}px`:void 0,"border-style":e.border_style||void 0,"border-color":e.border_color||void 0,"border-radius":void 0!==e.border_radius?`${e.border_radius}px`:void 0,padding:`${e.padding_top}px ${e.padding_right}px ${e.padding_bottom}px ${e.padding_left}px`};return html`
              <div class="text-field" style=${styleMap(o)}>
                <ha-markdown-element .content=${this._fieldValues[t]??""} ?breaks=${!1!==e.line_breaks}></ha-markdown-element>
              </div>
            `})}
        </div>
      </div>
    `}}customElements.define("chrono-markdown-card",ChronoMarkdownCard),window.customCards=window.customCards||[],window.customCards.push({type:"chrono-markdown-card",name:"Chrono Markdown Card",description:"A flexible multi-field text card. Each field is independently styled and supports Markdown, HTML, and live Jinja2 templates.",preview:!0});