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
        }

        onCustomWidgetResize(width, height) {
            this._renderChart();
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            this._renderChart();
        }

        onCustomWidgetDestroy(){
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

        _renderChart() {
            const dataBinding = this.dataBinding;
            console.log("Data Binding:");
            console.log(dataBinding);
            if (!dataBinding || dataBinding.state !== 'success') {
                return;
            }

            const { data, metadata } = dataBinding;
            console.log("Data:");
            console.log(data);
            console.log("Metadata:");
            console.log(metadata);
            const { dimensions, measures } = parseMetadata(metadata);
            console.log("Dimensions:")
            console.log(dimensions);
            console.log("Measures:")
            console.log(measures);

            const categoryData = dimensions.map(dimension => {
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
                categoryData.forEach(category => {
                    category.data.push(row[category.key].label);
                })
                series.forEach(series => {
                    series.data.push(row[series.key].raw);
                });
            });
            console.log("Category Data:");
            console.log(categoryData);
            console.log("Series:");
            console.log(series);

            const scaleFormat = (value) =>{
                let scaledValue = value;
                let suffix = '';
                switch (this.scaleFormat) {
                    case 'k':
                        scaledValue = value / 1000;
                        suffix = 'k';
                        break;
                    case 'm':
                        scaledValue = value / 1000000;
                        suffix = 'm';
                        break;
                    case 'b':
                        scaledValue = value / 1000000000;
                        suffix = 'b';
                        break;
                    default:
                        break;
                }
                return scaledValue.toFixed(this.decimalPlaces);
            }

            const chartOptions = {
                chart: {
                    type: 'funnel3d',
                    options3d: {
                        enabled: true,
                        alpha: 10,
                        viewDistance: 50
                    }
                },
                title: {
                    text: this.chartTitle || '',
                    align: this.titleAlignment || 'center',
                    style: {
                    fontSize: this.titleSize || '20px',
                    fontWeight: this.titleFontStyle || 'bold',
                    color: this.titleColor || '#333333'
                    }
                },
                subtitle: {
                    text: this.chartSubtitle || '',
                    align: this.subtitleAlignment || 'center',
                    style: {
                        fontSize: this.subtitleSize || '12px',
                        fontStyle: this.subtitleFontStyle || 'normal',
                        color: this.subtitleColor || '#666666'
                    }
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: this.showDataLabels || false,
                            allowOverlap: this.allowLabelOverlap || false,
                            formatter: function () {
                                const category = categoryData[this.point.index];
                                const value = scaleFormat(this.y);
                                return `${category} - ${value}`;
                            },
                            y: 10
                        },
                        neckWidth: '30%',
                        neckHeight: '25%',
                        width: '80%',
                        height: '80%'
                    }
                },
                exporting: {
                    enabled: true
                },
                tooltip: {
                    valueDecimals: 0,
                    formatter: function () {
                        const category = categoryData[this.point.index];
                        const value = scaleFormat(this.y);
                        return `${category} - ${value}`;
                    }
                },
                series
            }
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }
    }
    customElements.define('com-sap-sample-funnel3d', Funnel3D);
})();