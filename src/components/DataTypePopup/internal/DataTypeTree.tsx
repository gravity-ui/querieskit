import React, {useState} from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {ParameterType} from '../../../types/dataTypes';
import {optionalDepth} from '../../../helpers/dataTypes';
import i18n from '../i18n';
import './DataTypeTree.scss';

const block = cn('qp-data-type-tree');

function TypeChildren({type, level}: {type: ParameterType; level: number}) {
    if ('struct' in type) {
        return (
            <>
                {type.struct.map((entry, index) => (
                    <DataTypeTree key={index} type={entry.type} member={entry.key} level={level} />
                ))}
            </>
        );
    }
    if (type.name === 'Enum') {
        return (
            <>
                {type.type.map((entry, index) => (
                    <Text key={index} variant="code-1">
                        {entry.name}
                    </Text>
                ))}
            </>
        );
    }
    if ('type' in type) {
        const children = Array.isArray(type.type) ? type.type : [type.type];
        return (
            <>
                {children.map((child, index) => (
                    <DataTypeTree key={index} type={child} level={level} />
                ))}
            </>
        );
    }
    return null;
}

export function DataTypeTree({
    type,
    level = 0,
    member,
}: {
    type: ParameterType;
    level?: number;
    member?: string | number;
}) {
    const [expanded, setExpanded] = useState(level < 2);
    const complex = 'struct' in type || 'type' in type;
    const depth = optionalDepth(type);
    const name = type.name + (type.params?.length ? `(${type.params.join(', ')})` : '');
    return (
        <Flex className={block()} direction="column" gap={1}>
            <Flex alignItems="center" gap={1} wrap="wrap">
                {member !== undefined && <Text variant="code-1">{member}:</Text>}
                {complex ? (
                    <Button
                        className={block('toggle')}
                        view="flat"
                        size="xs"
                        aria-label={i18n(expanded ? 'action_collapse' : 'action_expand', {
                            type: name,
                        })}
                        aria-expanded={expanded}
                        onClick={() => setExpanded((current) => !current)}
                    >
                        {name}
                    </Button>
                ) : (
                    <Text variant="code-1">{name}</Text>
                )}
                {depth > 0 && (
                    <Text className={block('optional')} color="secondary">
                        {depth > 1 ? `Optional × ${depth}` : 'Optional'}
                    </Text>
                )}
                {type.tags?.map((tag, index) => (
                    <Text key={index} variant="code-1">
                        [{tag}]
                    </Text>
                ))}
            </Flex>
            {complex && (
                <Flex className={block('children')} direction="column" gap={1}>
                    {expanded ? (
                        <TypeChildren type={type} level={level + 1} />
                    ) : (
                        <Button
                            className={block('expand')}
                            view="flat"
                            size="xs"
                            aria-label={i18n('action_expand', {type: name})}
                            aria-expanded={false}
                            onClick={() => setExpanded(true)}
                        >
                            …
                        </Button>
                    )}
                </Flex>
            )}
        </Flex>
    );
}
