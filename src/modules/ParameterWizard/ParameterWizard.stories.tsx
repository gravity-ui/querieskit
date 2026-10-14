import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, Flex, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {
    ParameterPrimitiveTypeName,
    ParameterType,
    ParameterValue,
    ParameterWizardProps,
} from '../../types/parameterWizard';
import {ParameterWizard} from './ParameterWizard';

function ControlledWizard(props: ParameterWizardProps) {
    const [value, setValue] = useState(props.value);
    const [valid, setValid] = useState(false);
    const [deleted, setDeleted] = useState(false);
    useEffect(() => {
        setValue(props.value);
        setDeleted(false);
    }, [props.value, props.type]);
    if (deleted) return <Button onClick={() => setDeleted(false)}>Restore parameter</Button>;
    return (
        <Flex direction="column" gap={4}>
            <ParameterWizard
                {...props}
                value={value}
                onChange={setValue}
                onValidationChange={setValid}
                onReset={props.readOnly ? undefined : () => setValue(props.value)}
                onDelete={props.onDelete ? () => setDeleted(true) : undefined}
            />
            <Flex direction="column" gap={1}>
                <Text color={valid ? 'positive' : 'danger'}>
                    {valid ? 'Valid value' : 'Incomplete or invalid value'}
                </Text>
                <Text variant="code-1" style={{overflowWrap: 'anywhere'}}>
                    {JSON.stringify(value) ?? 'undefined'}
                </Text>
            </Flex>
        </Flex>
    );
}

const meta = {
    title: 'Modules/ParameterWizard',
    component: ParameterWizard,
    tags: ['autodocs'],
    parameters: {layout: 'padded'},
    decorators: [
        (Story) => (
            <div style={{maxWidth: 880}}>
                <Story />
            </div>
        ),
    ],
    args: {name: '$limit', type: {name: 'Uint64'}, value: '100', onChange: () => {}},
    render: (args) => <ControlledWizard {...args} />,
} satisfies Meta<typeof ParameterWizard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = {args: {value: undefined}};
export const InvalidValue: Story = {args: {type: {name: 'Int8'}, value: '256'}};
export const ReadOnly: Story = {args: {readOnly: true}};
export const Disabled: Story = {args: {disabled: true}};
export const Deletable: Story = {args: {onDelete: () => {}}};
export const Optional: Story = {
    args: {name: '$nickname', type: {name: 'Utf8', optional: true}, value: null},
};
export const NestedOptional: Story = {
    args: {
        name: '$nested',
        type: {name: 'Int64', optional: true, optionalLevel: 3},
        value: [[null]],
    },
};
export const List: Story = {
    args: {
        name: '$ids',
        type: {name: 'List', type: {name: 'Uint64'}},
        value: ['1', '18446744073709551615'],
    },
};
export const EmptyList: Story = {
    args: {name: '$items', type: {name: 'List', type: {name: 'Utf8'}}, value: []},
};
export const Tuple: Story = {
    args: {
        name: '$row',
        type: {
            name: 'Tuple',
            type: [{name: 'Int32'}, {name: 'Utf8'}, {name: 'Bool', optional: true}],
        },
        value: ['42', 'hello', [false]],
    },
};
export const Dictionary: Story = {
    args: {
        name: '$scores',
        type: {name: 'Dict', type: [{name: 'Utf8'}, {name: 'Int32'}]},
        value: {alice: '10', bob: '20'},
    },
};
export const Set: Story = {
    args: {
        name: '$unique',
        type: {name: 'Set', type: {name: 'Utf8'}},
        value: [
            ['first', 'Void'],
            ['second', 'Void'],
        ],
    },
};
export const Enum: Story = {
    args: {
        name: '$priority',
        type: {name: 'Enum', type: [{name: 'low'}, {name: 'normal'}, {name: 'high'}]},
        value: 'normal',
    },
};
export const Variant: Story = {
    args: {
        name: '$choice',
        type: {
            name: 'Variant',
            struct: [
                {key: 'id', type: {name: 'Uint64'}},
                {key: 'name', type: {name: 'Utf8'}},
            ],
        },
        value: [['id'], '42'],
    },
};
export const TupleVariant: Story = {
    args: {
        name: '$choice',
        type: {
            name: 'Variant',
            struct: [
                {key: 0, type: {name: 'Bool'}},
                {key: 1, type: {name: 'Utf8'}},
            ],
        },
        value: ['0', false],
    },
};

