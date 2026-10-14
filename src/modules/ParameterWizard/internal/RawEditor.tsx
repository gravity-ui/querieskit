import React, {useMemo} from 'react';
import {Flex, Text, useThemeValue} from '@gravity-ui/uikit';
import 'monaco-editor/language/json/monaco.contribution';
import cn from 'bem-cn-lite';
import {MonacoEditor} from '../../../components/MonacoEditor';
import type {MonacoEditorConfig} from '../../../components/MonacoEditor';
import {validateValue} from '../helpers/validateValue';
import i18n from '../i18n';
import {useDraftValue} from './useDraftValue';
import type {EditorProps} from './types';
import './RawEditor.scss';

const block = cn('qp-parameter-raw-editor');

export function RawEditor({value, onChange, type, name, readOnly, disabled}: EditorProps) {
    const theme = useThemeValue();
    const {text, invalid, onUpdate} = useDraftValue({
        value,
        onChange,
        format: (current) => JSON.stringify(current, null, 2) ?? '',
        parse: (input) => {
            if (!input.trim()) return {valid: true, value: undefined};
            try {
                const next = JSON.parse(input);
                return {valid: validateValue(next, type), value: next};
            } catch {
                return {valid: false, value: undefined};
            }
        },
    });
    const config = useMemo<MonacoEditorConfig>(
        () => ({
            ariaLabel: name,
            tabIndex: disabled ? -1 : 0,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            folding: true,
            tabSize: 2,
            padding: {top: 8, bottom: 8},
        }),
        [name, disabled],
    );
    const showError = invalid && text !== '' && !disabled;
    return (
        <Flex className={block({disabled})} direction="column" gap={1}>
            <MonacoEditor
                className={block('editor', {invalid: showError})}
                value={text}
                language="json"
                theme={theme}
                readOnly={readOnly || disabled}
                monacoConfig={config}
                onUpdate={(next) => {
                    if (!readOnly && !disabled) onUpdate(next);
                }}
            />
            {showError && <Text color="danger">{i18n('alert_invalid-json')}</Text>}
        </Flex>
    );
}
