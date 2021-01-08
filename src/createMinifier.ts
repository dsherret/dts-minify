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

const newLineCharCode = "\n".charCodeAt(0);

/** Creates a minifier that should be stored and then used to minify one or more files. */
export function createMinifier(ts: typeof import("typescript")): Minifier {
    const scanner = ts.createScanner(
        ts.ScriptTarget.Latest,
        /* skipTrivia */ false,
        ts.LanguageVariant.Standard,
    );

    return {
        minify,
    };

    function minify(fileText: string, options?: MinifyOptions) {
        const keepJsDocs = options?.keepJsDocs ?? false;
        let result = "";
        let lastWrittenToken: import("typescript").SyntaxKind | undefined;
        let lastHadSeparatingNewLine = false;

        scanner.setText(fileText);

        while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
            const currentToken = scanner.getToken();
            switch (currentToken) {
                case ts.SyntaxKind.NewLineTrivia:
                    lastHadSeparatingNewLine = true;
                    break;
                case ts.SyntaxKind.WhitespaceTrivia:
                    break;
                case ts.SyntaxKind.SingleLineCommentTrivia:
                    if (isTripleSlashDirective()) {
                        writeSingleLineComment();
                        lastHadSeparatingNewLine = false;
                    }
                    break;
                case ts.SyntaxKind.MultiLineCommentTrivia:
                    if (keepJsDocs && isJsDoc()) {
                        writeJsDoc();
                        lastHadSeparatingNewLine = false;
                    }
                    break;
                default:
                    // use a newline where ASI is probable
                    if (
                        currentToken === ts.SyntaxKind.Identifier
                        && lastHadSeparatingNewLine
                        && lastWrittenToken !== ts.SyntaxKind.SemicolonToken
                        && lastWrittenToken !== ts.SyntaxKind.CloseBraceToken
                        && lastWrittenToken !== ts.SyntaxKind.OpenBraceToken
                    ) {
                        result += "\n";
                    }

                    writeText(scanner.getTokenText());
                    lastHadSeparatingNewLine = false;
            }
        }

        return result;

        function isTripleSlashDirective() {
            const tokenText = scanner.getTokenText();
            // todo: better check
            return tokenText.startsWith("///") && tokenText.includes("<");
        }

        function writeSingleLineComment() {
            writeText(scanner.getTokenText());

            // write out the next newline as-is (ex. write \n or \r\n)
            const nextToken = scanner.scan();
            if (nextToken === ts.SyntaxKind.NewLineTrivia) {
                writeText(scanner.getTokenText());
            } else if (nextToken !== ts.SyntaxKind.EndOfFileToken) {
                throw new Error(`Unexpected scenario where the token after a comment was a ${nextToken}.`);
            }
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

            // ensure two tokens that would merge into a single token are separated by a space
            if (
                lastWrittenToken != null
                && isAlphaNumericToken(token)
                && isAlphaNumericToken(lastWrittenToken)
                && !wasLastWrittenNewLine()
            ) {
                result += " ";
            }

            result += text;
            lastWrittenToken = token;
        }

        function wasLastWrittenNewLine() {
            return result.charCodeAt(result.length - 1) === newLineCharCode;
        }
    }

    function isAlphaNumericToken(token: import("typescript").SyntaxKind) {
        if (token >= ts.SyntaxKind.FirstKeyword && token <= ts.SyntaxKind.LastKeyword) {
            return true;
        }
        return token === ts.SyntaxKind.Identifier;
    }
}
