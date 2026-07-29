import React, {FC, useState} from 'react';
import {Button, Flex, Icon, Popup} from '@gravity-ui/uikit';
import FunnelIcon from '@gravity-ui/icons/svgs/funnel.svg';
import ArrowRotateLeftIcon from '@gravity-ui/icons/svgs/arrow-rotate-left.svg';
import {useToggle} from '../../../helpers/useToggle';
import cn from 'bem-cn-lite';
import './HistoryFilter.scss';

const block = cn('qp-history-filter');

type Props = {
    onApply: () => void;
    onReset: () => void;
};

export const HistoryFilter: FC<Props> = ({onApply, onReset}) => {
    const [buttonElement, setButtonElement] = useState<HTMLButtonElement | null>(null);
    const [open, toggleOpen] = useToggle(false);

    const handleOnApply = () => {
        onApply();
    };

    const handleOnReset = () => {
        onReset();
    };

    return (
        <>
            <Button ref={setButtonElement} onClick={toggleOpen}>
                <Icon data={FunnelIcon} size={16} />
            </Button>
            <Popup
                anchorElement={buttonElement}
                open={open}
                onOpenChange={toggleOpen}
                className={block()}
                placement="bottom-start"
            >
                <div className={block('container')}>content</div>
                <Flex gap={3} className={block('container')}>
                    <Button view="action" onClick={handleOnApply}>
                        Apply
                    </Button>
                    <Button onClick={handleOnReset}>
                        <Icon data={ArrowRotateLeftIcon} size={16} />
                        Reset
                    </Button>
                </Flex>
            </Popup>
        </>
    );
};
