import {createHash} from "crypto";
import {readFile} from "node:fs/promises";

const hash = createHash("sha512");

const sourceFile = 'node-src/main/index.ts';
const sourceContents = await readFile(sourceFile);

console.log(sourceContents.toString());
console.log(hash.update(sourceContents).digest("hex"));

// const source = "let x: string  = 'string'";

// let result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS }});

// console.log(JSON.stringify(result));
