import type {DashboardRenderItem} from '../../../types/dashboard';
import type {ConfigLayout} from '@gravity-ui/dashkit';

/** Reconcile by ID without mutating the saved layout or emitting change events. */
export const createDefaultLayout = (
    items: DashboardRenderItem[],
    columns: number,
    savedLayout: ConfigLayout[] = [],
): ConfigLayout[] => {
    const cols = Number.isFinite(columns) ? Math.max(1, Math.floor(columns)) : 4;
    const width = Math.ceil(cols / 2);
    const ids = new Set(items.map(({id}) => id));
    const positions = new Map<string, ConfigLayout>();
    for (const entry of savedLayout) {
        if (!ids.has(entry.i) || positions.has(entry.i)) continue;
        if (![entry.x, entry.y, entry.w, entry.h].every(Number.isFinite)) continue;
        const w = Math.max(1, Math.min(cols, Math.floor(entry.w)));
        positions.set(entry.i, {
            ...entry,
            w,
            h: Math.max(1, Math.floor(entry.h)),
            x: Math.max(0, Math.min(cols - w, Math.floor(entry.x))),
            y: Math.max(0, Math.floor(entry.y)),
        });
    }
    let y = Math.max(0, ...Array.from(positions.values(), (item) => item.y + item.h));
    let x = 0;
    return items.map(({id}) => {
        const existing = positions.get(id);
        if (existing) return existing;
        if (x + width > cols) {
            x = 0;
            y += 4;
        }
        const position = {i: id, x, y, w: width, h: 4};
        x += width;
        return position;
    });
};