const structType: ParameterType = {
    name: 'Struct',
    struct: [
        {key: 'name', type: {name: 'Utf8'}},
        {key: 'enabled', type: {name: 'Bool'}},
        {key: 'tags', type: {name: 'List', type: {name: 'Utf8'}}},
        {
            key: 'address',
            type: {
                name: 'Struct',
                optional: true,
                struct: [
                    {key: 'city', type: {name: 'Utf8'}},
                    {key: 'zip', type: {name: 'Uint32'}},
                ],
            },
        },
    ],
};
const structValue: ParameterValue = {
    name: 'Example',
    enabled: true,
    tags: ['production', 'daily'],
    address: [{city: 'London', zip: '12345'}],
};
export const NestedContainers: Story = {
    args: {name: '$settings', type: structType, value: structValue},
};
export const ReadOnlyContainers: Story = {args: {...NestedContainers.args, readOnly: true}};
export const InvalidContainer: Story = {
    args: {name: '$ids', type: {name: 'List', type: {name: 'Int32'}}, value: {unexpected: 'value'}},
};
export const BinaryString: Story = {
    args: {name: '$bytes', type: {name: 'String'}, value: ['/wAB']},
};
export const Uuid: Story = {
    args: {name: '$uuid', type: {name: 'Uuid'}, value: ['AIQOVZvi1EGnFkRmVUQAAA==']},
};
export const Json: Story = {
    args: {
        name: '$document',
        type: {name: 'Json'},
        value: {name: 'Example', active: true, scores: [1, 2, 3]},
    },
};
export const Yson: Story = {
    args: {
        name: '$yson',
        type: {name: 'Yson'},
        value: {$value: '42', $type: 'int64', $attributes: {unit: {$value: 'ms', $type: 'string'}}},
    },
};
export const PostgreSQL: Story = {args: {name: '$pg', type: {name: 'pgtext'}, value: null}};
export const UnknownType: Story = {
    args: {name: '$custom', type: {name: 'Unknown'}, value: {custom: ['payload']}},
};
export const TaggedDecimal: Story = {
    args: {
        name: '$amount',
        type: {name: 'Decimal', params: [22, 9], tagged: true, tags: ['Money']},
        value: '1234567890123.123456789',
    },
};

function DateGallery() {
    const examples: {name: ParameterPrimitiveTypeName; value: string}[] = [
        {name: 'Date', value: '19509'},
        {name: 'Date32', value: '-8722'},
        {name: 'Datetime', value: '1686966302'},
        {name: 'Datetime64', value: '-753511371'},
        {name: 'Timestamp', value: '1685577600123456'},
        {name: 'Timestamp64', value: '-753511370765432'},
        {name: 'Interval', value: '1500000'},
        {name: 'Interval64', value: '9007199254740993'},
        {name: 'TzTimestamp', value: '2023-06-29T17:15:36.645735,Europe/Moscow'},
    ];
    return (
        <Flex direction="column" gap={6}>
            {examples.map((item) => (
                <ControlledWizard
                    key={item.name}
                    name={`$${item.name}`}
                    type={{name: item.name}}
                    value={item.value}
                    onChange={() => {}}
                />
            ))}
        </Flex>
    );
}
export const DatesAndIntervals: Story = {render: () => <DateGallery />};

