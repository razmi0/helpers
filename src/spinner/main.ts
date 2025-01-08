import { type Colors, colorfull } from "../colorfull/main.ts";

const STDOUT = Deno.stdout;

/**
 * Spinner configuration type
 */
export type SpinnerConfig = {
    asciispinner: string[];
    spinnerColor: keyof Colors;
    spinnerText: string;
    intervalTime: number;
    iterator: { i: number };
    interval: ReturnType<typeof setInterval> | null;
    encoder: TextEncoder;
    variant: "gross" | "default";
};

/**
 * @exemple
 * ```ts
 * const spinner = new Spinner();
 * spinner.start();
 * // Do some work here
 * spinner.stop();
 * ```
 * The default config is SpinnerConfig type :
 * ```ts
 * {
 *  asciispinner: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
 *  spinnerColor: "blue",
 *  spinnerText: "Loading",
 *  intervalTime: 100,
 *  iterator: { i: 0 },
 *  interval: null,
 *  encoder: new TextEncoder(),
 *  variant: "default",
 * }
 *```
 * @themes "gross" or "default"
 */
export class Spinner {
    public cfg: SpinnerConfig;

    private sp_default = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    private sp_gross = ["▖", "▘", "▝", "▗"];

    /**
     * Creates a new spinner instance with at least the default configuration
     * @param config - Partial SpinnerConfig
     */
    constructor(config: Partial<SpinnerConfig> = {}) {
        const defaultConfig: SpinnerConfig = {
            asciispinner: this.sp_default,
            spinnerColor: "blue",
            spinnerText: "Loading",
            intervalTime: 100,
            iterator: { i: 0 },
            interval: null,
            encoder: new TextEncoder(),
            variant: "default",
        };

        if (config.variant === "gross") {
            defaultConfig.asciispinner = this.sp_gross;
        }

        this.cfg = { ...defaultConfig, ...config };
    }

    /**
     * Starts the spinner
     */
    start = (): void => {
        if (this.cfg.interval) {
            clearInterval(this.cfg.interval);
        }
        this.padlog(`  ${this.cfg.spinnerText}`);
        this.cfg.interval = setInterval(() => {
            this.padlog(colorfull(this.cfg.spinnerColor, this.cfg.asciispinner[this.moduloIdx()]));
        }, this.cfg.intervalTime);
    };

    /**
     * @info Internal use
     * - Returns the index of the current spinner character
     */
    moduloIdx = (): number => this.cfg.iterator.i++ % this.cfg.asciispinner.length;

    /**
     * @info Internal use
     * - Encodes the string to a Uint8Array
     * @param str
     * @returns
     */
    encode = (str: string): Uint8Array => this.cfg.encoder.encode(str);

    /**
     * Stops and reset the spinner
     */
    stop = (): void => {
        if (this.cfg.interval) {
            clearInterval(this.cfg.interval);
            this.cfg.interval = null;
        }

        this.cfg.iterator.i = 0;
        this.clearLine();
    };

    /**
     * @info Internal use
     * - Writes the string to the terminal
     * @param str
     * @returns
     */
    padlog = (str: string): number => STDOUT.writeSync(this.encode(`\r${str}`));

    /**
     * @info Internal use
     * - Clears the current line in the terminal
     */
    clearLine(): void {
        STDOUT.writeSync(this.encode(`\r`)); // Move back to the beginning
        STDOUT.writeSync(this.encode(" ".repeat(80))); // Clear the line
        STDOUT.writeSync(this.encode(`\r`)); // Move back to the beginning again
    }
}
