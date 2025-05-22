(function () {
    /**
     * Template for the Styling Panel (APS) of the Funnel3D widget.
     */
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
                                <option value="16px" selected>16</option>
                                <option value="18px">18</option>
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
                            <input id="titleColor" type="color" value="#004B8D">
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
                                <option value="11px" selected>11</option>
                                <option value="12px">12</option>
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
                            <input id="subtitleColor" type="color" value="#000000">
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
                    <input id="showDataLabels" type="checkbox" checked>
                    <label for="showDataLabels">Show data labels</label>
                </td>
            </tr>
            <tr>
                <td>
                    <input id="allowLabelOverlap" type="checkbox">
                    <label for="allowLabelOverlap">Allow data label overlap</label>
                </td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Label Display Options</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="labelSize">
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
                            <select id="labelFormat">
                                <option value="labelAndValue" selected>Label and Value</option>
                                <option value="labelOnly">Label only</option>
                                <option value="valueOnly">Value only</option>
                            </select>
                        </td>
                    </tr>
                </table>
            </tr>
            <legend style="font-weight: bold;font-size: 18px;">Color Settings</legend>
            <table>
                <tr>
                    <td>Category Name</td>
                    <td>Color</td>
                </tr>
                <tr>
                    <td><input id="categoryName" type="text"></td>
                    <td><input id="categoryColor" type="color" value="#ffffff"></td>
                </tr>
                <tr>
                    <td><button type="button" id="addColor">Add Color</button></td>
                </tr>
            </table>
            <div id="colorList" style="margin-top: 10px;"></div>
            <tr>
                <button id="resetDefaults" type="button" style="margin-top: 20px;">Reset to Default</button>
            </tr>
        </table>
        <input type="submit" style="display:none;">
        </form>
    `;

    /**
     * Custom Web Component for the Styling Panel (APS) of the Funnel3D widget.
     * @extends HTMLElement
     */
    class Funnel3DAps extends HTMLElement {
        /**
         * Initializes the shadow DOM and sets up event listeners for form inputs.
         */
        constructor() { 
            super();

            const DEFAULTS = {
            chartTitle: '',
            titleSize: '16px',
            titleFontStyle: 'bold',
            titleAlignment: 'left',
            titleColor: '#004B8D',
            chartSubtitle: '',
            subtitleSize: '11px',
            subtitleFontStyle: 'normal',
            subtitleAlignment: 'left',
            subtitleColor: '#000000',
            scaleFormat: 'unformatted',
            decimalPlaces: '2',
            showDataLabels: true,
            allowLabelOverlap: false,
            labelFormat: 'labelAndValue',
            labelSize: '12px'
            };

            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            // Initialize internal state
            this.customColors = [];

            const addButton = this._shadowRoot.getElementById('addColor');
            const nameInput = this._shadowRoot.getElementById('categoryName');
            const colorInput = this._shadowRoot.getElementById('categoryColor');
            const listContainer = this._shadowRoot.getElementById('colorList');

            const renderColorList = () => {
                listContainer.innerHTML = '';
                this.customColors.forEach((entry, index) => {
                    const item = document.createElement('div');
                    item.style.display = 'flex';
                    item.style.justifyContent = 'space-between';
                    item.style.alignItems = 'center';
                    item.style.marginBottom = '4px';

                    const label = document.createElement('span');
                    label.textContent = `${entry.category}: `;
                    label.style.marginRight = '8px';
                    label.style.flex = '1';

                    const colorBox = document.createElement('span');
                    colorBox.style.backgroundColor = entry.color;
                    colorBox.style.width = '20px';
                    colorBox.style.height = '20px';
                    colorBox.style.border = '1px solid #ccc';
                    colorBox.style.display = 'inline-block';
                    colorBox.style.marginRight = '8px';

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = '✖';
                    deleteButton.style.cursor = 'pointer';
                    deleteButton.style.background = 'none';
                    deleteButton.style.border = 'none';
                    deleteButton.style.color = 'red';
                    deleteButton.addEventListener('click', () => {
                        this.customColors.splice(index, 1);
                        renderColorList();
                        console.log('Custom colors after delete button clicked:', this.customColors);
                        this._submit(new Event('submit'));
                    });

                    item.appendChild(label);
                    item.appendChild(colorBox);
                    item.appendChild(deleteButton); 

                    listContainer.appendChild(item);
                });
            };

            addButton.addEventListener('click', () => {
                const name = nameInput.value.trim();
                const color = colorInput.value;
                if (name && color) {
                    this.customColors.push({ category: name, color: color });
                    renderColorList();
                    this._submit(new Event('submit'));
                    nameInput.value = ''; // Clear the input field after adding
                    colorInput.value = '#ffffff'; // Reset color input to default
                }
                console.log('Custom colors after add button clicked:', this.customColors);
            });

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
            this._shadowRoot.getElementById('labelFormat').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('labelSize').addEventListener('change', this._submit.bind(this));


            // Reset button logic
            this._shadowRoot.getElementById('resetDefaults').addEventListener('click', () => {
                for (const key in DEFAULTS) {
                    if (key === 'chartTitle' || key === 'chartSubtitle') {
                        continue; // Skip these fields
                    }

                    const element = this._shadowRoot.getElementById(key);
                    if (!element) continue; // Skip if element not found
                    
                    if (typeof DEFAULTS[key] === 'boolean') {
                        element.checked = DEFAULTS[key];
                    } else {
                        element.value = DEFAULTS[key];
                    }
                }
                this._submit(new Event('submit')); // Trigger submit event to update properties
            });
        }
        
        
        /**
         * Handles the form submissions and dispatches a 'propertiesChanged' event.
         * @param {Event} e - The form submission event.
         */
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
                        labelFormat: this.labelFormat,
                        labelSize: this.labelSize,
                        customColors: this.customColors
                    }
                }
            }));
        }

        // Getters and setters for each property
        
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

        set labelFormat(value) {
            this._shadowRoot.getElementById('labelFormat').value = value;
        }

        get labelFormat() {
            return this._shadowRoot.getElementById('labelFormat').value;
        }

        set labelSize(value) {
            this._shadowRoot.getElementById('labelSize').value = value;
        }

        get labelSize() {
            return this._shadowRoot.getElementById('labelSize').value;
        }
        
        get customColors() {
            return this._customColors || [];
        }

        set customColors(value) {
            this._customColors = value || [];
        }

    }

    customElements.define('com-sap-sample-funnel3d-aps', Funnel3DAps);
})();