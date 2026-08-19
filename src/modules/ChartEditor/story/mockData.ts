import type {ChartAxisType} from '@gravity-ui/charts';
import type {ChartSeries} from '../types';

type ChartSeriesMap = Record<string, ChartSeries>;

export const cartesianAxisVariants: ChartAxisType[] = ['linear', 'datetime', 'logarithmic'];
export const timeAxisVariants: ChartAxisType[] = ['datetime', 'linear'];
export const logarithmicAxisVariants: ChartAxisType[] = ['logarithmic', 'linear'];
export const pieAxisVariants: ChartAxisType[] = ['linear'];

const getALineCords = () => {
    const linePoints = [
        82, 46, 54, 49, 38, 41, 65, 46, 58, 58, 54, 30, 38, 65, 36, 53, 45, 75, 69, 64, 31, 38, 53,
        66, 52, 33, 34, 38, 37, 34, 26,
    ].map((y, index) => ({x: Number(Number(1 + index * 0.15).toFixed(2)), y}));

    return linePoints;
};

const getBLineCords = () => {
    const linePoints = [
        23, 46, 54, 49, 38, 41, 65, 46, 23, 58, 54, 30, 66, 65, 36, 53, 85, 75, 69, 64, 90, 38, 53,
        66, 52, 33, 34, 20, 37, 75, 33,
    ].map((y, index) => ({x: Number(Number(1 + index * 0.65).toFixed(2)), y}));

    return linePoints;
};

export const aLineCords = getALineCords();
export const bLineCords = getBLineCords();

export const lineSeriesMap: ChartSeriesMap = {
    'Response time': {
        type: 'line',
        name: 'Response time',
        seriesId: 'response-time',
        data: aLineCords,
        marker: {enabled: false},
    },
};

export const multiLineSeriesMap: ChartSeriesMap = {
    'Current week': {
        type: 'line',
        name: 'Current week',
        seriesId: 'current-week',
        data: [42, 48, 45, 61, 58, 72, 68].map((y, x) => ({x: x + 1, y})),
        marker: {enabled: true},
    },
    'Previous week': {
        type: 'line',
        name: 'Previous week',
        seriesId: 'previous-week',
        data: [38, 43, 49, 52, 55, 60, 63].map((y, x) => ({x: x + 1, y})),
        dashStyle: 'Dash',
        marker: {enabled: true},
    },
    Target: {
        type: 'line',
        name: 'Target',
        seriesId: 'target',
        data: [50, 50, 50, 55, 55, 65, 65].map((y, x) => ({x: x + 1, y})),
        dashStyle: 'Dot',
        marker: {enabled: false},
    },
};

const hour = 60 * 60 * 1000;
const timeSeriesStart = Date.UTC(2026, 7, 15, 8);

export const timeSeriesMap: ChartSeriesMap = {
    'Requests per minute': {
        type: 'area',
        name: 'Requests per minute',
        seriesId: 'requests-per-minute',
        data: [120, 180, 165, 240, 310, 285, 360, 330, 390, 350, 300, 260].map((y, index) => ({
            x: timeSeriesStart + index * hour,
            y,
        })),
        opacity: 0.35,
    },
};

export const stackedAreaSeriesMap: ChartSeriesMap = {
    Organic: {
        type: 'area',
        name: 'Organic',
        stacking: 'normal',
        stackId: 'traffic',
        seriesId: 'Organic',
        data: [180, 210, 195, 240, 265, 290, 310].map((y, x) => ({x: x + 1, y})),
    },
    Advertising: {
        type: 'area',
        name: 'Advertising',
        stacking: 'normal',
        stackId: 'traffic',
        seriesId: 'Advertising',
        data: [80, 95, 120, 110, 140, 155, 170].map((y, x) => ({x: x + 1, y})),
    },
    Referrals: {
        type: 'area',
        name: 'Referrals',
        stacking: 'normal',
        stackId: 'traffic',
        seriesId: 'Referrals',
        data: [45, 52, 48, 65, 72, 68, 84].map((y, x) => ({x: x + 1, y})),
    },
};

export const groupedColumnsSeriesMap: ChartSeriesMap = {
    Desktop: {
        type: 'bar-x',
        name: 'Desktop',
        borderRadius: 3,
        dataLabels: {enabled: true},
        seriesId: 'Desktop',
        data: [420, 510, 590, 640, 710, 760].map((y, x) => ({x: x + 1, y})),
    },
    Mobile: {
        type: 'bar-x',
        name: 'Mobile',
        borderRadius: 3,
        dataLabels: {enabled: true},
        seriesId: 'Mobile',
        data: [310, 390, 460, 520, 610, 690].map((y, x) => ({x: x + 1, y})),
    },
};

export const horizontalBarsSeriesMap: ChartSeriesMap = {
    'Completed tasks': {
        type: 'bar-y',
        name: 'Completed tasks',
        borderRadius: 3,
        dataLabels: {enabled: true},
        seriesId: 'Completed-tasks',
        data: [92, 78, 67, 54, 41].map((x, y) => ({x, y: y + 1})),
    },
};

export const scatterSeriesMap: ChartSeriesMap = {
    'Cached queries': {
        type: 'scatter',
        name: 'Cached queries',
        data: [
            {x: 12, y: 90, radius: 5},
            {x: 18, y: 125, radius: 6},
            {x: 25, y: 145, radius: 5},
            {x: 33, y: 170, radius: 7},
            {x: 46, y: 210, radius: 6},
            {x: 58, y: 245, radius: 8},
        ],
        seriesId: 'Cached-queries',
    },
    'Uncached queries': {
        type: 'scatter',
        name: 'Uncached queries',
        symbolType: 'square',
        data: [
            {x: 14, y: 180, radius: 5},
            {x: 21, y: 230, radius: 7},
            {x: 29, y: 280, radius: 6},
            {x: 37, y: 340, radius: 8},
            {x: 49, y: 410, radius: 7},
            {x: 62, y: 490, radius: 9},
        ],
        seriesId: 'Uncached-queries',
    },
};

export const donutSeriesMap: ChartSeriesMap = {
    'Traffic sources': {
        type: 'pie',
        innerRadius: '55%',
        dataLabels: {enabled: true},
        data: [
            {name: 'Search', value: 42, label: '42%'},
            {name: 'Direct', value: 27, label: '27%'},
            {name: 'Referrals', value: 18, label: '18%'},
            {name: 'Social', value: 13, label: '13%'},
        ],
        seriesId: 'Traffic-sources',
    },
};

export const mixedSeriesMap: ChartSeriesMap = {
    Orders: {
        type: 'bar-x',
        name: 'Orders',
        borderRadius: 3,
        data: [34, 46, 41, 55, 62, 68, 74].map((y, x) => ({x: x + 1, y})),
        seriesId: 'Orders',
    },
    Plan: {
        type: 'line',
        name: 'Plan',
        dashStyle: 'Dash',
        lineWidth: 2,
        marker: {enabled: true},
        data: [40, 44, 48, 52, 60, 66, 72].map((y, x) => ({x: x + 1, y})),
        seriesId: 'Plan',
    },
};

export const logarithmicSeriesMap: ChartSeriesMap = {
    'Execution time': {
        type: 'line',
        name: 'Execution time',
        marker: {enabled: true},
        seriesId: 'Execution-time',
        data: [
            {x: 1, y: 18},
            {x: 10, y: 32},
            {x: 100, y: 85},
            {x: 1000, y: 240},
            {x: 10000, y: 710},
            {x: 100000, y: 2150},
        ],
    },
};

export const emptySeriesMap: ChartSeriesMap = {};
