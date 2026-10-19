import React, {useEffect, useRef, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import {QueriesVcs} from './QueriesVcs';
import {QueriesSidebar} from '../../widgets/QueriesSidebar';
import type {
    QueriesVcsProps,
    VcsFileContext,
    VcsItem,
    VcsLocation,
    VcsSelectorConfig,
} from '../../types/queriesVcs';

type StoryArgs = QueriesVcsProps & {
    narrow?: boolean;
    withRepositories?: boolean;
    selectedRepository?: boolean;
    repositoryState?: 'empty' | 'loading' | 'error';
    retainRepositoryOptions?: boolean;
};

const meta: Meta<StoryArgs> = {
    title: 'Modules/QueriesVcs',
    component: QueriesVcs,
    parameters: {layout: 'padded'},
};
export default meta;
type Story = StoryObj<StoryArgs>;

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

const repositoryOptions = [
    {id: 'analytics', title: 'Analytics'},
    {id: 'reporting', title: 'Reporting'},
    {id: 'archived', title: 'Archived (unavailable)', disabled: true},
];

function Demo({
    custom = false,
    sidebar = false,
    narrow = false,
    repositories,
    customHeader = false,
    selectedRepository = true,
}: {
    custom?: boolean;
    sidebar?: boolean;
    narrow?: boolean;
    repositories?: VcsSelectorConfig;
    customHeader?: boolean;
    selectedRepository?: boolean;
}) {
    const [location, setLocation] = useState<VcsLocation>(
        selectedRepository ? initialLocation : {providerId: 'github', path: '/'},
    );
    const [openedFile, setOpenedFile] = useState<VcsFileContext<DemoItem>>();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'asc' | 'desc'>('asc');
    const props: QueriesVcsProps<DemoItem> = {
        location,
        onUpdate: (next) => {
            action('update-location')(next);
            setLocation(next);
        },
        repositories,
        renderHeader: customHeader
            ? ({location: current, onUpdate, providers, repositories: repos, branches}) => (
                  <section aria-label="Custom VCS header">
                      <fieldset>
                          <legend>Provider</legend>
                          {providers.items.map((option) => (
                              <Button
                                  key={option.id}
                                  disabled={
                                      option.disabled ||
                                      providers.loading ||
                                      Boolean(providers.error)
                                  }
                                  selected={current.providerId === option.id}
                                  onClick={() => {
                                      if (option.id !== current.providerId)
                                          onUpdate({providerId: option.id, path: '/'});
                                  }}
                              >
                                  {option.title}
                              </Button>
                          ))}
                      </fieldset>
                      <fieldset>
                          <legend>Repository</legend>
                          {repos?.items.map((option) => (
                              <Button
                                  key={option.id}
                                  disabled={
                                      !current.providerId ||
                                      option.disabled ||
                                      providers.loading ||
                                      Boolean(providers.error) ||
                                      repos.loading ||
                                      Boolean(repos.error)
                                  }
                                  selected={current.repositoryId === option.id}
                                  onClick={() => {
                                      if (option.id !== current.repositoryId)
                                          onUpdate({
                                              providerId: current.providerId,
                                              repositoryId: option.id,
                                              path: '/',
                                          });
                                  }}
                              >
                                  {option.title}
                              </Button>
                          ))}
                      </fieldset>
                      <fieldset>
                          <legend>Branch</legend>
                          {branches.items.map((option) => (
                              <Button
                                  key={option.id}
                                  disabled={
                                      !current.providerId ||
                                      !current.repositoryId ||
                                      providers.loading ||
                                      Boolean(providers.error) ||
                                      repos?.loading ||
                                      Boolean(repos?.error) ||
                                      !repos?.items.length ||
                                      option.disabled ||
                                      branches.loading ||
                                      Boolean(branches.error)
                                  }
                                  selected={current.branch === option.id}
                                  onClick={() => {
                                      if (option.id !== current.branch)
                                          onUpdate({...current, branch: option.id, path: '/'});
                                  }}
                              >
                                  {option.title}
                              </Button>
                          ))}
                      </fieldset>
                  </section>
              )
            : undefined,
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
export const InSidebar: Story = {
    args: {narrow: false, withRepositories: true},
    argTypes: {
        narrow: {control: 'boolean', description: 'Use a 240px sidebar instead of 360px.'},
        withRepositories: {control: 'boolean', description: 'Enable repository selection.'},
    },
    parameters: {controls: {include: ['narrow', 'withRepositories']}},
    render: ({narrow, withRepositories}) => (
        <Demo
            key={String(withRepositories)}
            sidebar
            narrow={narrow}
            repositories={withRepositories ? {items: repositoryOptions} : undefined}
        />
    ),
};

export const MultipleRepositories: Story = {
    render: () => <Demo repositories={{items: repositoryOptions}} />,
};
export const SingleRepository: Story = {
    args: {selectedRepository: true},
    argTypes: {
        selectedRepository: {
            control: 'boolean',
            description:
                'The application has selected the sole repository. Changing this resets the demo.',
        },
    },
    parameters: {controls: {include: ['selectedRepository']}},
    render: ({selectedRepository}) => (
        <Demo
            key={String(selectedRepository)}
            repositories={{items: repositoryOptions.slice(0, 1)}}
            selectedRepository={selectedRepository}
        />
    ),
};
export const RepositoryStates: Story = {
    args: {repositoryState: 'empty', retainRepositoryOptions: false},
    argTypes: {
        repositoryState: {control: 'select', options: ['empty', 'loading', 'error']},
        retainRepositoryOptions: {
            control: 'boolean',
            description:
                'Keep previous options during loading or error to show the disabled selector.',
        },
    },
    parameters: {controls: {include: ['repositoryState', 'retainRepositoryOptions']}},
    render: ({repositoryState, retainRepositoryOptions}) => (
        <Demo
            repositories={{
                items:
                    repositoryState !== 'empty' && retainRepositoryOptions ? repositoryOptions : [],
                loading: repositoryState === 'loading',
                error: repositoryState === 'error' ? 'Unable to load repositories' : undefined,
            }}
        />
    ),
};
export const CustomHeader: Story = {
    render: () => <Demo customHeader repositories={{items: repositoryOptions}} />,
};

function AsyncDemo() {
    const [location, setLocation] = useState<VcsLocation>({path: '/'});
    const requestRevision = useRef(0);
    const [repositories, setRepositories] = useState<VcsSelectorConfig>({items: []});
    const [branches, setBranches] = useState<QueriesVcsProps['branches']>({items: []});
    const [items, setItems] = useState<DemoItem[]>([]);
    const [listState, setListState] = useState<QueriesVcsProps['listState']>({loaded: false});
    const [search, setSearch] = useState('');
    const [openedFile, setOpenedFile] = useState<VcsFileContext<DemoItem>>();

    useEffect(() => {
        if (!location.providerId) return undefined;
        const revision = requestRevision.current;
        let cancelled = false;
        const timer = setTimeout(() => {
            if (cancelled || revision !== requestRevision.current) return;
            const options =
                location.providerId === 'gitlab'
                    ? repositoryOptions.slice(0, 1)
                    : repositoryOptions;
            setRepositories({items: options});
            // The application, not QueriesVcs, selects a sole repository.
            if (options.length === 1) {
                setBranches({items: [], loading: true});
                setLocation((current) => ({...current, repositoryId: options[0].id}));
            }
        }, 800);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [location.providerId]);

    useEffect(() => {
        if (!location.providerId || !location.repositoryId) return undefined;
        const revision = requestRevision.current;
        let cancelled = false;
        const timer = setTimeout(() => {
            if (cancelled || revision !== requestRevision.current) return;
            setBranches({
                items: [
                    {id: 'main', title: 'main'},
                    {id: 'draft', title: 'draft'},
                ],
            });
        }, 800);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [location.providerId, location.repositoryId]);

    useEffect(() => {
        if (!location.providerId || !location.repositoryId || !location.branch) return undefined;
        const revision = requestRevision.current;
        let cancelled = false;
        const timer = setTimeout(() => {
            if (cancelled || revision !== requestRevision.current) return;
            setItems(
                files.filter((item) => {
                    const parent = item.path.slice(0, item.path.lastIndexOf('/')) || '/';
                    return parent === location.path;
                }),
            );
            setListState({loaded: true});
        }, 800);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [location.providerId, location.repositoryId, location.branch, location.path]);

    const handleUpdate = (next: VcsLocation) => {
        if (
            next.providerId === location.providerId &&
            next.repositoryId === location.repositoryId &&
            next.branch === location.branch &&
            next.path === location.path
        ) {
            return;
        }
        // Invalidate responses synchronously, before React cleans up the previous effects.
        requestRevision.current += 1;
        if (next.providerId !== location.providerId) {
            setRepositories({items: [], loading: Boolean(next.providerId)});
        }
        if (
            next.providerId !== location.providerId ||
            next.repositoryId !== location.repositoryId
        ) {
            setBranches({items: [], loading: Boolean(next.providerId && next.repositoryId)});
        }
        setListState({
            loaded: false,
            loading: Boolean(next.providerId && next.repositoryId && next.branch),
        });
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
                repositories={repositories}
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
                story: 'Select a provider, repository and branch to fetch files. GitLab has one repository, selected by the application. Each request takes 800 ms; obsolete responses are ignored at every stage.',
            },
        },
    },
};
