import React, {KeyboardEvent, useEffect, useState} from 'react';
import {Text, TextInput} from '@gravity-ui/uikit';
import {QueryListEditingRenderData, QueryListRow} from '../../types/queryList';

export type EditableRowTitleProps<T extends QueryListRow = QueryListRow> = {
    item: T;
    editing?: QueryListEditingRenderData<T>;
};

export const EditableRowTitle = <T extends QueryListRow>({
    item,
    editing,
}: EditableRowTitleProps<T>) => {
    const [title, setTitle] = useState(item.title);
    const isEditing = Boolean(editing?.enabled);
    const isTitleEmpty = !title.trim();

    useEffect(() => {
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

    return <Text ellipsis>{item.title}</Text>;
};