function ExternalUpdates() {
    const [value, setValue] = useState<ParameterValue>('10');
    return (
        <Flex direction="column" gap={4}>
            <Button onClick={() => setValue(value === '10' ? '20' : '10')}>
                Replace value from outside
            </Button>
            <ParameterWizard
                name="$external"
                type={{name: 'Int32'}}
                value={value}
                onChange={setValue}
            />
        </Flex>
    );
}
export const ControlledUpdates: Story = {render: () => <ExternalUpdates />};
export const DarkTheme: Story = {
    args: NestedContainers.args,
    decorators: [
        (Story) => (
            <ThemeProvider theme="dark" scoped>
                <Story />
            </ThemeProvider>
        ),
    ],
};
export const Narrow: Story = {
    args: NestedContainers.args,
    decorators: [
        (Story) => (
            <div style={{width: 320}}>
                <Story />
            </div>
        ),
    ],
};

interface PrimitiveListExample {
    name: ParameterPrimitiveTypeName;
    values: ParameterValue[];
}

function PrimitiveLists({examples}: {examples: PrimitiveListExample[]}) {
    return (
        <Flex direction="column" gap={6}>
            {examples.map(({name, values}) => (
                <ControlledWizard
                    key={name}
                    name={`$${name}`}
                    type={{name: 'List', type: {name}}}
                    value={values}
                    onChange={() => {}}
                />
            ))}
        </Flex>
    );
}

export const IntegerItems: Story = {
    render: () => (
        <PrimitiveLists
            examples={[
                {name: 'Int8', values: ['-128', '127']},
                {name: 'Int16', values: ['-32768', '32767']},
                {name: 'Int32', values: ['-2147483648', '2147483647']},
                {name: 'Int64', values: ['-9223372036854775808', '9223372036854775807']},
                {name: 'Uint8', values: ['0', '255']},
                {name: 'Uint16', values: ['0', '65535']},
                {name: 'Uint32', values: ['0', '4294967295']},
                {name: 'Uint64', values: ['0', '18446744073709551615']},
            ]}
        />
    ),
};

export const StringItems: Story = {
    render: () => (
        <PrimitiveLists
            examples={[
                {name: 'String', values: ['Hello', 'Another item']},
                {name: 'Utf8', values: ['Привет', 'Ещё один элемент']},
            ]}
        />
    ),
};

export const DateItems: Story = {
    render: () => (
        <PrimitiveLists
            examples={[
                {name: 'Date', values: ['19509', '19510']},
                {name: 'Date32', values: ['-8722', '19509']},
                {name: 'Datetime', values: ['1686966302', '1686966303']},
                {name: 'Datetime64', values: ['-753511371', '1686966302']},
                {name: 'Timestamp', values: ['1685577600123456', '1685577600654321']},
                {name: 'Timestamp64', values: ['-753511370765432', '1685577600123456']},
                {name: 'Interval', values: ['-1500000', '1500000']},
                {name: 'Interval64', values: ['-9007199254740993', '9007199254740993']},
                {name: 'TzDate', values: ['2023-06-29,Europe/Moscow', '2023-06-30,UTC']},
                {name: 'TzDate32', values: ['1946-02-14,Europe/Moscow', '2023-06-29,UTC']},
                {
                    name: 'TzDatetime',
                    values: ['2023-06-29T17:15:36,Europe/Moscow', '2023-06-30T12:00:00,UTC'],
                },
                {
                    name: 'TzDatetime64',
                    values: ['1946-02-14T12:00:00,Europe/Moscow', '2023-06-29T17:15:36,UTC'],
                },
                {
                    name: 'TzTimestamp',
                    values: [
                        '2023-06-29T17:15:36.645735,Europe/Moscow',
                        '2023-06-30T12:00:00.123456,UTC',
                    ],
                },
                {
                    name: 'TzTimestamp64',
                    values: [
                        '1946-02-14T12:00:00.123456,Europe/Moscow',
                        '2023-06-29T17:15:36.645735,UTC',
                    ],
                },
            ]}
        />
    ),
};
