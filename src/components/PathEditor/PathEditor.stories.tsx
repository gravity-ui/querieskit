import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';
import {PathEditor} from './PathEditor';
import {mockLoadPathSuggestions} from './PathEditor.stories.helpers';

const meta: Meta<typeof PathEditor> = {
    title: 'Components/PathEditor',
    component: PathEditor,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof PathEditor>;

export const Default: Story = {
    args: {
        defaultPath: '/home/user',
        autoFocus: true,
        onLoadSuggestions: mockLoadPathSuggestions,
        onChange: action('onChange'),
        onApply: action('onApply'),
        onCancel: action('onCancel'),
        onBlur: action('onBlur'),
    },
};

export const WithClear: Story = {
    args: {
        defaultPath: '/home/user/projects',
        hasClear: true,
        onLoadSuggestions: mockLoadPathSuggestions,
        onApply: action('onApply'),
    },
};

export const Disabled: Story = {
    args: {
        defaultPath: '/home/user',
        disabled: true,
        onLoadSuggestions: mockLoadPathSuggestions,
    },
};

export const SuggestionsError: Story = {
    args: {
        defaultPath: '/home/user',
        autoFocus: true,
        suggestionsError: true,
        errorMessage: 'Failed to load suggestions',
        onLoadSuggestions: async () => {
            throw new Error('Failed to load suggestions');
        },
    },
};
