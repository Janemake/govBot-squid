import {Account} from '../model'
import {Ctx} from '../processor'
import {IdentityIdentityOfStorage, CouncilMembersStorage, TechnicalCommitteeMembersStorage} from '../types/storage'
import {getAccount} from './common'
import {decodeAddress, encodeAddress} from './converter'

export const queryIdentities = async (
  ctx: Ctx,
  accountIds: string[],
  accountMap: Map<string, Account>
): Promise<void> => {
  const identityOf = new IdentityIdentityOfStorage(
    ctx,
    ctx.blocks[ctx.blocks.length - 1].header
  )

  // const Members = new CouncilMembersStorage(
  //   ctx,
  //   ctx.blocks[ctx.blocks.length - 1].header
  // )

  // const TechMembers = new TechnicalCommitteeMembersStorage(
  //   ctx,
  //   ctx.blocks[ctx.blocks.length - 1].header
  // )

  const res = await identityOf.asV1.getMany(accountIds.map(decodeAddress))

  // if (Members.isV1090) {
  //   const res_members = await Members.asV1090.get()
  // }

  // if (TechMembers.isV1090) {
  //   const res_tech = await TechMembers.asV1090.get() 
  // } 


  for (let i = 0; i < res.length; i++) {
    const account = getAccount(accountMap, accountIds[i])
    const registration = res[i]
    if (registration != null) {
      // console.log(" //// REGIST //////", registration)
      if ('value' in registration.info.display) {
        account.identityDisplay = Buffer.from(registration.info.display.value).toString()
      } else {
        account.identityDisplay = null
      }

    } else {
      account.identityDisplay = null
    }
    
  }
}


export const queryCouncilMembers = async (
  ctx: Ctx,
  accountMap: Map<string, Account>
): Promise<void> => {

  const Members = new CouncilMembersStorage(
    ctx,
    ctx.blocks[ctx.blocks.length - 1].header
  )

  if (Members.isV1090) {
    const res = await Members.asV1090.get()

    for (let i = 0; i < res.length; i++) {  
      let encodedAccount = encodeAddress(res[i])
      let account = getAccount(accountMap, encodedAccount)
      account.councilMember = "Member"
      // console.log(" //// COUNCIL FOUND //////", account)
    }
  }
  
  const TechMembers = new TechnicalCommitteeMembersStorage(
    ctx,
    ctx.blocks[ctx.blocks.length - 1].header
  )

  if (TechMembers.isV1090) {
    const res = await TechMembers.asV1090.get()

    for (let i = 0; i < res.length; i++) {  
      let encodedAccount = encodeAddress(res[i])
      let account = getAccount(accountMap, encodedAccount)
      account.technicalCommitteeMember= "Technical Member"
      // console.log(" //// TECHNICAL COMMITEE FOUND //////", account)
    }
  }

}