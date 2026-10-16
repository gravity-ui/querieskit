import React, {useEffect, useMemo, useState} from 'react';
import {Flex, Loader, Text, useThemeValue} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {MonacoEditorConfig, MonacoEditorProps} from '../../../types/monacoEditor';
import i18n from '../i18n';
import './ParameterDocument.scss';

const block = cn('qp-parameter-document');

type ParameterDocumentProps = {
    value: string;
    onUpdate: (value: string) => void;
    editing: boolean;
    disabled?: boolean;
    label: string;
    error?: string;
};

export function ParameterDocument({
    value,
    onUpdate,
    editing,
    disabled,
    label,
    error,
}: ParameterDocumentProps) {
    const [loadFailed, setLoadFailed] = useState(false);
    const [Editor, setEditor] = useState<React.ComponentType<MonacoEditorProps>>();
    const [highlight, setHighlight] = useState<{
        value: string;
        tokens: {text: string; kind: string}[];
    }>();
    const theme = useThemeValue();
    const config = useMemo<MonacoEditorConfig>(
        () => ({
            ariaLabel: label,
            tabIndex: disabled ? -1 : 0,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            folding: true,
            tabSize: 2,
            padding: {top: 8, bottom: 8},
        }),
        [label, disabled],
    );

    useEffect(() => {
        if (!editing) return undefined;
        setLoadFailed(false);
        let active = true;
        import('../../../components/MonacoEditor').then(
            ({MonacoEditor}) => {
                if (active) setEditor(() => MonacoEditor);
            },
            () => {
                if (active) setLoadFailed(true);
            },
        );
        return () => {
            active = false;
        };
    }, [editing]);

    useEffect(() => {
        if (editing) return undefined;
        let active = true;
        async function colorize() {
            // @ts-ignore The package's deep entrypoint does not expose declarations to this resolver.
            const monaco = await import('monaco-editor/editor/editor.api');
            await import('monaco-editor/languages/features/json/register');
            // colorize waits for the lazy JSON tokenizer. Render its tokens over the
            // original slices: colorize's HTML expands tabs and appends a line break.
            await monaco.editor.colorize(value, 'json', {tabSize: 4});
            const lines = value.split(/(\r\n|\r|\n)/);
            const tokenLines = monaco.editor.tokenize(value, 'json');
            const tokens: {text: string; kind: string}[] = [];
            for (let index = 0; index < lines.length; index += 2) {
                const line = lines[index];
                const lineTokens = tokenLines[index / 2];
                if (!lineTokens?.length) tokens.push({text: line, kind: 'plain'});
                else
                    for (let part = 0; part < lineTokens.length; part++) {
                        const token = lineTokens[part];
                        tokens.push({
                            text: line.slice(
                                token.offset,
                                lineTokens[part + 1]?.offset ?? line.length,
                            ),
                            kind: token.type.split('.')[0],
                        });
                    }
                if (index + 1 < lines.length) tokens.push({text: lines[index + 1], kind: 'plain'});
            }
            if (active) setHighlight({value, tokens});
        }
        colorize().catch(() => {
            if (active) setHighlight(undefined);
        });
        return () => {
            active = false;
        };
    }, [editing, value, theme]);

    if (!editing) {
        return highlight?.value === value ? (
            <div className={block('view')}>
                {highlight.tokens.map((token, index) => (
                    <span key={index} className={block('token', {[token.kind]: true})}>
                        {token.text}
                    </span>
                ))}
            </div>
        ) : (
            <div className={block('view')}>{value}</div>
        );
    }

    return (
        <Flex className={block({disabled})} direction="column" gap={1}>
            <div className={block('editor', {invalid: Boolean(error) && !disabled})}>
                {Editor ? (
                    <Editor
                        value={value}
                        onChange={(next) => {
                            if (!disabled) onUpdate(next);
                        }}
                        language="json"
                        theme={theme}
                        readOnly={disabled}
                        monacoConfig={config}
                    />
                ) : (
                    <Flex className={block('loading')} alignItems="center" justifyContent="center">
                        {loadFailed ? (
                            <Text color="danger" role="alert">
                                {i18n('alert_editor-load-failed')}
                            </Text>
                        ) : (
                            <Loader />
                        )}
                    </Flex>
                )}
            </div>
            {error && !disabled && (
                <Text color="danger" role="alert">
                    {error}
                </Text>
            )}
        </Flex>
    );
}
