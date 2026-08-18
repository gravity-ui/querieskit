import type {Column} from '../../../components';
import {buildColumnsFromKeys} from '../../../helpers/buildColumnsFromKeys';
import type {NavigationViewRow} from '../../../types/navigation';
import type viewI18n from '../i18n';

export function buildViewColumns<TRow extends NavigationViewRow>(
    columns: string[],
    i18n: typeof viewI18n,
): Array<Column<TRow>> {
    return buildColumnsFromKeys<TRow>(columns, i18n('value_empty'));
}
