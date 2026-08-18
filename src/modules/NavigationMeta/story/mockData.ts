import type {NavigationMetaConfig} from '../../../types/navigation';

export const META_GROUPS: NavigationMetaConfig['groups'] = [
    {
        title: 'General',
        items: [
            {name: 'Type', value: 'table'},
            {name: 'ID', value: '1-2-3-abcdef'},
            {name: 'Account', value: 'production'},
            {name: 'Owner', value: 'robot-yt'},
        ],
    },
    {
        title: 'Storage',
        items: [
            {name: 'Compression', value: 'zstd_5'},
            {name: 'Erasure codec', value: 'none'},
            {name: 'Disk space', value: '1.2 TB'},
            {name: 'Chunk count', value: '42'},
        ],
    },
];
