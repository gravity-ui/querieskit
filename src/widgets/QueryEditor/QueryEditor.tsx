import React, {useEffect, useId, useMemo, useState} from 'react';
import {Button, Flex, Icon, useThemeValue} from '@gravity-ui/uikit';
import SparklesIcon from '@gravity-ui/icons/svgs/sparkles.svg';
import cn from 'bem-cn-lite';
import {MonacoEditor} from '../../components/MonacoEditor';
import {Attachments} from '../../modules/Attachments';
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

export function QueryEditor<TCustom extends object = Record<string, unknown>>(
    props: QueryEditorProps<TCustom>,
) {
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
    const activePanel = controlledPanel === undefined ? localPanel : controlledPanel;
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
        <QuerySettings
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

    return (
        <Flex direction="column" className={block(null, props.className)}>
            <QueryEditorSplit
                className={block('split')}
                activePanel={activePanel}
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
                        <Attachments {...props.attachmentsProps} />
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
