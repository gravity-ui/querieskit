import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';
import type {QueryParameter} from '../../../types/queryParameters';
import {QueryEditor} from '../QueryEditor';

function Example({empty = false}: {empty?: boolean}) {
    const [query, setQuery] = useState('SELECT $limit;');
    const [parameters, setParameters] = useState<QueryParameter[]>(
        empty ? [] : [{id: 'limit', name: 'limit', type: {kind: 'Int64'}, value: '100'}],
    );
    return (
        <div style={{height: 540}}>
            <QueryEditor
                value={query}
                onChange={setQuery}
                clusters={[{id: 'production', title: 'Production'}]}
                clusterId="production"
                onClusterChange={action('cluster changed')}
                engines={[{id: 'yql', title: 'YQL', language: 'yql'}]}
                engineId="yql"
                onEngineChange={action('engine changed')}
                onRun={() => action('run')({query, parameters})}
                onFormat={action('format')}
                onValidate={action('validate')}
                defaultActivePanel="parameters"
                defaultPanelWidth={360}
                parametersProps={{
                    value: parameters,
                    onChange: (next) => {
                        setParameters(next);
                        action('parameters changed')(next);
                    },
                }}
            />
        </div>
    );
}

const meta: Meta<typeof Example> = {
    title: 'Modules/QueryEditor/Parameters',
    component: Example,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof Example>;

export const Controlled: Story = {};
export const Empty: Story = {args: {empty: true}};
export const Dark: Story = {globals: {theme: 'dark'}};
