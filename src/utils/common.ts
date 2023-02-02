import assert from 'assert'
import {decodeAddress, encodeAddress} from './converter'
import {decodeHex} from '@subsquid/substrate-processor'
import {  Proposals, Referenda, BountiesProposals, CouncilMotions,
         Account, MotionsVotes, ReferendaVotes, SecondedGroup, 
         TechComProposals, TechComProposalsVotes, TreasuryProposals
} from '../model'

export const getAccount = (m: Map<string, Account>, id: string): Account => {
 let acc = m.get(id)
 if (acc == null) {
   acc = new Account({
     id
   })
   m.set(id, acc)
 if (String(id) === "41UnKaWcErMsBJTLfqrrZBQdqeWARKz4FQLSkVKxHjgZHhSM") {
    console.log("41UnKaWcErMsBJTLfqrrZBQdqeWARKz4FQLSkVKxHjgZHhSM added in the account database")
  }
 }
 return acc
}

export const getReferenda = (m: Map<string, Referenda>, id: string ): Referenda => {
  let props = m.get(id)
  if (props == null) {
      props = new Referenda({
                            id: id,
                            refIndex: id
                           })
    m.set(id, props)
  }
  return props
 }

 export const getProposals = (m: Map<string, Proposals>, id: string): Proposals => {
  let props = m.get(id)
  if (props == null) {
    props = new Proposals({
      id: id,
      proposalHash: id
    })
    m.set(id, props)
  }
  return props
 }


 export const getCouncilMotions = (m: Map<string, CouncilMotions>, id: string): CouncilMotions => {
  let props = m.get(id)
  if (props == null) {
    props = new CouncilMotions({
      id: id,
      proposalHash: id
    })
    m.set(id, props)
  }
  return props
 }

 export const getTreasuryProposals = (m: Map<string, TreasuryProposals>, id: string): TreasuryProposals => {
  let props = m.get(id)
  if (props == null) {
    props = new TreasuryProposals({
      id: id,
      proposalHash: id
    })
    m.set(id, props)
  }
  return props
 }

 export const getBountiesProposals = (m: Map<string, BountiesProposals>, id: string): BountiesProposals => {
  let props = m.get(id)
  if (props == null) {
    props = new BountiesProposals({
      id: id, 
      bountyHash: id
    })
    m.set(id, props)
  }
  return props
 }

 export const getTechComProposals = (m: Map<string, TechComProposals>, id: string): TechComProposals => {
  let props = m.get(id)
  if (props == null) {
    props = new TechComProposals({
      id: id,
      proposalHash: id
    })
    m.set(id, props)
  }
  return props
 }


export const join = (...args: Array<string | number | bigint>): string =>
  args.map((x) => x.toString()).join('-')

export const toMap = <T extends {id: string}>(
  a: T[],
  fn: (a: T) => string = (a) => a.id
): Map<string, T> => new Map(a.map((a) => [fn(a), a]))

export function getOriginAccountId(origin: any): string {
  // console.log("Func ===> getOriginAccount", origin)
  if (origin && origin.__kind === 'system' && origin.value.__kind === 'Signed') {
      const id = origin.value.value
      if (id.__kind === 'Id') {
          return encodeAddress(decodeHex(id.value))
      } else {
          return encodeAddress(decodeHex(id))
      }
  } else {
      return "undefined"
  }
}


