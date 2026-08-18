import type {IconData} from '@gravity-ui/uikit';
import BanIcon from '@gravity-ui/icons/svgs/ban.svg';
import EyeSlashIcon from '@gravity-ui/icons/svgs/eye-slash.svg';
import FileTextIcon from '@gravity-ui/icons/svgs/file-text.svg';
import FolderIcon from '@gravity-ui/icons/svgs/folder.svg';
import LayoutHeaderCellsLargeIcon from '@gravity-ui/icons/svgs/layout-header-cells-large.svg';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import LinkSlashIcon from '@gravity-ui/icons/svgs/link-slash.svg';
import type {NavigationItemKind} from '../types/navigation';

/**
 * Resolves a default icon for a navigation item based on its backend-agnostic
 * `kind`. Consumers with their own backend-specific node types (e.g. YTsaurus
 * Cypress node types) should map them to a `NavigationItemKind` on their side,
 * or pass an explicit `icon` on the item to bypass this resolution entirely.
 */
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
