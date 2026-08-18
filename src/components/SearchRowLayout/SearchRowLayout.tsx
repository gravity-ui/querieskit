import React, {FC, ReactNode} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {MonacoEditor} from '../MonacoEditor';
import {RowLink} from '../RowLink';
import {fitQueryToVisibleLines} from './helpers/fitQueryToVisibleLines';
import {MONACO_CONFIG} from './helpers/monacoConfig';
import './SearchRowLayout.scss';

const block = cn('qp-search-row-layout');

export type SearchRowLayoutProps = {
    header: ReactNode;
    query?: string;
    language: string;
    href?: string;
    disabled?: boolean;
    className?: string;
};

export const SearchRowLayout: FC<SearchRowLayoutProps> = ({
    header,
    query,
    language,
    href,
    disabled,
    className,
}) => {
    return (
        <RowLink href={href} disabled={disabled} className={block(null, className)}>
            <Flex direction="column" gap={2} className={block('content')}>
                <Flex gap={2} alignItems="center">
                    {header}
                </Flex>
                <MonacoEditor
                    value={fitQueryToVisibleLines(query)}
                    language={language}
                    readOnly
                    monacoConfig={MONACO_CONFIG}
                    className={block('monaco')}
                />
            </Flex>
        </RowLink>
    );
};
