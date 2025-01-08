export function wait(ms: number = 0, cb?: () => void): Promise<unknown> {
    return cb
        ? new Promise(() => {
              setTimeout(cb, ms);
          })
        : new Promise((resolve) => setTimeout(resolve, ms));
}
