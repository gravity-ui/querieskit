import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Select, TextInput} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {FormField} from '../../../components/FormField';
import type {
    QuerySettingsCustomFieldsContext,
    QuerySettingsErrors,
    QuerySettingsHiddenField,
    QuerySettingsValue,
} from '../../../types/querySettings';
import {QueryEditor} from '../../../widgets/QueryEditor';
import type {QueryEditorPanel} from '../../../types/queryEditor';
import {QuerySettings} from '../QuerySettings';

type CustomSettings = {yqlVersion: string; warehouse: string};
type Settings = QuerySettingsValue<CustomSettings>;

const initialValue: Settings = {
    queryName: 'Daily report',
    access: 'private',
    ytOperationTitle: 'Daily report operation',
    tokenIds: ['analytics'],
    attributes: [{id: 'owner', key: 'owner', value: 'analytics'}],
    custom: {yqlVersion: 'stable', warehouse: 'reporting'},
};
const tokens = [
    {id: 'analytics', title: 'Analytics'},
    {id: 'production', title: 'Production'},
    {id: 'expired', title: 'Expired token', disabled: true},
];
const engines = [
    {id: 'yql', title: 'YQL', language: 'yql'},
    {id: 'clickhouse', title: 'ClickHouse', language: 'clickhouse'},
];

function validate(value: Settings, engine: string): QuerySettingsErrors<CustomSettings> {
    return {
        fields: {
            queryName: value.queryName.trim() ? undefined : 'Enter a query name',
            ytOperationTitle: value.ytOperationTitle.trim()
                ? undefined
                : 'Enter an operation title',
        },
        attributes: Object.fromEntries(
            value.attributes.map(({id, key}) => [
                id,
                {key: key.trim() ? undefined : 'Enter a key'},
            ]),
        ),
        custom: {
            warehouse:
                engine !== 'yql' && !value.custom.warehouse.trim()
                    ? 'Enter a warehouse'
                    : undefined,
        },
    };
}

function CustomFields({
    engine,
    value,
    onChange,
    errors,
    onFieldBlur,
    disabled,
}: QuerySettingsCustomFieldsContext<CustomSettings> & {engine: string}) {
    return engine === 'yql' ? (
        <FormField label="YQL version">
            <Select
                aria-label="YQL version"
                width="max"
                value={[value.custom.yqlVersion]}
                options={[
                    {value: 'stable', content: 'Stable'},
                    {value: 'preview', content: 'Preview'},
                ]}
                disabled={disabled}
                onUpdate={([yqlVersion]) =>
                    onChange({...value, custom: {...value.custom, yqlVersion}})
                }
                onBlur={() => onFieldBlur?.({section: 'custom', field: 'yqlVersion'})}
                validationState={errors?.custom?.yqlVersion ? 'invalid' : undefined}
                errorMessage={errors?.custom?.yqlVersion}
            />
        </FormField>
    ) : (
        <FormField label="Warehouse">
            <TextInput
                value={value.custom.warehouse}
                controlProps={{'aria-label': 'Warehouse'}}
                disabled={disabled}
                onUpdate={(warehouse) => onChange({...value, custom: {...value.custom, warehouse}})}
                onBlur={() => onFieldBlur?.({section: 'custom', field: 'warehouse'})}
                validationState={errors?.custom?.warehouse ? 'invalid' : undefined}
                errorMessage={errors?.custom?.warehouse}
            />
        </FormField>
    );
}

