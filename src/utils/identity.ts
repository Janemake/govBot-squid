import {Account} from '../model'
import {Ctx} from '../processor'
import {IdentityIdentityOfStorage, CouncilMembersStorage} from '../types/storage'
import {getAccount} from './common'
import {decodeAddress} from './converter'

export const queryIdentities = async (
  ctx: Ctx,
  accountIds: string[],
  accountMap: Map<string, Account>
): Promise<void> => {
  const identityOf = new IdentityIdentityOfStorage(
    ctx,
    ctx.blocks[ctx.blocks.length - 1].header
  )

  const res = await identityOf.asV1.getMany(accountIds.map(decodeAddress))

  // const Members = new CouncilMembersStorage(
  //   ctx,
  //   ctx.blocks[ctx.blocks.length - 1].header
  // )

  // const councilIn = await Members.asV1090.get()


  for (let i = 0; i < res.length; i++) {
    const account = getAccount(accountMap, accountIds[i])
    const registration = res[i]
    if (registration != null) {
      if ('value' in registration.info.display) {
        account.identityDisplay = Buffer.from(
          registration.info.display.value
        ).toString()
      } else {
        account.identityDisplay = null
      }

    } else {
      account.identityDisplay = null
    }
    
    // const decodedAccount = decodeAddress(accountIds[i])
    // for (let k = 0; k < councilIn.length; k++) {
      
    //   if (decodedAccount === councilIn[k] ) {
    //       account.councilMember = "Member"
    //       console.log(" ////////////////////////////////  COUNCIL FOUND ///////////////////////////////////////////")
    //   } else {
    //     account.councilMember = "No" 
    //   }


    // }


  }
}


// export const queryCouncilMembers = async (
//   ctx: Ctx,
//   accountIds: string[],
//   accountMap: Map<string, Account>
// ): Promise<void> => {

//   const Members = new CouncilMembersStorage(
//     ctx,
//     ctx.blocks[ctx.blocks.length - 1].header
//   )

//   const councilIn = await Members.asV1090.get()


//   for (let i = 0; i < res.length; i++) {
//     const account = getAccount(accountMap, accountIds[i])
//     const registration = res[i]
//     if (registration != null) {
//       if ('value' in registration.info.display) {
//         account.identityDisplay = Buffer.from(
//           registration.info.display.value
//         ).toString()
//       } else {
//         account.identityDisplay = null
//       }

//     } else {
//       account.identityDisplay = null
//     }
    
//     // const decodedAccount = decodeAddress(accountIds[i])
//     // for (let k = 0; k < councilIn.length; k++) {
      
//     //   if (decodedAccount === councilIn[k] ) {
//     //       account.councilMember = "Member"
//     //       console.log(" ////////////////////////////////  COUNCIL FOUND ///////////////////////////////////////////")
//     //   } else {
//     //     account.councilMember = "No" 
//     //   }


//     // }


//   }
// }