import React from 'react';
import {
    type QueriesSidebarTab,
    type TutorialsEngineFilterConfig,
    type TutorialsEngineOption,
    TutorialsHistory,
    type TutorialsHistoryProps,
} from '../../src';
import type {
    TutorialsEngineFilterConfig as ModuleEngineFilterConfig,
    TutorialsEngineOption as ModuleEngineOption,
} from '../../src/modules/TutorialsHistory';

const engines: readonly TutorialsEngineOption[] = [{id: 'yql', title: 'YQL'}];
const moduleEngines: readonly ModuleEngineOption[] = engines;
const onUpdate = (_engineId: string | null) => {};
const filter: TutorialsEngineFilterConfig = {engines: moduleEngines, onUpdate};
const moduleFilter: ModuleEngineFilterConfig = filter;
export const props: TutorialsHistoryProps = {
    items: [],
    search: {onUpdate: () => {}},
    engineFilter: moduleFilter,
};
export const defaultFilter = <TutorialsHistory {...props} />;
export const nullFilter = <TutorialsHistory {...props} engineFilter={{...filter, value: null}} />;
export const selectedFilter = (
    <TutorialsHistory {...props} engineFilter={{...filter, value: 'yql'}} />
);
export const hiddenFilter = <TutorialsHistory {...props} engineFilter={{onUpdate}} />;
export const tutorialsTab: QueriesSidebarTab = {id: 'tutorials', type: 'tutorials', props};

export const obsoleteProps: TutorialsHistoryProps = {
    ...props,
    // @ts-expect-error Tutorials use engineFilter instead of the history popup configuration.
    filter: {isChanged: true},
};
