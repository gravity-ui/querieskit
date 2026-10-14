import type * as Monaco from 'monaco-editor';
import {describe, expect, it, vi} from 'vitest';

import {attachEditorProviders} from '../../src/helpers/editorProviders';

function emitter() {
    const listeners = new Set<() => void>();
    return {
        event: (listener: () => void) => {
            listeners.add(listener);
            return {dispose: () => listeners.delete(listener)};
        },
        fire: () => listeners.forEach((listener) => listener()),
    };
}

class TokenSource {
    public event = emitter();
    token = {
        isCancellationRequested: false,
        onCancellationRequested: this.event.event,
    };
    public cancel() {
        this.token.isCancellationRequested = true;
        this.event.fire();
    }
    public dispose() {}
}

function fixture() {
    const registrations: Array<{
        selector: Monaco.languages.LanguageSelector;
        provider: Monaco.languages.CompletionItemProvider &
            Monaco.languages.InlineCompletionsProvider;
        dispose: ReturnType<typeof vi.fn>;
    }> = [];
    const register = (
        _language: Monaco.languages.LanguageSelector,
        provider: (typeof registrations)[number]['provider'],
    ) => {
        const registration = {selector: _language, provider, dispose: vi.fn()};
        registrations.push(registration);
        return registration;
    };
    const monaco = {
        CancellationTokenSource: TokenSource,
        languages: {
            registerCompletionItemProvider: register,
            registerInlineCompletionsProvider: register,
            registerHoverProvider: register,
            registerDefinitionProvider: register,
            registerDocumentFormattingEditProvider: register,
        },
    } as unknown as typeof Monaco;
    const content = emitter();
    const language = emitter();
    const model = {
        uri: {scheme: 'inmemory', fsPath: '/model/1'},
        getLanguageId: () => 'sql',
        onDidChangeContent: content.event,
        onDidChangeLanguage: language.event,
    } as unknown as Monaco.editor.ITextModel;
    const request = (index = 0, target = model) =>
        registrations[index].provider.provideCompletionItems(
            target,
            {lineNumber: 1, column: 1} as Monaco.Position,
            {triggerKind: 0},
            new TokenSource().token,
        );
    return {monaco, model, registrations, content, language, request};
}

