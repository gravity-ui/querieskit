import React from 'react';
import {FieldsSelector, type FieldsSelectorOption} from '../FieldsSelector';
import {SearchWithButtons} from '../SearchWithButtons';

export type FieldsSearchToolbarProps<K extends string = string> = {
    search?: string;
    onSearchUpdate?: (value: string) => void;
    searchPlaceholder?: string;
    fields: FieldsSelectorOption<K>[];
    visibleFields: K[];
    onVisibleFieldsChange: (value: K[]) => void;
    hideFieldsSelector?: boolean;
    className?: string;
};

export function FieldsSearchToolbar<K extends string = string>({
    search,
    onSearchUpdate,
    searchPlaceholder,
    fields,
    visibleFields,
    onVisibleFieldsChange,
    hideFieldsSelector,
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
