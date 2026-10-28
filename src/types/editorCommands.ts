import type {EditorSetupContext} from './editorProviders';

export type EditorCommand = {
    /** Unique within this editor's commands. Built-in IDs use the querieskit. prefix. */
    id: string;
    label: string;
    run: (context: EditorSetupContext) => void | Promise<void>;
    /** Monaco KeyMod / KeyCode combinations. Omit to register without a shortcut. */
    keybindings?: number[];
    disabled?: boolean;
    loading?: boolean;
};

export type EditorCommandsOptions = {
    /** Inactive editors keep their instance but cannot execute commands. Defaults to true. */
    active?: boolean;
};

export type QueryEditorShortcuts = Partial<Record<'run' | 'format' | 'validate', number[] | false>>;
