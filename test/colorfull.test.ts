import { assertEquals, assertThrows } from "@std/assert";
import { colorfull } from "../src/colorfull/main.ts"; // Adjust the path to the actual location of `colorfull`

Deno.test("[colorfull] : should wrap text with the correct color codes", () => {
    const result = colorfull("red", "Hello, World!");
    assertEquals(result, "\x1b[0;91mHello, World!\x1b[0m");
});

Deno.test("[colorfull] : should handle bright colors", () => {
    const result = colorfull("brightBlue", "Bright text!");
    assertEquals(result, "\x1b[0;94mBright text!\x1b[0m");
});

Deno.test("[colorfull] : should throw an error for invalid color", () => {
    assertThrows(() => {
        // @ts-expect-error - Testing invalid input
        colorfull("invalidColor", "This should fail");
    });
});
