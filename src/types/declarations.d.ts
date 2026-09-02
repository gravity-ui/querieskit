declare module '*.css' {
    const classes: {readonly [key: string]: string};
    export default classes;
}

declare module '*.scss' {
    const classes: {readonly [key: string]: string};
    export default classes;
}

declare module '*.svg' {
    import type {FC} from 'react';
    const ReactComponent: FC<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}

declare module '@gravity-ui/unipika' {
    type UnipikaSettings = Record<string, unknown>;

    type Unipika = {
        formatFromYQL(data: [unknown, unknown], settings?: UnipikaSettings): string;
    };

    export default function createUnipika(settings?: UnipikaSettings): Unipika;
}
