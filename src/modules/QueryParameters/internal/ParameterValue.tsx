import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {validType} from '../helpers/parameters';
import i18n from '../i18n';
import type {ParameterValueProps as Props} from './parameterValueTypes';
import {shapeValid} from './parameterValueHelpers';
import {NullableValue} from './NullableValue';
import {ParameterValueContent} from './ParameterValueContent';

export function ParameterValue(props: Props) {
    if (!validType(props.type) || !shapeValid(props.type, props.value)) {
        return (
            <Text className={props.className} color="danger" role="alert">
                {i18n(validType(props.type) ? 'alert_invalid-value' : 'alert_invalid-type')}
            </Text>
        );
    }
    if (props.type.kind === 'Optional' || props.type.kind === 'Pg') {
        return (
            <NullableValue
                {...props}
                type={props.type}
                ValueComponent={ParameterValue}
                ContentComponent={ParameterValueContent}
            />
        );
    }
    return <ParameterValueContent {...props} ValueComponent={ParameterValue} />;
}
