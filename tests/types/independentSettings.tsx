import React from 'react';
import {QuerySettings} from '../../src/modules/QuerySettings';
import {QueryAttributesEditor} from '../../src/modules/QueryAttributesEditor';
import {QueryEditor} from '../../src/widgets/QueryEditor';
import {BuiltinEngineSettingsFields} from '../../src/widgets/QueryEditor/presets/builtin';
import type {QueryEditorProps} from '../../src/types/queryEditor';
import type {
    QuerySettingsAttribute as LegacyAttribute,
    QuerySettingsAttributeCodec as LegacyCodec,
    QuerySettingsAttributeErrors as LegacyErrors,
    QuerySettingsAttributePermissions as LegacyPermissions,
    QuerySettingsSectionsProps,
    QuerySettingsStandardFields,
} from '../../src/types/querySettings';
import type {
    QuerySettingsAttribute,
    QuerySettingsAttributeCodec,
    QuerySettingsAttributeErrors,
    QuerySettingsAttributePermissions,
} from '../../src/modules/QueryAttributesEditor';

const sections: QuerySettingsSectionsProps<number> = {
    mode: 'sections',
    general: {queryName: {value: 'Report', onChange: (value) => value.toUpperCase()}},
    attributes: {
        items: [{id: 'x', key: 'limit', value: 2}],
        onChange: (items) => items[0].value.toFixed(),
        attributeCodec: {format: String, parse: (text) => ({value: Number(text)})},
    },
};
<QuerySettings {...sections} />;
declare const editor: QueryEditorProps<{}, never, number>;
<QueryEditor {...editor} settingsProps={sections} settings={undefined} />;
<QueryAttributesEditor
    items={[{id: 'x', key: 'limit', value: 2}]}
    attributeCodec={{format: String, parse: () => ({value: 3})}}
    onChange={(items) => items[0].value.toFixed()}
/>;
// @ts-expect-error Typed attributes must provide their codec.
<QueryAttributesEditor items={[{id: 'x', key: 'limit', value: 2}]} onChange={() => {}} />;
// @ts-expect-error Independently controlled settings do not accept an aggregate callback.
<QuerySettings mode="sections" general={{}} onChange={() => {}} />;
<BuiltinEngineSettingsFields
    engineId="yql"
    value={{yqlVersion: 'stable', other: 123}}
    onChange={(value, field) => {
        value.other.toFixed();
        const known: 'yqlVersion' | 'clique' | 'discoveryGroup' | 'spytConfig' = field;
        return known;
    }}
/>;

// Codec error branches must not widen the committed item type to number | undefined.
declare const numericItems: import('../../src/types/querySettings').QuerySettingsAttribute<number>[];
declare const setNumericItems: React.Dispatch<React.SetStateAction<typeof numericItems>>;
<QuerySettings
    mode="sections"
    attributes={{
        items: numericItems,
        onChange: setNumericItems,
        attributeCodec: {
            format: String,
            parse: (text) =>
                text.trim() && Number.isFinite(Number(text))
                    ? {value: Number(text)}
                    : {error: 'Invalid number'},
        },
    }}
/>;
<QueryAttributesEditor
    items={numericItems}
    onChange={setNumericItems}
    attributeCodec={{
        format: String,
        parse: (text) => (text.trim() ? {value: Number(text)} : {error: 'Required'}),
    }}
/>;
<QueryAttributesEditor
    items={numericItems}
    onChange={setNumericItems}
    // @ts-expect-error The parser must return the committed numeric value type.
    attributeCodec={{format: String, parse: () => ({value: 'wrong'})}}
/>;

// Both public import locations identify the same standalone attribute contracts.

type Equal<A, B> =
    (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
export type AttributeContractCompatibility = [
    Assert<Equal<LegacyAttribute<number>, QuerySettingsAttribute<number>>>,
    Assert<Equal<LegacyCodec<number>, QuerySettingsAttributeCodec<number>>>,
    Assert<Equal<LegacyErrors, QuerySettingsAttributeErrors>>,
    Assert<Equal<LegacyPermissions, QuerySettingsAttributePermissions>>,
];

// Arbitrary application fields need none of the opinionated standard-field models.
export const customOnlySections: QuerySettingsSectionsProps = {
    mode: 'sections',
    sections: [{id: 'deployment', title: 'Deployment', content: <input name="region" />}],
};
<QuerySettings {...customOnlySections} />;

export const explicitlyRequiredFields: QuerySettingsStandardFields = {
    queryName: {value: 'Report', onChange: () => {}, required: true},
    access: {value: 'private', onChange: () => {}, required: false},
};
<QuerySettings mode="sections" general={explicitlyRequiredFields} />;
