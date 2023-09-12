import * as Store from 'electron-store'
import { Maybe, Nothing } from 'purify-ts/Maybe'
const dummy = {
  string: 'dummyString',
  array: ['dummyString', 1, 2, 3],
  object: { dummy: 'dummyString' },
  boolean: true,
  number: 42,
  undefined: undefined,
}
enum StorageResults {
  success,
  failure,
}

const liveStore: {
  [key: string]: boolean | string | number | object | any[]
} = {}
const store = new Store.default()

export const Storage = {
  get: (key: keyof typeof dummy): Maybe<string | number | boolean | object | any[]> => {
    return Maybe.fromNullable(liveStore[key])
      .ifNothing(() => {
        return Maybe.fromNullable(store.get(key))
      }).ifJust((val) => {
        liveStore[key] = val
        return Maybe.of(val)
      })
  },
  set: (key: string, value: any): { key: string; value: any; error: Maybe<Error> } => {
    let ret = {
      key: key,
      value: value,
      error: Maybe.fromNullable<Error>(null),
    }
    try {
      let serialized = JSON.parse(JSON.stringify(value))
      setImmediate(() => {
        // sets the value asynchronously so we can return
        // success/failure faster
        store.set(key, value)
      })
      ret.value = serialized
    } catch (err) {
      console.log(err)
      ret.error = Maybe.of<Error>(err)
    }
    return ret
  },
}

export function setStoredVariable() {
  console.log('setStoredVariable')
}