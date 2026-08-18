import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';
import {Box, Icon} from '@gravity-ui/uikit';
import FileArrowRightOutIcon from '@gravity-ui/icons/svgs/file-arrow-right-out.svg';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {NavigationHeader} from './NavigationHeader';
import {NavigationHeaderAction, NavigationLocation} from '../../types/navigation';
import {mockLoadPathSuggestions} from '../../components/PathEditor/PathEditor.stories.helpers';

const meta: Meta<typeof NavigationHeader> = {
    title: 'Modules/NavigationHeader',
    component: NavigationHeader,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
    },
};

export default meta;
type Story = StoryObj<typeof NavigationHeader>;

const defaultLocation: NavigationLocation = {
    cluster: 'test',
    path: '/home/my-projects/favorites',
};

const longLocation: NavigationLocation = {
    cluster: 'prod',
    path: '/home/my-projects/favorites/very/long/nested/directory/structure',
};

const logAction = action('actionClick');

const defaultActions: NavigationHeaderAction[] = [
    {
        id: 'paste',
        title: 'Paste path',
        content: <Icon data={FileArrowRightOutIcon} size={16} />,
        onClick: (location) => logAction('Paste', location),
    },
    {
        id: 'open',
        title: 'Open in new tab',
        content: <Icon data={ArrowUpRightFromSquareIcon} size={16} />,
        onClick: (location) => logAction('Open', location),
    },
];

const InteractiveStory = ({
    initialLocation = defaultLocation,
    actions = defaultActions,
}: {
    initialLocation?: NavigationLocation;
    actions?: NavigationHeaderAction[];
}) => {
    const [location, setLocation] = useState(initialLocation);

    return (
        <Box width={300}>
            <NavigationHeader
                location={location}
                actions={actions}
                onUpdate={setLocation}
                onLoadSuggestions={mockLoadPathSuggestions}
            />
        </Box>
    );
};

export const Default: Story = {render: () => <InteractiveStory />};

export const WithoutActions: Story = {
    args: {
        location: defaultLocation,
        onUpdate: action('onUpdate'),
        onLoadSuggestions: mockLoadPathSuggestions,
    },
    decorators: [
        (StoryComponent) => (
            <Box width={300}>
                <StoryComponent />
            </Box>
        ),
    ],
};

export const EmptyLocation: Story = {
    args: {
        location: {cluster: undefined, path: undefined},
        actions: defaultActions,
        onUpdate: action('onUpdate'),
    },
};

export const LongPath: Story = {
    render: () => <InteractiveStory initialLocation={longLocation} />,
};

export const DisabledAction: Story = {
    render: () => (
        <InteractiveStory
            actions={defaultActions.map((headerAction) =>
                headerAction.id === 'paste' ? {...headerAction, disabled: true} : headerAction,
            )}
        />
    ),
};

export const HiddenAction: Story = {
    render: () => (
        <InteractiveStory
            actions={defaultActions.map((headerAction) =>
                headerAction.id === 'open' ? {...headerAction, hidden: true} : headerAction,
            )}
        />
    ),
};
