// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NavigationActionsMenu} from '../../src/components/NavigationActionsMenu';
import type {NavigationAction} from '../../src/types/navigation';
import type {NavigationActionsMenuProps} from '../../src/types/navigationActionsMenuProps';

const ITEM = {path: '/tables/events', metadata: {engine: 'custom'}};

describe('NavigationActionsMenu', () => {
    let container: HTMLDivElement;
    let root: Root;
    const onAction = vi.fn();
    const onParentClick = vi.fn();
    const action: NavigationAction<typeof ITEM> = {
        id: 'copy',
        title: 'Copy path',
        content: null,
        onClick: onAction,
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.clearAllMocks();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => root.unmount());
        container.remove();
    });

    const render = (props: Partial<NavigationActionsMenuProps<typeof ITEM>> = {}) => {
        act(() => {
            root.render(
                <ThemeProvider>
                    <div onClick={onParentClick}>
                        <NavigationActionsMenu arg={ITEM} actions={[action]} {...props} />
                    </div>
                </ThemeProvider>,
            );
        });
    };

    const trigger = () => container.querySelector<HTMLButtonElement>('button')!;
    const menuItem = (text: string) =>
        Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
            (item) => item.textContent === text,
        );

    it('omits hidden actions, empty groups and an empty trigger', async () => {
        render({
            actions: [{...action, hidden: true}],
            groups: [
                {id: 'hidden', title: 'Empty group', actions: [{...action, hidden: true}]},
                {id: 'copy', title: 'Copy', actions: [action]},
            ],
        });
        await act(async () => trigger().click());
        expect(menuItem('Empty group')).toBeUndefined();
        expect(menuItem('Copy')).toBeDefined();
        expect(menuItem('Copy path')).toBeDefined();
        render({actions: [], groups: [{id: 'empty', title: 'Empty', actions: []}]});
        expect(trigger()).toBeNull();
    });

    it('preserves the original argument and isolates trigger and portalled action clicks', async () => {
        const onOpenToggle = vi.fn();
        render({onOpenToggle});
        expect(trigger().getAttribute('aria-label')).toBeTruthy();
        await act(async () => trigger().click());
        expect(onOpenToggle).toHaveBeenLastCalledWith(true);
        expect(container.contains(menuItem('Copy path')!)).toBe(false);
        await act(async () => menuItem('Copy path')!.click());
        expect(onAction).toHaveBeenCalledExactlyOnceWith(ITEM);
        expect(onAction.mock.calls[0][0]).toBe(ITEM);
        expect(onOpenToggle).toHaveBeenLastCalledWith(false);
        expect(onParentClick).not.toHaveBeenCalled();
    });

    it('respects controlled open state', async () => {
        const onOpenToggle = vi.fn();
        render({open: false, onOpenToggle});
        await act(async () => trigger().click());
        expect(onOpenToggle).toHaveBeenLastCalledWith(true);
        expect(menuItem('Copy path')).toBeUndefined();
        render({open: true, onOpenToggle});
        expect(menuItem('Copy path')).toBeDefined();
    });

    it('disables the menu trigger and individual actions', async () => {
        render({disabled: true});
        expect(trigger().disabled).toBe(true);
        await act(async () => trigger().click());
        expect(menuItem('Copy path')).toBeUndefined();
        render({actions: [{...action, disabled: true}]});
        await act(async () => trigger().click());
        await act(async () => menuItem('Copy path')!.click());
        expect(onAction).not.toHaveBeenCalled();
    });

    it.each(['empty', 'disabled'] as const)(
        'closes an uncontrolled menu when %s and does not reopen when restored',
        async (reason) => {
            const onOpenToggle = vi.fn();
            render({onOpenToggle});
            await act(async () => trigger().click());
            expect(menuItem('Copy path')).toBeDefined();
            onOpenToggle.mockClear();

            render({
                onOpenToggle,
                ...(reason === 'empty' ? {actions: [{...action, hidden: true}]} : {disabled: true}),
            });
            expect(onOpenToggle).toHaveBeenCalledExactlyOnceWith(false);
            // UIKit keeps the popup mounted during its exit transition.
            await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
            expect(menuItem('Copy path')).toBeUndefined();

            render({onOpenToggle});
            expect(trigger().disabled).toBe(false);
            expect(menuItem('Copy path')).toBeUndefined();
            await act(async () => trigger().click());
            expect(menuItem('Copy path')).toBeDefined();
            expect(onOpenToggle).toHaveBeenLastCalledWith(true);
        },
    );

    it.each(['empty', 'disabled'] as const)(
        'hides a controlled menu and requests closure when %s',
        async (reason) => {
            const onOpenToggle = vi.fn();
            render({open: true, onOpenToggle});
            expect(menuItem('Copy path')).toBeDefined();

            render({
                open: true,
                onOpenToggle,
                ...(reason === 'empty' ? {groups: [], actions: []} : {disabled: true}),
            });
            await act(async () => new Promise((resolve) => setTimeout(resolve, 150)));
            expect(menuItem('Copy path')).toBeUndefined();
            expect(onOpenToggle).toHaveBeenCalledExactlyOnceWith(false);

            // The controlled owner accepts the closure request before restoring availability.
            render({open: false, onOpenToggle});
            expect(menuItem('Copy path')).toBeUndefined();
        },
    );
});
