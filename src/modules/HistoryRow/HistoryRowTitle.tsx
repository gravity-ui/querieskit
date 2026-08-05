import React, {KeyboardEvent, useState} from 'react';
import {QueryHistoryEditingRenderData, QueryHistoryRow} from '../../types/history';
import {Text, TextInput} from '@gravity-ui/uikit';
import './HistoryRow.scss';

export type Props<T extends QueryHistoryRow> = {
    item: T;
    editing?: QueryHistoryEditingRenderData<T>;
};

export const HistoryRowTitle = <T extends QueryHistoryRow>({item, editing}: Props<T>) => {
    const [title, setTitle] = useState(item.title);
    const isEditing = Boolean(editing?.enabled);
    const isTitleEmpty = !title.trim();

    React.useEffect(() => {
        setTitle(item.title);
    }, [item.id, item.title]);

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation();

        if (event.key === 'Enter') {
            event.preventDefault();
            const nextTitle = title.trim();

            if (!nextTitle) {
                return;
            }

            if (nextTitle === item.title) {
                editing?.onCancel?.(item);
                setTitle(item.title);
                return;
            }

            editing?.onSubmit?.(item, nextTitle);
        }

        if (event.key === 'Escape') {
            editing?.onCancel?.(item);
            setTitle(item.title);
        }
    };

    if (isEditing) {
        return (
            <div
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <TextInput
                    autoFocus
                    value={title}
                    size="s"
                    validationState={isTitleEmpty ? 'invalid' : undefined}
                    onKeyDown={handleKeyDown}
                    onUpdate={setTitle}
                />
            </div>
        );
    }

    return (
        <Text variant="subheader-1" ellipsis>
            {item.title}
        </Text>
    );
};
