import {readFile} from 'node:fs/promises';
import process from 'node:process';
import ts from 'typescript';

const projectRoot = new URL('../../', import.meta.url);
const missing = [];

for (const level of ['components', 'modules']) {
    const barrel = await readFile(new URL(`src/${level}/index.ts`, projectRoot), 'utf8');
    const source = ts.createSourceFile('index.ts', barrel, ts.ScriptTarget.Latest, true);
    const units = new Set();
    for (const statement of source.statements) {
        if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) continue;
        if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
        const match = /^\.\/([^/]+)$/.exec(statement.moduleSpecifier.text);
        if (match) units.add(match[1]);
    }

    let covered = 0;
    for (const unit of [...units].sort()) {
        const specPath = `tests/visual/${level}/${unit}/${unit}.visual.spec.ts`;
        let content;
        try {
            content = await readFile(new URL(specPath, projectRoot), 'utf8');
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            missing.push(specPath);
            continue;
        }

        const spec = ts.createSourceFile(specPath, content, ts.ScriptTarget.Latest, true);
        let hasScreenshotAssertion = false;
        function visit(node) {
            if (
                ts.isCallExpression(node) &&
                ts.isPropertyAccessExpression(node.expression) &&
                node.expression.name.text === 'toHaveScreenshot'
            ) {
                hasScreenshotAssertion = true;
            }
            ts.forEachChild(node, visit);
        }
        visit(spec);
        if (hasScreenshotAssertion) covered++;
        else missing.push(`${specPath} (no screenshot assertion)`);
    }
    console.info(`Visual specs: ${covered}/${units.size} ${level}`);
}

if (missing.length) {
    console.error(`Public units without a visual spec:\n${missing.join('\n')}`);
    process.exitCode = 1;
}
