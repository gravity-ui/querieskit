import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ThemeProvider} from '@gravity-ui/uikit';
import {DataTypePopup} from './DataTypePopup';
import type {ParameterType} from '../../types/parameterWizard';

const nestedType: ParameterType = {
    name: 'Struct',
    struct: [
        {key: 'id', type: {name: 'Uint64'}},
        {key: 'name', type: {name: 'Utf8', optional: true}},
        {
            key: 'items',
            type: {
                name: 'List',
                type: {
                    name: 'Struct',
                    struct: [
                        {key: 'price', type: {name: 'Decimal', params: [22, 9]}},
                        {key: 'tags', type: {name: 'Set', type: {name: 'String'}}},
                    ],
                },
            },
        },
    ],
};

const meta = {
    title: 'Components/DataTypePopup',
    component: DataTypePopup,
    tags: ['autodocs'],
    parameters: {layout: 'centered'},
    args: {children: 'Uint64', type: {name: 'Uint64'}},
} satisfies Meta<typeof DataTypePopup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primitive: Story = {};
export const Nested: Story = {args: {children: 'Struct', type: nestedType}};
export const OptionalAndTagged: Story = {
    args: {
        children: 'Decimal',
        type: {
            name: 'Decimal',
            params: [22, 9],
            optional: true,
            optionalLevel: 3,
            tagged: true,
            tags: ['Money', 'USD'],
        },
    },
};
export const Dictionary: Story = {
    args: {
        children: 'Dict',
        type: {name: 'Dict', type: [{name: 'Utf8'}, {name: 'List', type: {name: 'Int64'}}]},
    },
};
export const Variant: Story = {
    args: {
        children: 'Variant',
        type: {
            name: 'Variant',
            struct: [
                {key: 'text', type: {name: 'Utf8'}},
                {key: 'point', type: {name: 'Tuple', type: [{name: 'Double'}, {name: 'Double'}]}},
                {key: 'status', type: {name: 'Enum', type: [{name: 'ready'}, {name: 'pending'}]}},
            ],
        },
    },
};
export const WithoutIcon: Story = {args: {...Nested.args, hideIcon: true}};
export const WithoutType: Story = {args: {children: 'No type information', type: undefined}};
export const LongStructure: Story = {
    args: {
        children: 'Struct with 50 fields',
        type: {
            name: 'Struct',
            struct: Array.from({length: 50}, (_, index) => ({
                key: `field_${index}`,
                type: {name: 'Utf8'},
            })),
        },
    },
};
export const DarkTheme: Story = {
    args: Nested.args,
    decorators: [
        (Story) => (
            <ThemeProvider theme="dark">
                <Story />
            </ThemeProvider>
        ),
    ],
};
