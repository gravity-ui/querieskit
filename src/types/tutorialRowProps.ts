import type {QueryListLinkRenderer} from './queryList';
import type {TutorialHistoryRow} from './tutorial';

export type TutorialRowProps<T extends TutorialHistoryRow = TutorialHistoryRow> = {
    item: T;
    renderLink?: QueryListLinkRenderer;
};
