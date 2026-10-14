import React, {useState} from 'react';
import {CircleInfo} from '@gravity-ui/icons';
import {ArrowToggle, Button, Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {SchemaTypeNode} from '../helpers/queryResultSchemaType';
import i18n from '../i18n';

import './QueryResultSchemaType.scss';

const block = cn('qp-query-result-schema-type');

export function QueryResultSchemaType({type}: {type: SchemaTypeNode}) {
    // Keep all paths here so hiding a parent does not discard its children's state.
    const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

    function renderNode(node: SchemaTypeNode, path: string, depth: number, label?: string) {
        const hasChildren = Boolean(node.children?.length);
        const expanded = expandedPaths[path] ?? depth < 2;
        const name = label === undefined ? node.name : `${label}: ${node.name}`;

        return (
            <div key={path} className={block('node')}>
                <Flex alignItems="center" gap={1} className={block('line')}>
                    {hasChildren ? (
                        <Button
                            size="xs"
                            view="flat-secondary"
                            className={block('toggle')}
                            aria-label={`${i18n(expanded ? 'action_collapse-type' : 'action_expand-type')}: ${name}`}
                            aria-expanded={expanded}
                            onClick={() =>
                                setExpandedPaths((previous) => ({...previous, [path]: !expanded}))
                            }
                        >
                            <ArrowToggle direction={expanded ? 'bottom' : 'right'} size={12} />
                        </Button>
                    ) : (
                        <span className={block('spacer')} aria-hidden="true" />
                    )}
                    <code className={block('name')}>
                        {label !== undefined && <span className={block('label')}>{label}: </span>}
                        {node.name}
                        {node.parameters?.length
                            ? `(${node.parameters.map(String).join(', ')})`
                            : ''}
                    </code>
                    {Boolean(node.optionalDepth) && (
                        <span className={block('modifier')}>
                            {i18n('value_optional')}
                            {(node.optionalDepth ?? 0) > 1 ? ` × ${node.optionalDepth}` : ''}
                        </span>
                    )}
                    {node.tags?.map((tag, index) => (
                        <span key={index} className={block('tag')}>
                            [{tag}]
                        </span>
                    ))}
                    {node.sourceDescription !== undefined && (
                        <Tooltip
                            content={node.sourceDescription}
                            openDelay={0}
                            className={block('source')}
                        >
                            <Button
                                size="xs"
                                view="flat-secondary"
                                className={block('info')}
                                aria-label={i18n('action_show-type-source')}
                            >
                                <Icon data={CircleInfo} size={14} />
                            </Button>
                        </Tooltip>
                    )}
                </Flex>
                {hasChildren && expanded && (
                    <div className={block('children')}>
                        {node.children?.map((child, index) =>
                            renderNode(child.type, `${path}.${index}`, depth + 1, child.label),
                        )}
                    </div>
                )}
            </div>
        );
    }

    return <div className={block()}>{renderNode(type, '0', 0)}</div>;
}
