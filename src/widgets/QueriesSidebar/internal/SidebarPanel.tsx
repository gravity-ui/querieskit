import React, {useContext, useState} from 'react';
import {ListActivityContext} from '../../../helpers/ListActivityContext';

export function SidebarPanel({
    active,
    keepMounted,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {active: boolean; keepMounted: boolean}) {
    const parentActive = useContext(ListActivityContext);
    const [visited, setVisited] = useState(active);
    const mounted = active || (keepMounted && visited);
    if (visited !== mounted) setVisited(mounted);

    return (
        <div {...props} hidden={!active} tabIndex={active ? 0 : -1}>
            <ListActivityContext.Provider value={active && parentActive}>
                {mounted ? children : null}
            </ListActivityContext.Provider>
        </div>
    );
}
