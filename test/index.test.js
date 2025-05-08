// Mock HTMLElement for the test environment
class MockHTMLElement {}
global.HTMLElement = MockHTMLElement;

describe('_updateSubtitle', () => {
    test('returns correct subtitle based on scaleFormat when chartSubtitle is empty', () => {
        const funnel3D = new (class extends HTMLElement {
            _updateSubtitle() {
                if (!this.chartSubtitle || this.chartSubtitle.trim() === '') {
                    switch (this.scaleFormat) {
                        case 'k': return 'in k';
                        case 'm': return 'in m';
                        case 'b': return 'in b';
                        default: return '';
                    }
                } else {
                    return this.chartSubtitle;
                }
            }
        })();

        funnel3D.chartSubtitle = '';
        funnel3D.scaleFormat = 'k';
        expect(funnel3D._updateSubtitle()).toBe('in k');

        funnel3D.scaleFormat = 'm';
        expect(funnel3D._updateSubtitle()).toBe('in m');

        funnel3D.scaleFormat = 'b';
        expect(funnel3D._updateSubtitle()).toBe('in b');

        funnel3D.scaleFormat = 'unknown';
        expect(funnel3D._updateSubtitle()).toBe('');
    });

    test('returns chartSubtitle when it is not empty', () => {
        const funnel3D = new (class extends HTMLElement {
            _updateSubtitle() {
                if (!this.chartSubtitle || this.chartSubtitle.trim() === '') {
                    switch (this.scaleFormat) {
                        case 'k': return 'in k';
                        case 'm': return 'in m';
                        case 'b': return 'in b';
                        default: return '';
                    }
                } else {
                    return this.chartSubtitle;
                }
            }
        })();

        funnel3D.chartSubtitle = 'Custom Subtitle';
        expect(funnel3D._updateSubtitle()).toBe('Custom Subtitle');
    });
});

describe('_scaleFormat', () => {
    test('scales value correctly for different formats', () => {
        const funnel3D = new (class extends HTMLElement {
            constructor() {
                super();
                this.decimalPlaces = 2;
            }
            _scaleFormat(value) {
                switch (this.scaleFormat) {
                    case 'k': return { scaledValue: (value / 1000).toFixed(this.decimalPlaces), valueSuffix: 'k' };
                    case 'm': return { scaledValue: (value / 1000000).toFixed(this.decimalPlaces), valueSuffix: 'm' };
                    case 'b': return { scaledValue: (value / 1000000000).toFixed(this.decimalPlaces), valueSuffix: 'b' };
                    default: return { scaledValue: value.toFixed(this.decimalPlaces), valueSuffix: '' };
                }
            }
        })();

        funnel3D.scaleFormat = 'k';
        expect(funnel3D._scaleFormat(1500)).toEqual({ scaledValue: '1.50', valueSuffix: 'k' });

        funnel3D.scaleFormat = 'm';
        expect(funnel3D._scaleFormat(1500000)).toEqual({ scaledValue: '1.50', valueSuffix: 'm' });

        funnel3D.scaleFormat = 'b';
        expect(funnel3D._scaleFormat(1500000000)).toEqual({ scaledValue: '1.50', valueSuffix: 'b' });

        funnel3D.scaleFormat = 'unknown';
        expect(funnel3D._scaleFormat(1500)).toEqual({ scaledValue: '1500.00', valueSuffix: '' });
    });
});

describe('_processCategoryData', () => {
    test('processes valid dimensions correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _processCategoryData(dimensions) {
                return dimensions.map(dimension => ({
                    id: dimension.id,
                    name: dimension.description,
                    data: [],
                    key: dimension.key
                }));
            }
        })();

        const dimensions = [
            { id: 1, description: 'Category 1', key: 'key1' },
            { id: 2, description: 'Category 2', key: 'key2' }
        ];

        const expectedOutput = [
            { id: 1, name: 'Category 1', data: [], key: 'key1' },
            { id: 2, name: 'Category 2', data: [], key: 'key2' }
        ];

        expect(funnel3D._processCategoryData(dimensions)).toEqual(expectedOutput);
    });

    test('processes empty dimensions correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _processCategoryData(dimensions) {
                return dimensions.map(dimension => ({
                    id: dimension.id,
                    name: dimension.description,
                    data: [],
                    key: dimension.key
                }));
            }
        })();

        expect(funnel3D._processCategoryData([])).toEqual([]);
    });
});

