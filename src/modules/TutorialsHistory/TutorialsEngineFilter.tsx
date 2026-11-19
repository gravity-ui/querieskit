import React from 'react';
import {Select} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {TutorialsEngineFilterConfig} from '../../types/tutorialsHistory';
import i18n from './i18n';
import './TutorialsEngineFilter.scss';

const block = cn('qp-tutorials-engine-filter');
const allValue = 'all';
// Namespace actual IDs so even an empty engine ID cannot collide with All.
const engineValue = (id: string) => `engine:${id}`;

export const TutorialsEngineFilter = ({engines, value, onUpdate}: TutorialsEngineFilterConfig) => {
    const selectedEngine = value ?? null;

    return (
        <Select
            className={block()}
            size="m"
            view="normal"
            aria-label={i18n('field_engine')}
            value={[selectedEngine === null ? allValue : engineValue(selectedEngine)]}
            options={[
                {value: allValue, content: i18n('value_all')},
                ...(engines ?? []).map(({id, title}) => ({
                    value: engineValue(id),
                    content: title,
                })),
            ]}
            onUpdate={([nextValue]) => {
                if (nextValue === undefined) return;
                onUpdate(nextValue === allValue ? null : nextValue.slice('engine:'.length));
            }}
        />
    );
};
