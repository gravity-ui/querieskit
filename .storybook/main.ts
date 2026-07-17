import type {StorybookConfig} from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    async viteFinal(viteConfig) {
        const {mergeConfig} = await import('vite');

        return mergeConfig(viteConfig, {
            optimizeDeps: {
                include: [
                    // Pre-bundle React JSX entries so Vite does not serve the raw CJS files.
                    'react/jsx-runtime',
                    'react/jsx-dev-runtime',
                ],
            },
            plugins: [
                svgr({
                    include: /@gravity-ui\/icons\/.*\.svg(?:\?.*)?$/,
                }),
            ],
        });
    },
};

export default config;
