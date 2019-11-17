/**
 * Minifies TypeScript declaration files.
 * @remarks Use `createMinifier` to create a minifier.
 */
export interface Minifier {
    /**
     * Minifies the provided text.
     * @param text - Text to minify.
     * @param options - Options for minifying.
     */
    minify(text: string, options?: MinifyOptions): string;
}

/** Options for minifying. */
export interface MinifyOptions {
    /**
     * Strip all the JS docs.
     * @default false
     */
    stripJsDocs?: boolean;
}

/** Creates a minifier that should be stored and then used to minify one or multiple files. */
export function createMinifier(ts: typeof import("typescript")): Minifier {
    const scanner = ts.createScanner(
        ts.ScriptTarget.Latest,
        /* skipTrivia */ false,
        ts.LanguageVariant.Standard
    );

    return {
        minify
    };

    function minify(text: string, options?: MinifyOptions) {
        const stripJsDocs = options && options.stripJsDocs || false;
        let result = "";
        let lastWrittenToken: import("typescript").SyntaxKind | undefined;

        scanner.setText(text);

        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            switch (scanner.getToken()) {
                case ts.SyntaxKind.WhitespaceTrivia:
                case ts.SyntaxKind.NewLineTrivia:
                    break;
                case ts.SyntaxKind.SingleLineCommentTrivia:
                    const tokenText = scanner.getTokenText();
                    // todo: better check
                    // simple check to just keep all triple slash comments in case they are a directive
                    if (!tokenText.startsWith("///") || !tokenText.includes("<"))
                        continue;

                    writeText(tokenText);

                    // write out the next newline as-is (this may be ts.SyntaxKind.EndOfFileToken)
                    if (scanner.scan() === ts.SyntaxKind.NewLineTrivia)
                        writeText(scanner.getTokenText());

                    break;
                case ts.SyntaxKind.MultiLineCommentTrivia: {
                    if (stripJsDocs)
                        continue; // don't bother checking futher

                    const tokenText = scanner.getTokenText();
                    const isJsDoc = tokenText.startsWith("/**");

                    if (!isJsDoc)
                        continue;

                    // remove the leading whitespace on each line
                    writeText(tokenText.replace(/^\s+\*/mg, " *"));
                    break;
                }
                default: {
                    writeText(scanner.getTokenText());
                }
            }
        }

        return result;

        function writeText(text: string) {
            const token = scanner.getToken();

            // Ensure two tokens that would merge into a single token are separated by a space.
            if (lastWrittenToken != null && isAlphaNumericToken(token) && isAlphaNumericToken(lastWrittenToken))
                result += " ";

            result += text;
            lastWrittenToken = token;
        }
    }

    function isAlphaNumericToken(token: import("typescript").SyntaxKind) {
        if (token >= ts.SyntaxKind.FirstKeyword && token <= ts.SyntaxKind.LastKeyword)
            return true;
        return token === ts.SyntaxKind.Identifier;
    }
}
