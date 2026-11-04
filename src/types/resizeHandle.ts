export type ResizeHandleProps = {
    orientation: 'horizontal' | 'vertical';
    value: number;
    min: number;
    max?: number;
    label: string;
    controls: string;
    onChange: (value: number) => void;
};
