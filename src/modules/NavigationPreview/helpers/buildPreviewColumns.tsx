import type {Column} from '../../../components';
import {buildColumnsFromKeys} from '../../../helpers/buildColumnsFromKeys';
import type {NavigationPreviewRow} from '../../../types/navigation';
import type previewI18n from '../i18n';

export function buildPreviewColumns<TRow extends NavigationPreviewRow>(
    columns: string[],
    i18n: typeof previewI18n,
): Array<Column<TRow>> {
    return buildColumnsFromKeys<TRow>(columns, i18n('value_empty'));
}
