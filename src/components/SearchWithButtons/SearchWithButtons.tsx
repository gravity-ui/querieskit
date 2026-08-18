import React, {FC} from 'react';
import {Flex, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './SearchWithButtons.scss';

export type SearchWithButtonsProps = {
    value?: string;
    placeholder?: string;
    hasClear?: boolean;
    innerButtons?: React.ReactNode[];
    endButtons?: React.ReactNode[];
    onUpdate?: (value: string) => void;
    className?: string;
};

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
}) => {
    const hasInnerButtons = Boolean(innerButtons?.length);
    const hasEndButtons = Boolean(endButtons?.length);

    return (
        <Flex gap={1} className={block(null, className)}>
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
