import type {DateValue, RangeDatePickerFieldProps} from '../../types/simpleFormProps';
import React, {FC} from 'react';
import {Flex, Text} from '@gravity-ui/uikit';
import {DatePicker} from '@gravity-ui/date-components';

const DATE_FORMAT = 'YYYY-MM-DD';

export const RangeDatePickerField: FC<RangeDatePickerFieldProps> = ({value, title, onChange}) => {
    const handleStartChange = (newValue: DateValue) => {
        onChange({...value, start: newValue});
    };

    const handleEndChange = (newValue: DateValue) => {
        onChange({...value, end: newValue});
    };

    return (
        <Flex direction="column" gap={2}>
            {title && <Text variant="body-1">{title}</Text>}
            <Flex gap={2}>
                <DatePicker
                    value={value?.start ?? null}
                    onUpdate={handleStartChange}
                    format={DATE_FORMAT}
                    maxValue={value?.end ?? undefined}
                />
                <DatePicker
                    value={value?.end ?? null}
                    onUpdate={handleEndChange}
                    format={DATE_FORMAT}
                    minValue={value?.start ?? undefined}
                />
            </Flex>
        </Flex>
    );
};

declare module '../../types/forms' {
    interface FormFieldPropsRegistry {
        rangeDatePicker: RangeDatePickerFieldProps;
    }
}
