import React, {useRef, useState} from 'react';
import {Alert, Flex, Text, TextInput} from '@gravity-ui/uikit';
import {MarkerSeverity} from 'monaco-editor/editor/editor.api';
import {action} from 'storybook/actions';
import type {QueryEditorProps} from '../../../types/queryEditor';
import type {QueryShareLink} from '../../../types/queryShare';
import type {BuiltinEngineSettings} from '../../../types/builtinQueryEngines';
import {QueryEditor} from '../QueryEditor';
import {createBuiltinQueryEngines} from '../presets/builtin';
import {ATTACHMENTS, CLUSTERS, DELETED_ATTACHMENTS, PARAMETERS, QUERY, SETTINGS} from './demoData';

type EditorProps = QueryEditorProps<BuiltinEngineSettings>;
export type QueryEditorExampleProps = Pick<
    EditorProps,
    | 'readOnly'
    | 'defaultActivePanel'
    | 'activePanel'
    | 'onActivePanelChange'
    | 'panelWidth'
    | 'onPanelWidthChange'
    | 'actionStates'
> & {
    width?: number | string;
    longTitles?: boolean;
    emptyOptions?: boolean;
    customPanels?: boolean;
};

export function QueryEditorExample({
    width = '100%',
    longTitles = false,
    emptyOptions = false,
    customPanels = false,
    ...props
}: QueryEditorExampleProps) {
    const [value, setValue] = useState(QUERY);
    const [clusterId, setClusterId] = useState(CLUSTERS[0].id);
    const [engineId, setEngineId] = useState('yql');
    const [settings, setSettings] = useState(SETTINGS);
    const [parameters, setParameters] = useState(PARAMETERS);
    const [attachments, setAttachments] = useState(ATTACHMENTS);
    const [deletedAttachments, setDeletedAttachments] = useState(DELETED_ATTACHMENTS);
    const [link, setLink] = useState<QueryShareLink>();
    const [message, setMessage] = useState(
        'Demo data is kept in memory. Open Settings, Parameters, or Attachments to edit it.',
    );
    const [diagnostics, setDiagnostics] = useState<EditorProps['diagnostics']>([]);
    const [customValues, setCustomValues] = useState({
        settings: 'Analytics',
        parameters: '100',
        attachments: 'report.csv',
    });
    const revision = useRef(0);
    const snapshot = {
        query: value,
        clusterId: emptyOptions ? undefined : clusterId,
        engineId: emptyOptions ? undefined : engineId,
        settings,
        parameters,
        attachments,
        deletedAttachments,
        ...(customPanels ? {customValues} : {}),
    };
    const serialized = JSON.stringify(snapshot);
    const [saved, setSaved] = useState(serialized);
    const report = (name: string, text: string, payload: unknown = snapshot) => {
        action(name)(payload);
        setMessage(text);
    };
    const generate = (permanent: boolean) => {
        revision.current += 1;
        setLink({
            url: `https://example.com/queries/shared-${revision.current}`,
            expiresAt: permanent ? null : Date.now() + 24 * 60 * 60 * 1000,
        });
    };
    const engines = createBuiltinQueryEngines({
        yql: {versions: ['stable', 'preview']},
        chyt: {cliques: [{alias: `${clusterId}-analytics`, state: 'active', health: 'good'}]},
        spyt: {
            discoveryGroups: [{path: `//${clusterId}/spark/default`, title: `${clusterId} Spark`}],
        },
    });
    const save = (copy: boolean) => {
        if (copy) {
            const next = {...settings, queryName: `${settings.queryName} (copy)`};
            setSettings(next);
            setSaved(JSON.stringify({...snapshot, settings: next}));
            report('save as', `Saved a local copy: ${next.queryName}`, {
                ...snapshot,
                settings: next,
            });
        } else {
            setSaved(serialized);
            report('save', `Saved locally: ${settings.queryName}`);
        }
    };
    const customContent = (panel: keyof typeof customValues) => (
        <Flex direction="column" gap={3} spacing={{p: 4}}>
            <Text variant="subheader-1">Application {panel}</Text>
            <Text color="secondary">
                Custom slot content. Switch panels to check that edits persist.
            </Text>
            <TextInput
                controlProps={{'aria-label': `Custom ${panel}`}}
                value={customValues[panel]}
                onUpdate={(next) => setCustomValues((current) => ({...current, [panel]: next}))}
            />
        </Flex>
    );
    return (
        <Flex direction="column" gap={3}>
            <Text color="secondary">
                {saved === serialized ? 'All changes saved locally' : 'Unsaved changes'}
            </Text>
            <div style={{height: 540, width, maxWidth: '100%'}}>
                <QueryEditor
                    {...props}
                    value={value}
                    onChange={(next) => {
                        setValue(next);
                        setDiagnostics([]);
                    }}
                    clusters={
                        emptyOptions
                            ? []
                            : CLUSTERS.map((item) => ({
                                  ...item,
                                  title: longTitles
                                      ? `${item.title}: analytics cluster in the primary region`
                                      : item.title,
                              }))
                    }
                    clusterId={emptyOptions ? undefined : clusterId}
                    onClusterChange={setClusterId}
                    engines={
                        emptyOptions
                            ? []
                            : engines.map((item) => ({
                                  ...item,
                                  title: longTitles
                                      ? `${item.title}: distributed query engine`
                                      : item.title,
                              }))
                    }
                    engineId={emptyOptions ? undefined : engineId}
                    onEngineChange={setEngineId}
                    defaultPanelWidth={360}
                    onRun={() =>
                        report('run', 'Run payload sent to Actions (no backend execution).')
                    }
                    onFormat={() => {
                        setValue(value.trim() + '\n');
                        setDiagnostics([]);
                        report('format', 'Demo formatter trimmed surrounding whitespace.');
                    }}
                    onValidate={() => {
                        const invalid = /\bunknown\b/i.exec(value);
                        const before = invalid ? value.slice(0, invalid.index).split('\n') : [];
                        const column = (before[before.length - 1]?.length ?? 0) + 1;
                        setDiagnostics(
                            invalid
                                ? [
                                      {
                                          severity: MarkerSeverity.Error,
                                          message:
                                              'Demo validation: replace "unknown" with an existing field.',
                                          startLineNumber: before.length,
                                          endLineNumber: before.length,
                                          startColumn: column,
                                          endColumn: column + invalid[0].length,
                                      },
                                  ]
                                : [],
                        );
                        report(
                            'validate',
                            invalid
                                ? 'Demo validation found "unknown"; see the highlighted text.'
                                : 'Demo validation passed. Type "unknown" to try an error.',
                        );
                    }}
                    diagnostics={diagnostics}
                    highlightErrorLines
                    saveProps={{onSave: () => save(false), onSaveAs: () => save(true)}}
                    shareProps={{
                        link,
                        onGenerate: () => generate(false),
                        onRegenerate: () => generate(link?.expiresAt === null),
                        onMakePermanent: () => generate(true),
                        onExpirationChange: (expiresAt) =>
                            setLink((current) => current && {...current, expiresAt}),
                    }}
                    additionalActions={[
                        {id: 'duplicate', title: 'Duplicate query', onClick: () => save(true)},
                        {
                            id: 'history',
                            title: 'Show history',
                            disabled: true,
                            onClick: action('history'),
                        },
                    ]}
                    onCodeAssistantClick={() =>
                        report(
                            'code assistant',
                            'Code Assistant requested. Connect an application assistant through onCodeAssistantClick.',
                        )
                    }
                    {...(customPanels
                        ? {
                              settings: customContent('settings'),
                              parameters: customContent('parameters'),
                              attachments: customContent('attachments'),
                          }
                        : {
                              settingsProps: {
                                  value: settings,
                                  onChange: setSettings,
                                  tokens: [{id: 'analytics', title: 'Analytics'}],
                              },
                              parametersProps: {value: parameters, onChange: setParameters},
                              attachmentsProps: {
                                  attachments,
                                  deletedAttachments,
                                  tokens: [{value: 'analytics', title: 'Analytics'}],
                                  onItemClick: (item) =>
                                      report(
                                          'attachment clicked',
                                          'Attachment selected; details sent to Actions.',
                                          item,
                                      ),
                                  onChange: (next) => {
                                      setAttachments(next.attachments);
                                      setDeletedAttachments(next.deletedAttachments);
                                  },
                              },
                          })}
                />
            </div>
            <div role="status">
                <Alert theme="info" message={message} />
            </div>
        </Flex>
    );
}
