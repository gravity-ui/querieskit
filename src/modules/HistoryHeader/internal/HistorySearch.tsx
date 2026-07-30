import React, {FC, useEffect, useState} from 'react';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import ChevronsExpandHorizontalIcon from '@gravity-ui/icons/svgs/chevrons-expand-horizontal.svg';
import './HistorySearch.scss';

type Props = {
    value?: string;
    fullSearch?: boolean;
    hasClear?: boolean;
    onUpdate: (data: {value: string; fullSearch: boolean}) => void;
};

const block = cn('qp-history-search');

export const HistorySearch: FC<Props> = ({value, fullSearch, hasClear, onUpdate}) => {
    const [search, setSearch] = useState(value || '');
    const [isFullSearch, setFullSearch] = useState(fullSearch || false);

    useEffect(() => {
        setSearch(value || '');
        setFullSearch(fullSearch || false);
    }, [value, fullSearch]);

    const handleOnUpdate = (newValue: string) => {
        setSearch(newValue);
        onUpdate({value: newValue, fullSearch: isFullSearch});
    };

    const handleModeChange = () => {
        const newValue = !isFullSearch;
        setFullSearch(newValue);
        onUpdate({value: search, fullSearch: newValue});
    };

    return (
        <TextInput
            className={block()}
            value={search}
            onUpdate={handleOnUpdate}
            hasClear={hasClear}
            endContent={
                <Button
                    className={block('full-search')}
                    size="xs"
                    view={isFullSearch ? 'action' : undefined}
                    onClick={handleModeChange}
                >
                    <Icon data={ChevronsExpandHorizontalIcon} size={12} />
                </Button>
            }
        />
    );
};
