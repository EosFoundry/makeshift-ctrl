import { exec } from 'child_process'
import { readFile } from 'fs/promises'
import semver, { minVersion } from 'semver'

const rawFile = await readFile('package.json', 'utf-8')
const packageJson = JSON.parse(rawFile)


const CWD = process.cwd()

console.log(CWD)

const aceVersion = packageJson.devDependencies['ace-builds']

console.log(aceVersion)
console.log(semver.valid('^1.16.0'))
console.log(semver.valid(aceVersion))

if (semver.valid(aceVersion) === null) {
  console.log('invalid ace-builds version detected in package.json, exiting')
  process.exit(1)
}

const minAceVersion = minVersion(aceVersion)

console.log(minAceVersion.version)

await exec('git status', {
  cwd: CWD + '\\lib\\ace-builds'
},
  (error, stdout, stderr) => {
    console.log(stdout)
    console.log(stderr)
  })

const aceTagString = 'v' + minAceVersion.version

const checkoutTagCommand = `git checkout ${aceTagString}`
const testCommand = `git status`

await exec(checkoutTagCommand, {
  cwd: CWD + '\\lib\\ace-builds'
}, (error, stdout, stderr) => {
  if (error !== null) {
    console.log(error)
  } else {
    console.log(stdout)
    console.log(stderr)
  }
})