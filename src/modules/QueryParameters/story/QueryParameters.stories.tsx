import React, {useRef, useState} from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';
import type {QueryParameter, QueryParametersProps} from '../../../types/queryParameters';
import {QueryParameters} from '../QueryParameters';

import './QueryParameters.stories.scss';

const b = block('query-parameters-story');

const parameters: QueryParameter[] = [
    {id: 'limit', name: 'limit', type: {kind: 'Number'}, value: '9007199254740993'},
    {id: 'region', name: 'region', type: {kind: 'String'}, value: 'предложение'},
    {
        id: 'options',
        name: 'options',
        type: {kind: 'Json'},
        value: '{\n  "a": 3\n}',
    },
    {
        id: 'tags',
        name: 'tags',
        type: {kind: 'List', item: {kind: 'String'}},
        value: [
            {id: 'tag-1', value: 'предложение'},
            {id: 'tag-2', value: 'строка\nс переносом'},
            {id: 'tag-3', value: 'значение'},
        ],
    },
    {
        id: 'groups',
        name: 'groups',
        type: {kind: 'List', item: {kind: 'List', item: {kind: 'String'}}},
        value: [
            {
                id: 'group-1',
                value: [
                    {id: 'group-1-tag-1', value: 'daily_events'},
                    {id: 'group-1-tag-2', value: 'weekly_events'},
                ],
            },
            {id: 'group-2', value: []},
        ],
    },
    {
        id: 'range',
        name: 'range',
        type: {kind: 'Tuple', items: [{kind: 'Number'}, {kind: 'Number'}]},
        value: [
            {id: 'from', value: '10'},
            {id: 'to', value: '100'},
        ],
    },
    {
        id: 'source',
        name: 'source',
        type: {
            kind: 'Variant',
            options: [
                {id: 'name', name: 'Name', type: {kind: 'String'}},
                {id: 'names', name: 'Names', type: {kind: 'List', item: {kind: 'String'}}},
            ],
        },
        value: {optionId: 'names', value: [{id: 'source-1', value: 'daily_events'}]},
    },
    {
        id: 'thresholds',
        name: 'thresholds',
        type: {kind: 'Dict', key: {kind: 'String'}, value: {kind: 'String'}},
        value: [
            {id: 'threshold-1', key: 'warning', value: '10'},
            {id: 'threshold-2', key: 'critical', value: '100'},
            {id: 'threshold-3', key: 'maximum', value: '1000'},
        ],
    },
    {id: 'old-limit', name: 'old_limit', type: {kind: 'Number'}, value: '50', deleted: true},
];

function Example({
    initialValue = parameters,
    width = 460,
    errors,
    disabled,
    loading,
    rejectSave = false,
}: {
    initialValue?: QueryParameter[];
    width?: number;
    errors?: QueryParametersProps['errors'];
    disabled?: boolean;
    loading?: boolean;
    rejectSave?: boolean;
}) {
    const [value, setValue] = useState(initialValue);
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{width: expanded ? '100%' : width, maxWidth: '100%', height: 680}}>
            <QueryParameters
                value={value}
                expanded={expanded}
                onExpandedChange={setExpanded}
                onChange={async (nextValue) => {
                    action('parametersChange')(nextValue);
                    if (rejectSave) {
                        await new Promise((resolve) => setTimeout(resolve, 600));
                        throw new Error('The example server could not save the parameters.');
                    }
                    setValue(nextValue);
                }}
                onUpdate={() => {
                    action('parametersUpdate')();
                    setValue((current) => [...current]);
                }}
                errors={errors}
                disabled={disabled}
                loading={loading}
            />
        </div>
    );
}

function ApplicationLayoutExample() {
    const [value, setValue] = useState(parameters);
    const [expanded, setExpanded] = useState(false);
    const [open, setOpen] = useState(true);
    const reopenButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <Flex direction="column" className={b()}>
            <Flex alignItems="center" gap={4} className={b('tabs')}>
                <Text variant="subheader-1">New query</Text>
                <Text color="secondary">Query workspace</Text>
                <Button
                    ref={reopenButtonRef}
                    view="flat"
                    selected={open}
                    onClick={() => setOpen(true)}
                    className={b('open')}
                >
                    Parameters
                </Button>
            </Flex>
            <div className={b('workspace')}>
                <div className={b('editor', {sidebar: open})} hidden={expanded}>
                    <Flex direction="column" gap={5}>
                        <Text variant="subheader-1">Query</Text>
                        <Text as="pre" variant="code-1" className={b('code')}>
                            {
                                'DECLARE $limit AS Int64;\nDECLARE $region AS String;\n\nSELECT *\nFROM events\nWHERE region = $region\nLIMIT $limit;'
                            }
                        </Text>
                        <Text color="secondary">
                            Open Parameters, then use the expand button next to Close.
                        </Text>
                    </Flex>
                </div>
                <div className={b('panel', {expanded})} hidden={!open}>
                    <QueryParameters
                        value={value}
                        onChange={setValue}
                        onUpdate={() => setValue((current) => [...current])}
                        expanded={expanded}
                        onExpandedChange={setExpanded}
                        onClose={() => {
                            setOpen(false);
                            setExpanded(false);
                            reopenButtonRef.current?.focus();
                        }}
                    />
                </div>
            </div>
        </Flex>
    );
}

const meta = {
    title: 'Modules/QueryParameters',
    component: Example,
    args: {width: 460, disabled: false, loading: false, rejectSave: false},
    argTypes: {
        initialValue: {control: false},
        width: {control: {type: 'range', min: 280, max: 800, step: 20}},
        disabled: {control: 'boolean'},
        loading: {control: 'boolean'},
        rejectSave: {
            control: 'boolean',
            description: 'Reject Save to demonstrate preserved edits after an asynchronous error.',
        },
    },
    parameters: {layout: 'padded'},
    tags: ['autodocs'],
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = {args: {initialValue: []}};
export const ExternalErrors: Story = {
    args: {
        errors: {
            region: {name: 'This name is reserved by the application.'},
            limit: {value: {$: 'The server limit is 1000000.'}},
            thresholds: {
                value: {'$/threshold-1/value': 'Use a threshold greater than 10.'},
            },
        },
    },
};

export const ApplicationLayout: Story = {
    render: () => <ApplicationLayoutExample />,
    parameters: {controls: {disable: true}},
};
