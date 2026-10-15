import React from 'react';
import {FormField, type SimpleFormField} from '../../src';
import {SimpleForm} from '../../src/components/SimpleForm';

const fields: SimpleFormField[] = [{id: 'enabled', type: 'switch', initialValue: false}];

// The root entrypoint must expose both the React component and the field definition type.
export const formFieldExample = (
    <FormField label="Settings">
        <SimpleForm fields={fields} />
    </FormField>
);
