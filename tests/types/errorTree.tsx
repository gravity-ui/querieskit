import React from 'react';
import {
    ErrorTree,
    type ErrorTreeItem,
    type ErrorTreeProps,
    type QueryExecutionTab,
} from '../../src';

const message: ErrorTreeItem = {id: 'message', severity: 'info', message: 'Completed'};
export const props: ErrorTreeProps = {roots: [message]};
export const single = <ErrorTree {...props} />;
export const multiple = <ErrorTree roots={[message, {...message, id: 'second'}]} />;
export const empty = <ErrorTree roots={[]} />;
export const info: QueryExecutionTab = {id: 'messages', type: 'info', props};
export const emptyInfo: QueryExecutionTab = {id: 'messages', type: 'info'};

// @ts-expect-error A source array is required.
export const missingSource = <ErrorTree />;
// @ts-expect-error The singular root API has been removed.
export const legacy = <ErrorTree root={message} />;
// @ts-expect-error Only roots is accepted, even when both sources are supplied.
export const both = <ErrorTree roots={[message]} root={message} />;
// @ts-expect-error Native info tabs use the same roots-only contract.
export const legacyInfo: QueryExecutionTab = {id: 'messages', type: 'info', props: {root: message}};
