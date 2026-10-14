import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React, {FC} from 'react';
import type {SearchRowLayoutProps} from '../../types/searchRowLayoutProps';
import {MonacoEditor} from '../MonacoEditor';
import {RowLink} from '../RowLink';
import {fitQueryToVisibleLines} from './helpers/fitQueryToVisibleLines';
import {MONACO_CONFIG} from './helpers/monacoConfig';
import './SearchRowLayout.scss';
export type {SearchRowLayoutProps} from '../../types/searchRowLayoutProps';

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