describe('model-scoped editor providers', () => {
    it('shares a registration, guards unrelated models and disposes after the last consumer', async () => {
        const f = fixture();
        const provider = {provideCompletionItems: vi.fn(() => ({suggestions: []}))};
        const first = attachEditorProviders(f.monaco, f.model, {completion: provider}, undefined);
        const otherModel = {...f.model};
        const second = attachEditorProviders(f.monaco, f.model, {completion: provider}, undefined);
        expect(f.registrations).toHaveLength(1);
        await f.request(0, {...f.model});
        expect(provider.provideCompletionItems).not.toHaveBeenCalled();
        await f.request();
        await f.request();
        expect(provider.provideCompletionItems).toHaveBeenCalledTimes(2);
        first.dispose();
        expect(f.registrations[0].dispose).not.toHaveBeenCalled();
        await f.request(0, otherModel);
        expect(provider.provideCompletionItems).toHaveBeenCalledTimes(2);
        second.dispose();
        second.dispose();
        expect(f.registrations[0].dispose).toHaveBeenCalledTimes(1);
    });

    it('preserves completion and inline requests when only hover changes or overrides are equivalent', async () => {
        const f = fixture();
        let completionToken!: Monaco.CancellationToken;
        let inlineToken!: Monaco.CancellationToken;
        let finishCompletion!: (value: Monaco.languages.CompletionList) => void;
        let finishInline!: (value: Monaco.languages.InlineCompletions) => void;
        const completion: Monaco.languages.CompletionItemProvider = {
            provideCompletionItems: (_model, _position, _context, token) => {
                completionToken = token;
                return new Promise((resolve) => {
                    finishCompletion = resolve;
                });
            },
        };
        const inlineCompletion: Monaco.languages.InlineCompletionsProvider = {
            provideInlineCompletions: (_model, _position, _context, token) => {
                inlineToken = token;
                return new Promise((resolve) => {
                    finishInline = resolve;
                });
            },
            disposeInlineCompletions: vi.fn(),
        };
        const hover = {provideHover: vi.fn()};
        const attached = attachEditorProviders(
            f.monaco,
            f.model,
            {completion, inlineCompletion, hover},
            undefined,
        );
        const completionResult = f.request();
        const inlineResult = f.registrations[1].provider.provideInlineCompletions(
            f.model,
            {} as Monaco.Position,
            {} as Monaco.languages.InlineCompletionContext,
            new TokenSource().token,
        );
        const replacement = {provideHover: vi.fn()};
        attached.update({hover: {mode: 'replace', provider: replacement}});
        attached.update({hover: {mode: 'replace', provider: replacement}});
        expect(f.registrations).toHaveLength(4);
        expect(f.registrations[2].dispose).toHaveBeenCalledOnce();
        expect(f.registrations[0].dispose).not.toHaveBeenCalled();
        expect(f.registrations[1].dispose).not.toHaveBeenCalled();
        expect(completionToken.isCancellationRequested).toBe(false);
        expect(inlineToken.isCancellationRequested).toBe(false);
        const completions = {suggestions: []};
        const inlineCompletions = {items: []};
        finishCompletion(completions);
        finishInline(inlineCompletions);
        expect(await completionResult).toBe(completions);
        expect(await inlineResult).toBe(inlineCompletions);
        attached.dispose();
    });

    it('cancels removed sources while retaining appended sources and restores disabled preset providers', async () => {
        const f = fixture();
        const preset = {provideCompletionItems: vi.fn(() => ({suggestions: []}))};
        let token!: Monaco.CancellationToken;
        let finish!: (value: Monaco.languages.CompletionList) => void;
        const custom: Monaco.languages.CompletionItemProvider = {
            provideCompletionItems: (_model, _position, _context, requestToken) => {
                token = requestToken;
                return new Promise((resolve) => {
                    finish = resolve;
                });
            },
        };
        const attached = attachEditorProviders(
            f.monaco,
            f.model,
            {completion: preset},
            {
                completion: {mode: 'append', provider: custom},
            },
        );
        const pending = f.request(1);
        attached.update(undefined);
        expect(token.isCancellationRequested).toBe(true);
        expect(f.registrations[0].dispose).not.toHaveBeenCalled();
        expect(f.registrations[1].dispose).toHaveBeenCalledOnce();
        const dispose = vi.fn();
        finish({suggestions: [], dispose});
        expect(await pending).toBeUndefined();
        expect(dispose).toHaveBeenCalledOnce();
        attached.update({completion: false});
        expect(f.registrations[0].dispose).toHaveBeenCalledOnce();
        attached.update(undefined);
        expect(f.registrations).toHaveLength(3);
        await f.request(2);
        expect(preset.provideCompletionItems).toHaveBeenCalledOnce();
        attached.dispose();
        attached.update(undefined);
        expect(f.registrations).toHaveLength(3);
    });

    it('replaces, appends and disables without changing inputs', () => {
        const f = fixture();
        const preset = {completion: {provideCompletionItems: vi.fn()}};
        const provider = {provideCompletionItems: vi.fn()};
        const disabled = attachEditorProviders(f.monaco, f.model, preset, {completion: false});
        expect(f.registrations).toHaveLength(0);
        disabled.dispose();
        const replacement = attachEditorProviders(f.monaco, f.model, preset, {
            completion: {mode: 'replace', provider},
        });
        expect(f.registrations).toHaveLength(1);
        replacement.dispose();
        const appended = attachEditorProviders(f.monaco, f.model, preset, {
            completion: {mode: 'append', provider},
        });
        expect(f.registrations).toHaveLength(3);
        expect(preset.completion.provideCompletionItems).not.toHaveBeenCalled();
        appended.dispose();
    });

    it.each(['content', 'language', 'detach'] as const)(
        'cancels pending requests on %s and disposes stale results',
        async (event) => {
            const f = fixture();
            let finish!: (result: Monaco.languages.CompletionList) => void;
            let requestToken: Monaco.CancellationToken | undefined;
            const provider: Monaco.languages.CompletionItemProvider = {
                provideCompletionItems: (_model, _position, _context, token) => {
                    requestToken = token;
                    return new Promise((resolve) => {
                        finish = resolve;
                    });
                },
            };
            const attached = attachEditorProviders(
                f.monaco,
                f.model,
                {completion: provider},
                undefined,
            );
            const result = f.request();
            if (event === 'detach') {
                attached.dispose();
            } else {
                f[event].fire();
            }
            expect(requestToken?.isCancellationRequested).toBe(true);
            const dispose = vi.fn();
            finish({suggestions: [], dispose});
            expect(await result).toBeUndefined();
            expect(dispose).toHaveBeenCalledOnce();
            attached.dispose();
        },
    );

    it('retains inline lifecycle, events and source binding after detach', async () => {
        const f = fixture();
        const result = {items: [{insertText: 'SELECT'}]};
        const end = vi.fn();
        const dispose = vi.fn();
        const event = emitter().event;
        const provider: Monaco.languages.InlineCompletionsProvider = {
            provideInlineCompletions() {
                expect(this).toBe(provider);
                return result;
            },
            disposeInlineCompletions: dispose,
            handleEndOfLifetime: end,
            onDidChangeInlineCompletions: event,
            groupId: 'custom',
        };
        const attached = attachEditorProviders(
            f.monaco,
            f.model,
            {inlineCompletion: provider},
            undefined,
        );
        const wrapper = f.registrations[0].provider;
        expect(wrapper.groupId).toBe('custom');
        const listener = vi.fn();
        const subscription = wrapper.onDidChangeInlineCompletions?.(listener);
        const returned = await wrapper.provideInlineCompletions(
            f.model,
            {} as Monaco.Position,
            {} as Monaco.languages.InlineCompletionContext,
            new TokenSource().token,
        );
        expect(returned).toBe(result);
        attached.dispose();
        const reason = {kind: 0, alternativeAction: false} as const;
        const lifetime = {} as Monaco.languages.LifetimeSummary;
        wrapper.handleEndOfLifetime?.(result, result.items[0], reason, lifetime);
        wrapper.disposeInlineCompletions(result, {kind: 'other'});
        expect(end).toHaveBeenCalledWith(result, result.items[0], reason, lifetime);
        expect(dispose).toHaveBeenCalledWith(result, {kind: 'other'});
        subscription?.dispose();
    });

    it('keeps completion resolve and disposal with a frozen source after replacement', async () => {
        const f = fixture();
        const item = {label: 'table', kind: 0, insertText: 'table', range: {} as Monaco.IRange};
        const dispose = vi.fn();
        const provider: Monaco.languages.CompletionItemProvider = Object.freeze({
            triggerCharacters: ['.'],
            provideCompletionItems: () => ({suggestions: [item], dispose}),
            resolveCompletionItem(value: Monaco.languages.CompletionItem) {
                expect(this).toBe(provider);
                return {...value, detail: 'original'};
            },
        });
        const first = attachEditorProviders(f.monaco, f.model, {completion: provider}, undefined);
        const result = await f.request();
        first.dispose();
        const second = attachEditorProviders(
            f.monaco,
            f.model,
            {
                completion: {provideCompletionItems: () => ({suggestions: []})},
            },
            undefined,
        );
        const resolved = await f.registrations[0].provider.resolveCompletionItem?.(
            item,
            new TokenSource().token,
        );
        expect(resolved?.detail).toBe('original');
        expect(f.registrations[0].provider.triggerCharacters).toEqual(['.']);
        result?.dispose?.();
        expect(dispose).toHaveBeenCalledOnce();
        second.dispose();
    });

    it('disposes cancelled inline responses without inventing a rejection event', async () => {
        const f = fixture();
        let finish!: (value: Monaco.languages.InlineCompletions) => void;
        const dispose = vi.fn();
        const rejection = vi.fn();
        const provider: Monaco.languages.InlineCompletionsProvider = {
            provideInlineCompletions: () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
            disposeInlineCompletions: dispose,
            handleRejection: rejection,
        };
        const attached = attachEditorProviders(
            f.monaco,
            f.model,
            {inlineCompletion: provider},
            undefined,
        );
        const token = new TokenSource();
        const pending = f.registrations[0].provider.provideInlineCompletions(
            f.model,
            {} as Monaco.Position,
            {} as Monaco.languages.InlineCompletionContext,
            token.token,
        );
        token.cancel();
        const result = {items: [{insertText: 'SELECT'}]};
        finish(result);
        expect(await pending).toBeUndefined();
        expect(dispose).toHaveBeenCalledWith(result, {kind: 'tokenCancellation'});
        expect(rejection).not.toHaveBeenCalled();
        attached.dispose();
    });

    it('uses model selectors so formatters and inline groups from other editors are not candidates', () => {
        const f = fixture();
        const provider = {provideDocumentFormattingEdits: vi.fn()};
        const otherModel = {
            ...f.model,
            uri: {scheme: 'inmemory', fsPath: '/model/2'},
        } as Monaco.editor.ITextModel;
        const first = attachEditorProviders(
            f.monaco,
            f.model,
            {documentFormatting: provider},
            undefined,
        );
        const second = attachEditorProviders(
            f.monaco,
            otherModel,
            {documentFormatting: provider},
            undefined,
        );
        expect(f.registrations.map(({selector}) => selector)).toEqual([
            {language: 'sql', scheme: 'inmemory', pattern: '/model/1'},
            {language: 'sql', scheme: 'inmemory', pattern: '/model/2'},
        ]);
        first.dispose();
        expect(f.registrations[0].dispose).toHaveBeenCalledOnce();
        expect(f.registrations[1].dispose).not.toHaveBeenCalled();
        second.dispose();
    });

    it('preserves hover context and links the token in its actual argument position', async () => {
        const f = fixture();
        const context = {verbosityRequest: {verbosityDelta: 1}};
        const hover = {contents: [{value: 'table'}]};
        const provideHover = vi.fn((_model, _position, token, receivedContext) => {
            expect(token.isCancellationRequested).toBe(false);
            expect(receivedContext).toBe(context);
            return hover;
        });
        const attached = attachEditorProviders(
            f.monaco,
            f.model,
            {hover: {provideHover}},
            undefined,
        );
        const wrapper = f.registrations[0].provider as unknown as Monaco.languages.HoverProvider;
        expect(
            await wrapper.provideHover(
                f.model,
                {} as Monaco.Position,
                new TokenSource().token,
                context as Monaco.languages.HoverContext,
            ),
        ).toBe(hover);
        expect(provideHover).toHaveBeenCalledOnce();
        attached.dispose();
    });

    it('dispatches definitions and formatting with the correct cancellation token', async () => {
        const f = fixture();
        const definitions: Monaco.languages.Location[] = [];
        const edits: Monaco.languages.TextEdit[] = [];
        const provideDefinition = vi.fn((_model, _position, token) => {
            expect(token.isCancellationRequested).toBe(false);
            return definitions;
        });
        const provideDocumentFormattingEdits = vi.fn((_model, options, token) => {
            expect(options).toEqual({tabSize: 4, insertSpaces: true});
            expect(token.isCancellationRequested).toBe(false);
            return edits;
        });
        const attached = attachEditorProviders(
            f.monaco,
            f.model,
            {
                definition: {provideDefinition},
                documentFormatting: {provideDocumentFormattingEdits},
            },
            undefined,
        );
        const definition = f.registrations[0]
            .provider as unknown as Monaco.languages.DefinitionProvider;
        const formatting = f.registrations[1]
            .provider as unknown as Monaco.languages.DocumentFormattingEditProvider;
        expect(
            await definition.provideDefinition(
                f.model,
                {} as Monaco.Position,
                new TokenSource().token,
            ),
        ).toBe(definitions);
        expect(
            await formatting.provideDocumentFormattingEdits(
                f.model,
                {tabSize: 4, insertSpaces: true},
                new TokenSource().token,
            ),
        ).toBe(edits);
        attached.dispose();
    });
});
