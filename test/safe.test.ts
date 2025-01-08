import { assert, assertThrows } from "@std/assert";
import { safe } from "../src/safe/main.ts";

// Test: Should catch errors
Deno.test("[safe] : should catch errors", () => {
    assertThrows(() => {
        safe(() => {
            throw new Error("test");
        });
    });
});

// Test: Should return the result of the function
Deno.test("[safe] : should return the result of the function", () => {
    const result = safe(() => "test");
    assert(result === "test");
});
