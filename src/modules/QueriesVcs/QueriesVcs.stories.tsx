import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueriesVcs} from './QueriesVcs';
import {QueriesSidebar} from '../../widgets/QueriesSidebar';
import type {QueriesVcsProps, VcsFileContext, VcsItem, VcsLocation} from '../../types/queriesVcs';

const meta: Meta<typeof QueriesVcs> = {
    title: 'Modules/QueriesVcs',
    component: QueriesVcs,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<typeof QueriesVcs>;

type DemoItem = VcsItem & {format: string};
const files: DemoItem[] = [
    {path: '/queries', title: 'queries', kind: 'folder', format: 'directory'},
    {path: '/README.md', title: 'README.md', kind: 'file', format: 'markdown'},
    {path: '/empty.sql', title: 'empty.sql', kind: 'file', format: 'sql'},
    {path: '/queries/report.sql', title: 'report.sql', kind: 'file', format: 'sql'},
];
const contents: Record<string, string> = {
    '/README.md': '# Analytics repository\n\nReusable reports and queries.',
    '/empty.sql': '',
    '/queries/report.sql': 'SELECT category, count(*)\nFROM events\nGROUP BY category;',
};
const initialLocation: VcsLocation = {
    providerId: 'github',
    repositoryId: 'analytics',
    branch: 'main',
    path: '/',
};

function Demo({
    custom = false,
    sidebar = false,
    narrow = false,
}: {
    custom?: boolean;
    sidebar?: boolean;
    narrow?: boolean;
}) {
    const [location, setLocation] = useState(initialLocation);
    const [openedFile, setOpenedFile] = useState<VcsFileContext<DemoItem>>();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc'>('asc');
    const props: QueriesVcsProps<DemoItem> = {
        location,
        onUpdate: setLocation,
        providers: {
            items: [
                {id: 'github', title: 'GitHub'},
                {id: 'gitlab', title: 'GitLab'},
            ],
        },
        branches: {
            items: [
                {id: 'main', title: 'main'},
                {id: 'draft', title: 'draft'},
            ],
        },
        items: files
            .filter((item) => {
                const parent = item.path.slice(0, item.path.lastIndexOf('/')) || '/';
                return (
                    parent === location.path &&
                    item.title.toLowerCase().includes(search.toLowerCase())
                );
            })
            .sort((a, b) => (sort === 'asc' ? 1 : -1) * a.title.localeCompare(b.title)),
        search: {value: search, onUpdate: setSearch},
        sort: {value: sort, onUpdate: setSort},
        listState: {loaded: true},
        onPathSubmit: (next) => {
            const file = files.find((item) => item.path === next.path && item.kind === 'file');
            if (file) {
                const parent = file.path.slice(0, file.path.lastIndexOf('/')) || '/';
                setLocation({...next, path: parent});
                setOpenedFile({item: file, location: {...next, path: parent}});
            } else {
                setLocation(next);
                setOpenedFile(undefined);
            }
        },
        onInsertFile: action('insert-file'),
        onAttachFile: action('attach-file'),
        renderItemIcon: custom
            ? ({item}) => (
                  <span aria-label={item.format}>
                      {item.kind === 'folder' ? '📁' : item.format.toUpperCase()}
                  </span>
              )
            : undefined,
        detail: {
            openedFile,
            content: openedFile ? contents[openedFile.item.path] : undefined,
            language: openedFile?.item.format === 'sql' ? 'sql' : 'plaintext',
            onOpen: setOpenedFile,
            onClose: () => setOpenedFile(undefined),
            renderContent: custom
                ? ({item, content, onClose, actions, location: fileLocation}) => (
                      <section>
                          <Button onClick={onClose}>Back to files</Button>
                          <p>
                              {item.title} · {item.format}
                          </p>
                          <pre>{content || '(Empty file)'}</pre>
                          {actions.map((itemAction) => (
                              <Button
                                  key={itemAction.id}
                                  onClick={() => itemAction.onClick({item, location: fileLocation})}
                              >
                                  {itemAction.title}
                              </Button>
                          ))}
                      </section>
                  )
                : undefined,
        },
    };
    return (
        <div style={{width: narrow ? 240 : 360, height: 560}}>
            {sidebar ? (
                <QueriesSidebar tabs={[{id: 'files', type: 'vcs', props}]} />
            ) : (
                <QueriesVcs {...props} />
            )}
        </div>
    );
}

export const Default: Story = {render: () => <Demo />};
export const CustomIconsAndPreview: Story = {render: () => <Demo custom />};
export const InSidebar: Story = {render: () => <Demo sidebar />};

export const NarrowSidebar: Story = {render: () => <Demo sidebar narrow />};

function AsyncDemo() {
    const [location, setLocation] = useState<VcsLocation>({path: '/'});
    const [branches, setBranches] = useState<QueriesVcsProps['branches']>({items: []});
    const [items, setItems] = useState<DemoItem[]>([]);
    const [listState, setListState] = useState<QueriesVcsProps['listState']>({loaded: false});
    const [search, setSearch] = useState('');
    const [openedFile, setOpenedFile] = useState<VcsFileContext<DemoItem>>();

    useEffect(() => {
        if (!location.providerId) return undefined;
        const timer = setTimeout(() => {
            setBranches({
                items: [
                    {id: 'main', title: 'main'},
                    {id: 'draft', title: 'draft'},
                ],
            });
        }, 800);
        return () => clearTimeout(timer);
    }, [location.providerId]);

    useEffect(() => {
        if (!location.providerId || !location.branch) return undefined;
        const timer = setTimeout(() => {
            setItems(
                files.filter((item) => {
                    const parent = item.path.slice(0, item.path.lastIndexOf('/')) || '/';
                    return parent === location.path;
                }),
            );
            setListState({loaded: true});
        }, 800);
        return () => clearTimeout(timer);
    }, [location.providerId, location.branch, location.path]);

    const handleUpdate = (next: VcsLocation) => {
        if (
            next.providerId === location.providerId &&
            next.branch === location.branch &&
            next.path === location.path
        ) {
            return;
        }
        if (next.providerId !== location.providerId) {
            setBranches({items: [], loading: Boolean(next.providerId)});
        }
        setListState({loaded: false, loading: Boolean(next.providerId && next.branch)});
        setItems([]);
        setSearch('');
        setOpenedFile(undefined);
        setLocation(next);
    };

    return (
        <div style={{width: 360, height: 560}}>
            <QueriesVcs
                location={location}
                onUpdate={handleUpdate}
                providers={{
                    items: [
                        {id: 'github', title: 'GitHub'},
                        {id: 'gitlab', title: 'GitLab'},
                    ],
                }}
                branches={branches}
                items={items.filter((item) =>
                    item.title.toLowerCase().includes(search.toLowerCase()),
                )}
                listState={listState}
                search={{value: search, onUpdate: setSearch}}
                detail={{
                    openedFile,
                    content: openedFile ? contents[openedFile.item.path] : undefined,
                    onOpen: setOpenedFile,
                    onClose: () => setOpenedFile(undefined),
                }}
            />
        </div>
    );
}

export const AsyncLoading: Story = {
    render: () => <AsyncDemo />,
    parameters: {
        docs: {
            description: {
                story: 'Select a VCS provider to fetch branches, then select a branch to fetch files. Each request takes 800 ms.',
            },
        },
    },
};
