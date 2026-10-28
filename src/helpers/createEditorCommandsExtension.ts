import type {EditorCommand, EditorCommandsOptions} from '../types/editorCommands';
import type {EditorExtension} from '../types/editorProviders';

/** Register instance-scoped actions; replacing the extension disposes the old actions. */
export function createEditorCommandsExtension(
    commands: readonly EditorCommand[],
    {active = true}: EditorCommandsOptions = {},
): EditorExtension {
    return {
        setup(context) {
            const seen = new Set<string>();
            const registrations: Array<{dispose(): void}> = [];
            try {
                for (const command of commands) {
                    if (seen.has(command.id))
                        throw new Error(`Duplicate editor command: ${command.id}`);
                    seen.add(command.id);
                    if (!active || command.disabled || command.loading) continue;
                    registrations.push(
                        context.editor.addAction({
                            id: command.id,
                            label: command.label,
                            keybindings: command.keybindings,
                            keybindingContext: 'editorTextFocus',
                            run: () => {
                                if (context.editor.hasTextFocus()) return command.run(context);
                                return undefined;
                            },
                        }),
                    );
                }
            } catch (error) {
                registrations.forEach((registration) => registration.dispose());
                throw error;
            }
            return () => registrations.forEach((registration) => registration.dispose());
        },
    };
}
