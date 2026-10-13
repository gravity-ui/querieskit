import React, {useEffect, useId, useState} from 'react';
import {Button, Dialog, Flex, Icon, TextArea, useThemeValue} from '@gravity-ui/uikit';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import cn from 'bem-cn-lite';
import type {MonacoEditorProps} from '../../../types/monacoEditor';
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

function validJson(value: string) {
    try {
        JSON.parse(value);
        return true;
    } catch {
        return false;
    }
}

export function ParameterDocument({
    value,
    onUpdate,
    editing,
    disabled,
    label,
    error,
}: ParameterDocumentProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    const [Editor, setEditor] = useState<React.ComponentType<MonacoEditorProps>>();
    const [highlight, setHighlight] = useState<{
        value: string;
        tokens: {text: string; kind: string}[];
    }>();
    const titleId = useId();
    const theme = useThemeValue();

    useEffect(() => {
        if (!open) return undefined;
        let active = true;
        import('../../../components/MonacoEditor').then(
            ({MonacoEditor}) => {
                if (active) setEditor(() => MonacoEditor);
            },
            () => {
                // The text editor remains available when the optional chunk cannot load.
            },
        );
        return () => {
            active = false;
        };
    }, [open]);

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

    useEffect(() => {
        if (!editing || disabled) setOpen(false);
    }, [editing, disabled]);

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

    const invalid = !validJson(draft);
    return (
        <div className={block()}>
            <Flex gap={1} alignItems="start">
                <TextArea
                    className={block('input')}
                    value={value}
                    onUpdate={onUpdate}
                    size="m"
                    minRows={3}
                    disabled={disabled}
                    validationState={error ? 'invalid' : undefined}
                    errorMessage={error}
                    controlProps={{'aria-label': label}}
                />
                <Button
                    view="flat-secondary"
                    size="m"
                    disabled={disabled}
                    aria-label={i18n('action_edit-document')}
                    title={i18n('action_edit-document')}
                    onClick={() => {
                        setDraft(value);
                        setOpen(true);
                    }}
                >
                    <Icon data={PencilIcon} size={16} />
                </Button>
            </Flex>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="l"
                fullWidth
                aria-labelledby={titleId}
            >
                <Dialog.Header caption={label} id={titleId} />
                <Dialog.Body>
                    {Editor ? (
                        <Editor
                            className={block('editor')}
                            value={draft}
                            onChange={setDraft}
                            language="json"
                            theme={theme}
                            monacoConfig={{
                                automaticLayout: true,
                                minimap: {enabled: false},
                                ariaLabel: label,
                            }}
                        />
                    ) : (
                        <TextArea
                            value={draft}
                            onUpdate={setDraft}
                            minRows={12}
                            controlProps={{'aria-label': label}}
                        />
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_apply')}
                    textButtonCancel={i18n('action_cancel')}
                    propsButtonApply={{disabled: invalid || disabled}}
                    showError={invalid}
                    errorText={invalid ? i18n('alert_invalid-json') : undefined}
                    onClickButtonCancel={() => setOpen(false)}
                    onClickButtonApply={() => {
                        if (!invalid && !disabled) {
                            onUpdate(draft);
                            setOpen(false);
                        }
                    }}
                />
            </Dialog>
        </div>
    );
}
