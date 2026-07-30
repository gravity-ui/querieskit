import {ComponentType} from 'react';

const controls = new Map<string, ComponentType<any>>();

export function registerFormControl<K extends string, P extends {value?: any; onChange?: any}>(
    controlId: K,
    controlComponent: ComponentType<P>,
) {
    if (controls.has(controlId)) {
        console.warn(`Control '${controlId}' is already registered in SimpleForm!`);
    }

    controls.set(controlId, controlComponent);
}

export function getControl(type: string) {
    const Control = controls.get(type);

    if (!Control) {
        throw new Error(`Control '${type}' is not registered in SimpleForm!`);
    }

    return Control;
}
