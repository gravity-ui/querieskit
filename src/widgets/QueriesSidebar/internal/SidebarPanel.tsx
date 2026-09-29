import React, {useContext, useState} from 'react';
import {ListActivityContext} from '../../../helpers/ListActivityContext';

export function SidebarPanel({
    active,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {active: boolean}) {
    const parentActive = useContext(ListActivityContext);
    const [visited, setVisited] = useState(active);
    if (active && !visited) setVisited(true);

    return (
        <div {...props} hidden={!active} tabIndex={active ? 0 : -1}>
            <ListActivityContext.Provider value={active && parentActive}>
                {visited || active ? children : null}
            </ListActivityContext.Provider>
        </div>
    );
}
