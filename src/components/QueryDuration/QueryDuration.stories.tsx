import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {QueryDuration} from './QueryDuration';

const now = Date.now();
const fiveMinutesAgo = now - 5 * 60 * 1000;
const oneHourAgo = now - 60 * 60 * 1000;

const meta: Meta<typeof QueryDuration> = {
    title: 'Components/QueryDuration',
    component: QueryDuration,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof QueryDuration>;

/** Статичное время: startTime + endTime переданы, отображается итоговая длительность */
export const Completed: Story = {
    args: {
        status: 'completed',
        startTime: fiveMinutesAgo,
        endTime: now,
    },
};

/** Статичное время: запрос завершился с ошибкой */
export const Failed: Story = {
    args: {
        status: 'failed',
        startTime: oneHourAgo,
        endTime: now,
    },
};

/** Статичное время: запрос прерван */
export const Aborted: Story = {
    args: {
        status: 'aborted',
        startTime: fiveMinutesAgo,
        endTime: now,
    },
};

/** Живой таймер: endTime не передан — счётчик тикает каждую секунду */
export const Running: Story = {
    args: {
        status: 'running',
        startTime: fiveMinutesAgo,
        // endTime намеренно не передаётся
    },
};

/** Черновик: всегда показывает --:-- независимо от времён */
export const Draft: Story = {
    args: {
        status: 'draft',
        startTime: now,
    },
};

/** Все варианты рядом: Running обновляется в реальном времени, Draft статичен */
export const AllStatuses: Story = {
    render: () => (
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
            {/* Статичные */}
            <QueryDuration status="completed" startTime={fiveMinutesAgo} endTime={now} />
            <QueryDuration status="failed" startTime={oneHourAgo} endTime={now} />
            <QueryDuration status="aborted" startTime={fiveMinutesAgo} endTime={now} />
            {/* Живой таймер */}
            <QueryDuration status="running" startTime={fiveMinutesAgo} />
            {/* Всегда --:-- */}
            <QueryDuration status="draft" startTime={now} />
        </div>
    ),
};
