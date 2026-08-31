export const useKeyDownFormControl = (onAccept: () => void, onCancel: () => void) => {
    const handleInputKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onAccept();
        }
    };

    const handleEditorKeyDown = (event: React.KeyboardEvent<'div'>) => {
        if (event.key !== 'Escape' || event.nativeEvent.isComposing) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        onCancel?.();
    };

    return {handleInputKeyDown, handleEditorKeyDown};
};
