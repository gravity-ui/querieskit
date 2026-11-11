import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueryAttributesEditor} from './QueryAttributesEditor';
import type {QueryAttributesEditorProps} from '../../types/queryAttributesEditor';
function Example(args: QueryAttributesEditorProps) {
    const [items, setItems] = useState(args.items);
    return <QueryAttributesEditor {...args} items={items} onChange={setItems} />;
}
const meta = {
    title: 'Modules/QueryAttributesEditor',
    component: Example,
    decorators: [
        (Story) => (
            <div style={{width: 360}}>
                <Story />
            </div>
        ),
    ],
    args: {
        items: [
            {id: 'pool', key: 'pool', value: 'analytics'},
            {id: 'owner', key: 'owner', value: 'team'},
        ],
        onChange: () => {},
    },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = {args: {items: []}};
export const Disabled: Story = {args: {disabled: true}};
