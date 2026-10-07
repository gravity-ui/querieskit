import React, {forwardRef} from 'react';

type Props = React.ComponentPropsWithoutRef<'button'> & {isMenuItem?: boolean};

// Isolate selection with TabProvider, but do not reference its generated panels:
// QueryTabs renders only the strip, and panel ownership stays with the application.
export const QueryTabButton = forwardRef<HTMLButtonElement, Props>(function QueryTabButtonRoot(
    {'aria-controls': _ariaControls, isMenuItem: _isMenuItem, ...props},
    ref,
) {
    return <button type="button" {...props} ref={ref} />;
});
