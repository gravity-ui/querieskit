import React from 'react';
import {Button, Divider, DropdownMenu, Flex, Icon, Select} from '@gravity-ui/uikit';
import PlayIcon from '@gravity-ui/icons/svgs/play.svg';
import SquareDashedTextIcon from '@gravity-ui/icons/svgs/square-dashed-text.svg';
import CheckIcon from '@gravity-ui/icons/svgs/list-check.svg';
import PaperclipIcon from '@gravity-ui/icons/svgs/paperclip.svg';
import ParametersIcon from '@gravity-ui/icons/svgs/sliders-vertical.svg';
import GearIcon from '@gravity-ui/icons/svgs/gear.svg';
import EllipsisIcon from '@gravity-ui/icons/svgs/ellipsis.svg';
import SaveIcon from '@gravity-ui/icons/svgs/floppy-disk.svg';
import ShareIcon from '@gravity-ui/icons/svgs/arrow-shape-turn-up-right.svg';
import cn from 'bem-cn-lite';
import type {
    QueryEditorEngine,
    QueryEditorPanel,
    QueryEditorProps,
} from '../../../types/queryEditor';
import i18n from '../i18n';
import './QueryEditorToolbar.scss';

const block = cn('qp-query-editor-toolbar');

type Props = Pick<
    QueryEditorProps,
    | 'clusters'
    | 'clusterId'
    | 'onClusterChange'
    | 'engineId'
    | 'onEngineChange'
    | 'onRun'
    | 'onFormat'
    | 'onValidate'
    | 'actionStates'
    | 'additionalActions'
    | 'rightActions'
    | 'saveProps'
> & {
    engines: Omit<QueryEditorEngine, 'renderSettingsFields' | 'renderSettingsSections'>[];
    activePanel: QueryEditorPanel;
    attachmentsId: string;
    settingsId: string;
    parametersId: string;
    onPanelToggle: (panel: Exclude<QueryEditorPanel, null>) => void;
    onShareClick?: () => void;
    shareButtonRef?: React.Ref<HTMLButtonElement>;
    shareOpen?: boolean;
};

