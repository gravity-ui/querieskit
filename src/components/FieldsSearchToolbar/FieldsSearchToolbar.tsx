import React from 'react';
import type {FieldsSearchToolbarProps} from '../../types/fieldsSearchToolbarProps';
import {FieldsSelector} from '../FieldsSelector';
import {SearchWithButtons} from '../SearchWithButtons';
export type {FieldsSearchToolbarProps} from '../../types/fieldsSearchToolbarProps';

export function FieldsSearchToolbar<K extends string = string>({
    search,
    onSearchUpdate,
    searchPlaceholder,
    fields,
    visibleFields,
    onVisibleFieldsChange,
    hideFieldsSelector,
    fieldsSelectorProps,
    className,
}: FieldsSearchToolbarProps<K>) {
    const showFieldsSelector = !hideFieldsSelector && fields.length > 0;

    return (
        <SearchWithButtons
            gap={2}
            value={search}
            placeholder={searchPlaceholder}
            onUpdate={onSearchUpdate}
            className={className}
            endButtons={
                showFieldsSelector
                    ? [
                          <FieldsSelector<K>
                              key="fields-selector"
                              buttonView="flat"
                              {...fieldsSelectorProps}
                              fields={fields}
                              value={visibleFields}
                              onChange={onVisibleFieldsChange}
                          />,
                      ]
                    : undefined
            }
        />
    );
}
