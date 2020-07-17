import * as path from "path";
import { Project, NewLineKind } from "ts-morph";

const declarationProject = createDeclarationProject();
const emitMainFile = declarationProject.getSourceFileOrThrow("./dist/index.d.ts");
const writeProject = new Project({
    manipulationSettings: {
        newLineKind: NewLineKind.CarriageReturnLineFeed,
    },
});
const declarationFile = writeProject.addSourceFileAtPath("lib/dts-minify.d.ts");
const writer = declarationProject.createWriter();

for (const [name, declarations] of emitMainFile.getExportedDeclarations()) {
    for (const declaration of declarations) {
        if (writer.getLength() > 0)
            writer.newLine();

        writer.writeLine(declaration.getText(true));
    }
}

// todo: format using dprint
declarationFile.replaceWithText(writer.toString());
declarationFile.saveSync();

const diagnostics = writeProject.getPreEmitDiagnostics();
if (diagnostics.length > 0) {
    console.log(writeProject.formatDiagnosticsWithColorAndContext(diagnostics));
    process.exit(1);
}

function createDeclarationProject() {
    const project = new Project({
        tsConfigFilePath: path.join(__dirname, "../tsconfig.json"),
        compilerOptions: { declaration: true },
    });
    const result = project.emitToMemory({
        emitOnlyDtsFiles: true,
    });
    const declarationProject = new Project({
        tsConfigFilePath: path.join(__dirname, "../tsconfig.json"),
        addFilesFromTsConfig: false,
    });
    for (const emittedFile of result.getFiles())
        declarationProject.createSourceFile(emittedFile.filePath, emittedFile.text);
    return declarationProject;
}
