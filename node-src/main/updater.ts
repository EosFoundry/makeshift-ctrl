import { Octokit, App as OctokitApp } from 'octokit'
import * as Store from 'electron-store'

import { LogLevel, Msg } from "@eos-makeshift/msg"
import { ctrlLogger } from "./utils"
import { compare } from 'purify-ts'
import * as semver from 'semver'

const octokit = new Octokit({
  userAgent: `makeshift-ctrl/v${process.env.APP_VERSION}`,
})

// Create Loggers
const msgen = new Msg({
  host: 'Updater',
  logLevel: 'info'
})
msgen.logger = ctrlLogger
let log = msgen.getLevelLoggers()

const updaterStore = new Store.default({
  name: 'updater',
  defaults: {
    releaseList: [],
  },
})
export const knownReleaseList = updaterStore.get('releaseList')
export let updateAvailable = false


export async function checkForUpdates(opts: { logLvl?: LogLevel }) {
  if (opts.logLvl) { msgen.logLevel = opts.logLvl }
  log = msgen.getLevelLoggers()

  log.info('Checking for updates...')

  const releaseResponse = await octokit.request('GET /repos/EosFoundry/makeshift-ctrl/releases', {
    owner: 'eos-makeshift',
    repo: 'makeshift-ctrl',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  if (releaseResponse.status !== 200) {
    log.error(`Failed to check for updates: ${releaseResponse.status}`)
    updateAvailable = false
    return false
  }

  const releases = releaseResponse.data
  const sortedReleases = releases.toSorted((a, b) => {
    return Date.parse(b.published_at) - Date.parse(a.published_at)
  })
  const newReleaseDigest = digestReleaseList(sortedReleases)

  log.debug(`Latest release: ${newReleaseDigest[0]}`)
  log.debug(`Digest of new releases:`)
  // console.dir(newReleaseDigest, { depth: 3 })

  updaterStore.set('releaseList', sortedReleases)
  if (knownReleaseList.length === 0) {
    log.debug(`No known releases, saving latest release list.`)
    updateAvailable = false
    return false
  }

  const knownReleaseDigest = digestReleaseList(knownReleaseList)
  log.debug(`Digest of known releases:`)
  // console.dir(knownReleaseDigest, { depth: 3 })

  const hasNewRelease = semver.gt(newReleaseDigest[0].tag_name, knownReleaseDigest[0].tag_name)
  log.debug(`Has new release: ${hasNewRelease}`)
  if (hasNewRelease) {
    log.info(`New version available! makeshift-ctrl ${newReleaseDigest[0].tag_name}`)
  }
  updateAvailable = hasNewRelease
  return hasNewRelease
}

function digestReleaseList(releaseList) {
  const digest = releaseList.map(release => {
    return {
      name: release.name,
      published_at: release.published_at,
      tag_name: release.tag_name,
      id: release.id,
    }
  })
  return digest
}
