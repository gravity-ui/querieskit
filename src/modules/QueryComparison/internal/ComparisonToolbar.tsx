import React from 'react';
import {Button, Flex, Icon, SegmentedRadioGroup, Select} from '@gravity-ui/uikit';
import {ArrowRightArrowLeft, ArrowRotateLeft, FloppyDisk} from '@gravity-ui/icons';
import cn from 'bem-cn-lite';
import type {CodeComparisonMode} from '../../../types/monacoDiffEditor';
import type {QueryComparisonProps} from '../../../types/queryComparison';
import i18n from '../i18n';
import './ComparisonToolbar.scss';

const block = cn('qp-comparison-toolbar');

type Props = Pick<QueryComparisonProps, 'versionSelection' | 'actions' | 'header' | 'className'> & {
    mode: CodeComparisonMode;
    onModeChange: (mode: CodeComparisonMode) => void;
};

export function ComparisonToolbar({
    versionSelection,
    actions = {},
    header,
    mode,
    onModeChange,
    className,
}: Props) {
    const busy = Boolean(actions.pendingAction);
    const actionsDisabled = busy || actions.disabled;
    const versionsDisabled = busy || versionSelection?.disabled;
    const options = versionSelection?.options.map(({id, title}) => ({value: id, content: title}));

    return (
        <Flex
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            wrap="wrap"
            className={block(null, className)}
        >
            <Flex alignItems="center" gap={2} className={block('versions')}>
                {header ??
                    (versionSelection && (
                        <>
                            <Select
                                size="m"
                                label={`${i18n('field_baseline')}:`}
                                aria-label={i18n('field_baseline')}
                                options={options}
                                value={[versionSelection.originalId]}
                                disabled={versionsDisabled}
                                className={block('select')}
                                onUpdate={([originalId]) => {
                                    if (
                                        originalId !== undefined &&
                                        originalId !== versionSelection.originalId
                                    )
                                        versionSelection.onChange({
                                            originalId,
                                            modifiedId: versionSelection.modifiedId,
                                        });
                                }}
                            />
                            <Button
                                view="flat"
                                size="m"
                                title={i18n('action_swap')}
                                aria-label={i18n('action_swap')}
                                disabled={
                                    versionsDisabled ||
                                    versionSelection.originalId === versionSelection.modifiedId
                                }
                                onClick={() =>
                                    versionSelection.onChange({
                                        originalId: versionSelection.modifiedId,
                                        modifiedId: versionSelection.originalId,
                                    })
                                }
                            >
                                <Icon data={ArrowRightArrowLeft} size={16} />
                            </Button>
                            <Select
                                size="m"
                                label={`${i18n('field_competitor')}:`}
                                aria-label={i18n('field_competitor')}
                                options={options}
                                value={[versionSelection.modifiedId]}
                                disabled={versionsDisabled}
                                className={block('select')}
                                onUpdate={([modifiedId]) => {
                                    if (
                                        modifiedId !== undefined &&
                                        modifiedId !== versionSelection.modifiedId
                                    )
                                        versionSelection.onChange({
                                            originalId: versionSelection.originalId,
                                            modifiedId,
                                        });
                                }}
                            />
                        </>
                    ))}
            </Flex>
            <Flex alignItems="center" gap={2} wrap="wrap" className={block('actions')}>
                <SegmentedRadioGroup
                    value={mode}
                    size="m"
                    aria-label={i18n('title_mode')}
                    onUpdate={(value) => onModeChange(value as CodeComparisonMode)}
                >
                    <SegmentedRadioGroup.Option value="split">
                        {i18n('value_split')}
                    </SegmentedRadioGroup.Option>
                    <SegmentedRadioGroup.Option value="unified">
                        {i18n('value_unified')}
                    </SegmentedRadioGroup.Option>
                </SegmentedRadioGroup>
                <Button
                    view="flat"
                    size="m"
                    title={i18n('action_reset')}
                    aria-label={i18n('action_reset')}
                    disabled={actionsDisabled || !actions.hasChanges || !actions.onReset}
                    onClick={actions.onReset}
                >
                    <Icon data={ArrowRotateLeft} size={16} />
                </Button>
                <Button
                    view="flat"
                    size="m"
                    title={i18n('action_save')}
                    aria-label={i18n('action_save')}
                    disabled={actionsDisabled || !actions.hasChanges || !actions.onSave}
                    loading={actions.pendingAction === 'save'}
                    onClick={actions.onSave}
                >
                    <Icon data={FloppyDisk} size={16} />
                </Button>
                <Button
                    view="action"
                    size="m"
                    disabled={actionsDisabled || !actions.onCreateQuery}
                    loading={actions.pendingAction === 'create'}
                    onClick={actions.onCreateQuery}
                >
                    {i18n('action_create-query')}
                </Button>
            </Flex>
        </Flex>
    );
}
