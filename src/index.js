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
            this.shadowRoot.innerHTML = `
                <div id="container" style="width: 100%; height: 100%;"></div>    
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
        }

        static get observedAttributes() {
            return [
                'chartTitle', 'titleSize', 'titleFontStyle', 'titleAlignment', 'titleColor',                // Title properties
                'chartSubtitle', 'subtitleSize', 'subtitleFontStyle', 'subtitleAlignment', 'subtitleColor', // Subtitle properties
                'scaleFormat', 'decimalPlaces',                                                             // Number formatting properties
                'showDataLabels', 'allowLabelOverlap'                                                       // Data label properties            
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
                }
                return;
            }

            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);

            if (dimensions.length === 0 || measures.length === 0) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                }
                return
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
                    type: 'funnel3d'
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

            const scaleFormat = (value) =>{
                let scaledValue = value;
                switch (this.scaleFormat) {
                    case 'k':
                        scaledValue = value / 1000;
                        break;
                    case 'm':
                        scaledValue = value / 1000000;
                        break;
                    case 'b':
                        scaledValue = value / 1000000000;
                        break;
                    default:
                        break;
                }
                return scaledValue.toFixed(this.decimalPlaces);
            }

            const subtitleText = this._updateSubtitle();

            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                }
            });

            const categoryData = this.categoryData;
            
            const chartOptions = {
              chart: {
                type: "funnel3d",
                options3d: {
                  enabled: true,
                  alpha: 10,
                  viewDistance: 50,
                },
                marginRight: 70,
              },
              title: {
                text: this.chartTitle || "",
                align: this.titleAlignment || "center",
                style: {
                  fontSize: this.titleSize || "20px",
                  fontWeight: this.titleFontStyle || "bold",
                  color: this.titleColor || "#333333",
                },
              },
              subtitle: {
                text: subtitleText,
                align: this.subtitleAlignment || "center",
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
                    formatter: function () {
                        const index = series[0].data.indexOf(this.y);
                        if (index !== -1 && categoryData && categoryData[0].data[index]) {
                            const category = categoryData[0].data[index];
                            const value = scaleFormat(this.y);
                            return `${category.name} - ${value}`;
                        } else {
                            return '';
                        }
                    },
                    y: 10,
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
              },
              series,
            };
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }

        _handlePointClick(event) {
            const point = event.target;
            if (!point) {
                console.error('Point is undefined');
                return;
            }

            const dataBinding = this.dataBinding;

            const pointIndex = point.index;
            // Retrieve the correct label based on the index from the categoryData
            const label = this.categoryData[0].data[pointIndex].name;
            // Use the dimension key to find the corresponding item in dataBinding.data
            const selectedItem = dataBinding.data.find(item => item[this.categoryData[0].key].label === label);
            const linkedAnalysis = this.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

            if (this._selectedPoint && this._selectedPoint !== point) {
                const prevLabel = this.categoryData[0].data[this._selectedPoint.index].name;
                const prevItem = this.dataBinding.data.find(item => item[this.categoryData[0].key].label === prevLabel);

                if (prevItem) {
                    const prevSelection = {};
                    prevSelection[this.categoryData[0].id] = prevItem[this.categoryData[0].key].id;
                    linkedAnalysis.removeFilters();
                    this._selectedPoint.select(false, false);
                }
            }

            if (event.type === 'select') {
                if (selectedItem) {
                    const selection = {};
                    selection[this.categoryData[0].id] = selectedItem[this.categoryData[0].key].id;
                    console.log('Setting filter with selection:', selection);
                    linkedAnalysis.setFilters(selection);
                    this._selectedPoint = point;
                }
            } else if (event.type === 'unselect') {
                linkedAnalysis.removeFilters();
                this._selectedPoint = null;
            }
        }
    }
    customElements.define('com-sap-sample-funnel3d', Funnel3D);
})();