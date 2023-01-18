import assert from 'assert'
// import {Account} from '../model'

// export const getAccount = (m: Map<string, Account>, id: string): Account => {
//  let acc = m.get(id)
//  if (acc == null) {
//    acc = new Account({
//      id
//    })
//    m.set(id, acc)
//  }
//  return acc
// }

export const assertGet = <T, U>(map: Map<U, T>, key: U): T => {
 const value = map.get(key)
  assert(value)
  return value
}

export const join = (...args: Array<string | number | bigint>): string =>
  args.map((x) => x.toString()).join('-')

export const toMap = <T extends {id: string}>(
  a: T[],
  fn: (a: T) => string = (a) => a.id
): Map<string, T> => new Map(a.map((a) => [fn(a), a]))

