import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { Project, ts } from "https://deno.land/x/ts_morph@17.0.1/mod.ts";
import { createMinifier, MinifyOptions } from "./mod.ts";

// todo: more tests... I created this project really late at night
const minifier = createMinifier(ts);
const project = new Project();

function doTest(inputText: string, expectedText: string, options?: MinifyOptions) {
  const result = minifier.minify(inputText, options);
  // test for equality
  assertEquals(result, expectedText);

  // test for any syntax errors
  project.createSourceFile("test.d.ts", result, { overwrite: true });
  assertEquals(project.getProgram().getSyntacticDiagnostics().map(d => d.getMessageText()), []);
}

Deno.test("should minify the provided text", () => {
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

Deno.test("should write a type reference directive on the last line that has no newline", () => {
  doTest(`/// <reference lib="none" />`, `/// <reference lib="none" />`);
});

Deno.test("should strip jsdocs when specified to", () => {
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

Deno.test("should separate with a newline when ASI is probable", () => {
  doTest(
    [
      `interface Test {`,
      "  test(): U",
      "  test2(): U[]",
      "  test3():",
      "U",
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
      `test3():U\n`,
      `asdf():other;`,
      "test(other,test2):void",
      "}",
    ].join(""),
  );
});
