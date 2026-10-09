import type * as Monaco from 'monaco-editor';

import type {EditorMonaco, EditorProviderSet, EditorProviders} from '../../types/editorProviders';

type ProviderKind = keyof EditorProviderSet;
type Provider = NonNullable<EditorProviderSet[ProviderKind]>;
type MonacoInstance = EditorMonaco;
type Model = Monaco.editor.ITextModel;

type Consumer = {
    active: boolean;
    requests: Set<Monaco.CancellationTokenSource>;
};
type Registration = {
    kind: ProviderKind;
    model: Model;
    language: string;
    provider: Provider;
    consumers: Map<Model, Set<Consumer>>;
    disposable: Monaco.IDisposable;
};

const registries = new WeakMap<MonacoInstance, Set<Registration>>();
const methods = {
    completion: 'provideCompletionItems',
    inlineCompletion: 'provideInlineCompletions',
    hover: 'provideHover',
    definition: 'provideDefinition',
    documentFormatting: 'provideDocumentFormattingEdits',
} as const;

function cancel(consumer: Consumer) {
    for (const source of consumer.requests) {
        source.cancel();
    }
}

function register(
    monaco: MonacoInstance,
    kind: ProviderKind,
    language: string,
    provider: Provider,
    ownedModel: Model,
): Registration {
    const consumers: Registration['consumers'] = new Map();
    // Keep each source as an independent Monaco provider. Results, resolve calls,
    // events and inline lifecycle hooks therefore retain their original owner.
    const wrapper = new Proxy({} as Provider, {
        get(_target, property) {
            const target = provider;
            const value = Reflect.get(target, property, target);
            if (property !== methods[kind]) {
                return typeof value === 'function' ? value.bind(target) : value;
            }
            return async (model: Model, ...args: unknown[]) => {
                const consumer = consumers.get(model)?.values().next().value as
                    Consumer | undefined;
                if (!consumer?.active || model.getLanguageId() !== language) {
                    return undefined;
                }
                const tokenIndex = kind === 'completion' || kind === 'inlineCompletion' ? 2 : 1;
                const token = args[tokenIndex] as Monaco.CancellationToken;
                if (token.isCancellationRequested) {
                    return undefined;
                }
                const source = new monaco.CancellationTokenSource();
                const subscription = token.onCancellationRequested(() => source.cancel());
                consumer.requests.add(source);
                const requestArgs = [...args];
                requestArgs[tokenIndex] = source.token;
                try {
                    const result = await value.call(target, model, ...requestArgs);
                    if (source.token.isCancellationRequested || !consumer.active) {
                        if (kind === 'completion') {
                            (result as Monaco.languages.CompletionList | undefined)?.dispose?.();
                        } else if (kind === 'inlineCompletion' && result) {
                            (
                                target as Monaco.languages.InlineCompletionsProvider
                            ).disposeInlineCompletions(result, {kind: 'tokenCancellation'});
                        }
                        return undefined;
                    }
                    return result;
                } catch (error) {
                    if (!source.token.isCancellationRequested && consumer.active) {
                        throw error;
                    }
                    return undefined;
                } finally {
                    consumer.requests.delete(source);
                    subscription.dispose();
                    source.dispose();
                }
            };
        },
    });
    // Monaco chooses formatters and inline provider groups before invoking them.
    // A model guard alone cannot prevent unrelated providers entering that choice.
    const selector: Monaco.languages.LanguageFilter = {
        language,
        scheme: ownedModel.uri.scheme,
        pattern: ownedModel.uri.fsPath.replace(/[?*[\]{}]/g, (character) => `[${character}]`),
    };
    let disposable: Monaco.IDisposable;
    switch (kind) {
        case 'completion':
            disposable = monaco.languages.registerCompletionItemProvider(
                selector,
                wrapper as Monaco.languages.CompletionItemProvider,
            );
            break;
        case 'inlineCompletion':
            disposable = monaco.languages.registerInlineCompletionsProvider(
                selector,
                wrapper as Monaco.languages.InlineCompletionsProvider,
            );
            break;
        case 'hover':
            disposable = monaco.languages.registerHoverProvider(
                selector,
                wrapper as Monaco.languages.HoverProvider,
            );
            break;
        case 'definition':
            disposable = monaco.languages.registerDefinitionProvider(
                selector,
                wrapper as Monaco.languages.DefinitionProvider,
            );
            break;
        case 'documentFormatting':
            disposable = monaco.languages.registerDocumentFormattingEditProvider(
                selector,
                wrapper as Monaco.languages.DocumentFormattingEditProvider,
            );
            break;
    }
    return {kind, model: ownedModel, language, provider, consumers, disposable};
}

/** Attach to this model and reconcile individual provider identities on updates. */
export function attachEditorProviders(
    monaco: MonacoInstance,
    model: Model,
    preset: EditorProviderSet | undefined,
    overrides: EditorProviders | undefined,
): Monaco.IDisposable & {update: (overrides: EditorProviders | undefined) => void} {
    let registry = registries.get(monaco);
    if (!registry) {
        registry = new Set();
        registries.set(monaco, registry);
    }
    const attached = new Map<Registration, Consumer>();
    let disposed = false;
    const release = (registration: Registration) => {
        const consumer = attached.get(registration);
        if (!consumer) return;
        consumer.active = false;
        cancel(consumer);
        attached.delete(registration);
        const modelConsumers = registration.consumers.get(model);
        modelConsumers?.delete(consumer);
        if (!modelConsumers?.size) registration.consumers.delete(model);
        if (!registration.consumers.size) {
            registration.disposable.dispose();
            registry.delete(registration);
        }
    };
    const update = (nextOverrides: EditorProviders | undefined) => {
        if (disposed) return;
        const language = model.getLanguageId();
        const desired = new Map<ProviderKind, Set<Provider>>();
        for (const kind of Object.keys(methods) as ProviderKind[]) {
            const override = nextOverrides?.[kind];
            const providers = new Set<Provider>();
            if (override !== false) {
                if ((!override || override.mode === 'append') && preset?.[kind]) {
                    providers.add(preset[kind]);
                }
                if (override) providers.add(override.provider);
            }
            desired.set(kind, providers);
        }
        for (const registration of attached.keys()) {
            if (
                registration.language !== language ||
                !desired.get(registration.kind)?.has(registration.provider)
            ) {
                release(registration);
            }
        }
        for (const [kind, providers] of desired) {
            for (const provider of providers) {
                let registration = [...registry].find(
                    (entry) =>
                        entry.kind === kind &&
                        entry.model === model &&
                        entry.language === language &&
                        entry.provider === provider,
                );
                if (!registration) {
                    registration = register(monaco, kind, language, provider, model);
                    registry.add(registration);
                }
                if (attached.has(registration)) continue;
                const consumer: Consumer = {active: true, requests: new Set()};
                let modelConsumers = registration.consumers.get(model);
                if (!modelConsumers) {
                    modelConsumers = new Set();
                    registration.consumers.set(model, modelConsumers);
                }
                modelConsumers.add(consumer);
                attached.set(registration, consumer);
            }
        }
    };
    const cancelRequests = () => attached.forEach(cancel);
    const subscriptions = [
        model.onDidChangeContent(cancelRequests),
        model.onDidChangeLanguage(cancelRequests),
    ];
    const dispose = () => {
        if (disposed) return;
        disposed = true;
        subscriptions.forEach((subscription) => subscription.dispose());
        for (const registration of attached.keys()) release(registration);
    };
    try {
        update(overrides);
    } catch (error) {
        dispose();
        throw error;
    }
    return {update, dispose};
}
