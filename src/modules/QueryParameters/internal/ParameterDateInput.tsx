import React from 'react';
import {Calendar} from '@gravity-ui/date-components';
import CalendarIcon from '@gravity-ui/icons/svgs/calendar.svg';
import {Button, Icon, Popup, TextInput} from '@gravity-ui/uikit';

import i18n from '../i18n';

import {getParameterCalendarDate, updateParameterDate} from './parameterDate';

interface ParameterDateInputProps {
    value: string;
    onUpdate: (value: string) => void;
    disabled?: boolean;
    label: string;
    error?: string;
    kind: string;
}

export function ParameterDateInput({
    value,
    onUpdate,
    disabled,
    label,
    error,
    kind,
}: ParameterDateInputProps) {
    const [open, setOpen] = React.useState(false);
    const [anchor, setAnchor] = React.useState<HTMLButtonElement | null>(null);

    return (
        <>
            <TextInput
                value={value}
                onUpdate={onUpdate}
                disabled={disabled}
                controlProps={{'aria-label': label}}
                validationState={error ? 'invalid' : undefined}
                errorMessage={error}
                endContent={
                    <Button
                        ref={setAnchor}
                        view="flat"
                        size="s"
                        disabled={disabled}
                        aria-label={i18n('action_open-calendar')}
                        aria-haspopup="dialog"
                        aria-expanded={open && !disabled}
                        onClick={() => setOpen(!open)}
                    >
                        <Icon data={CalendarIcon} size={16} />
                    </Button>
                }
            />
            <Popup
                anchorElement={anchor}
                open={open && !disabled}
                onOpenChange={setOpen}
                placement="bottom-end"
                role="dialog"
                aria-label={label}
            >
                <Calendar
                    value={getParameterCalendarDate(value)}
                    timeZone="UTC"
                    autoFocus
                    onUpdate={(date) => {
                        onUpdate(updateParameterDate(value, date.format('YYYY-MM-DD'), kind));
                        setOpen(false);
                    }}
                />
            </Popup>
        </>
    );
}
