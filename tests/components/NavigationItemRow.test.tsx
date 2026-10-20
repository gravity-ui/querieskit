// @vitest-environment jsdom

import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {List, ThemeProvider} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {NavigationItemRow} from '../../src/components/NavigationItemRow';
import type {NavigationAction} from '../../src/types/navigation';

const ITEM = {path: '/item', title: 'Item', metadata: {owner: 'user'}};

describe('NavigationItemRow actions inside the real list', () => {
    let container: HTMLDivElement;
    let root: Root;
    const onNavigate = vi.fn();
    const onAction = vi.fn();
    const primary: NavigationAction<typeof ITEM> = {
        id: 'favorite',
        title: 'Favorite',
        content: '☆',
        onClick: onAction,
    };
    const more: NavigationAction<typeof ITEM> = {
        id: 'copy',
        title: 'Copy path',
        content: 'C',
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

    const render = (disabled = false) => {
        const item = disabled ? {...ITEM, disabled} : ITEM;
        act(() =>
            root.render(
                <ThemeProvider>
                    <List
                        items={[item]}
                        virtualized={false}
                        filterable={false}
                        activeItemIndex={0}
                        onItemClick={onNavigate}
                        renderItem={(value) => (
                            <NavigationItemRow
                                item={value}
                                description="/a/long/target"
                                indicators={<span>Favorite status</span>}
                                actions={[
                                    primary,
                                    {...primary, id: 'hidden', title: 'Hidden', hidden: true},
                                ]}
                                menuActions={[more]}
                            />
                        )}
                    />
                </ThemeProvider>,
            ),
        );
    };

    it('preserves the original item and isolates action clicks and keyboard events', () => {
        render();
        expect(container.textContent).toContain('/a/long/target');
        expect(container.textContent).toContain('Favorite status');
        expect(container.querySelector('[aria-label="Hidden"]')).toBeNull();
        const button = container.querySelector<HTMLButtonElement>('[aria-label="Favorite"]')!;
        act(() => {
            button.focus();
            for (const key of ['Enter', ' ', 'ArrowDown']) {
                button.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
                button.dispatchEvent(new KeyboardEvent('keyup', {key, bubbles: true}));
            }
            button.click();
        });
        expect(onNavigate).not.toHaveBeenCalled();
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.mock.calls[0][0]).toBe(ITEM);
        act(() =>
            container
                .querySelector('.qp-navigation-item-row__title')
                ?.dispatchEvent(new MouseEvent('click', {bubbles: true})),
        );
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it('isolates menu trigger and portalled menu item clicks', async () => {
        render();
        const trigger = container.querySelector<HTMLButtonElement>(
            '.g-dropdown-menu__switcher-button',
        )!;
        expect(trigger.getAttribute('aria-label')).toBeTruthy();
        await act(async () => trigger.click());
        const menuItem = Array.from(
            document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
        ).find((element) => element.textContent?.includes('Copy path'));
        expect(menuItem).toBeDefined();
        expect(container.contains(menuItem!)).toBe(false);
        await act(async () => {
            menuItem!.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}),
            );
            menuItem!.click();
        });
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.mock.calls[0][0]).toBe(ITEM);
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('activates a menu action from the keyboard without opening the row', async () => {
        render();
        const trigger = container.querySelector<HTMLButtonElement>(
            '.g-dropdown-menu__switcher-button',
        )!;
        await act(async () => {
            trigger.focus();
            trigger.click();
        });
        await act(async () => {
            trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
        });
        await act(async () => {
            trigger.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
        });
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction.mock.calls[0][0]).toBe(ITEM);
        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('disables actions and menu on a disabled item', () => {
        render(true);
        const buttons = Array.from(container.querySelectorAll('button'));
        expect(buttons.length).toBeGreaterThanOrEqual(2);
        expect(buttons.every((button) => button.disabled)).toBe(true);
        act(() => buttons.forEach((button) => button.click()));
        expect(onAction).not.toHaveBeenCalled();
        expect(onNavigate).not.toHaveBeenCalled();
    });
});
