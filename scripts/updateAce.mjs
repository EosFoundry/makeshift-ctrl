import { exec } from 'child_process'
import { readFile } from 'fs/promises'
import { minVersion } from 'semver'

const rawFile = await readFile('package.json', 'utf-8')
const packageJson = JSON.parse(rawFile)

console.log(packageJson)

const aceVersion = packageJson.devDependencies['ace-builds']

console.log(aceVersion)

const minAceVersion = minVersion(aceVersion)

console.log(minAceVersion.version)

exec('git status', (error, stdout, stderr) => {
  console.log(stdout)
  console.log(stderr)
})