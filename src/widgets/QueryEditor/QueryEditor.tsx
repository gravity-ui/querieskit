import React, {useEffect, useId, useMemo, useState} from 'react';
import {Button, Flex, Icon, useThemeValue} from '@gravity-ui/uikit';
import SparklesIcon from '@gravity-ui/icons/svgs/sparkles.svg';
import cn from 'bem-cn-lite';
import {createEditorCommandsExtension} from '../../helpers/createEditorCommandsExtension';
import type {EditorCommand} from '../../types/editorCommands';
import {MonacoEditor} from '../../components/MonacoEditor';
import {Attachments} from '../../modules/Attachments';
import type {AttachItem} from '../../types/attachments';
import {QueryParameters} from '../../modules/QueryParameters';
import type {QueryParameter} from '../../types/queryParameters';
import {QuerySettings} from '../../modules/QuerySettings';
import {QueryShare} from '../../modules/QueryShare';
import type {QueryEditorPanel, QueryEditorProps} from '../../types/queryEditor';
import {QueryEditorToolbar} from './internal/QueryEditorToolbar';
import {QueryEditorSplit} from './internal/QueryEditorSplit';
import i18n from './i18n';
import './QueryEditor.scss';

const block = cn('qp-query-editor');

export function QueryEditor<
    TCustom extends object = Record<string, unknown>,
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
>(props: QueryEditorProps<TCustom, TAttachment, TValue>): React.JSX.Element;
export function QueryEditor<TCustom extends object = Record<string, unknown>>(
    props: QueryEditorProps<TCustom>,
): React.JSX.Element;
export function QueryEditor<
    TCustom extends object = Record<string, unknown>,
    TAttachment extends AttachItem = AttachItem,
    TValue = string,
>(props: QueryEditorProps<TCustom, TAttachment, TValue>) {
    const {
        activePanel: controlledPanel,
        defaultActivePanel = null,
        panelWidth: controlledWidth,
        defaultPanelWidth = 320,
    } = props;
    const [localPanel, setLocalPanel] = useState<QueryEditorPanel>(defaultActivePanel);
    const [localWidth, setLocalWidth] = useState(defaultPanelWidth);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareAnchor, setShareAnchor] = useState<HTMLButtonElement | null>(null);
    const sharingEnabled = props.shareProps !== undefined;
    useEffect(() => {
        if (!sharingEnabled) setShareOpen(false);
    }, [sharingEnabled]);
    const selectedPanel = controlledPanel === undefined ? localPanel : controlledPanel;
    const panelHidden = selectedPanel !== null && props.hiddenPanels?.includes(selectedPanel);
    const activePanel = panelHidden ? null : selectedPanel;
    useEffect(() => {
        if (controlledPanel === undefined && panelHidden) setLocalPanel(null);
    }, [controlledPanel, panelHidden]);
    const panelWidth = controlledWidth ?? localWidth;
    const [localParameters, setLocalParameters] = useState<QueryParameter[]>([]);
    const parametersId = useId();
    const settingsId = useId();
    const attachmentsId = useId();
    const theme = useThemeValue();
    const changePanel = (panel: QueryEditorPanel) => {
        if (controlledPanel === undefined) setLocalPanel(panel);
        props.onActivePanelChange?.(panel);
    };
    const togglePanel = (panel: Exclude<QueryEditorPanel, null>) => {
        changePanel(activePanel === panel ? null : panel);
    };
    const changeWidth = (width: number) => {
        if (controlledWidth === undefined) setLocalWidth(width);
        props.onPanelWidthChange?.(width);
    };
    const engine = props.engines.find((item) => item.id === props.engineId);
    const language = engine?.language ?? 'plaintext';
    const settingsProps = props.settingsProps;
    const settings = settingsProps ? (
        <QuerySettings<TCustom, TValue>
            key="settings"
            {...settingsProps}
            renderCustomFields={(context) => (
                <>
                    {engine?.renderSettingsFields?.({
                        ...context,
                        engineId: engine.id,
                        clusterId: props.clusterId,
                    })}
                    {settingsProps.renderCustomFields?.(context)}
                </>
            )}
            renderCustomSections={(context) => (
                <>
                    {engine?.renderSettingsSections?.({
                        ...context,
                        engineId: engine.id,
                        clusterId: props.clusterId,
                    })}
                    {settingsProps.renderCustomSections?.(context)}
                </>
            )}
        />
    ) : (
        props.settings
    );
    const providerContext = useMemo(
        () => ({
            ...props.providerContext,
            language,
            engineId: props.engineId,
            clusterId: props.clusterId,
        }),
        [props.providerContext, language, props.engineId, props.clusterId],
    );

    const commandExtension = useMemo(() => {
        const commands: EditorCommand[] = [...(props.commands ?? [])];
        const handlers = {run: props.onRun, format: props.onFormat, validate: props.onValidate};
        for (const id of ['run', 'format', 'validate'] as const) {
            const keybindings = props.shortcuts?.[id];
            const handler = handlers[id];
            if (keybindings && keybindings.length && handler) {
                commands.push({
                    id: `querieskit.${id}`,
                    label: i18n(`action_${id}`),
                    keybindings,
                    run: handler,
                    ...props.actionStates?.[id],
                });
            }
        }
        return commands.length
            ? createEditorCommandsExtension(commands, {active: props.active})
            : undefined;
    }, [
        props.commands,
        props.shortcuts,
        props.onRun,
        props.onFormat,
        props.onValidate,
        props.actionStates,
        props.active,
    ]);
    const extensions = useMemo(
        () =>
            commandExtension ? [...(props.extensions ?? []), commandExtension] : props.extensions,
        [props.extensions, commandExtension],
    );

    return (
        <Flex direction="column" className={block(null, props.className)}>
            <QueryEditorSplit
                className={block('split')}
                activePanel={activePanel}
                hiddenPanels={props.hiddenPanels}
                settingsId={settingsId}
                width={panelWidth}
                onWidthChange={changeWidth}
                onClose={() => changePanel(null)}
                settings={settings}
                parametersId={parametersId}
                parameters={
                    props.parameters === undefined ? (
                        <QueryParameters
                            value={localParameters}
                            onChange={setLocalParameters}
                            {...props.parametersProps}
                        />
                    ) : (
                        props.parameters
                    )
                }
                attachmentsId={attachmentsId}
                attachments={
                    props.attachments === undefined ? (
                        props.attachmentsProps ? (
                            <Attachments<TAttachment>
                                key="attachments"
                                {...props.attachmentsProps}
                            />
                        ) : (
                            <Attachments key="attachments" />
                        )
                    ) : (
                        props.attachments
                    )
                }
            >
                <QueryEditorToolbar
                    {...props}
                    activePanel={activePanel}
                    parametersId={parametersId}
                    settingsId={settingsId}
                    attachmentsId={attachmentsId}
                    onPanelToggle={togglePanel}
                    shareButtonRef={setShareAnchor}
                    shareOpen={shareOpen}
                    onShareClick={sharingEnabled ? () => setShareOpen((open) => !open) : undefined}
                />
                <MonacoEditor
                    editorRef={props.editorRef}
                    onClick={props.onClick}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    preset={props.preset}
                    providers={props.providers}
                    providerContext={providerContext}
                    extensions={extensions}
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
            {props.shareProps && (
                <QueryShare
                    {...props.shareProps}
                    anchorElement={shareAnchor}
                    open={shareOpen}
                    onClose={() => setShareOpen(false)}
                />
            )}
        </Flex>
    );
}
