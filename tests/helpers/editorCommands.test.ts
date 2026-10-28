import {describe, expect, it, vi} from 'vitest';
import {createEditorCommandsExtension} from '../../src/helpers/createEditorCommandsExtension';
import type {EditorSetupContext} from '../../src/types/editorProviders';
import type {editor} from 'monaco-editor';

function setup(focused = true) {
    const actions = new Map<string, editor.IActionDescriptor>();
    const dispose = vi.fn();
    const context = {
        editor: {
            hasTextFocus: () => focused,
            addAction: (action: editor.IActionDescriptor) => {
                actions.set(action.id, action);
                return {
                    dispose: () => {
                        actions.delete(action.id);
                        dispose();
                    },
                };
            },
        },
    } as unknown as EditorSetupContext & {statusBarElement: HTMLDivElement | null};
    return {context, actions, dispose};
}

describe('editor commands', () => {
    it('uses per-editor actions, focus guard and cleanup', () => {
        const first = setup();
        const second = setup(false);
        const run = vi.fn();
        const extension = createEditorCommandsExtension([
            {id: 'run', label: 'Run', keybindings: [1], run},
        ]);
        const cleanup = extension.setup(first.context);
        extension.setup(second.context);
        first.actions.get('run')!.run(first.context.editor);
        second.actions.get('run')!.run(second.context.editor);
        expect(run).toHaveBeenCalledExactlyOnceWith(first.context);
        expect(first.actions.get('run')!.keybindingContext).toBe('editorTextFocus');
        cleanup();
        expect(first.actions.size).toBe(0);
        expect(second.actions.size).toBe(1);
    });
    it('does not register inactive, disabled or loading commands', () => {
        const instance = setup();
        const run = vi.fn();
        createEditorCommandsExtension([{id: 'r', label: 'Run', run}], {active: false}).setup(
            instance.context,
        );
        createEditorCommandsExtension([
            {id: 'a', label: 'Run', run, disabled: true},
            {id: 'b', label: 'Run', run, loading: true},
        ]).setup(instance.context);
        expect(instance.actions.size).toBe(0);
    });
    it('replacement cleans up old handlers and bindings', () => {
        const instance = setup();
        const old = vi.fn();
        const next = vi.fn();
        const cleanup = createEditorCommandsExtension([{id: 'r', label: 'Run', run: old}]).setup(
            instance.context,
        );
        cleanup();
        createEditorCommandsExtension([{id: 'r', label: 'Run', run: next, keybindings: [2]}]).setup(
            instance.context,
        );
        instance.actions.get('r')!.run(instance.context.editor);
        expect(old).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledOnce();
        expect(instance.actions.get('r')!.keybindings).toEqual([2]);
    });
    it('cleans up on duplicate IDs', () => {
        const instance = setup();
        const command = {id: 'r', label: 'Run', run: vi.fn()};
        expect(() =>
            createEditorCommandsExtension([command, command]).setup(instance.context),
        ).toThrow('Duplicate');
        expect(instance.actions.size).toBe(0);
    });
});
