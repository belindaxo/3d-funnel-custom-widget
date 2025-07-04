/**
 * Module dependencies for Highcharts 3D Funnel chart.
 */
import * as Highcharts from 'highcharts';
import 'highcharts/highcharts-3d';
import 'highcharts/modules/exporting';
import 'highcharts/modules/cylinder';
import 'highcharts/modules/funnel3d';


/**
 * Parses metadata into structured dimensions and measures.
 * @param {Object} metadata - The metadata object from SAC data binding.
 * @returns {Object} An object containing parsed dimensions, measures, and their maps.
 */
var parseMetadata = metadata => {
    const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata;
    const dimensions = [];
    for (const key in dimensionsMap) {
        const dimension = dimensionsMap[key];
        dimensions.push({ key, ...dimension });
    }

    const measures = [];
    for (const key in measuresMap) {
        const measure = measuresMap[key];
        measures.push({ key, ...measure });
    }
    return { dimensions, measures, dimensionsMap, measuresMap };
}

(function () {
    /**
     * Custom Web Component for rendering a 3D Funnel Chart in SAP Analytics Cloud.
     * @extends HTMLElement
     */
    class Funnel3D extends HTMLElement {
        /**
         * Initializes the shadow DOM, styles, and chart container.
         */
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            // Create a CSSStyleSheet for the shadow DOM
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(`
                @font-face {
                    font-family: '72';
                    src: url('../fonts/72-Regular.woff2') format('woff2');
                }
                #container {
                    width: 100%;
                    height: 100%;
                    font-family: '72';
                }
            `);

            // Apply the stylesheet to the shadow DOM
            this.shadowRoot.adoptedStyleSheets = [sheet];

            // Add the container for the chart
            this.shadowRoot.innerHTML = `
                <div id="container"></div>    
            `;

            this._selectedPoint = null;

            this._handlePointClick = this._handlePointClick.bind(this);

            this._lastSentCategories = [];

            this._onMouseEnter = null;
            this._onMouseLeave = null;

        }

        /**
         * Called when the widget is resized.
         * @param {number} width - New width of the widget.
         * @param {number} height - New height of the widget.
         */
        onCustomWidgetResize(width, height) {
            this._renderChart();
        }

        /**
         * Called after widget properties are updated.
         * @param {Object} changedProperties - Object containing changed attributes.
         */
        onCustomWidgetAfterUpdate(changedProperties) {
            this._renderChart();
        }

        /**
         * Called when the widget is destroyed. Cleans up chart instance.
         */
        onCustomWidgetDestroy() {
            if (this._chart) {
                this._chart.destroy();
                this._chart = null;
            }
            this._selectedPoint = null; // Reset selection when chart is destroyed
        }

        /**
         * Specifies which attributes should trigger re-rendering on change.
         * @returns {string[]} An array of observed attribute names.
         */
        static get observedAttributes() {
            return [
                'chartTitle', 'titleSize', 'titleFontStyle', 'titleAlignment', 'titleColor',                // Title properties
                'chartSubtitle', 'subtitleSize', 'subtitleFontStyle', 'subtitleAlignment', 'subtitleColor', // Subtitle properties
                'scaleFormat', 'decimalPlaces',                                                             // Number formatting properties
                'showDataLabels', 'allowLabelOverlap', 'labelFormat', 'labelSize',                          // Data label properties
                'customColors'
            ];
        }

        /**
         * Called when an observed attribute changes.
         * @param {string} name - The name of the changed attribute.
         * @param {string} oldValue - The old value of the attribute.
         * @param {string} newValue - The new value of the attribute.
         */
        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue) {
                this[name] = newValue;
                this._renderChart();
            }
        }

        /**
         * Determines subtitle text based on scale format or user input.
         * @returns {string} The subtitle text.
         */
        _updateSubtitle() {
            if (!this.chartSubtitle || this.chartSubtitle.trim() === '') {
                let subtitleText = '';
                switch (this.scaleFormat) {
                    case 'k':
                        subtitleText = 'in k';
                        break;
                    case 'm':
                        subtitleText = 'in m';
                        break;
                    case 'b':
                        subtitleText = 'in b';
                        break;
                    default:
                        subtitleText = '';
                        break;
                }
                return subtitleText;
            } else {
                return this.chartSubtitle;
            }
        }

        /**
         * Scales a value based on the selected scale format (k, m, b).
         * @param {number} value 
         * @returns {Object} An object containing the scaled value and its suffix.
         */
        _scaleFormat(value) {
            let scaledValue = value;
            let valueSuffix = '';

            switch (this.scaleFormat) {
                case 'k':
                    scaledValue = value / 1000;
                    valueSuffix = 'k';
                    break;
                case 'm':
                    scaledValue = value / 1000000;
                    valueSuffix = 'm';
                    break;
                case 'b':
                    scaledValue = value / 1000000000;
                    valueSuffix = 'b';
                    break;
                default:
                    break;
            }
            return {
                scaledValue: scaledValue.toFixed(this.decimalPlaces),
                valueSuffix
            };
        }

        /**
         * Processes dimensions into category data.
         * @param {Array} dimensions - The dimensions from metadata.
         * @returns {Array} Processed category data.
         */
        _processCategoryData(dimensions) {
            return dimensions.map(dimension => ({
                id: dimension.id,
                name: dimension.description,
                data: [],
                key: dimension.key
            }));
        }

        /**
         * Processes measures into series data.
         * @param {Array} measures - The measures from metadata.
         * @returns {Array} Processed series data.
         */
        _processSeriesData(measures) {
            return measures.map(measure => ({
                id: measure.id,
                name: measure.label,
                data: [],
                key: measure.key,
                type: 'funnel3d',
                categoryName: this.categoryData[0]?.name || '' // The category name
            }));
        }

        /**
         * Populates data arrays for categories and series.
         * @param {Array} data - The data from the data binding.
         * @param {Array} categoryData - The category data to populate.
         * @param {Array} series - The series data to populate.
         */
        _populateDataArrays(data, categoryData, series) {
            data.forEach(row => {
                this.categoryData.forEach(category => {
                    category.data.push({
                        id: row[category.key].id,
                        name: row[category.key].label
                    });
                });
                series.forEach(seriesItem => {
                    const categoryName = row[this.categoryData[0].key]?.label;
                    const rawValue = row[seriesItem.key].raw;
                    seriesItem.data.push([categoryName, rawValue]);
                });
            });
        }

        /**
         * Sorts data arrays by ID.
         * @param {Array} categoryData - The category data to sort. 
         * @param {Array} series - The series data to sort.
         */
        _sortDataById(categoryData, series) {
            const sortedIndices = [...Array(categoryData[0].data.length).keys()].sort((a, b) => {
                return categoryData[0].data[a].id - categoryData[0].data[b].id;
            });

            categoryData.forEach(category => {
                category.data = sortedIndices.map(i => category.data[i]);
            });

            series.forEach(series => {
                series.data = sortedIndices.map(i => series.data[i]);
            });
        }

        /**
         * Renders the 3D funnel chart using Highcharts.
         */
        _renderChart() {
            const dataBinding = this.dataBinding;
            if (!dataBinding || dataBinding.state !== 'success' || !dataBinding.data || dataBinding.data.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    // Reset selection when chart is destroyed
                    this._selectedPoint = null;
                }
                return;
            }

            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);

            if (dimensions.length === 0 || measures.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    // Reset selection when chart is destroyed
                    this._selectedPoint = null;
                }
                return;
            }

            // Process categories and series data
            this.categoryData = this._processCategoryData(dimensions);
            const series = this._processSeriesData(measures);

            // Populate and sort data arrays
            this._populateDataArrays(data, this.categoryData, series);
            this._sortDataById(this.categoryData, series);

            const validCategoryNames = this.categoryData[0]?.data.map(d => d.name) || [];

            if (JSON.stringify(this._lastSentCategories) !== JSON.stringify(validCategoryNames)) {
                this._lastSentCategories = validCategoryNames;
                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                    detail: {
                        properties: {
                            validCategoryNames
                        }
                    }
                }));
            }

            const scaleFormat = (value) => this._scaleFormat(value);
            const subtitleText = this._updateSubtitle();
            const labelFormat = this.labelFormat;
            
            const customColors = this.customColors || [];

            series.forEach(seriesItem => {
                seriesItem.data = seriesItem.data.map(([categoryName, rawValue]) => {
                    const match = customColors.find(c => c.category === categoryName);
                    return {
                        name: categoryName,
                        y: rawValue,
                        ...(match?.color && { color: match.color }), // Use custom color if available
                    };
                });
            });

            const categoryData = this.categoryData;

            // Reset the selected point reference before rendering the chart
            this._selectedPoint = null;

            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                },
                colors: ['#004b8d', '#939598', '#faa834', '#00aa7e', '#47a5dc', '#006ac7', '#ccced2', '#bf8028', '#00e4a7'],
                navigation: {
                    buttonOptions: {
                        symbolStroke: '#004b8d',  // Outline color
                        symbolFill: 'transparent', // No fill
                        symbolStrokeWidth: 1,
                        // Core button shape settings
                        height: 32,          // Ensure square for circle
                        width: 32,
                        theme: {
                            r: 16,           // Rounded corners (half width = full circle)
                            fill: '#f7f7f7', // Background color
                            stroke: '#ccc',  // Thin outer border
                            'stroke-width': 0.8,
                            style: {
                                cursor: 'pointer'
                            }
                        }
                    }
                }
            });

            Highcharts.SVGRenderer.prototype.symbols.contextButton = function (x, y, w, h) {
                const radius = w * 0.11;
                const spacing = w * 0.4;

                const offsetY = 2;    // moves dots slightly down
                const offsetX = 1;  // moves dots slightly to the right

                const centerY = y + h / 2 + offsetY;
                const startX = x + (w - spacing * 2) / 2 + offsetX;

                const makeCirclePath = (cx, cy, r) => [
                    'M', cx - r, cy,
                    'A', r, r, 0, 1, 0, cx + r, cy,
                    'A', r, r, 0, 1, 0, cx - r, cy
                ];

                return [].concat(
                    makeCirclePath(startX, centerY, radius),
                    makeCirclePath(startX + spacing, centerY, radius),
                    makeCirclePath(startX + spacing * 2, centerY, radius)
                );
            };

            const chartOptions = {
                chart: {
                    type: "funnel3d",
                    backgroundColor: '#ffffff',
                    options3d: {
                        enabled: true,
                        alpha: 10,
                        depth: 50,
                        viewDistance: 50,
                    },
                    style: {
                        fontFamily: "'72', sans-serif",
                    },
                    events: {
                        load: this._alignDataLabels()
                    }
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: this.chartTitle || "",
                    align: this.titleAlignment || "left",
                    style: {
                        fontSize: this.titleSize || "16px",
                        fontWeight: this.titleFontStyle || "bold",
                        color: this.titleColor || "#004B8D",
                    },
                },
                subtitle: {
                    text: subtitleText,
                    align: this.subtitleAlignment || "left",
                    style: {
                        fontSize: this.subtitleSize || "11px",
                        fontStyle: this.subtitleFontStyle || "normal",
                        color: this.subtitleColor || "#000000",
                    },
                },
                plotOptions: {
                    series: {
                        allowPointSelect: true,
                        cursor: "pointer",
                        point: {
                            events: {
                                select: this._handlePointClick,
                                unselect: this._handlePointClick,
                            },
                        },
                        dataLabels: {
                            enabled: this.showDataLabels || false,
                            allowOverlap: this.allowLabelOverlap || false,
                            animation: false,
                            padding: 2,
                            borderWidth: 1,
                            borderRadius: 1,
                            style: {
                                fontWeight: 'normal',
                                color: '#000000',
                                fontSize: this.labelSize || '12px'
                            },
                            formatter: this._formatDataLabel(scaleFormat, labelFormat)
                        },
                        neckWidth: (20 / 50) * 0.7 * 100 + "%",
                        neckHeight: ((20 + 5) / (50 + 20 + 5)) * 100 + "%",
                        width: "70%",
                        height: "80%",
                    },
                },
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            enabled: false,
                        }
                    },
                    menuItemDefinitions: {
                        resetFilters: {
                            text: 'Reset Filters',
                            onclick: () => {
                                const linkedAnalysis = this.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();
                                if (linkedAnalysis) {
                                    linkedAnalysis.removeFilters();
                                    if (this._selectedPoint) {
                                        this._selectedPoint.select(false, false);
                                        this._selectedPoint = null;
                                    }
                                }
                            }

                        }
                    }
                },
                tooltip: {
                    valueDecimals: 0,
                    followPointer: true,
                    hideDelay: 0,
                    useHTML: true,
                    formatter: this._formatTooltip(scaleFormat)
                },
                series,
            };
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);

            const container = this.shadowRoot.getElementById('container');

            if (this._onMouseEnter) container.removeEventListener('mouseenter', this._onMouseEnter);
            if (this._onMouseLeave) container.removeEventListener('mouseleave', this._onMouseLeave);

            this._onMouseEnter = () => {
                if (!this._chart) return;
                this._chart.update(
                    {
                        exporting: {
                            buttons: {
                                contextButton: {
                                    enabled: true,
                                    symbol: 'contextButton',
                                    menuItems: ['resetFilters']
                                },
                            },
                        }
                    },
                    true,
                    false,
                    false
                );
                
                this._alignDataLabels().call(this._chart);
            };

            this._onMouseLeave = () => {
                if (!this._chart) return;
                this._chart.update(
                    {
                        exporting: {
                            buttons: {
                                contextButton: {
                                    enabled: false,
                                },
                            },
                        },
                    },
                    true, 
                    false, 
                    false
                );

                this._alignDataLabels().call(this._chart);
            };

            container.addEventListener('mouseenter', this._onMouseEnter);
            container.addEventListener('mouseleave', this._onMouseLeave);
        }

        /**
         * Aligns data labels to ensure they do not overflow the chart's plot area.
         * @returns {Function} A function that adjusts the position of data labels.
         */
        _alignDataLabels() {
            return function () {
                // Check if showDataLabels is enabled
                if (!this.options.plotOptions.series.dataLabels.enabled) {
                    return;
                }
                var chart = this, points = chart.series[0].points, offset;
                points.forEach(function (point) {
                    if ((point.dataLabel.attr('x') + point.dataLabel.attr('width')) > chart.plotWidth) {
                        offset = (point.dataLabel.attr('x') + point.dataLabel.attr('width')) - chart.plotWidth;

                        point.dataLabel.attr({
                            x: point.dataLabel.attr('x') - offset
                        });
                    }
                });
            };
        }

        /**
         * Formats the tooltip content for the chart.
         * @param {Function} scaleFormat - A function to scale and format the value.
         * @returns {Function} A function that formats the tooltip content.
         */
        _formatTooltip(scaleFormat) {
            return function () {
                if (this.point) {
                    // Retrieve the category data using the index
                    const name = this.point.name;
                    const { scaledValue, valueSuffix } = scaleFormat(this.y);
                    const value = Highcharts.numberFormat(scaledValue, -1, '.', ',');
                    const valueWithSuffix = `${value} ${valueSuffix}`;
                    return `
                        <div style="text-align: left; font-family: '72', sans-serif; font-size: 14px;">
                            <div style="font-size: 14px; font-weight: normal; color: #666666;">${this.series.name}</div>
                            <div style="font-size: 18px; font-weight: normal; color: #000000;">${valueWithSuffix}</div>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 5px 0;">
                            <table style="width: 100%; font-size: 14px; color: #000000;">
                                <tr>
                                    <td style="text-align: left; padding-right: 10px;">
                                        <span style="color:${this.color}">\u25CF</span> ${this.series.options.categoryName}
                                    </td>
                                    <td style="text-align: right; padding-left: 10px;">${name}</td>
                                </tr>
                            </table>
                        </div>
                        `;

                } else {
                    return 'error with data';
                }
            };
        }

        /**
         * Formats the data labels displayed on the chart.
         * @param {Function} scaleFormat - A function to scale and format the value.
         * @param {string} labelFormat - The format of the label ['labelAndValue', 'valueOnly', 'labelOnly'].
         * @returns {Function} A function that formats the data label content.
         */
        _formatDataLabel(scaleFormat, labelFormat) {
            return function () {
                if (this.point) {
                    const name = this.point.name;
                    const { scaledValue, valueSuffix } = scaleFormat(this.y);
                    const value = Highcharts.numberFormat(scaledValue, -1, '.', ',');
                    if (labelFormat === 'labelAndValue') {
                        return `${name} - ${value}`;
                    } else if (labelFormat === 'valueOnly') {
                        return `${value}`;
                    } else if (labelFormat === 'labelOnly') {
                        return `${name}`;
                    } else {
                        return `${name} - ${value}`;
                    }
                } else {
                    return 'error with data';
                }
            };
        }

        /**
         * Handles point selection/unselection and manages linked analysis filtering.
         * @param {Object} event - Highcharts point event. 
         */
        _handlePointClick(event) {
            const point = event.target;
            if (!point) {
                console.error("Point is undefined");
                return;
            }

            const dataBinding = this.dataBinding;

            const pointIndex = point.index;
            // Retrieve the correct label based on the index from the categoryData
            const label = this.categoryData[0].data[pointIndex].name;
            // Use the dimension key to find the corresponding item in dataBinding.data
            const selectedItem = dataBinding.data.find(
                (item) => item[this.categoryData[0].key].label === label
            );
            const linkedAnalysis = this.dataBindings
                .getDataBinding("dataBinding")
                .getLinkedAnalysis();

            // If there was a previously selected point, remove its filter before applying the new one
            if (this._selectedPoint && this._selectedPoint !== point) {
                linkedAnalysis.removeFilters(); // Clear any previous filters
                this._selectedPoint.select(false, false); // Deselect the previous point
                this._selectedPoint = null; // Clear the reference to the previous point
            }

            if (event.type === "select") {
                if (selectedItem) {
                    const selection = {};
                    selection[this.categoryData[0].id] =
                        selectedItem[this.categoryData[0].key].id;
                    linkedAnalysis.setFilters(selection);
                    this._selectedPoint = point;
                }
            } else if (event.type === "unselect") {
                linkedAnalysis.removeFilters();
                this._selectedPoint = null;
            }
        }
    }
    customElements.define('com-sap-sample-funnel3d', Funnel3D);
})();