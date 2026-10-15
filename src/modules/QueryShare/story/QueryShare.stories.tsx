import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {action} from 'storybook/actions';
import type {QueryShareLink, QueryShareProps} from '../../../types/queryShare';
import {QueryShare} from '../QueryShare';

const temporaryLink: QueryShareLink = {
    url: 'https://yql.example.com/public/63cb3e94',
    expiresAt: new Date(2026, 10, 4, 18, 30).getTime(),
};

function Example(args: QueryShareProps) {
    const [open, setOpen] = useState(args.open);
    const [link, setLink] = useState(args.link);

    useEffect(() => setLink(args.link), [args.link]);
    useEffect(() => setOpen(args.open), [args.open]);

    return (
        <React.Fragment>
            <Button onClick={() => setOpen(true)}>Open sharing</Button>
            <QueryShare
                {...args}
                open={open}
                onClose={() => {
                    args.onClose();
                    setOpen(false);
                }}
                link={link}
                onGenerate={() => {
                    args.onGenerate?.();
                    setLink(temporaryLink);
                }}
                onRegenerate={() => {
                    args.onRegenerate?.();
                    setLink((current) => ({
                        ...(current ?? temporaryLink),
                        url: `https://yql.example.com/public/${Date.now()}`,
                    }));
                }}
                onMakePermanent={() => {
                    args.onMakePermanent?.();
                    setLink((current) => ({...(current ?? temporaryLink), expiresAt: null}));
                }}
                onExpirationChange={(expiresAt) => {
                    args.onExpirationChange?.(expiresAt);
                    setLink((current) => current && {...current, expiresAt});
                }}
            />
        </React.Fragment>
    );
}

const meta: Meta<typeof QueryShare> = {
    title: 'Modules/QueryShare',
    component: QueryShare,
    render: (args) => <Example {...args} />,
    args: {
        open: true,
        onClose: action('onClose'),
        onGenerate: action('onGenerate'),
        onRegenerate: action('onRegenerate'),
        onMakePermanent: action('onMakePermanent'),
        onExpirationChange: action('onExpirationChange'),
    },
};
export default meta;
type Story = StoryObj<typeof QueryShare>;

export const Initial: Story = {};
export const Temporary: Story = {args: {link: temporaryLink}};
export const Permanent: Story = {args: {link: {...temporaryLink, expiresAt: null}}};
export const Generating: Story = {args: {pendingAction: 'generate'}};
export const Regenerating: Story = {args: {link: temporaryLink, pendingAction: 'regenerate'}};
export const MakingPermanent: Story = {args: {link: temporaryLink, pendingAction: 'makePermanent'}};
export const UpdatingExpiration: Story = {
    args: {link: temporaryLink, pendingAction: 'updateExpiration'},
};
export const Error: Story = {
    args: {link: temporaryLink, error: 'Could not update the link. Try again.'},
};
export const LongUrl: Story = {
    args: {
        link: {
            ...temporaryLink,
            url: `https://yql.example.com/public/${'long-query-id-'.repeat(30)}`,
        },
    },
};
export const Russian: Story = {
    args: {link: temporaryLink},
    globals: {locale: 'ru'},
};
