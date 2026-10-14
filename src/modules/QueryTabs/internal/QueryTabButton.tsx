import React, {forwardRef} from 'react';

type Props = React.ComponentPropsWithoutRef<'button'> & {
    isMenuItem?: boolean;
    'data-query-panel-id'?: string;
};

// Do not reference UIKit-generated panels. A surrounding composition may
// explicitly link a content panel; standalone strips leave aria-controls absent.
export const QueryTabButton = forwardRef<HTMLButtonElement, Props>(function QueryTabButtonRoot(
    {
        'aria-controls': _ariaControls,
        'data-query-panel-id': panelId,
        isMenuItem: _isMenuItem,
        ...props
    },
    ref,
) {
    return <button type="button" {...props} aria-controls={panelId} ref={ref} />;
});
