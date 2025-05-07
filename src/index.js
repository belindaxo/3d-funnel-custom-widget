import Highcharts from 'highcharts';
import Highcharts3D from 'highcharts/highcharts-3d';
Highcharts3D(Highcharts);
import Exporting from 'highcharts/modules/exporting';
Exporting(Highcharts);
import HighchartsCylinder from 'highcharts/modules/cylinder';
HighchartsCylinder(Highcharts);
import HighchartsFunnel3D from 'highcharts/modules/funnel3d';
HighchartsFunnel3D(Highcharts);

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

(function() {
    class Funnel3D extends HTMLElement {
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
        }

        onCustomWidgetResize(width, height) {
            this._renderChart();
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            this._renderChart();
        }

        onCustomWidgetDestroy(){
            if (this._chart) {
                this._chart.destroy();
                this._chart = null;
            }
            this._selectedPoint = null; // Reset selection when chart is destroyed
        }

        static get observedAttributes() {
            return [
                'chartTitle', 'titleSize', 'titleFontStyle', 'titleAlignment', 'titleColor',                // Title properties
                'chartSubtitle', 'subtitleSize', 'subtitleFontStyle', 'subtitleAlignment', 'subtitleColor', // Subtitle properties
                'scaleFormat', 'decimalPlaces',                                                             // Number formatting properties
                'showDataLabels', 'allowLabelOverlap', 'labelFormat'                                        // Data label properties            
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue) {
                this[name] = newValue;
                this._renderChart();
            }
        }

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

        _renderChart() {
            const dataBinding = this.dataBinding;
            if (!dataBinding || dataBinding.state !== 'success' || !dataBinding.data || dataBinding.data.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedPoint = null; // Reset selection when chart is destroyed
                }
                return;
            }

            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);

            if (dimensions.length === 0 || measures.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedPoint = null; // Reset selection when chart is destroyed
                }
                return;
            }

            this.categoryData = dimensions.map(dimension => {
                return {
                    id: dimension.id,   
                    name: dimension.description,
                    data: [],
                    key: dimension.key
                }
            })

            const series = measures.map(measure => {
                return {
                    id: measure.id,
                    name: measure.label,
                    data: [],
                    key: measure.key,
                    type: 'funnel3d',
                    categoryName: this.categoryData[0].name // The category name
                }
            });

            data.forEach(row => {
                this.categoryData.forEach(category => {
                    category.data.push({
                        id: row[category.key].id,
                        name: row[category.key].label
                    })
                })
                series.forEach(series => {
                    series.data.push(row[series.key].raw);
                });
            });

            let sortedIndices = [...Array(this.categoryData[0].data.length).keys()].sort((a, b) => {
                return this.categoryData[0].data[a].id - this.categoryData[0].data[b].id;
            });

            this.categoryData.forEach(category => {
                category.data = sortedIndices.map(i => category.data[i]);
            });

            series.forEach(series => {
                series.data = sortedIndices.map(i => series.data[i]);
            });

            console.log("Category Data (After Sorting):");
            console.log(this.categoryData);
            console.log("Series (After Sorting):");
            console.log(series);
            console.log("Data:");
            console.log(data);

            const scaleFormat = (value) =>{
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
            };


            const subtitleText = this._updateSubtitle();

            const labelFormat = this.labelFormat;

            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });

            const categoryData = this.categoryData;

            const containerWidth = this.shadowRoot.getElementById('container').offsetWidth;

            this._selectedPoint = null; // Reset the selected point reference before rendering the chart
            
            const chartOptions = {
              chart: {
                type: "funnel3d",
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
                    load: function() {
                        var chart = this,
                        points = chart.series[0].points,
                        offset
                        points.forEach(function(point, index) {
                            if ((point.dataLabel.attr('x') + point.dataLabel.attr('width')) > chart.plotWidth) {
                                offset = (point.dataLabel.attr('x') + point.dataLabel.attr('width')) - chart.plotWidth;

                                point.dataLabel.attr({
                                    x: point.dataLabel.attr('x') - offset
                                });
                            }
                        });
                    }
                }
              },
              title: {
                text: this.chartTitle || "",
                align: this.titleAlignment || "left",
                style: {
                  fontSize: this.titleSize || "20px",
                  fontWeight: this.titleFontStyle || "bold",
                  color: this.titleColor || "#333333",
                },
              },
              subtitle: {
                text: subtitleText,
                align: this.subtitleAlignment || "left",
                style: {
                  fontSize: this.subtitleSize || "12px",
                  fontStyle: this.subtitleFontStyle || "normal",
                  color: this.subtitleColor || "#666666",
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
                    padding: 2,
                    backgroundColor: '#eeeeeeaa',
                    borderWidth: 1,
                    borderRadius: 1,
                    shadow: true,
                    style: {
                        fontWeight: 'normal',
                        textOutline: 'none',
                        color: '#000000',
                        fontSize: '13px',
                    },
                    formatter: function () {
                        const index = series[0].data.indexOf(this.y);
                        if (index !== -1 && categoryData && categoryData[0].data[index]) {
                            const category = categoryData[0].data[index];
                            const { scaledValue, valueSuffix } = scaleFormat(this.y);
                            const value = scaledValue;
                            if (labelFormat === 'labelAndValue') {
                                return `${category.name} - ${value}`;
                            } else if (labelFormat === 'valueOnly') {
                                return `${value}`;
                            } else if (labelFormat === 'labelOnly') {
                                return `${category.name}`;
                            } else {
                                return `${category.name} - ${value}`;
                            }
                        } else {
                            return 'error with data';
                        }
                    }
                  },
                  neckWidth: (20 / 50) * 0.7 * 100 + "%",
                  neckHeight: ((20 + 5) / (50 + 20 + 5)) * 100 + "%",
                  width: "70%",
                  height: "80%",
                },
              },
              exporting: {
                enabled: true,
              },
              tooltip: {
                valueDecimals: 0,
                followPointer: true,
                hideDelay: 0,
                useHTML: true,
                formatter: function () {
                    console.log(this);
                    // Find index of current point in the series data
                    const index = this.series.data.indexOf(this.point);
                    if (index !== -1 && categoryData && categoryData[0].data[index]) {
                        // Retrieve the category data using the index
                        const category = categoryData[0].data[index];
                        const { scaledValue, valueSuffix } = scaleFormat(this.y);
                        const value = scaledValue;
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
                                    <td style="text-align: right; padding-left: 10px;">${category.name}</td>
                                </tr>
                            </table>
                        </div>
                        `;

                    } else {
                        return 'error with data';
                    }
                }
              },
              series,
            };
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }

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
              console.log("Setting filter with selection:", selection);

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