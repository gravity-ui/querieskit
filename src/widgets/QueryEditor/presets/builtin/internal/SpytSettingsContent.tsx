import React from 'react';
import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import CheckIcon from '@gravity-ui/icons/svgs/check.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import cn from 'bem-cn-lite';
import {MonacoEditor} from '../../../../../components/MonacoEditor';
import type {SpytSettingsState} from './useSpytSettings';
import i18n from '../i18n';
import './SpytSettingsContent.scss';

const block = cn('qp-spyt-settings-content');

export function SpytSettingsContent({
    state: {draft, error, disabled, save, change, blur, cancel},
    className,
    classNames,
}: {
    state: SpytSettingsState;
    className?: string;
    classNames?: {editorFrame?: string; editor?: string; invalidEditorFrame?: string};
}) {
    return (
        <Flex direction="column" gap={2} className={block(null, className)}>
            <div
                className={block(
                    'editor-frame',
                    {invalid: Boolean(error)},
                    [classNames?.editorFrame, error ? classNames?.invalidEditorFrame : undefined]
                        .filter(Boolean)
                        .join(' '),
                )}
            >
                <MonacoEditor
                    className={block('editor', classNames?.editor)}
                    value={draft}
                    language="json"
                    readOnly={disabled}
                    onChange={change}
                    onBlur={blur}
                    monacoConfig={{
                        ariaLabel: i18n('field_spyt-config'),
                        minimap: {enabled: false},
                        lineNumbers: 'on',
                        lineNumbersMinChars: 2,
                        lineDecorationsWidth: 8,
                        glyphMargin: false,
                        folding: false,
                        scrollBeyondLastLine: false,
                        overviewRulerLanes: 0,
                        renderLineHighlight: 'none',
                        wordWrap: 'on',
                        padding: {top: 8, bottom: 8},
                    }}
                />
            </div>
            {error && (
                <Text color="danger" role="alert">
                    {error}
                </Text>
            )}
            <Flex gap={1}>
                <Button view="flat" disabled={disabled} onClick={save}>
                    <Icon data={CheckIcon} size={16} />
                    {i18n('action_save')}
                </Button>
                <Button view="flat" disabled={disabled} onClick={cancel}>
                    <Icon data={XmarkIcon} size={16} />
                    {i18n('action_cancel')}
                </Button>
            </Flex>
        </Flex>
    );
}
