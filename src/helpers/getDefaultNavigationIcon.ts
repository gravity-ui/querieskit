import type {IconData} from '@gravity-ui/uikit';
import BanIcon from '@gravity-ui/icons/svgs/ban.svg';
import EyeSlashIcon from '@gravity-ui/icons/svgs/eye-slash.svg';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import FolderIcon from '@gravity-ui/icons/svgs/folder.svg';
import LayoutHeaderCellsLargeIcon from '@gravity-ui/icons/svgs/layout-header-cells-large.svg';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import LinkSlashIcon from '@gravity-ui/icons/svgs/link-slash.svg';
import type {NavigationItemKind} from '../types/navigation';

export function getDefaultNavigationIcon(
    kind: NavigationItemKind = 'unknown',
    targetPathBroken?: boolean,
): IconData {
    if (kind === 'link' && targetPathBroken) {
        return LinkSlashIcon;
    }

    switch (kind) {
        case 'folder':
            return FolderIcon;
        case 'file':
            return FileTextIcon;
        case 'table':
            return LayoutHeaderCellsLargeIcon;
        case 'link':
            return LinkIcon;
        case 'unknown':
            return EyeSlashIcon;
        default:
            return BanIcon;
    }
}
