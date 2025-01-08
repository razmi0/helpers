import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { colors } from "../src/colorfull/main.ts"; // Adjust the import path accordingly
import { Spinner, type SpinnerConfig } from "../src/spinner/main.ts"; // Adjust the import path accordingly

Deno.test("[Spinner] : initializes with default config", () => {
    const spinner = new Spinner();
    assertEquals(spinner.cfg.spinnerText, "Loading");
    assertEquals(spinner.cfg.intervalTime, 100);
    assert(Array.isArray(spinner.cfg.asciispinner));
    assert(colors[spinner.cfg.spinnerColor] !== undefined);
});

Deno.test("[Spinner] : accepts custom configuration", () => {
    const customConfig: Partial<SpinnerConfig> = {
        spinnerText: "Custom Text",
        intervalTime: 200,
        variant: "gross",
    };
    const spinner = new Spinner(customConfig);
    assertEquals(spinner.cfg.spinnerText, "Custom Text");
    assertEquals(spinner.cfg.intervalTime, 200);
    assertEquals(spinner.cfg.asciispinner, ["▖", "▘", "▝", "▗"]); // Gross variant
});

Deno.test("[Spinner] : start method initializes interval", () => {
    const spinner = new Spinner();
    spinner.start();
    assertNotEquals(spinner.cfg.interval, null);
    spinner.stop(); // Cleanup
});

Deno.test("[Spinner] : stop method clears interval", () => {
    const spinner = new Spinner();
    spinner.start();
    spinner.stop();
    assertEquals(spinner.cfg.interval, null);
    assertEquals(spinner.cfg.iterator.i, 0);
});

Deno.test("[Spinner] : moduloIdx calculates correct index", () => {
    const spinner = new Spinner();
    const idx = spinner.moduloIdx();
    assertEquals(idx, 0);
    spinner.cfg.iterator.i = 10;
    assertEquals(spinner.moduloIdx(), 10 % spinner.cfg.asciispinner.length);
});

Deno.test("[Spinner] : encode method correctly encodes string", () => {
    const spinner = new Spinner();
    const encoded = spinner.encode("Test");
    assert(encoded instanceof Uint8Array);
    assertEquals(new TextDecoder().decode(encoded), "Test");
});

Deno.test("[Spinner] : padlog writes to stdout", () => {
    const spinner = new Spinner();
    const originalWriteSync = Deno.stdout.writeSync;
    let logged = "";

    Deno.stdout.writeSync = (data) => {
        logged = new TextDecoder().decode(data);
        return data.length;
    };

    spinner.padlog("Testing log");
    assertEquals(logged.trim(), "Testing log");

    Deno.stdout.writeSync = originalWriteSync; // Restore
});

Deno.test("[Spinner] : clearLine clears the output", () => {
    const spinner = new Spinner();
    const originalWriteSync = Deno.stdout.writeSync;
    const logs: string[] = [];

    Deno.stdout.writeSync = (data) => {
        logs.push(new TextDecoder().decode(data));
        return data.length;
    };

    spinner.clearLine();

    // Verify the sequence of writes
    assert(logs[0].startsWith("\r")); // First write should move to the beginning
    assert(logs[1] === " ".repeat(80)); // Second write should clear the line
    assert(logs[2].startsWith("\r")); // Third write should move back to the beginning

    // Restore the original `writeSync`
    Deno.stdout.writeSync = originalWriteSync;
});
