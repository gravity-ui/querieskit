import React, {useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button, DropdownMenu, Flex, ThemeProvider, configure} from '@gravity-ui/uikit';
import {FieldsSelector} from '../../../src/components/FieldsSelector';
import {Attachments} from '../../../src/modules/Attachments';
import {QuerySettings} from '../../../src/modules/QuerySettings';
import {NavigationItemsList} from '../../../src/modules/NavigationItemsList';
import type {AttachItem} from '../../../src/types/attachments';
import type {QuerySettingsValue} from '../../../src/types/querySettings';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

configure({lang: 'en'});
setLang('en');

function Panels() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [selection, setSelection] = useState(['column-0']);
    const [changes, setChanges] = useState(0);
    const [opened, setOpened] = useState(0);
    const [actions, setActions] = useState(0);
    const [details, setDetails] = useState(false);
    const [attachments, setAttachments] = useState<AttachItem[]>([{id: 'a', name: 'sample.sql'}]);
    const [deleted, setDeleted] = useState<AttachItem[]>([]);
    const fileAttempts = useRef(0);
    const [settings, setSettings] = useState<QuerySettingsValue>({
        queryName: 'Report',
        access: 'private',
        ytOperationTitle: '',
        tokenIds: [],
        attributes: [
            {id: 'a', key: 'pool', value: 'default'},
            {id: 'b', key: 'priority', value: 'high'},
        ],
        custom: {},
    });
    return (
        <ThemeProvider theme={theme}>
            <Flex direction="column" gap={4} style={{width: 320, padding: 16}}>
                <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    Toggle theme
                </Button>
                <FieldsSelector
                    fields={Array.from({length: 500}, (_, i) => ({
                        id: `column-${i}`,
                        title: `Column ${i}`,
                    }))}
                    value={selection}
                    onChange={(next) => {
                        setSelection(next);
                        setChanges(changes + 1);
                    }}
                    applyMode="explicit"
                    searchable
                    showSelectedCount
                />
                <output data-testid="selection">
                    {selection.join(',')} / {changes}
                </output>
                <Button onClick={() => setDetails(!details)}>Toggle descriptions</Button>
                <output data-testid="navigation">
                    {opened} / {actions}
                </output>
                <div style={{height: 240}} data-testid="navigation-list">
                    <NavigationItemsList
                        path="/"
                        titleLabel="Name"
                        items={Array.from({length: 100}, (_, i) => ({
                            path: `/item-${i}`,
                            title: `Item ${i}`,
                            metadata: i,
                        }))}
                        onItemClick={() => setOpened(opened + 1)}
                        getItemRowConfig={(item) => ({
                            description: details
                                ? 'Long target path with extra details that must fit a narrow panel'
                                : undefined,
                            actions: [
                                {
                                    id: 'star',
                                    title: `Favorite ${item.metadata}`,
                                    content: '*',
                                    onClick: () => setActions((n) => n + 1),
                                },
                            ],
                            menuActions: [
                                {
                                    id: 'copy',
                                    title: 'Copy',
                                    content: 'C',
                                    onClick: () => setActions((n) => n + 1),
                                },
                            ],
                            renderMenuTrigger: ({item: original, disabled}) => (
                                <DropdownMenu
                                    disabled={disabled}
                                    size="s"
                                    defaultSwitcherProps={{
                                        'aria-label': 'More actions',
                                        qa: `custom-menu-${original.metadata}`,
                                    }}
                                    items={[
                                        {
                                            text: 'Copy',
                                            action: () => setActions((n) => n + 1),
                                        },
                                    ]}
                                />
                            ),
                        })}
                    />
                </div>
                <div data-testid="attachments" style={{height: 260}}>
                    <Attachments
                        validateDuplicates
                        attachments={attachments}
                        deletedAttachments={deleted}
                        onSelectFile={async (file) => {
                            fileAttempts.current++;
                            if (fileAttempts.current === 1)
                                throw new Error('Please retry this file');
                            return {id: `local-${file.name}`, name: file.name};
                        }}
                        onChange={(next) => {
                            setAttachments(next.attachments);
                            setDeleted(next.deletedAttachments);
                        }}
                    />
                </div>
                <QuerySettings
                    value={settings}
                    onChange={setSettings}
                    hiddenFields={['access', 'ytOperationTitle']}
                    checkDuplicateAttributeKeys
                />
            </Flex>
        </ThemeProvider>
    );
}

createRoot(document.getElementById('root')!).render(<Panels />);
