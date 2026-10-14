/** Compare form data, including arrays and date values, independently of object key order. */
export function equalFilterValues(left: unknown, right: unknown): boolean {
    if (Object.is(left, right)) return true;
    if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
    if (Object.getPrototypeOf(left) !== Object.getPrototypeOf(right)) return false;
    const leftValue = left.valueOf();
    const rightValue = right.valueOf();
    if (leftValue !== left || rightValue !== right) return Object.is(leftValue, rightValue);
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
        leftKeys.length === rightKeys.length &&
        leftKeys.every(
            (key) =>
                Object.prototype.hasOwnProperty.call(right, key) &&
                equalFilterValues(
                    (left as Record<string, unknown>)[key],
                    (right as Record<string, unknown>)[key],
                ),
        )
    );
}
