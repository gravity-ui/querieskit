export type BreadcrumbSegment = {
    path: string;
    title: string;
};

export function parsePathSegments(path: string | undefined): BreadcrumbSegment[] {
    if (!path) return [];

    const parts = path.trim().split('/').filter(Boolean);

    let pathAcc = '';
    return parts.map((segment) => {
        pathAcc += `/${segment}`;
        return {path: pathAcc, title: segment};
    });
}
