import type {ReactNode} from 'react';
import type {IconProps} from '@gravity-ui/uikit';
import type {MonacoEditorConfig, MonacoEditorIntegrationProps} from './monacoEditor';
import type {QuerySettingsCustomFieldsContext, QuerySettingsProps} from './querySettings';

export type QueryEditorCluster = {id: string; title: string; disabled?: boolean};

export type QueryEditorEngineSettingsContext<TCustom extends object = Record<string, unknown>> =
    QuerySettingsCustomFieldsContext<TCustom> & {
        engineId: string;
        clusterId?: string;
    };

export type QueryEditorEngine<TCustom extends object = Record<string, unknown>> =
    QueryEditorCluster & {
        /** Registered Monaco language ID, e.g. yql or clickhouse. */
        language: string;
        /** Fields rendered after Query name when the built-in settings form is used. */
        renderSettingsFields?: (context: QueryEditorEngineSettingsContext<TCustom>) => ReactNode;
        /** Engine-specific sections rendered after Attributes in the built-in settings form. */
        renderSettingsSections?: (context: QueryEditorEngineSettingsContext<TCustom>) => ReactNode;
    };

export type QueryEditorActionState = {disabled?: boolean; loading?: boolean};

export type QueryEditorMenuAction = {
    id: string;
    title: string;
    onClick: () => void;
    disabled?: boolean;
};

export type QueryEditorToolbarAction = QueryEditorMenuAction & {
    icon: IconProps['data'];
    loading?: boolean;
};

export type QueryEditorOptions = Omit<
    MonacoEditorConfig,
    'model' | 'value' | 'language' | 'theme' | 'readOnly' | 'automaticLayout'
>;

export type QueryEditorProps<TCustom extends object = Record<string, unknown>> =
    MonacoEditorIntegrationProps & {
        value: string;
        onChange: (value: string) => void;
        clusters: QueryEditorCluster[];
        clusterId?: string;
        onClusterChange: (id: string) => void;
        engines: QueryEditorEngine<TCustom>[];
        engineId?: string;
        onEngineChange: (id: string) => void;
        onRun: () => void;
        onFormat: () => void;
        onValidate: () => void;
        actionStates?: Partial<Record<'run' | 'format' | 'validate', QueryEditorActionState>>;
        additionalActions?: QueryEditorMenuAction[];
        rightActions?: QueryEditorToolbarAction[];
        onCodeAssistantClick?: () => void;
        readOnly?: boolean;
        editorOptions?: QueryEditorOptions;
        /** Controlled visibility; omit to keep visibility inside the module. */
        settingsOpen?: boolean;
        /** Initial uncontrolled visibility. Defaults to false. */
        defaultSettingsOpen?: boolean;
        onSettingsOpenChange?: (open: boolean) => void;
        /** Controlled preferred width in pixels; constrained to available space. */
        settingsWidth?: number;
        /** Initial uncontrolled width. Defaults to 320px. */
        defaultSettingsWidth?: number;
        onSettingsWidthChange?: (width: number) => void;
        /** The parent supplies a bounded height through its layout or this class. */
        className?: string;
    } & (
            | {
                  /** Full custom content below the Settings heading; excludes the built-in form. */
                  settings?: ReactNode;
                  settingsProps?: never;
              }
            | {
                  settings?: never;
                  /** Built-in controlled form. Engine fields precede renderCustomFields from these props. */
                  settingsProps: QuerySettingsProps<TCustom>;
              }
        );
