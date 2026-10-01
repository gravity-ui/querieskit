import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Flex, Text} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueriesList} from './QueriesList';
import {QueriesHistory} from '../QueriesHistory';
import {SavedQueries} from '../SavedQueries';
import {TutorialsHistory} from '../TutorialsHistory';
import type {QueryHistoryRow} from '../../types/history';
import type {SavedQuery} from '../../types/savedQueries';
import type {TutorialHistoryRow} from '../../types/tutorial';
import type {QueryListSearchConfig} from '../../types/queryList';

const meta: Meta<typeof QueriesList> = {
    title: 'Modules/QueriesList',
    component: QueriesList,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof QueriesList>;

const lessons: TutorialHistoryRow[] = Array.from({length: 22}, (_, index) => ({
    id: `lesson-${index + 1}`,
    number: index + 1,
    title: `Lesson ${index + 1}`,
    query: 'SELECT 1;',
    height: 28,
}));
const history: QueryHistoryRow[] = lessons.map((item) => ({
    ...item,
    height: 52,
    status: 'completed',
    engine: 'SQL',
    mode: 'Validate',
    startTime: '2026-04-29T12:00:00Z',
    endTime: '2026-04-29T12:00:17Z',
}));
const saved: SavedQuery[] = lessons.map((item) => ({
    ...item,
    height: 52,
    engine: 'SQL',
    author: 'Anna',
    savedAt: '2026-04-29T12:00:00Z',
}));

type ExampleProps = {
    state?: 'default' | 'empty' | 'no-results' | 'loading' | 'comparison';
    height?: number;
};
const PanelExamples = ({state = 'default', height = 720}: ExampleProps) => {
    const [search, setSearch] = useState({
        value: state === 'no-results' ? 'missing' : '',
        fullSearch: false,
    });
    const [selectedRowId, setSelectedRowId] = useState<string | number>('lesson-2');
    const [comparedRowIds, setComparedRowIds] = useState<(string | number)[]>([]);
    const config: QueryListSearchConfig = {...search, hasClear: true, onUpdate: setSearch};
    const common = {
        logo: <Text>YQL UI</Text>,
        search: config,
        filter: {},
        selectedRowId,
        loading: state === 'loading',
        onListItemClick: (item: {id: string | number} | {header: string}) => {
            if ('id' in item) setSelectedRowId(item.id);
        },
    };
    const comparison =
        state === 'comparison'
            ? {
                  enabled: true,
                  comparedRowIds,
                  onChange: (item: {id: string | number}, checked: boolean) =>
                      setComparedRowIds((ids) =>
                          checked ? [...ids, item.id] : ids.filter((id) => id !== item.id),
                      ),
                  onCompare: action('compare'),
                  onCancel: action('cancelComparison'),
              }
            : undefined;
    const results = <T extends TutorialHistoryRow>(items: T[]) => {
        if (state === 'empty' || state === 'loading') return [];
        return items.filter(
            (item) =>
                item.title.toLowerCase().includes(search.value.toLowerCase()) ||
                (search.fullSearch &&
                    item.query?.toLowerCase().includes(search.value.toLowerCase())),
        );
    };
    const historyResults = results(history);
    return (
        <Flex gap={5}>
            <div style={{width: 347, height}} data-panel="tutorials">
                <TutorialsHistory {...common} items={results(lessons)} />
            </div>
            <div style={{width: 347, height}} data-panel="history">
                <QueriesHistory
                    {...common}
                    items={
                        historyResults.length && !search.value
                            ? [{header: '29 April 2026', height: 28}, ...historyResults]
                            : historyResults
                    }
                    visibleFields={{
                        fields: [{id: 'engine', title: 'Engine'}],
                        value: ['engine', 'duration', 'mode', 'startTime'],
                        onChange: action('visibleFields'),
                    }}
                    comparison={comparison}
                />
            </div>
            <div style={{width: 347, height}} data-panel="saved">
                <SavedQueries {...common} items={results(saved)} comparison={comparison} />
            </div>
        </Flex>
    );
};

export const Panels: Story = {render: () => <PanelExamples />};
export const EmptyPanels: Story = {render: () => <PanelExamples state="empty" />};
export const NoResults: Story = {render: () => <PanelExamples state="no-results" />};
export const Loading: Story = {render: () => <PanelExamples state="loading" />};
export const Comparison: Story = {render: () => <PanelExamples state="comparison" height={300} />};
export const ShortPanels: Story = {render: () => <PanelExamples height={240} />};
export const Legacy: Story = {
    render: () => (
        <div style={{width: 347, height: 720}}>
            <QueriesList
                title="Legacy"
                items={lessons}
                search={{onUpdate: action('search')}}
                filter={{}}
                renderRow={({item}) => <Text>{'title' in item ? item.title : item.header}</Text>}
            />
        </div>
    ),
};
export const TutorialsAlias: Story = {
    render: () => (
        <div style={{width: 347, height: 720}}>
            <QueriesList
                variant="tutorials"
                title="Alias"
                logo={<Text>YQL UI</Text>}
                items={lessons}
                search={{onUpdate: action('search')}}
                filter={{}}
                renderRow={({item}) => <Text>{'title' in item ? item.title : item.header}</Text>}
            />
        </div>
    ),
};
