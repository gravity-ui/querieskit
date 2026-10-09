import React, {useId, useMemo, useState} from 'react';
import {Button, Flex, Icon, useThemeValue} from '@gravity-ui/uikit';
import SparklesIcon from '@gravity-ui/icons/svgs/sparkles.svg';
import cn from 'bem-cn-lite';
import {MonacoEditor} from '../../components/MonacoEditor';
import type {QueryEditorProps} from '../../types/queryEditor';
import {QueryEditorToolbar} from './internal/QueryEditorToolbar';
import {QueryEditorSplit} from './internal/QueryEditorSplit';
import i18n from './i18n';
import './QueryEditor.scss';

const block = cn('qp-query-editor');

export function QueryEditor(props: QueryEditorProps) {
    const {
        settingsOpen: controlledOpen,
        defaultSettingsOpen = false,
        settingsWidth: controlledWidth,
        defaultSettingsWidth = 320,
    } = props;
    const [localOpen, setLocalOpen] = useState(defaultSettingsOpen);
    const [localWidth, setLocalWidth] = useState(defaultSettingsWidth);
    const settingsOpen = controlledOpen ?? localOpen;
    const settingsWidth = controlledWidth ?? localWidth;
    const settingsId = useId();
    const theme = useThemeValue();
    const changeOpen = () => {
        if (controlledOpen === undefined) setLocalOpen(!settingsOpen);
        props.onSettingsOpenChange?.(!settingsOpen);
    };
    const changeWidth = (width: number) => {
        if (controlledWidth === undefined) setLocalWidth(width);
        props.onSettingsWidthChange?.(width);
    };
    const language =
        props.engines.find((engine) => engine.id === props.engineId)?.language ?? 'plaintext';
    const providerContext = useMemo(
        () => ({
            ...props.providerContext,
            language,
            engineId: props.engineId,
            clusterId: props.clusterId,
        }),
        [props.providerContext, language, props.engineId, props.clusterId],
    );

    return (
        <Flex direction="column" className={block(null, props.className)}>
            <QueryEditorSplit
                className={block('split')}
                open={settingsOpen}
                settingsId={settingsId}
                width={settingsWidth}
                onWidthChange={changeWidth}
                onClose={changeOpen}
            >
                <QueryEditorToolbar
                    {...props}
                    settingsOpen={settingsOpen}
                    settingsId={settingsId}
                    onSettingsToggle={changeOpen}
                />
                <MonacoEditor
                    editorRef={props.editorRef}
                    onClick={props.onClick}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    preset={props.preset}
                    providers={props.providers}
                    providerContext={providerContext}
                    extensions={props.extensions}
                    showStatusBar={props.showStatusBar}
                    diagnostics={props.diagnostics}
                    highlightErrorLines={props.highlightErrorLines}
                    highlightedLine={props.highlightedLine}
                    onLineNumberClick={props.onLineNumberClick}
                    value={props.value}
                    onChange={props.onChange}
                    readOnly={props.readOnly}
                    language={language}
                    theme={theme}
                    backgroundColor="var(--g-color-base-background)"
                    monacoConfig={{
                        ariaLabel: i18n('field_query'),
                        ...props.editorOptions,
                        automaticLayout: true,
                        readOnly: props.readOnly,
                    }}
                    className={block('editor')}
                />
            </QueryEditorSplit>
            <Flex alignItems="center" justifyContent="end" className={block('footer')}>
                {props.onCodeAssistantClick && (
                    <Button view="flat" onClick={props.onCodeAssistantClick}>
                        <Icon data={SparklesIcon} size={16} />
                        {i18n('action_code-assistant')}
                    </Button>
                )}
            </Flex>
        </Flex>
    );
}
