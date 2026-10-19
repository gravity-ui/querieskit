import {useState} from 'react';
import type {VcsLocation} from '../../../types/queriesVcs';

/** Keep navigation visible after the first successful response within this branch. */
export function useBrowserReady(location: VcsLocation, ready: boolean) {
    const scope = JSON.stringify([location.providerId, location.repositoryId, location.branch]);
    const [state, setState] = useState({scope, ready});
    if (state.scope !== scope) {
        setState({scope, ready});
        return ready;
    }
    if (ready && !state.ready) {
        setState({scope, ready: true});
    }
    return state.ready || ready;
}
