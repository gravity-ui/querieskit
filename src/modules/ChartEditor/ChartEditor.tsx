import React from 'react';
import {Chart} from '@gravity-ui/charts';
import {Box, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';

import {ChartEditorForm} from '../../components/ChartEditorForm';
import type {ChartEditorProps} from './types';
import i18n from './i18n';

import './ChartEditor.scss';

const block = cn('qp-chart-editor');

export const ChartEditor = <TCategory extends string>({
    data,
    className,
    emptyDataLabel,
    chartFormProps,
}: ChartEditorProps<TCategory>) => {
    const emptyLabel = emptyDataLabel ?? i18n('alert_no-chart-data');

    return (
        <Flex
            width="100%"
            height="100%"
            overflow="hidden"
            as="section"
            className={block(null, className)}
        >
            <Box spacing={{p: 5}} className={block('preview')}>
                {data ? (
                    <Box width="100%" height="100%">
                        <Chart data={data} />
                    </Box>
                ) : (
                    <Flex width="100%" height="100%" centerContent className={block('empty')}>
                        <Text color="secondary">{emptyLabel}</Text>
                    </Flex>
                )}
            </Box>

            <div className={block('panel')}>
                <ChartEditorForm {...chartFormProps} />
            </div>
        </Flex>
    );
};
