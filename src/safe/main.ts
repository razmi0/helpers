/**
 * Wrap a function in a try-catch block and rethrow the error.
 * @param fn
 * @returns
 */
export function safe<T>(fn: () => T): T {
    try {
        return fn();
    } catch (e) {
        throw e;
    }
}
