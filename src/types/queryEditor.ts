import type {IconProps} from '@gravity-ui/uikit';
import type {MonacoEditorConfig} from './monacoEditor';

export type QueryEditorCluster = {id: string; title: string; disabled?: boolean};

export type QueryEditorEngine = QueryEditorCluster & {
    /** Registered Monaco language ID, e.g. yql or clickhouse. */
    language: string;
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

export type QueryEditorProps = {
    value: string;
    onChange: (value: string) => void;
    clusters: QueryEditorCluster[];
    clusterId?: string;
    onClusterChange: (id: string) => void;
    engines: QueryEditorEngine[];
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
};