function Example({
    engine = 'yql',
    hiddenFields,
    disabled = false,
    invalid = false,
    width = 320,
    inEditor = false,
    manyAttributes = false,
    emptyTokens = false,
}: {
    engine?: string;
    hiddenFields?: QuerySettingsHiddenField[];
    disabled?: boolean;
    invalid?: boolean;
    width?: number;
    inEditor?: boolean;
    manyAttributes?: boolean;
    emptyTokens?: boolean;
}) {
    const [engineId, setEngineId] = useState(engine);
    const [query, setQuery] = useState('SELECT 1;');
    const [activePanel, setActivePanel] = useState<QueryEditorPanel>('settings');
    const [showErrors, setShowErrors] = useState(invalid);
    const [value, setValue] = useState<Settings>(() => ({
        ...initialValue,
        ...(invalid && {
            queryName: '',
            ytOperationTitle: '',
            attributes: [{id: 'empty', key: '', value: 'analytics'}],
            custom: {...initialValue.custom, warehouse: ''},
        }),
        ...(manyAttributes && {
            attributes: Array.from({length: 16}, (_, index) => ({
                id: `attribute-${index}`,
                key: `attribute_${index}`,
                value: `Value ${index}`,
            })),
        }),
    }));
    const errors = showErrors ? validate(value, engineId) : undefined;
    const run = () => {
        const nextErrors = validate(value, engineId);
        setShowErrors(true);
        const hasErrors = [
            ...Object.values(nextErrors.fields ?? {}),
            ...Object.values(nextErrors.custom ?? {}),
            ...Object.values(nextErrors.attributes ?? {}).flatMap(Object.values),
        ].some(Boolean);
        if (hasErrors) {
            setActivePanel('settings');
        } else {
            action('run')({query, settings: value});
        }
    };
    const settings = (
        <QuerySettings
            value={value}
            onChange={(nextValue) => {
                setValue(nextValue);
                action('settingsChange')(nextValue);
            }}
            tokens={emptyTokens ? [] : tokens}
            hiddenFields={hiddenFields}
            disabled={disabled}
            errors={errors}
            onFieldBlur={(field) => {
                setShowErrors(true);
                action('fieldBlur')(field);
            }}
            renderCustomFields={(context) => <CustomFields {...context} engine={engineId} />}
        />
    );

    if (inEditor) {
        return (
            <div style={{height: 520}}>
                <QueryEditor
                    value={query}
                    onChange={setQuery}
                    clusters={[{id: 'production', title: 'Production'}]}
                    clusterId="production"
                    onClusterChange={action('clusterChange')}
                    engines={engines}
                    engineId={engineId}
                    onEngineChange={setEngineId}
                    onRun={run}
                    onFormat={action('format')}
                    onValidate={() => {
                        setShowErrors(true);
                        setActivePanel('settings');
                        action('validate')(validate(value, engineId));
                    }}
                    activePanel={activePanel}
                    onActivePanelChange={setActivePanel}
                    settings={settings}
                />
            </div>
        );
    }
    return <div style={{width, maxWidth: '100%'}}>{settings}</div>;
}

const meta = {
    title: 'Modules/QuerySettings',
    component: Example,
    parameters: {layout: 'padded'},
    tags: ['autodocs'],
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Yql: Story = {};
export const OtherEngine: Story = {args: {engine: 'clickhouse'}};
export const HiddenFields: Story = {args: {hiddenFields: ['tokens', 'attributes']}};
export const ExternalErrors: Story = {args: {invalid: true, engine: 'clickhouse'}};
export const Disabled: Story = {args: {disabled: true}};
export const EmptyTokens: Story = {args: {emptyTokens: true}};
export const DarkAndNarrow: Story = {args: {width: 240}, globals: {theme: 'dark'}};
export const EditorIntegration: Story = {args: {inEditor: true, manyAttributes: true}};

function ProtectedSettingsExample() {
    const [settingsValue, setValue] = useState(initialValue);
    return (
        <div style={{width: 280, maxWidth: '100%'}}>
            <QuerySettings
                value={settingsValue}
                onChange={setValue}
                hiddenFields={['access']}
                renderCustomFields={({value, onChange, disabled}) => (
                    <Select
                        aria-label="Visibility"
                        width="max"
                        value={[value.access]}
                        disabled={disabled}
                        options={[
                            {value: 'private', content: 'Private'},
                            {value: 'everyone', content: 'Everyone'},
                        ]}
                        onUpdate={([access]) => {
                            if (access === 'private' || access === 'everyone')
                                onChange({...value, access});
                        }}
                    />
                )}
                getAttributePermissions={(row) => ({
                    canEditKey: row.id !== 'owner',
                    canRemove: row.id !== 'owner',
                })}
                checkDuplicateAttributeKeys
                validateAttribute={(draft) =>
                    draft.value.trim() ? undefined : {value: 'Enter a value'}
                }
            />
        </div>
    );
}
export const ProtectedAttributes: Story = {render: () => <ProtectedSettingsExample />};
export const ProtectedAttributesDark: Story = {...ProtectedAttributes, globals: {theme: 'dark'}};
