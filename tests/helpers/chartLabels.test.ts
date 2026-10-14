import {afterEach, expect, it} from 'vitest';
import {getChartTypeLabel} from '../../src/helpers/chartLabels';
import {setLang} from '../../src/i18n';

afterEach(() => setLang('en'));

it('resolves chart labels in the current language after initialization', () => {
    setLang('en');
    expect(getChartTypeLabel('line')).toBe('Line');
    expect(getChartTypeLabel('bar-x')).toBe('Vertical bars');
    setLang('ru');
    expect(getChartTypeLabel('line')).toBe('Линейный');
    expect(getChartTypeLabel('bar-x')).toBe('Вертикальные столбцы');
    expect(getChartTypeLabel('bar-y')).toBe('Горизонтальные столбцы');
    setLang('en');
    expect(getChartTypeLabel('line')).toBe('Line');
});
