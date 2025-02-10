(function() {
    let template = document.createElement('template');
    template.innerHTML = `
        <form id="form">
        <legend style="font-weight: bold;font-size: 18px;"> Font </legend>
        <table>
            <tr>
                <td>Chart Title</td>
            </tr>
            <tr>
                <td><input id="chartTitle" type="text"></td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Font Style</td>
                        <td>Alignment</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="titleSize">
                                <option value="10px">10</option>
                                <option value="12px">12</option>
                                <option value="14px">14</option>
                                <option value="16px">16</option>
                                <option value="18px" selected>18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <select id="titleFontStyle">
                                <option value="normal">Normal</option>
                                <option value="bold" selected>Bold</option>
                            </select>
                        </td>
                        <td>
                            <select id="titleAlignment">
                                <option value="left" selected>Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input id="titleColor" type="color" value="#333333">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <table>
            <tr>
                <td>Chart Subtitle</td>
            </tr>
            <tr>
                <td><input id="chartSubtitle" type="text"></td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Font Style</td>
                        <td>Alignment</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="subtitleSize">
                                <option value="10px">10</option>
                                <option value="12px" selected>12</option>
                                <option value="14px">14</option>
                                <option value="16px">16</option>
                                <option value="18px">18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <select id="subtitleFontStyle">
                                <option value="normal" selected>Normal</option>
                                <option value="italic">Italic</option>
                            </select>
                        </td>
                        <td>
                            <select id="subtitleAlignment">
                                <option value="left" selected>Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input id="subtitleColor" type="color" value="#666666">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <legend style="font-weight: bold;font-size: 18px;"> Number Formatting </legend>
        <table>
            <tr>
                <td>Scale Format</td>
            </tr>
            <tr>
                <td>
                    <select id="scaleFormat">
                        <option value="unformatted" selected>Unformatted</option>
                        <option value="k">Thousands (k)</option>
                        <option value="m">Millions (m)</option>
                        <option value="b">Billions (b)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Decimal Places</td>
            </tr>
            <tr>
                <td>
                    <select id="decimalPlaces">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2" selected>2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </td>
            </tr>
        </table>
        <legend style="font-weight: bold;font-size: 18px;">Data Point</legend>
        <table>
            <tr>
                <td>
                    <input id="showDataLabels" type="checkbox">
                    <label for="showDataLabels">Show data labels</label>
                </td>
            </tr>
            <tr>
                <td>
                    <input id="allowLabelOverlap" type="checkbox">
                    <label for="allowLabelOverlap">Allow data label overlap</label>
                </td>
            </tr>
        </table>
        <input type="submit" style="display:none;">
        </form>
    `;

    class Funnel3DAps extends HTMLElement {
        constructor() {
            super();
            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));
            this._shadowRoot.getElementById('form').addEventListener('submit', this._submit.bind(this));
            this._shadowRoot.getElementById('titleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleFontStyle').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleAlignment').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleFontStyle').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleAlignment').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('scaleFormat').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('decimalPlaces').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('showDataLabels').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('allowLabelOverlap').addEventListener('change', this._submit.bind(this));
        }

        _submit(e) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('propertiesChanged', {
                detail: {
                    properties: {
                        chartTitle: this.chartTitle,
                        titleSize: this.titleSize,
                        titleFontStyle: this.titleFontStyle,
                        titleAlignment: this.titleAlignment,
                        titleColor: this.titleColor,
                        chartSubtitle: this.chartSubtitle,
                        subtitleSize: this.subtitleSize,
                        subtitleFontStyle: this.subtitleFontStyle,
                        subtitleAlignment: this.subtitleAlignment,
                        subtitleColor: this.subtitleColor,
                        scaleFormat: this.scaleFormat,
                        decimalPlaces: this.decimalPlaces,
                        showDataLabels: this.showDataLabels,
                        allowLabelOverlap: this.allowLabelOverlap,
                    }
                }
            }));
        }

        

        set chartTitle(value) {
            this._shadowRoot.getElementById('chartTitle').value = value;
        }

        get chartTitle() {
            return this._shadowRoot.getElementById('chartTitle').value;
        }

        set titleSize(value) {
            this._shadowRoot.getElementById('titleSize').value = value;
        }

        get titleSize() {
            return this._shadowRoot.getElementById('titleSize').value;
        }

        set titleFontStyle(value) {
            this._shadowRoot.getElementById('titleFontStyle').value = value;
        }

        get titleFontStyle() {
            return this._shadowRoot.getElementById('titleFontStyle').value;
        }

        set titleAlignment(value) {
            this._shadowRoot.getElementById('titleAlignment').value = value;
        }

        get titleAlignment() {
            return this._shadowRoot.getElementById('titleAlignment').value;
        }

        set titleColor(value) {
            this._shadowRoot.getElementById('titleColor').value = value;
        }

        get titleColor() {
            return this._shadowRoot.getElementById('titleColor').value;
        }

        set chartSubtitle(value) {
            this._shadowRoot.getElementById('chartSubtitle').value = value;
        }

        get chartSubtitle() {
            return this._shadowRoot.getElementById('chartSubtitle').value;
        }

        set subtitleSize(value) {
            this._shadowRoot.getElementById('subtitleSize').value = value;
        }

        get subtitleSize() {
            return this._shadowRoot.getElementById('subtitleSize').value;
        }

        set subtitleFontStyle(value) {
            this._shadowRoot.getElementById('subtitleFontStyle').value = value;
        }

        get subtitleFontStyle() {
            return this._shadowRoot.getElementById('subtitleFontStyle').value;
        }

        set subtitleAlignment(value) {
            this._shadowRoot.getElementById('subtitleAlignment').value = value;
        }

        get subtitleAlignment() {
            return this._shadowRoot.getElementById('subtitleAlignment').value;
        }

        set subtitleColor(value) {
            this._shadowRoot.getElementById('subtitleColor').value = value;
        }

        get subtitleColor() {
            return this._shadowRoot.getElementById('subtitleColor').value;
        }

        set scaleFormat(value) {
            this._shadowRoot.getElementById('scaleFormat').value = value;
        }

        get scaleFormat() {
            return this._shadowRoot.getElementById('scaleFormat').value;
        }

        set decimalPlaces(value) {
            this._shadowRoot.getElementById('decimalPlaces').value = value;
        }

        get decimalPlaces() {
            return this._shadowRoot.getElementById('decimalPlaces').value;
        }

        set showDataLabels(value) {
            this._shadowRoot.getElementById('showDataLabels').checked = value;
        }

        get showDataLabels() {
            return this._shadowRoot.getElementById('showDataLabels').checked;
        }

        set allowLabelOverlap(value) {
            this._shadowRoot.getElementById('allowLabelOverlap').checked = value;
        }

        get allowLabelOverlap() {
            return this._shadowRoot.getElementById('allowLabelOverlap').checked;
        }
    }

    customElements.define('com-sap-sample-funnel3d-aps', Funnel3DAps);
})();