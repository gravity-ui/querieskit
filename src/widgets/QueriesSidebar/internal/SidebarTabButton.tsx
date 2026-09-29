import React, {forwardRef} from 'react';

type Props = React.ComponentPropsWithoutRef<'button'> & {
    isMenuItem?: boolean;
    'data-sidebar-tab-id': string;
    'data-sidebar-panel-id': string;
};

// UIKit's TabPanel fixes its role and IDs. Use the public Tab component override
// to associate tabs with stable panels that can also become standalone regions.
export const SidebarTabButton = forwardRef<HTMLButtonElement, Props>(function SidebarTabButtonRoot(
    {
        'data-sidebar-tab-id': tabId,
        'data-sidebar-panel-id': panelId,
        isMenuItem: _isMenuItem,
        ...props
    },
    ref,
) {
    return <button type="button" {...props} ref={ref} id={tabId} aria-controls={panelId} />;
});
