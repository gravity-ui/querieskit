import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC, Suspense, lazy} from 'react';
import type {SearchRowLayoutProps} from '../../types/searchRowLayoutProps';
import {RowLink} from '../RowLink';
import {fitQueryToVisibleLines} from './helpers/fitQueryToVisibleLines';
import {MONACO_CONFIG} from './helpers/monacoConfig';
import './SearchRowLayout.scss';
export type {SearchRowLayoutProps} from '../../types/searchRowLayoutProps';

const MonacoEditor = lazy(() =>
    import('../MonacoEditor').then((module) => ({default: module.MonacoEditor})),
);

const block = cn('qp-search-row-layout');

export const SearchRowLayout: FC<SearchRowLayoutProps> = ({
    header,
    query,
    language,
    href,
    disabled,
    renderLink,
    className,
}) => {
    const visibleQuery = fitQueryToVisibleLines(query);

    return (
        <RowLink
            href={href}
            disabled={disabled}
            renderLink={renderLink}
            className={block(null, className)}
        >
            <Flex direction="column" gap={2} className={block('content')}>
                <Flex gap={2} alignItems="center">
                    {header}
                </Flex>
                <Suspense
                    fallback={
                        <pre className={block('monaco', {loading: true})}>{visibleQuery}</pre>
                    }
                >
                    <MonacoEditor
                        value={visibleQuery}
                        language={language}
                        readOnly
                        monacoConfig={MONACO_CONFIG}
                        className={block('monaco')}
                    />
                </Suspense>
            </Flex>
        </RowLink>
    );
};
