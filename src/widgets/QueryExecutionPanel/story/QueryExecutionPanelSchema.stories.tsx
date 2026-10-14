import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueryExecutionPanel} from '../QueryExecutionPanel';

const meta: Meta<typeof QueryExecutionPanel> = {
    title: 'Widgets/QueryExecutionPanel/Schema',
    component: QueryExecutionPanel,
    parameters: {layout: 'padded'},
};
export default meta;

type Story = StoryObj<typeof QueryExecutionPanel>;

/** Uses the real result module and its standard schema renderer, with no data rows. */
export const DefaultSchema: Story = {
    render: () => (
        <QueryExecutionPanel
            tabs={[
                {
                    id: 'result/0',
                    type: 'result',
                    title: 'Result 1',
                    props: {
                        defaultView: 'schema',
                        rows: [],
                        columns: [
                            {name: 'name', type: ['OptionalType', ['DataType', 'String']]},
                            {name: 'count', type: ['OptionalType', ['DataType', 'Int64']]},
                            {name: 'weight', type: ['OptionalType', ['DataType', 'Float']]},
                            {
                                name: 'details',
                                type: [
                                    'OptionalType',
                                    [
                                        'StructType',
                                        [
                                            [
                                                'tags',
                                                [
                                                    'ListType',
                                                    ['TaggedType', 'label', ['DataType', 'String']],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            },
                        ],
                    },
                },
                {
                    id: 'info',
                    type: 'info',
                    props: {
                        root: {
                            id: 'done',
                            severity: 'info',
                            message: 'Schema is available without result rows',
                        },
                    },
                },
            ]}
        />
    ),
};
