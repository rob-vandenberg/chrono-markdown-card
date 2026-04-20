import{LitElement,html,css}from"https://unpkg.com/lit@2.0.0/index.js?module";import{live}from"https://unpkg.com/lit@2.0.0/directives/live.js?module";import{styleMap}from"https://unpkg.com/lit@2.0.0/directives/style-map.js?module";const CARD_VERSION="0.1.18";console.info("%c CHRONO-MARKDOWN-CARD %c v0.1.18 ","background-color: #2980b9; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 3px 0 0 3px;","background-color: #1e1e1e; color: #fff; font-weight: bold; padding: 2px 4px; border-radius: 0 3px 3px 0;");const DEFAULT_FIELD={name:"",show:!0,line_breaks:!1,content:"",color:"",font_size:1,font_weight:400,text_align:"left",line_height:1.4,background_color:"",border_width:0,border_style:"solid",border_color:"",border_radius:12,padding_top:8,padding_bottom:8,padding_left:8,padding_right:8},DEFAULT_CONFIG={background_color:"",border_width:1,border_style:"solid",border_color:"",border_radius:12,padding_top:8,padding_bottom:8,padding_left:8,padding_right:8,box_shadow:"",fields:[{...DEFAULT_FIELD,name:"Title",show:!1,line_breaks:!1,content:"",color:"",font_size:1.68,font_weight:400,text_align:"left"},{...DEFAULT_FIELD,name:"Content",show:!0,line_breaks:!1,content:"The **Markdown** card allows you to write any text. You can style it **bold**, *italicized*, ~strikethrough~ etc. You can do images, links, and more.\n\nFor more information see the [Markdown Cheatsheet](https://commonmark.org/help).",color:"",font_size:1,font_weight:400,text_align:"left"}]},NUMERIC_CONFIG_KEYS=new Set(["border_width","border_radius","padding_top","padding_bottom","padding_left","padding_right"]),NUMERIC_FIELD_KEYS=new Set(["font_size","font_weight","line_height","border_width","border_radius","padding_top","padding_bottom","padding_left","padding_right"]);function cmParseNumber(e){const t=String(e).replace(",",".");if("-"===t||"-0"===t||t.endsWith("."))return null;if(t.includes(".")&&t.endsWith("0"))return null;if(""===t)return;const o=parseFloat(t);return isNaN(o)?null:o}function cmTextField(e,t,o,i={}){return html`
    <div class="text-field">
      <label>${e}</label>
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
      <label>${e}</label>
      <ha-switch .checked=${t} @change=${o}></ha-switch>
    </div>
  `}function cmColorPicker(e,t,o){return html`
    <div class="text-field">
      <label>${e}</label>
      <div class="color-picker-row">
        <input type="color" .value=${t??"#ffffff"} @input=${o}>
        <chrono-cm-textfield
          .value=${String(t??"")}
          @input=${o}
        ></chrono-cm-textfield>
      </div>
    </div>
  `}function cmButtonPicker(e,t,o,i,r="",n=""){return html`
    <div class="button-picker-field ${n}" style=${"end"===r?"justify-self:end":""}>
      <label>${e}</label>
      <chrono-cm-button-toggle-group
        .value=${t}
        .options=${o}
        @change=${i}
      ></chrono-cm-button-toggle-group>
    </div>
  `}function cmTextArea(e,t,o){return html`
    <div class="text-field">
      <label>${e}</label>
      <chrono-cm-textarea
        .value=${String(t??"")}
        @input=${o}
      ></chrono-cm-textarea>
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
  `;updated(e){if(e.has("value")){const e=this.shadowRoot.querySelector(".editor");e&&e.innerText!==this.value&&(e.innerText=this.value??"")}}render(){return html`
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
  `;render(){const e=this.options??[];return html`${e.map((t,o)=>{const i=0===o,r=o===e.length-1,n=1===e.length,d=[t.value===this.value?"active":"",n?"only":i?"first":r?"last":""].filter(Boolean).join(" ");return html`<button class="${d}" @click=${()=>this._select(t.value)}>${t.label}</button>`})}`}_select(e){this.value=e,this.dispatchEvent(new CustomEvent("change",{detail:{value:e},bubbles:!0,composed:!0}))}}customElements.define("chrono-cm-button-toggle-group",CmButtonToggleGroup);class ChronoMarkdownCardEditor extends LitElement{static properties={hass:{attribute:!1},_config:{state:!0}};setConfig(e){this._config={...DEFAULT_CONFIG,...e}}_valueChanged(e,t){if(!this._config)return;const o=t.target.value??t.detail?.value;let i;if(NUMERIC_CONFIG_KEYS.has(e)){const t=cmParseNumber(o);if(null===t)return;i=void 0===t?DEFAULT_CONFIG[e]:t}else i=o;this._config={...this._config,[e]:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_fieldChanged(e,t,o){if(!this._config)return;const i=o.target.value??o.detail?.value;let r;if(NUMERIC_FIELD_KEYS.has(t)){const e=cmParseNumber(i);if(null===e)return;r=void 0===e?DEFAULT_FIELD[t]:e}else r=i;const n=this._config.fields.map((o,i)=>i===e?{...o,[t]:r}:o);this._config={...this._config,fields:n},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_fieldToggled(e,t,o){if(!this._config)return;const i=o.target.checked,r=this._config.fields.map((o,r)=>r===e?{...o,[t]:i}:o);this._config={...this._config,fields:r},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_addField(){const e=(this._config.fields??[]).length,t=[...this._config.fields??[],{...DEFAULT_FIELD,name:`Field ${e+1}`,content:`Field ${e+1}`}];this._config={...this._config,fields:t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_removeField(e){const t=this._config.fields.filter((t,o)=>o!==e);this._config={...this._config,fields:t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}static styles=css`

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

  `;_textAlignOptions=[{label:"L",value:"left"},{label:"C",value:"center"},{label:"R",value:"right"}];render(){if(!this._config)return html``;const e=this._config,t=e.fields??[];return html`

      <!-- ── Card section ─────────────────────────────────────────────────── -->

      <ha-expansion-panel header="Card" outlined .expanded=${!0}>

        <!-- Row 1: Background color / Box shadow -->
        <div class="row-bg-shadow">
          ${cmColorPicker("Background color",e.background_color,e=>this._valueChanged("background_color",e))}
          ${cmTextField("Box shadow",e.box_shadow,e=>this._valueChanged("box_shadow",e))}
        </div>

        <!-- Row 2: Border — color, width, radius, style -->
        <div class="row-border">
          ${cmColorPicker("Border color",e.border_color,e=>this._valueChanged("border_color",e))}
          ${cmTextField("Width (px)",e.border_width,e=>this._valueChanged("border_width",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Radius (px)",e.border_radius,e=>this._valueChanged("border_radius",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Style",e.border_style,e=>this._valueChanged("border_style",e))}
        </div>

        <!-- Row 3: Padding -->
        <div class="row-padding">
          ${cmTextField("Padding top",e.padding_top,e=>this._valueChanged("padding_top",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Padding bottom",e.padding_bottom,e=>this._valueChanged("padding_bottom",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Padding left",e.padding_left,e=>this._valueChanged("padding_left",e),{type:"number",step:"1",min:"0"})}
          ${cmTextField("Padding right",e.padding_right,e=>this._valueChanged("padding_right",e),{type:"number",step:"1",min:"0"})}
        </div>

      </ha-expansion-panel>

      <!-- ── Fields section ───────────────────────────────────────────────── -->

      ${t.map((e,o)=>html`
        <ha-expansion-panel outlined>

          <div class="panel-header" slot="header">
            <span>${e.name||`Field ${o+1}`}</span>
            <button
              class="remove-btn"
              ?disabled=${t.length<=1}
              @click=${e=>{e.stopPropagation(),this._removeField(o)}}
            >✕</button>
          </div>

          <!-- Row 1: Name (full width) -->
          <div class="row-name">
            ${cmTextField("Name",e.name,e=>this._fieldChanged(o,"name",e))}
          </div>

          <!-- Row 2: Show / Line breaks toggles -->
          <div class="row-show">
            ${cmToggleField("Show",e.show??!0,e=>this._fieldToggled(o,"show",e))}
            ${cmToggleField("Line breaks",e.line_breaks??!0,e=>this._fieldToggled(o,"line_breaks",e))}
          </div>

          <!-- Row 3: Content (full width, textarea) -->
          <div class="row-content">
            ${cmTextArea("Content (HTML / Jinja2)",e.content,e=>this._fieldChanged(o,"content",e))}
          </div>

          <!-- Row 4: Typography — font size, font weight, line height, text align -->
          <div class="row-typography">
            ${cmTextField("Font size",e.font_size,e=>this._fieldChanged(o,"font_size",e),{type:"number",step:"0.1",min:"0"})}
            ${cmTextField("Font weight",e.font_weight,e=>this._fieldChanged(o,"font_weight",e),{type:"number",step:"100",min:"100",max:"900"})}
            ${cmTextField("Line height",e.line_height,e=>this._fieldChanged(o,"line_height",e),{type:"number",step:"0.1",min:"0"})}
            ${cmTextField("Text align",e.text_align,e=>this._fieldChanged(o,"text_align",e))}
          </div>

          <!-- Row 5: Colors -->
          <div class="row-colors">
            ${cmColorPicker("Color",e.color,e=>this._fieldChanged(o,"color",e))}
            ${cmColorPicker("Background color",e.background_color,e=>this._fieldChanged(o,"background_color",e))}
          </div>

          <!-- Row 6: Border — color, width, radius, style -->
          <div class="row-border">
            ${cmColorPicker("Border color",e.border_color,e=>this._fieldChanged(o,"border_color",e))}
            ${cmTextField("Width (px)",e.border_width,e=>this._fieldChanged(o,"border_width",e),{type:"number",step:"1",min:"0"})}
            ${cmTextField("Radius (px)",e.border_radius,e=>this._fieldChanged(o,"border_radius",e),{type:"number",step:"1",min:"0"})}
            ${cmTextField("Style",e.border_style,e=>this._fieldChanged(o,"border_style",e))}
          </div>

          <!-- Row 7: Padding -->
          <div class="row-padding">
            ${cmTextField("Padding top (px)",e.padding_top,e=>this._fieldChanged(o,"padding_top",e),{type:"number",step:"1",min:"0"})}
            ${cmTextField("Padding bottom (px)",e.padding_bottom,e=>this._fieldChanged(o,"padding_bottom",e),{type:"number",step:"1",min:"0"})}
            ${cmTextField("Padding left (px)",e.padding_left,e=>this._fieldChanged(o,"padding_left",e),{type:"number",step:"1",min:"0"})}
            ${cmTextField("Padding right (px)",e.padding_right,e=>this._fieldChanged(o,"padding_right",e),{type:"number",step:"1",min:"0"})}
          </div>

        </ha-expansion-panel>
      `)}

      <!-- ── Add field button ──────────────────────────────────────────────── -->

      <div class="add-field-row">
        <button class="add-field-btn" @click=${this._addField}>+ Add field</button>
      </div>

    `}}customElements.define("chrono-markdown-card-editor",ChronoMarkdownCardEditor);class ChronoMarkdownCard extends LitElement{static properties={_config:{attribute:!1},_fieldValues:{state:!0}};static getCardSize(){return 3}static getConfigElement(){return document.createElement("chrono-markdown-card-editor")}static getStubConfig(){return{...DEFAULT_CONFIG}}constructor(){super(),this._config=null,this._hass=null,this._fieldValues=[],this._templateUnsubs=[]}set hass(e){this._hass=e,this._config&&0===this._templateUnsubs.length&&this._setupSubscriptions()}get hass(){return this._hass}setConfig(e){this._teardownSubscriptions(),this._config={...DEFAULT_CONFIG,...e},this._hass&&this._setupSubscriptions()}connectedCallback(){super.connectedCallback(),this._hass&&this._config&&0===this._templateUnsubs.length&&this._setupSubscriptions()}disconnectedCallback(){super.disconnectedCallback(),this._teardownSubscriptions()}_setupSubscriptions(){this._teardownSubscriptions();const e=this._config.fields??[];this._fieldValues=new Array(e.length).fill("");const t=(e,t)=>{const o=String(e);if(!o.includes("{{"))return void t(o);const i=this._hass.connection.subscribeMessage(e=>t(e.result),{type:"render_template",template:o});this._templateUnsubs.push(i)};e.forEach((e,o)=>{t(e.content,e=>{this._fieldValues=this._fieldValues.map((t,i)=>i===o?e:t),this.requestUpdate()})})}_teardownSubscriptions(){this._templateUnsubs.forEach(e=>{try{const t=e();t&&"function"==typeof t.catch&&t.catch(()=>{})}catch(e){}}),this._templateUnsubs=[]}static styles=css`
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