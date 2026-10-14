import React, {useState} from 'react';

/** Mount on first selection; retain until the owner removes this keyed panel. */
export function QueryPagePanel({
    active,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {active: boolean}) {
    const [visited, setVisited] = useState(active);
    if (active && !visited) setVisited(true);
    return (
        <div {...props} hidden={!active}>
            {active || visited ? children : null}
        </div>
    );
}
