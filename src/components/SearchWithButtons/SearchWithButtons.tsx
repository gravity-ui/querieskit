import {Flex, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {SearchWithButtonsProps} from '../../types/searchWithButtonsProps';
import './SearchWithButtons.scss';
export type {SearchWithButtonsProps} from '../../types/searchWithButtonsProps';

const block = cn('qp-search-with-buttons');

const renderButtons = (buttons: React.ReactNode[]) =>
    buttons.map((button, index) => <React.Fragment key={index}>{button}</React.Fragment>);

export const SearchWithButtons: FC<SearchWithButtonsProps> = ({
    value,
    placeholder,
    hasClear,
    innerButtons,
    endButtons,
    onUpdate,
    className,
    gap = 1,
}) => {
    const hasInnerButtons = Boolean(innerButtons?.length);
    const hasEndButtons = Boolean(endButtons?.length);

    return (
        <Flex gap={gap} className={block(null, className)}>
            <TextInput
                className={block('input')}
                value={value}
                placeholder={placeholder}
                hasClear={hasClear}
                onUpdate={onUpdate}
                endContent={
                    hasInnerButtons ? (
                        <Flex gap={1} className={block('inner-buttons')}>
                            {renderButtons(innerButtons as React.ReactNode[])}
                        </Flex>
                    ) : undefined
                }
            />
            {hasEndButtons && (
                <Flex gap={1} className={block('end-buttons')}>
                    {renderButtons(endButtons as React.ReactNode[])}
                </Flex>
            )}
        </Flex>
    );
};