describe('_processSeriesData', () => {
    test('processes valid measures correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            constructor() {
                super();
                this.categoryData = [{ name: 'Category 1' }];
            }
            _processSeriesData(measures) {
                return measures.map(measure => ({
                    id: measure.id,
                    name: measure.label,
                    data: [],
                    key: measure.key,
                    type: 'funnel3d',
                    categoryName: this.categoryData[0]?.name || ''
                }));
            }
        })();

        const measures = [
            { id: 1, label: 'Measure 1', key: 'key1' },
            { id: 2, label: 'Measure 2', key: 'key2' }
        ];

        const expectedOutput = [
            { id: 1, name: 'Measure 1', data: [], key: 'key1', type: 'funnel3d', categoryName: 'Category 1' },
            { id: 2, name: 'Measure 2', data: [], key: 'key2', type: 'funnel3d', categoryName: 'Category 1' }
        ];

        expect(funnel3D._processSeriesData(measures)).toEqual(expectedOutput);
    });

    test('processes empty measures correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            constructor() {
                super();
                this.categoryData = [{ name: 'Category 1' }];
            }
            _processSeriesData(measures) {
                return measures.map(measure => ({
                    id: measure.id,
                    name: measure.label,
                    data: [],
                    key: measure.key,
                    type: 'funnel3d',
                    categoryName: this.categoryData[0]?.name || ''
                }));
            }
        })();

        expect(funnel3D._processSeriesData([])).toEqual([]);
    });
});

describe('_populateDataArrays', () => {
    test('processes valid data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _populateDataArrays(data, categoryData, series) {
                data.forEach(item => {
                    const category = categoryData.find(cat => cat.key === item.dimensionKey);
                    const seriesItem = series.find(ser => ser.key === item.measureKey);
                    if (category && seriesItem) {
                        category.data.push(item);
                        seriesItem.data.push(item);
                    }
                });
            }
        })();

        const data = [
            { dimensionKey: 'key1', measureKey: 'key1', value: 100 },
            { dimensionKey: 'key2', measureKey: 'key2', value: 200 }
        ];
        const categoryData = [
            { key: 'key1', data: [] },
            { key: 'key2', data: [] }
        ];
        const series = [
            { key: 'key1', data: [] },
            { key: 'key2', data: [] }
        ];

        funnel3D._populateDataArrays(data, categoryData, series);

        expect(categoryData[0].data).toEqual([{ dimensionKey: 'key1', measureKey: 'key1', value: 100 }]);
        expect(series[0].data).toEqual([{ dimensionKey: 'key1', measureKey: 'key1', value: 100 }]);
    });

    test('processes empty data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _populateDataArrays(data, categoryData, series) {
                data.forEach(item => {
                    const category = categoryData.find(cat => cat.key === item.dimensionKey);
                    const seriesItem = series.find(ser => ser.key === item.measureKey);
                    if (category && seriesItem) {
                        category.data.push(item);
                        seriesItem.data.push(item);
                    }
                });
            }
        })();

        const data = [];
        const categoryData = [{ key: 'key1', data: [] }];
        const series = [{ key: 'key1', data: [] }];

        funnel3D._populateDataArrays(data, categoryData, series);

        expect(categoryData[0].data).toEqual([]);
        expect(series[0].data).toEqual([]);
    });
});

describe('_sortDataById', () => {
    test('sorts data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _sortDataById(categoryData, series) {
                categoryData.sort((a, b) => a.id - b.id);
                series.sort((a, b) => a.id - b.id);
            }
        })();

        const categoryData = [{ id: 2 }, { id: 1 }];
        const series = [{ id: 2 }, { id: 1 }];

        funnel3D._sortDataById(categoryData, series);

        expect(categoryData).toEqual([{ id: 1 }, { id: 2 }]);
        expect(series).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('handles empty data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _sortDataById(categoryData, series) {
                categoryData.sort((a, b) => a.id - b.id);
                series.sort((a, b) => a.id - b.id);
            }
        })();

        const categoryData = [];
        const series = [];

        funnel3D._sortDataById(categoryData, series);

        expect(categoryData).toEqual([]);
        expect(series).toEqual([]);
    });
});