export function QueryEditorToolbar(props: Props) {
    const actions = [
        {id: 'run', title: i18n('action_run'), icon: PlayIcon, onClick: props.onRun},
        {
            id: 'format',
            title: i18n('action_format'),
            icon: SquareDashedTextIcon,
            onClick: props.onFormat,
        },
        {
            id: 'validate',
            title: i18n('action_validate'),
            icon: CheckIcon,
            onClick: props.onValidate,
        },
    ] as const;
    return (
        <Flex wrap alignItems="center" gap={2} className={block()}>
            <Flex gap={1} alignItems="center">
                {actions.map(({id, title, icon, onClick}) => (
                    <Button
                        key={id}
                        view={id === 'run' ? 'action' : 'flat'}
                        size="m"
                        title={title}
                        aria-label={title}
                        onClick={onClick}
                        {...props.actionStates?.[id]}
                    >
                        <Icon data={icon} size={16} />
                        {title}
                    </Button>
                ))}
                {Boolean(props.additionalActions?.length) && (
                    <DropdownMenu
                        items={props.additionalActions?.map(({id, title, onClick, disabled}) => ({
                            id,
                            text: title,
                            action: onClick,
                            disabled,
                        }))}
                        renderSwitcher={(switcherProps) => (
                            <Button
                                {...switcherProps}
                                view="flat"
                                title={i18n('action_more')}
                                aria-label={i18n('action_more')}
                            >
                                <Icon data={EllipsisIcon} size={16} />
                            </Button>
                        )}
                    />
                )}
            </Flex>
            <Flex
                wrap
                gap={2}
                alignItems="center"
                justifyContent="end"
                grow={1}
                className={block('selectors')}
            >
                <Select
                    view="clear"
                    label={i18n('field_cluster')}
                    aria-label={i18n('field_cluster')}
                    className={block('select')}
                    value={props.clusterId === undefined ? [] : [props.clusterId]}
                    options={props.clusters.map(({id, title, disabled}) => ({
                        value: id,
                        content: title,
                        disabled,
                    }))}
                    disabled={!props.clusters.length}
                    onUpdate={([id]) => {
                        if (id !== undefined && id !== props.clusterId) props.onClusterChange(id);
                    }}
                />
                <Select
                    view="clear"
                    label={i18n('field_engine')}
                    aria-label={i18n('field_engine')}
                    className={block('select')}
                    value={props.engineId === undefined ? [] : [props.engineId]}
                    options={props.engines.map(({id, title, disabled}) => ({
                        value: id,
                        content: title,
                        disabled,
                    }))}
                    disabled={!props.engines.length}
                    onUpdate={([id]) => {
                        if (id !== undefined && id !== props.engineId) props.onEngineChange(id);
                    }}
                />
            </Flex>
            <Flex gap={1} alignItems="center" className={block('actions')}>
                <Divider orientation="vertical" className={block('divider')} />
                {props.onShareClick && (
                    <Button
                        view="flat"
                        title={i18n('action_share')}
                        aria-label={i18n('action_share')}
                        ref={props.shareButtonRef}
                        aria-expanded={props.shareOpen}
                        aria-haspopup="dialog"
                        onClick={props.onShareClick}
                    >
                        <Icon data={ShareIcon} size={16} />
                    </Button>
                )}
                {props.saveProps && (
                    <DropdownMenu
                        disabled={props.saveProps.disabled || props.saveProps.loading}
                        popupProps={{placement: 'bottom-start'}}
                        items={[
                            {text: i18n('action_save'), action: props.saveProps.onSave},
                            {text: i18n('action_save-as'), action: props.saveProps.onSaveAs},
                        ]}
                        renderSwitcher={(switcherProps) => (
                            <Button
                                {...switcherProps}
                                view="flat"
                                title={i18n('action_save')}
                                aria-label={i18n('action_save')}
                                disabled={props.saveProps?.disabled}
                                loading={props.saveProps?.loading}
                            >
                                <Icon data={SaveIcon} size={16} />
                            </Button>
                        )}
                    />
                )}
                {props.rightActions?.map(({id, title, icon, onClick, disabled, loading}) => (
                    <Button
                        key={id}
                        title={title}
                        aria-label={title}
                        view="flat"
                        onClick={onClick}
                        disabled={disabled}
                        loading={loading}
                    >
                        <Icon data={icon} size={16} />
                    </Button>
                ))}
                <Button
                    view="flat"
                    title={i18n('action_attachments')}
                    aria-label={i18n('action_attachments')}
                    selected={props.activePanel === 'attachments'}
                    aria-expanded={props.activePanel === 'attachments'}
                    aria-controls={props.attachmentsId}
                    onClick={() => props.onPanelToggle('attachments')}
                >
                    <Icon data={PaperclipIcon} size={16} />
                </Button>
                <Button
                    view="flat"
                    size="m"
                    title={i18n('action_parameters')}
                    aria-label={i18n('action_parameters')}
                    selected={props.activePanel === 'parameters'}
                    aria-expanded={props.activePanel === 'parameters'}
                    aria-controls={props.parametersId}
                    onClick={() => props.onPanelToggle('parameters')}
                >
                    <Icon data={ParametersIcon} size={16} />
                </Button>
                <Button
                    view="flat"
                    title={i18n('action_settings')}
                    aria-label={i18n('action_settings')}
                    selected={props.activePanel === 'settings'}
                    aria-expanded={props.activePanel === 'settings'}
                    aria-controls={props.settingsId}
                    onClick={() => props.onPanelToggle('settings')}
                >
                    <Icon data={GearIcon} size={16} />
                </Button>
            </Flex>
        </Flex>
    );
}
