import React, {useCallback, useEffect, useState} from 'react';
import {ArrowRotateLeft, TrashBin} from '@gravity-ui/icons';
import {ActionTooltip, Button, Flex, Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {ParameterWizardProps} from '../../types/parameterWizard';
import {validateValue} from './helpers/validateValue';
import i18n from './i18n';
import {ParameterEditor} from './internal/ParameterEditor';
import {ValidationContext} from './internal/validation';
import './ParameterWizard.scss';

const block = cn('qp-parameter-wizard');

export function ParameterWizard({
    name,
    type,
    value,
    onChange,
    onDelete,
    onReset,
    resetDisabled,
    onValidationChange,
    readOnly,
    disabled,
    className,
}: ParameterWizardProps) {
    const [revision, setRevision] = useState(0);
    const [invalidDrafts, setInvalidDrafts] = useState<Set<string>>(() => new Set());

    const report = useCallback((id: string, invalid: boolean) => {
        setInvalidDrafts((current) => {
            if (current.has(id) === invalid) return current;
            const next = new Set(current);
            if (invalid) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const valid = invalidDrafts.size === 0 && validateValue(value, type);

    useEffect(() => {
        onValidationChange?.(valid);
    }, [valid, onValidationChange]);

    return (
        <Flex className={block(null, className)} direction="column" gap={3}>
            <ValidationContext.Provider value={report}>
                <ParameterEditor
                    key={`${name}:${JSON.stringify(type)}:${revision}`}
                    name={name}
                    type={type}
                    value={value}
                    onChange={(next) => {
                        if (!readOnly && !disabled) onChange(next);
                    }}
                    readOnly={readOnly}
                    disabled={disabled}
                    actions={
                        !readOnly && (
                            <Flex gap={1}>
                                {onReset && (
                                    <ActionTooltip title={i18n('action_reset')}>
                                        <Button
                                            view="flat-secondary"
                                            size="m"
                                            aria-label={i18n('action_reset')}
                                            disabled={disabled || resetDisabled}
                                            onClick={() => {
                                                setRevision((current) => current + 1);
                                                onReset();
                                            }}
                                        >
                                            <Icon data={ArrowRotateLeft} size={16} />
                                        </Button>
                                    </ActionTooltip>
                                )}
                                {onDelete && (
                                    <ActionTooltip title={i18n('action_delete')}>
                                        <Button
                                            view="flat-secondary"
                                            size="m"
                                            aria-label={i18n('action_delete')}
                                            disabled={disabled}
                                            onClick={onDelete}
                                        >
                                            <Icon data={TrashBin} size={16} />
                                        </Button>
                                    </ActionTooltip>
                                )}
                            </Flex>
                        )
                    }
                />
            </ValidationContext.Provider>
        </Flex>
    );
}
