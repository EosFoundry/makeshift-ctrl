import * as ts from "typescript";
import {Maybe} from "purify-ts/Maybe";

const something = Maybe.fromNullable(undefined)
console.log(something.isNothing())

// const source = "let x: string  = 'string'";

// let result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS }});

// console.log(JSON.stringify(result));