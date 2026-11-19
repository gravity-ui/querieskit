import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {LazyList} from '../../../src/components/LazyList';
import {ListActivityContext} from '../../../src/helpers/ListActivityContext';
import '@gravity-ui/uikit/styles/styles.css';

type Item = {id: string};

function Fixture() {
    const params = new URLSearchParams(window.location.search);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [requests, setRequests] = useState(0);
    const [active, setActive] = useState(!params.has('inactive'));
    const [hidden, setHidden] = useState(params.has('hidden'));

    window.lazyListPaginationTest = {
        complete: (match, more) => {
            if (match) setItems([{id: 'Matching tutorial'}]);
            setHasMore(more);
            setLoading(false);
        },
        setActive,
        setHidden,
    };

    return (
        <ThemeProvider theme="light">
            <output data-testid="requests">{requests}</output>
            <output data-testid="loading">{String(loading)}</output>
            <div hidden={hidden} style={{width: 400, height: 300}}>
                <ListActivityContext.Provider value={active}>
                    <LazyList
                        items={items}
                        itemHeight={() => 40}
                        renderItem={(item) => <span>{item.id}</span>}
                        hasMore={hasMore}
                        loading={loading}
                        onLoadMore={() => {
                            setRequests((count) => count + 1);
                            setLoading(true);
                        }}
                        emptyContent={<span>No matching tutorials</span>}
                    />
                </ListActivityContext.Provider>
            </div>
        </ThemeProvider>
    );
}

const container = document.getElementById('root');
if (!container) throw new Error('Missing fixture root');
createRoot(container).render(<Fixture />);

declare global {
    interface Window {
        lazyListPaginationTest: {
            complete: (match: boolean, more: boolean) => void;
            setActive: (active: boolean) => void;
            setHidden: (hidden: boolean) => void;
        };
    }
}
