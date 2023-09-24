import { readFileSync } from 'fs'
const pinnedVersion = { electron: '25.0.0' }

export async function updateNvmrc (){
  const nvmrc = readFileSync('.nvmrc', 'utf8')
  const electronPackageJson = JSON.parse(readFileSync('node_modules/electron/package.json', 'utf8'))
  const electronVersion = electronPackageJson.version
  console.log(electronPackageJson)
  console.log('updateNvmrcccccccccccccccccccccccc')
  console.log(electronVersion)
  console.log(nvmrc)
}
