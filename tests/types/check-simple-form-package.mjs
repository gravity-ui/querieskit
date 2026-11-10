import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));
mkdirSync(path.join(root, 'build'), {recursive: true});
const workspace = mkdtempSync(path.join(root, 'build/simple-form-types-'));
const fixtures = [
    ['root', '@gravity-ui/querieskit', 'SimpleFormField'],
    ['subpath', '@gravity-ui/querieskit/components/SimpleForm', 'FormField'],
];
try {
    for (const [name, entrypoint, fieldType] of fixtures) {
        // Each program sees only the published declarations, never the source tree or
        // another fixture's augmentation. Type-only imports must be sufficient.
        const filename = path.join(workspace, `${name}.ts`);
        writeFileSync(
            filename,
            `
import type {${fieldType} as Field, FormFieldPropsRegistry} from '${entrypoint}';
const fields: Field[] = [
    {id: 'select', type: 'select', options: [{value: 'a', content: 'A'}], initialValue: ['a']},
    {id: 'switch', type: 'switch', initialValue: false},
    {id: 'range', type: 'rangeDatePicker', initialValue: {start: null, end: null}},
    {id: 'checks', type: 'checkboxGroup', items: [{id: 'a'}], initialValue: ['a']},
];
// @ts-expect-error Select requires options.
const missingOptions: Field = {id: 'select', type: 'select'};
// @ts-expect-error A switch value is boolean.
const wrongSwitch: Field = {id: 'switch', type: 'switch', initialValue: 'yes'};
// @ts-expect-error Select props cannot be assigned to a switch.
const wrongProps: Field = {id: 'switch', type: 'switch', options: []};
// @ts-expect-error Date ranges are not strings.
const wrongRange: Field = {id: 'range', type: 'rangeDatePicker', initialValue: 'today'};
// @ts-expect-error Checkbox items are required.
const missingItems: Field = {id: 'checks', type: 'checkboxGroup'};
`,
        );
        check(filename, name);
        writeFileSync(
            filename,
            `
import type {${fieldType} as Field, FormFieldPropsRegistry} from '${entrypoint}';
declare module '${entrypoint}' {
    interface FormFieldPropsRegistry {
        customRating: {value: number; onChange: (value: number) => void; max: number};
    }
}
const custom: Field = {id: 'rating', type: 'customRating', max: 5, initialValue: 3};
const standard: Field = {id: 'select', type: 'select', options: []};
// @ts-expect-error Custom field props remain strict.
const invalidCustom: Field = {id: 'rating', type: 'customRating', initialValue: 3};
// @ts-expect-error Custom values remain typed.
const invalidValue: Field = {id: 'rating', type: 'customRating', max: 5, initialValue: '3'};
`,
        );
        check(filename, `${name} custom augmentation`);
    }
} finally {
    rmSync(workspace, {recursive: true, force: true});
}
function check(filename, label) {
    const program = ts.createProgram([filename], {
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        types: [],
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(
        diagnostics.length,
        0,
        `${label}:\n${ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCanonicalFileName: (file) => file,
            getCurrentDirectory: () => root,
            getNewLine: () => '\n',
        })}`,
    );
    assert(
        !program.getSourceFiles().some((file) => file.fileName.startsWith(path.join(root, 'src/'))),
    );
    console.info(`✓ SimpleForm published ${label}`);
}
