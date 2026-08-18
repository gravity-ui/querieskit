import React, {
    FC,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {Icon, Popup, Text, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import type {
    LoadPathSuggestions,
    PathEditorEventPayload,
    PathEditorSuggestion,
    PathEditorSuggestionFilter,
} from '../../types/pathEditor';
import {getDefaultNavigationIcon} from '../../helpers/getDefaultNavigationIcon';
import {
    filterByCurrentPath,
    getCompletedPath,
    getLastFragment,
    getNextSelectedIndex,
    getPrevSelectedIndex,
} from './helpers/suggestions';
import i18n from './i18n';
import './PathEditor.scss';

const DEBOUNCE_MS = 300;
const block = cn('qp-path-editor');

export type PathEditorProps = {
    className?: string;
    placeholder?: string;
    defaultPath?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    hasClear?: boolean;
    showErrors?: boolean;
    customFilter?: PathEditorSuggestionFilter;
    cluster?: string;
    suggestions?: PathEditorSuggestion[];
    suggestionsError?: boolean;
    errorMessage?: string;
    onLoadSuggestions?: LoadPathSuggestions;
    onChange?: (path: string) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>, payload: PathEditorEventPayload) => void;
    onBlur?: (path: string) => void;
    onApply?: (path: string) => void;
    onCancel?: () => void;
};

export const PathEditor: FC<PathEditorProps> = ({
    className,
    placeholder = i18n('field_placeholder'),
    defaultPath = '',
    disabled = false,
    autoFocus = false,
    hasClear = false,
    showErrors = true,
    customFilter,
    cluster,
    suggestions: suggestionsFromProps,
    suggestionsError: suggestionsErrorFromProps,
    errorMessage: errorMessageFromProps,
    onLoadSuggestions,
    onChange,
    onFocus,
    onBlur,
    onApply,
    onCancel,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedItemRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const requestIdRef = useRef(0);
    const wasDisabledRef = useRef(disabled);
    const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);

    const onLoadSuggestionsRef = useRef(onLoadSuggestions);
    onLoadSuggestionsRef.current = onLoadSuggestions;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const customFilterRef = useRef(customFilter);
    customFilterRef.current = customFilter;

    const [path, setPath] = useState(defaultPath);
    const [loadedSuggestions, setLoadedSuggestions] = useState<PathEditorSuggestion[]>([]);
    const [internalError, setInternalError] = useState(false);
    const [internalErrorMessage, setInternalErrorMessage] = useState<string>();
    const [inputFocus, setInputFocus] = useState(false);
    const [inputChange, setInputChange] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [inputWidth, setInputWidth] = useState(0);

    const suggestions = suggestionsFromProps ?? loadedSuggestions;
    const suggestionsError = suggestionsErrorFromProps ?? internalError;
    const errorMessage =
        errorMessageFromProps ?? internalErrorMessage ?? i18n('message_error-default');

    const actualSuggestions = useMemo(() => {
        if (!inputFocus || !inputChange || !suggestions.length) {
            return [];
        }

        return filterByCurrentPath(path, suggestions);
    }, [inputFocus, inputChange, path, suggestions]);

    const loadSuggestions = useCallback(
        (nextPath: string) => {
            const load = onLoadSuggestionsRef.current;
            if (!load) {
                return;
            }

            const requestId = ++requestIdRef.current;

            Promise.resolve(
                load({
                    path: nextPath,
                    customFilter: customFilterRef.current,
                    cluster,
                }),
            )
                .then((result) => {
                    if (requestId !== requestIdRef.current) {
                        return;
                    }

                    if (result) {
                        setLoadedSuggestions(result);
                    }
                    setInternalError(false);
                    setInternalErrorMessage(undefined);
                })
                .catch((error: unknown) => {
                    if (requestId !== requestIdRef.current) {
                        return;
                    }

                    setLoadedSuggestions([]);
                    setInternalError(true);
                    setInternalErrorMessage(error instanceof Error ? error.message : undefined);
                });
        },
        [cluster],
    );

    const debounceLoading = useCallback(
        (nextPath: string) => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                loadSuggestions(nextPath);
                onChangeRef.current?.(nextPath);
            }, DEBOUNCE_MS);
        },
        [loadSuggestions],
    );

    const hideSuggestions = useCallback(() => {
        setInputFocus(false);
        setSelectedIndex(-1);
    }, []);

    const handleInputChange = useCallback(
        (nextPath: string) => {
            setPath(nextPath);
            setSelectedIndex(-1);
            setInputChange(true);
            setInputFocus(true);
            debounceLoading(nextPath);
        },
        [debounceLoading],
    );

    const handleInputFocus = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setInputFocus(true);
            onFocus?.(event, {path});
        },
        [onFocus, path],
    );

    const handleInputBlur = useCallback(() => {
        hideSuggestions();
        onBlur?.(path);
    }, [hideSuggestions, onBlur, path]);

    const handleEnterClick = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            event.preventDefault();

            const inputPath = event.currentTarget.value;

            if (selectedIndex === -1) {
                setPath(inputPath);
                setSelectedIndex(-1);
                onApply?.(inputPath);
                return;
            }

            const suggestion = actualSuggestions[selectedIndex];
            if (suggestion) {
                handleInputChange(getCompletedPath(suggestion));
            }
        },
        [actualSuggestions, handleInputChange, onApply, selectedIndex],
    );

    const handleEscClick = useCallback(() => {
        inputRef.current?.blur();
        onCancel?.();
    }, [onCancel]);

    const handleTabClick = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            event.preventDefault();

            if (actualSuggestions.length === 1) {
                handleInputChange(getCompletedPath(actualSuggestions[0]));
            } else if (actualSuggestions.length > 1) {
                setSelectedIndex((current) => getNextSelectedIndex(actualSuggestions, current));
            }
        },
        [actualSuggestions, handleInputChange],
    );

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            switch (event.key) {
                case 'ArrowDown':
                    if (!actualSuggestions.length) {
                        break;
                    }
                    event.preventDefault();
                    setSelectedIndex((current) => getNextSelectedIndex(actualSuggestions, current));
                    break;
                case 'ArrowUp':
                    if (!actualSuggestions.length) {
                        break;
                    }
                    event.preventDefault();
                    setSelectedIndex((current) => getPrevSelectedIndex(actualSuggestions, current));
                    break;
                case 'Enter':
                    handleEnterClick(event);
                    break;
                case 'Escape':
                    handleEscClick();
                    break;
                case 'Tab':
                    if (!actualSuggestions.length) {
                        break;
                    }
                    handleTabClick(event);
                    break;
            }
        },
        [actualSuggestions, handleEnterClick, handleEscClick, handleTabClick],
    );

    useEffect(() => {
        if (path) {
            loadSuggestions(path);
        }

        return () => {
            requestIdRef.current += 1;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (wasDisabledRef.current && !disabled) {
            inputRef.current?.focus();
        }
        wasDisabledRef.current = disabled;
    }, [disabled]);

    useLayoutEffect(() => {
        if (inputFocus && rootElement) {
            setInputWidth(rootElement.offsetWidth);
        }
    }, [inputFocus, path, rootElement]);

    useLayoutEffect(() => {
        selectedItemRef.current?.scrollIntoView({block: 'nearest'});
    }, [selectedIndex]);

    const isPopupVisible = Boolean(
        (actualSuggestions.length || (suggestionsError && showErrors)) && inputFocus,
    );

    return (
        <div className={block(null, className)} ref={setRootElement}>
            <TextInput
                onKeyDown={handleKeyDown}
                onUpdate={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                hasClear={hasClear}
                autoFocus={autoFocus}
                disabled={disabled}
                controlRef={inputRef}
                value={path}
            />
            <Popup
                className={block('popup')}
                placement="bottom-start"
                onOpenChange={(open) => {
                    if (!open) {
                        hideSuggestions();
                    }
                }}
                anchorElement={rootElement}
                open={isPopupVisible}
                offset={{mainAxis: 0, crossAxis: 0}}
                disableEscapeKeyDown
                disableFocusOut
            >
                <div
                    className={block('items')}
                    style={{width: inputWidth || undefined}}
                    role="listbox"
                >
                    {suggestionsError && showErrors ? (
                        <Text className={block('item', {error: true})} color="danger">
                            {errorMessage}
                        </Text>
                    ) : (
                        actualSuggestions.map((item, index) => {
                            const completedPath = getCompletedPath(item);
                            const isSelected = index === selectedIndex;
                            const lastFragment = getLastFragment(item.path);

                            const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
                                handleInputChange(completedPath);
                                event.preventDefault();
                            };

                            return (
                                <div
                                    key={item.path}
                                    ref={isSelected ? selectedItemRef : undefined}
                                    onMouseDown={handleMouseDown}
                                    className={block('item', {selected: isSelected})}
                                    role="option"
                                    aria-selected={isSelected}
                                >
                                    {item.icon ?? (
                                        <Icon
                                            data={getDefaultNavigationIcon(
                                                item.kind,
                                                item.targetPathBroken,
                                            )}
                                            size={16}
                                        />
                                    )}
                                    <span className={block('item-path')}>
                                        {lastFragment ? `\u2026/${lastFragment}` : item.path}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </Popup>
        </div>
    );
};
