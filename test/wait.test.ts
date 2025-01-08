import { assertEquals } from "@std/assert";
import { wait } from "../src/wait/main.ts";

Deno.test("[wait] : wait 100ms", async function (): Promise<void> {
    const duration = 100;
    const start = performance.now();
    await wait(duration);
    const end = performance.now();
    const diff = end - start;
    assertEquals(Math.round(diff / duration), 1);
});
