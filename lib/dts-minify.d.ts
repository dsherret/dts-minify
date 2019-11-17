/** Creates a minifier that should be stored and then used to minify one or multiple files. */
export declare function createMinifier(ts: typeof import("typescript")): Minifier;

/**
 * Minifies TypeScript declaration files.
 * @remarks Use `createMinifier` to create a minifier.
 */
export interface Minifier {
    /**
     * Removes non-essential whitespace, newlines, and comments from the provided text.
     * @param text - Text to minify.
     * @param options - Options for minifying.
     */
    minify(text: string, options?: MinifyOptions): string;
}

/** Options for minifying. */
export interface MinifyOptions {
    /**
     * Does not remove the JS docs when true.
     * @default false
     */
    keepJsDocs?: boolean;
}
