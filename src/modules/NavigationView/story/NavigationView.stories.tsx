import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Icon} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import CodeIcon from '@gravity-ui/icons/svgs/code.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import PlayIcon from '@gravity-ui/icons/svgs/play.svg';
import {action} from 'storybook/actions';
import {NavigationView} from '..';
import type {NavigationViewSection} from '../../../types/navigation';
import {VIEW_SECTIONS} from './mockData';

const meta: Meta<typeof NavigationView> = {
    title: 'Modules/NavigationView',
    component: NavigationView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
    decorators: [
        (Story) => (
            <div style={{width: 640}}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NavigationView>;

export const Default: Story = {
    args: {
        data: {sections: VIEW_SECTIONS, loaded: true},
    },
};

export const Loading: Story = {
    args: {
        data: {sections: [], loading: true},
    },
};

export const Empty: Story = {
    args: {
        data: {sections: [], loaded: true},
    },
};

export const Error: Story = {
    args: {
        data: {sections: [], errorContent: 'Failed to load view'},
    },
};

const SECTIONS_WITH_ACTIONS: NavigationViewSection[] = VIEW_SECTIONS.map((section) => ({
    ...section,
    actions: [
        {
            id: 'export',
            title: 'Export',
            content: <Icon data={ArrowUpRightFromSquareIcon} size={14} />,
            onClick: (s) => action('exportClick')(s.id),
        },
        {
            id: 'code',
            title: 'Show code',
            content: <Icon data={CodeIcon} size={14} />,
            onClick: (s) => action('codeClick')(s.id),
        },
        {
            id: 'run',
            title: 'Run',
            content: <Icon data={PlayIcon} size={14} />,
            onClick: (s) => action('runClick')(s.id),
        },
        {
            id: 'settings',
            title: 'Settings',
            content: <Icon data={GearIcon} size={14} />,
            onClick: (s) => action('settingsClick')(s.id),
        },
    ],
}));

export const WithActions: Story = {
    args: {
        data: {sections: SECTIONS_WITH_ACTIONS, loaded: true},
    },
};

const ControlledExpandStory = () => {
    const [expandedId, setExpandedId] = useState<string>('general');

    const sections: NavigationViewSection[] = VIEW_SECTIONS.map((section) => ({
        ...section,
        expanded: section.id === expandedId,
        defaultExpanded: undefined,
        onExpandedChange: (expanded) => {
            action('onExpandedChange')(section.id, expanded);
            setExpandedId(expanded ? section.id : '');
        },
    }));

    return <NavigationView data={{sections, loaded: true}} />;
};

export const ControlledExpand: Story = {
    render: () => <ControlledExpandStory />,
};
