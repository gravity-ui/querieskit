// @vitest-environment jsdom
import React, {act} from 'react';
import {type Root, createRoot} from 'react-dom/client';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {QueryShare} from '../../src/modules/QueryShare';
import type {QueryShareProps} from '../../src/types/queryShare';
import {setLang} from '../../src/i18n';

describe('QueryShare', () => {
    let container: HTMLDivElement;
    let root: Root;
    let props: QueryShareProps;
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const link = {
        url: 'https://example.com/query/shared',
        expiresAt: new Date(2026, 9, 15, 9, 5).getTime(),
    };

    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
            })),
        );
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn(() => 1),
        );
        vi.stubGlobal('cancelAnimationFrame', vi.fn());
        vi.stubGlobal(
            'ResizeObserver',
            class {
                public observe() {}
                public disconnect() {}
                public unobserve() {}
            },
        );
        configure({lang: 'en'});
        setLang('en');
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
        props = {
            open: true,
            onClose: vi.fn(),
            onGenerate: vi.fn(),
            onRegenerate: vi.fn(),
            onMakePermanent: vi.fn(),
            onExpirationChange: vi.fn(),
        };
    });
    afterEach(() => {
        act(() => root.unmount());
        container.remove();
        if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
        else Reflect.deleteProperty(navigator, 'clipboard');
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });
    function render(overrides: Partial<QueryShareProps> = {}) {
        act(() =>
            root.render(
                <ThemeProvider>
                    <QueryShare {...props} {...overrides} />
                </ThemeProvider>,
            ),
        );
    }
    function dialog() {
        const element = document.querySelector<HTMLElement>('[role="dialog"]');
        if (!element) throw new Error('Missing dialog');
        return element;
    }
    function button(label: string) {
        const element = [...dialog().querySelectorAll<HTMLButtonElement>('button')].find(
            (candidate) =>
                candidate.getAttribute('aria-label') === label ||
                candidate.textContent?.trim() === label,
        );
        if (!element) throw new Error(`Missing ${label}`);
        return element;
    }
    function click(element: HTMLElement) {
        act(() => element.click());
    }
    it('only presents the title and generation action until a link is supplied', () => {
        render();
        expect(dialog().textContent).toContain('Public link');
        expect(dialog().querySelector('input')).toBeNull();
        expect(dialog().textContent).not.toContain('Create permanent link');
        click(button('Generate link'));
        expect(props.onGenerate).toHaveBeenCalledTimes(1);
        expect(dialog().querySelector('input')).toBeNull();
        expect(props.onRegenerate).not.toHaveBeenCalled();
    });
    it('shows a readonly temporary URL and local expiration, and delegates actions', () => {
        render({link});
        const input = dialog().querySelector<HTMLInputElement>('input[aria-label="Public link"]');
        if (!input) throw new Error('Missing public link input');
        expect(input.value).toBe(link.url);
        expect(input.readOnly).toBe(true);
        expect(dialog().textContent).toContain('15.10.2026 09:05');
        for (const [label, callback] of [
            ['Regenerate link', props.onRegenerate],
            ['Create permanent link', props.onMakePermanent],
        ] as const) {
            click(button(label));
            expect(callback).toHaveBeenCalledTimes(1);
        }
        expect(input.value).toBe(link.url);
    });
    function expirationInput() {
        const input = dialog().querySelector<HTMLInputElement>(
            'input[aria-label="Expiration date and time"]',
        );
        if (!input) throw new Error('Missing expiration picker');
        return input;
    }
    function incrementExpirationDay() {
        const input = expirationInput();
        act(() => input.focus());
        act(() =>
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true})),
        );
        act(() =>
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true})),
        );
    }
    it('edits a local date/time draft and persists it only on Save', () => {
        render({link});
        click(button('Edit expiration'));
        expect(expirationInput().value.replace(/[\u2066-\u2069]/g, '')).toBe('15.10.2026 09:05');
        expect(dialog().textContent).not.toContain('15.10.2026 09:05');
        incrementExpirationDay();
        expect(expirationInput().value.replace(/[\u2066-\u2069]/g, '')).toBe('16.10.2026 09:05');
        expect(props.onExpirationChange).not.toHaveBeenCalled();
        click(button('Save expiration'));
        expect(props.onExpirationChange).toHaveBeenCalledExactlyOnceWith(
            new Date(2026, 9, 16, 9, 5).getTime(),
        );
        expect(dialog().querySelector('input[aria-label="Expiration date and time"]')).toBeNull();
        expect(dialog().textContent).toContain('15.10.2026 09:05');
        render({link: {...link, expiresAt: new Date(2026, 9, 16, 9, 5).getTime()}});
        expect(dialog().textContent).toContain('16.10.2026 09:05');
    });
    it('discards canceled drafts and reinitializes editing from the supplied expiration', () => {
        render({link});
        click(button('Edit expiration'));
        incrementExpirationDay();
        click(button('Cancel expiration editing'));
        expect(props.onExpirationChange).not.toHaveBeenCalled();
        expect(dialog().textContent).toContain('15.10.2026 09:05');
        click(button('Edit expiration'));
        expect(expirationInput().value.replace(/[\u2066-\u2069]/g, '')).toBe('15.10.2026 09:05');
    });
    it('disables an open expiration editor while an application operation is pending', () => {
        render({link});
        click(button('Edit expiration'));
        render({link, pendingAction: 'updateExpiration'});
        expect(expirationInput().disabled).toBe(true);
        expect(button('Save expiration').disabled).toBe(true);
        click(button('Save expiration'));
        expect(props.onExpirationChange).not.toHaveBeenCalled();
        expect(button('Copy link').disabled).toBe(false);
    });
    it('discards the draft when the controlled expiration changes', () => {
        render({link});
        click(button('Edit expiration'));
        incrementExpirationDay();
        render({link: {...link, expiresAt: new Date(2026, 10, 20, 12, 30).getTime()}});
        expect(dialog().querySelector('input[aria-label="Expiration date and time"]')).toBeNull();
        click(button('Edit expiration'));
        expect(expirationInput().value.replace(/[\u2066-\u2069]/g, '')).toBe('20.11.2026 12:30');
        expect(props.onExpirationChange).not.toHaveBeenCalled();
    });
    it('prevents saving an incomplete expiration', () => {
        render({link});
        click(button('Edit expiration'));
        const input = expirationInput();
        act(() => input.focus());
        act(() =>
            input.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'a', ctrlKey: true, bubbles: true}),
            ),
        );
        act(() =>
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Backspace', bubbles: true})),
        );
        expect(button('Save expiration').disabled).toBe(true);
        click(button('Save expiration'));
        expect(props.onExpirationChange).not.toHaveBeenCalled();
    });
    it('updates the visible link and removes expiration actions when it becomes permanent', () => {
        render({link});
        render({link: {url: 'https://example.com/query/permanent', expiresAt: null}});
        expect(dialog().querySelector<HTMLInputElement>('input')?.value).toBe(
            'https://example.com/query/permanent',
        );
        expect(dialog().textContent).toContain('No expiration');
        expect(dialog().querySelector('[aria-label="Edit expiration"]')).toBeNull();
        expect(dialog().textContent).not.toContain('Create permanent link');
        expect(button('Regenerate link').disabled).toBe(false);
        expect(button('Copy link').disabled).toBe(false);
    });
    it.each(['regenerate', 'makePermanent', 'updateExpiration'] as const)(
        'disables mutations while %s is pending, but permits copying and closing',
        (pendingAction) => {
            render({link, pendingAction});
            for (const label of ['Regenerate link', 'Create permanent link', 'Edit expiration']) {
                expect(button(label).disabled).toBe(true);
                click(button(label));
            }
            expect(props.onRegenerate).not.toHaveBeenCalled();
            expect(props.onMakePermanent).not.toHaveBeenCalled();
            expect(props.onExpirationChange).not.toHaveBeenCalled();
            expect(button('Copy link').disabled).toBe(false);
            click(button('Close dialog'));
            expect(props.onClose).toHaveBeenCalledTimes(1);
        },
    );
    it('shows generation failure and permits retry after loading ends', () => {
        render({pendingAction: 'generate'});
        expect(button('Generate link').disabled).toBe(true);
        click(button('Generate link'));
        expect(props.onGenerate).not.toHaveBeenCalled();
        render({error: 'Sharing service unavailable'});
        expect(dialog().textContent).toContain('Sharing service unavailable');
        click(button('Generate link'));
        expect(props.onGenerate).toHaveBeenCalledTimes(1);
        render({link});
        expect(dialog().textContent).not.toContain('Sharing service unavailable');
    });
    it('copies only after an explicit click and copies the latest URL', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}});
        render({link});
        expect(writeText).not.toHaveBeenCalled();
        await act(async () => button('Copy link').click());
        expect(writeText).toHaveBeenCalledExactlyOnceWith(link.url);
        render({link: {url: 'https://example.com/query/new', expiresAt: null}});
        await act(async () => button('Copy link').click());
        expect(writeText).toHaveBeenLastCalledWith('https://example.com/query/new');
    });
    it('shows copy failure and clears it when the URL changes', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('Clipboard unavailable'));
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}});
        render({link});
        await act(async () => button('Copy link').click());
        expect(dialog().querySelector('[role="alert"]')?.textContent).toBe('Failed to copy link');
        render({link: {url: 'https://example.com/query/replacement', expiresAt: null}});
        expect(dialog().querySelector('[role="alert"]')).toBeNull();
        // The browser clipboard fallback leaves its hidden textarea on failure in jsdom.
        document
            .querySelectorAll('textarea[aria-hidden="true"]')
            .forEach((element) => element.remove());
    });
    it('requests closing on Escape without mutating controlled visibility', () => {
        render({link});
        act(() =>
            document.dispatchEvent(
                new KeyboardEvent('keydown', {key: 'Escape', code: 'Escape', bubbles: true}),
            ),
        );
        expect(props.onClose).toHaveBeenCalledTimes(1);
        expect(dialog()).toBeTruthy();
    });
});
