import { expect } from "chai";
import { Project } from "ts-morph";
import * as ts from "typescript";
import { createMinifier, Minifier, MinifyOptions } from "../createMinifier";

// todo: more tests... I created this project really late at night

describe(nameof<Minifier>(), () => {
    const minifier = createMinifier(ts);
    const project = new Project();

    describe(nameof<Minifier>(m => m.minify), () => {
        function doTest(inputText: string, expectedText: string, options?: MinifyOptions) {
            const result = minifier.minify(inputText, options);
            // test for equality
            expect(result).to.equal(expectedText, "checking output equality");

            // test for any syntax errors
            project.createSourceFile("test.d.ts", result, { overwrite: true });
            expect(project.getProgram().getSyntacticDiagnostics().map(d => d.getMessageText())).to.deep.equal(
                [],
                "checking for syntax errors",
            );
        }

        it("should minify the provided text", () => {
            doTest(
                [
                    ` /// <reference lib="none" />\n/// <reference lib="none" />\r\n`,
                    "/* asdfasdf */ //testing",
                    "/**\n      * Test\n    * asdfa\n */",
                    "class Test {\npublic prop: string | undefined; private readonly test: any; }",
                    "declare interface   Test  {\nmethod() : void; }",
                ].join("\n"),
                [
                    `/// <reference lib="none" />\n`,
                    `/// <reference lib="none" />\r\n`,
                    "class Test{public prop:string|undefined;private readonly test:any;}",
                    "declare interface Test{method():void;}",
                ].join(""),
            );
        });

        it("should write a type reference directive on the last line that has no newline", () => {
            doTest(`/// <reference lib="none" />`, `/// <reference lib="none" />`);
        });

        it("should strip jsdocs when specified to", () => {
            doTest(
                [
                    "/**\n      * Test\n    * asdfa\n */",
                    "class Test {}",
                ].join("\n"),
                [
                    "/**\n * Test\n * asdfa\n */",
                    "class Test{}",
                ].join(""),
                {
                    keepJsDocs: true,
                },
            );
        });

        it("should separate with a newline when ASI is probable", () => {
            doTest(
                [
                    `interface Test {`,
                    "  test(): U",
                    "  test2(): U[]",
                    "  asdf(): other;",
                    "  test(",
                    "    other,",
                    "    test2): void",
                    "}",
                ].join("\n"),
                [
                    `interface Test{`,
                    `test():U\n`,
                    `test2():U[]\n`,
                    `asdf():other;`,
                    "test(other,test2):void",
                    "}",
                ].join(""),
            );
        });
    });
});
