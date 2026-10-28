import React from 'react';
import {QuerySettings} from '../../src/modules/QuerySettings';
import {QueryEditor} from '../../src/widgets/QueryEditor';
import {QueryPage} from '../../src/pages/QueryPage';
import {createBuiltinQueryEngines} from '../../src/widgets/QueryEditor/presets/builtin';
import type {BuiltinEngineSettings} from '../../src/types/builtinQueryEngines';
import type {
    QuerySettingsAttributeCodec,
    QuerySettingsProps,
    QuerySettingsValue,
} from '../../src/types/querySettings';
import type {QueryEditorProps} from '../../src/types/queryEditor';
import type {QueryPageProps} from '../../src/types/queryPage';
import type {AttachItem} from '../../src/types/attachments';
import type {QueryHistoryRow} from '../../src/types/history';
import type {SavedQuery} from '../../src/types/savedQueries';
import type {
    NavigationCluster,
    NavigationItem,
    NavigationMetaItem,
} from '../../src/types/navigation';
import type {TutorialHistoryRow} from '../../src/types/tutorial';
import type {VcsItem} from '../../src/types/queriesVcs';

type Custom = {warehouse: string};
declare const legacy: QuerySettingsValue<Custom>;
declare const typed: QuerySettingsValue<Custom, number>;
const codec: QuerySettingsAttributeCodec<number> = {
    format: String,
    parse: (text) =>
        Number.isFinite(Number(text)) ? {value: Number(text)} : {error: 'Invalid number'},
};
const legacyProps: QuerySettingsProps<Custom> = {
    value: legacy,
    onChange: (next) => {
        next.attributes[0].value.toUpperCase();
    },
};
<QuerySettings {...legacyProps} />;
const typedProps: QuerySettingsProps<Custom, number> = {
    value: typed,
    attributeCodec: codec,
    onChange: (next, change) => {
        next.attributes[0].value.toFixed();
        change?.changes.forEach((operation) => {
            if (operation.section === 'custom') {
                const field: 'warehouse' = operation.field;
                return field;
            }
            return undefined;
        });
    },
    validateAttribute: (row) => (row.value < 0 ? {value: 'Negative'} : undefined),
};
<QuerySettings {...typedProps} />;
// @ts-expect-error Non-string attribute values require an explicit codec.
export const missingCodec: QuerySettingsProps<Custom, number> = {value: typed, onChange: () => {}};
// @ts-expect-error Inferred typed values must require a codec as well.
<QuerySettings value={typed} onChange={() => {}} />;
// @ts-expect-error A codec for numbers cannot handle existing string values.
<QuerySettings value={legacy} onChange={() => {}} attributeCodec={codec} />;

declare const editor: QueryEditorProps<Custom, AttachItem, number>;
<QueryEditor {...editor} settingsProps={typedProps} settings={undefined} />;
const engines = createBuiltinQueryEngines<BuiltinEngineSettings, number>();
declare const builtinEditor: QueryEditorProps<BuiltinEngineSettings, AttachItem, number>;
<QueryEditor {...builtinEditor} engines={engines} />;

declare const page: QueryPageProps<
    QueryHistoryRow,
    SavedQuery,
    NavigationItem,
    NavigationCluster,
    TutorialHistoryRow,
    Custom,
    Record<string, unknown>,
    NavigationMetaItem,
    VcsItem,
    AttachItem,
    number
>;
<QueryPage {...page} />;
