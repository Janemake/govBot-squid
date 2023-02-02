//import {Account, IdentityLevel} from '../model'
import {Ctx} from '../processor'
import {IdentityIdentityOfStorage} from '../types/storage'
//import {getAccount} from './common'
import {decodeAddress, encodeAddress} from './converter'

export const queryIdentities = async (
  ctx: Ctx, 
  block: Ctx['blocks'][number],
  accountId: Uint8Array
): Promise<string | undefined> => {
  const identityOf = new IdentityIdentityOfStorage(
    ctx, block.header
  )
  const registration = await identityOf.asV1.get(decodeAddress("42JKu2pMjtR6mzWtwgKEZb2SDBJfNma287oqvx5uErj23LDr"))

  // const account = getAccount(accountMap, accountIds[i])
  // const registration = res
  if (registration != null) {
    console.log("USER INFO =====>  ", registration)
    if ('value' in registration.info.display) {
      let identityDisplay = Buffer.from(
        registration.info.display.value
      ).toString()
    } else {
      return "No"
    }
  } else {
    return "NoRegistered"
  }
}
