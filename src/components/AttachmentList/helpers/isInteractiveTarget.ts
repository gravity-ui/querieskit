export const INTERACITVE_SELECTOR =
    'a, button, input, select, textarea, label, [role="button"], [role="link"], [role="menuitem"], [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

export const isInteractiveTarget = (target: EventTarget | null | undefined) => {
    return target instanceof Element && Boolean(target.closest(INTERACITVE_SELECTOR));
};
