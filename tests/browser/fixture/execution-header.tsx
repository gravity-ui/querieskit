import React from 'react';
import {createRoot} from 'react-dom/client';
import {Button, ClipboardButton, Flex, Icon, ThemeProvider, configure} from '@gravity-ui/uikit';
import {ArrowShapeTurnUpRight, Pencil} from '@gravity-ui/icons';
import {QueryExecutionPanel} from '../../../src/widgets/QueryExecutionPanel';
import {setLang} from '../../../src/i18n';
import '@gravity-ui/uikit/styles/styles.css';

configure({lang: 'en'});
setLang('en');

const root = document.getElementById('root');
if (!root) throw new Error('Missing root');
createRoot(root).render(
    <ThemeProvider>
        <div style={{width: '100%', height: 300}}>
            <QueryExecutionPanel
                tabs={[
                    {
                        id: 'error',
                        type: 'info',
                        props: {
                            root: {
                                id: 'error',
                                severity: 'error',
                                message: 'Query execution failed',
                            },
                        },
                    },
                    {id: 'meta', type: 'meta', props: {data: {groups: []}}},
                ]}
                execution={{startedAt: '30 Nov 2025, 11:00:00', author: 'screenshot-user'}}
                headerActions={
                    <Flex alignItems="center" gap={2} wrap>
                        <Button view="flat">
                            <Icon data={ArrowShapeTurnUpRight} size={16} />
                            Share
                        </Button>
                        <Button view="flat">
                            <Icon data={Pencil} size={16} />
                            Edit ACO
                        </Button>
                        <ClipboardButton text="Query execution failed" />
                    </Flex>
                }
                onExpandedChange={() => {}}
            />
        </div>
    </ThemeProvider>,
);
