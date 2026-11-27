import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC, Suspense, lazy, useMemo} from 'react';
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
    previewLineNumber,
    language,
    href,
    disabled,
    renderLink,
    className,
}) => {
    const {query: visibleQuery, startLineNumber} = fitQueryToVisibleLines(query, previewLineNumber);
    const monacoConfig = useMemo(
        () => ({
            ...MONACO_CONFIG,
            lineNumbers: (lineNumber: number) => String(startLineNumber + lineNumber - 1),
        }),
        [startLineNumber],
    );

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
                        monacoConfig={monacoConfig}
                        className={block('monaco')}
                    />
                </Suspense>
            </Flex>
        </RowLink>
    );
};