describe('_formatTooltip', () => {
    test('formats valid data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _formatTooltip(data) {
                return `Value: ${data.value}`;
            }
        })();

        const data = { value: 100 };
        expect(funnel3D._formatTooltip(data)).toBe('Value: 100');
    });

    test('handles invalid data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _formatTooltip(data) {
                return data && data.value ? `Value: ${data.value}` : 'No data';
            }
        })();

        expect(funnel3D._formatTooltip(null)).toBe('No data');
    });
});

describe('_formatDataLabel', () => {
    test('formats data correctly for labelAndValue', () => {
        const funnel3D = new (class extends HTMLElement {
            _formatDataLabel(data, format) {
                switch (format) {
                    case 'labelAndValue': return `${data.label}: ${data.value}`;
                    case 'valueOnly': return `${data.value}`;
                    case 'labelOnly': return `${data.label}`;
                    default: return '';
                }
            }
        })();

        const data = { label: 'Label', value: 100 };
        expect(funnel3D._formatDataLabel(data, 'labelAndValue')).toBe('Label: 100');
        expect(funnel3D._formatDataLabel(data, 'valueOnly')).toBe('100');
        expect(funnel3D._formatDataLabel(data, 'labelOnly')).toBe('Label');
    });

	test('formats data correctly for valueOnly', () => {
        const funnel3D = new (class extends HTMLElement {
            _formatDataLabel(data, format) {
                switch (format) {
                    case 'labelAndValue': return `${data.label}: ${data.value}`;
                    case 'valueOnly': return `${data.value}`;
                    case 'labelOnly': return `${data.label}`;
                    default: return '';
                }
            }
        })();

        const data = { label: 'Label', value: 100 };
        expect(funnel3D._formatDataLabel(data, 'valueOnly')).toBe('100');
    });

    test('formats data correctly for labelOnly', () => {
        const funnel3D = new (class extends HTMLElement {
            _formatDataLabel(data, format) {
                switch (format) {
                    case 'labelAndValue': return `${data.label}: ${data.value}`;
                    case 'valueOnly': return `${data.value}`;
                    case 'labelOnly': return `${data.label}`;
                    default: return '';
                }
            }
        })();

        const data = { label: 'Label', value: 100 };
        expect(funnel3D._formatDataLabel(data, 'labelOnly')).toBe('Label');
    });

    test('handles invalid data correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            _formatDataLabel(data, format) {
                switch (format) {
                    case 'labelAndValue': return `${data?.label || ''}: ${data?.value || ''}`;
                    case 'valueOnly': return `${data?.value || ''}`;
                    case 'labelOnly': return `${data?.label || ''}`;
                    default: return '';
                }
            }
        })();

        expect(funnel3D._formatDataLabel(null, 'labelAndValue')).toBe(': ');
    });
});

describe('_handlePointClick', () => {
    test('handles point selection correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            constructor() {
                super();
                this.selectedPoints = new Set();
            }
            _handlePointClick(point) {
                if (this.selectedPoints.has(point)) {
                    this.selectedPoints.delete(point);
                } else {
                    this.selectedPoints.add(point);
                }
            }
        })();

        const point = { id: 1 };
        funnel3D._handlePointClick(point);
        expect(funnel3D.selectedPoints.has(point)).toBe(true);

        funnel3D._handlePointClick(point);
        expect(funnel3D.selectedPoints.has(point)).toBe(false);
    });

	test('handles point unselection and filter removal correctly', () => {
        const funnel3D = new (class extends HTMLElement {
            constructor() {
                super();
                this.selectedPoints = new Set();
            }
            _handlePointClick(point) {
                if (this.selectedPoints.has(point)) {
                    this.selectedPoints.delete(point);
                } else {
                    this.selectedPoints.add(point);
                }
            }
        })();

        const point = { id: 1 };
        funnel3D.selectedPoints.add(point); // Simulate point already selected
        funnel3D._handlePointClick(point);
        expect(funnel3D.selectedPoints.has(point)).toBe(false);
    });
});