import type {Decorator, Preview} from '@storybook/react';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import React from 'react';

import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/unipika/dist/unipika.css';
import './redefinition.css';

configure({lang: 'en'});

const withYtComponentsTheme: Decorator = (Story, context) => {
    const globalsTheme = context.globals.theme;
    const isDark = globalsTheme === 'dark';
    const uikitTheme = isDark ? 'dark' : 'light';

    return (
        <ThemeProvider theme={uikitTheme}>
            <Story />
        </ThemeProvider>
    );
};

const preview: Preview = {
    decorators: [withYtComponentsTheme],
    globalTypes: {
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                ],
                dynamicTitle: true,
            },
        },
    },
    parameters: {},
};

export default preview;
