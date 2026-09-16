import React, {useEffect, useMemo, useState} from 'react';
import {Progress, SegmentedRadioGroup, Table, Text} from '@gravity-ui/uikit';

import type {
    QueryGraphDetail,
    QueryGraphJobCounts,
    QueryGraphNode,
    QueryGraphSchema,
} from '../../../types/queryGraph';
import i18n from '../i18n';
import {getQueryGraphNodeIcon} from './queryGraphIcons';

type Section = 'stages' | 'details' | 'jobs' | 'schemas';
const jobStatuses = ['pending', 'running', 'completed', 'failed', 'aborted'] as const;
const jobStatusLabels = {
    pending: 'status_pending',
    running: 'status_running',
    completed: 'status_completed',
    failed: 'status_failed',
    aborted: 'status_aborted',
} as const;

export function QueryGraphPopup({node}: {node: QueryGraphNode}) {
    const sections = useMemo(() => {
        const items: Section[] = [];
        if (node.popup?.stages?.length) items.push('stages');
        if (node.popup?.details?.length) items.push('details');
        if (node.popup?.jobs || node.progress) items.push('jobs');
        if (node.popup?.inputs?.length || node.popup?.outputs?.length) items.push('schemas');
        return items;
    }, [node.popup, node.progress]);
    const [section, setSection] = useState<Section | undefined>(sections[0]);

    useEffect(() => {
        if (!section || !sections.includes(section)) setSection(sections[0]);
    }, [section, sections]);

    const labels: Record<Section, string> = {
        stages: i18n('value_stages'),
        details: i18n('value_details'),
        jobs: i18n('value_jobs'),
        schemas: i18n('value_schemas'),
    };

    return (
        <div className="qp-query-graph__popup-content">
            <div className="qp-query-graph__popup-title">
                {getQueryGraphNodeIcon(node)}
                <div>
                    <Text variant="subheader-1">{node.name}</Text>
                    {node.label && <Text color="secondary">{node.label}</Text>}
                </div>
            </div>
            {sections.length > 1 && (
                <SegmentedRadioGroup
                    size="s"
                    width="max"
                    value={section}
                    onUpdate={(value) => setSection(value as Section)}
                >
                    {sections.map((item) => (
                        <SegmentedRadioGroup.Option key={item} value={item}>
                            {labels[item]}
                        </SegmentedRadioGroup.Option>
                    ))}
                </SegmentedRadioGroup>
            )}
            {section === 'stages' && <Stages node={node} />}
            {section === 'details' && <Details items={node.popup?.details ?? []} />}
            {section === 'jobs' && <Jobs jobs={node.popup?.jobs ?? node.progress ?? {}} />}
            {section === 'schemas' && <Schemas node={node} />}
            {!sections.length && node.label && <Text color="secondary">{node.label}</Text>}
        </div>
    );
}

function Stages({node}: {node: QueryGraphNode}) {
    const data = node.popup?.stages ?? [];
    return (
        <Table
            data={data}
            columns={[
                {id: 'name', name: i18n('field_stage')},
                {
                    id: 'duration',
                    name: i18n('field_duration'),
                    align: 'end',
                    template: (item) => formatDuration(item.duration),
                },
            ]}
        />
    );
}

function Details({items}: {items: QueryGraphDetail[]}) {
    return (
        <div className="qp-query-graph__details">
            {items.map((item, index) => (
                <Detail key={`${item.name}-${index}`} item={item} />
            ))}
        </div>
    );
}

function Detail({item}: {item: QueryGraphDetail}) {
    const content = item.value === undefined ? null : formatValue(item.value);
    if (item.children?.length) {
        return (
            <details open>
                <summary>{item.name}</summary>
                {content && <Text color="secondary">{content}</Text>}
                <Details items={item.children} />
            </details>
        );
    }
    return (
        <div className="qp-query-graph__detail-row">
            <Text color="secondary">{item.name}</Text>
            <Text>{content}</Text>
        </div>
    );
}

function Jobs({jobs}: {jobs: QueryGraphJobCounts}) {
    const rows = jobStatuses.map((status) => ({
        status: i18n(jobStatusLabels[status]),
        count: jobs[status] ?? 0,
    }));
    const total = jobs.total ?? 0;
    const completed = jobs.completed ?? 0;
    return (
        <div className="qp-query-graph__jobs">
            <Progress size="xs" value={total > 0 ? (completed / total) * 100 : 0} />
            <Table
                data={[...rows, {status: i18n('value_total'), count: total}]}
                columns={[
                    {id: 'status', name: i18n('field_status')},
                    {id: 'count', name: i18n('field_count'), align: 'end'},
                ]}
            />
        </div>
    );
}

function Schemas({node}: {node: QueryGraphNode}) {
    return (
        <div className="qp-query-graph__schemas">
            <SchemaGroup title={i18n('value_inputs')} schemas={node.popup?.inputs ?? []} />
            <SchemaGroup title={i18n('value_outputs')} schemas={node.popup?.outputs ?? []} />
        </div>
    );
}

function SchemaGroup({title, schemas}: {title: string; schemas: QueryGraphSchema[]}) {
    if (!schemas.length) return null;
    return (
        <details open>
            <summary>{title}</summary>
            {schemas.map((schema) => (
                <details key={schema.name} open={schemas.length === 1}>
                    <summary>{schema.name}</summary>
                    <Table
                        data={schema.columns}
                        columns={[
                            {id: 'name', name: i18n('field_name')},
                            {id: 'type', name: i18n('field_type'), align: 'end'},
                        ]}
                    />
                </details>
            ))}
        </details>
    );
}

function formatDuration(value: number) {
    if (value < 1000) return `${value} ms`;
    return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)} s`;
}

function formatValue(value: QueryGraphDetail['value']): string {
    if (Array.isArray(value)) return value.map(formatValue).join(', ');
    if (value === null) return 'null';
    return String(value);
}
