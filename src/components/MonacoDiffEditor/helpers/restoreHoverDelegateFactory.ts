// @ts-ignore Monaco's internal entrypoints do not expose declarations.
import {setHoverDelegateFactory} from 'monaco-editor/base/browser/ui/hover/hoverDelegateFactory';
// @ts-ignore Monaco's internal entrypoints do not expose declarations.
import {StandaloneServices} from 'monaco-editor/editor/standalone/browser/standaloneServices';
// @ts-ignore Monaco's internal entrypoints do not expose declarations.
import {IInstantiationService} from 'monaco-editor/platform/instantiation/common/instantiation';
// @ts-ignore Monaco's internal entrypoints do not expose declarations.
import {WorkbenchHoverDelegate} from 'monaco-editor/platform/hover/browser/hover';

/**
 * Monaco 0.56 binds its global hover factory to the last diff editor's scoped
 * service. Removing that editor breaks lazy widgets in the remaining editors,
 * including widgets initialized during disposal. Use the standalone root service
 * so the factory survives individual editors.
 * https://github.com/microsoft/monaco-editor/issues/4612
 */
export function restoreHoverDelegateFactory() {
    const service = StandaloneServices.get(IInstantiationService);
    setHoverDelegateFactory((placement: 'mouse' | 'element', enableInstantHover: boolean) =>
        service.createInstance(
            WorkbenchHoverDelegate,
            placement,
            {instantHover: enableInstantHover},
            {},
        ),
    );
}
