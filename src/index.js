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

        _renderChart() {
            const dataBinding = this.dataBinding;
            if (!dataBinding || dataBinding.state !== 'success') {
                return;
            }

            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);

            const categoryData = [];

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
                categoryData.push(dimensions.map(dimension => {
                    return row[dimension.key].label;
                }).join('/'));
                series.forEach(series => {
                    series.data.push(row[series.key].raw);
                });
            });

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
                    text: 'Highcharts 3D Funnel Chart'
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:,.0f}',
                            allowOverlap: true,
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
                series
            }
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }
    }
    customElements.define('com-sap-sample-funnel3d', Funnel3D);
})();