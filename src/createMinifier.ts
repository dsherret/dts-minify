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
        const keepJsDocs = options && options.keepJsDocs || false;
        let result = "";
        let lastWrittenToken: import("typescript").SyntaxKind | undefined;

        scanner.setText(text);

        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            switch (scanner.getToken()) {
                case ts.SyntaxKind.WhitespaceTrivia:
                case ts.SyntaxKind.NewLineTrivia:
                    break;
                case ts.SyntaxKind.SingleLineCommentTrivia:
                    if (isTripleSlashDirective())
                        writeTripleSlashDirective();
                    break;
                case ts.SyntaxKind.MultiLineCommentTrivia: {
                    if (keepJsDocs && isJsDoc())
                        writeJsDoc();
                    break;
                }
                default: {
                    writeText(scanner.getTokenText());
                }
            }
        }

        return result;

        function isTripleSlashDirective() {
            const tokenText = scanner.getTokenText();
            // todo: better check
            return tokenText.startsWith("///") && tokenText.includes("<");
        }

        function writeTripleSlashDirective() {
            writeText(scanner.getTokenText());

            // write out the next newline as-is (ex. write \n or \r\n)
            if (scanner.scan() === ts.SyntaxKind.NewLineTrivia) // may be EndOfFileToken
                writeText(scanner.getTokenText());
        }

        function isJsDoc() {
            const tokenText = scanner.getTokenText();
            return tokenText.startsWith("/**");
        }

        function writeJsDoc() {
            writeText(scanner.getTokenText().replace(/^\s+\*/mg, " *"));
        }

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
