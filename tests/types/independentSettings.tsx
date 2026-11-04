import React from 'react';
import {QueryAttributesEditor} from '../../src/modules/QueryAttributesEditor';
import type {
    QuerySettingsAttribute as LegacyAttribute,
    QuerySettingsAttributeCodec as LegacyCodec,
    QuerySettingsAttributeErrors as LegacyErrors,
    QuerySettingsAttributePermissions as LegacyPermissions,
} from '../../src/types/querySettings';
import type {
    QuerySettingsAttribute,
    QuerySettingsAttributeCodec,
    QuerySettingsAttributeErrors,
    QuerySettingsAttributePermissions,
} from '../../src/modules/QueryAttributesEditor';

<QueryAttributesEditor
    items={[{id: 'x', key: 'limit', value: 2}]}
    attributeCodec={{format: String, parse: () => ({value: 3})}}
    onChange={(items) => items[0].value.toFixed()}
/>;
// @ts-expect-error Typed attributes must provide their codec.
<QueryAttributesEditor items={[{id: 'x', key: 'limit', value: 2}]} onChange={() => {}} />;
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

