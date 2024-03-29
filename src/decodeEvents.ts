//import {BigDecimal} from '@subsquid/big-decimal'
import {SubstrateBlock, toHex, decodeHex} from '@subsquid/substrate-processor'
import {Ctx} from './processor'
import {
  DemocracyProposedEvent,
  DemocracyTabledEvent,
  DemocracyExternalTabledEvent,
  DemocracySecondedEvent,
  DemocracyProposalCanceledEvent,

  DemocracyStartedEvent,
  DemocracyPassedEvent,
  DemocracyNotPassedEvent,
  DemocracyCancelledEvent,
  DemocracyVotedEvent,

  IdentityIdentitySetEvent,
  IdentityIdentityClearedEvent,
  // IdentityJudgementGivenEvent,

  BountiesBountyAwardedEvent,
  BountiesBountyBecameActiveEvent,
  BountiesBountyCanceledEvent,
  BountiesBountyClaimedEvent,
  BountiesBountyExtendedEvent,
  BountiesBountyProposedEvent,
  BountiesBountyRejectedEvent,
  
  CouncilApprovedEvent,
  CouncilClosedEvent,
  CouncilDisapprovedEvent,
  CouncilExecutedEvent,
  CouncilMemberExecutedEvent,
  CouncilProposedEvent,
  CouncilVotedEvent,
  
  // TechnicalCommitteeApprovedEvent,
  // TechnicalCommitteeClosedEvent,
  // TechnicalCommitteeDisapprovedEvent,
  TechnicalCommitteeExecutedEvent,
  // TechnicalCommitteeMemberExecutedEvent,
  // TechnicalCommitteeProposedEvent,
  // TechnicalCommitteeVotedEvent,

  PreimageNotedEvent,
  
  TreasuryAwardedEvent,
  TreasuryProposedEvent,
  TreasuryRejectedEvent,
  TreasurySpendApprovedEvent,

  PhalaStakePoolv2RewardReceivedEvent, PhalaStakePoolv2OwnerRewardsWithdrawnEvent

} from './types/events'
import {encodeAddress, encodeHash} from './utils/converter'

import {getOriginAccountId} from './utils/common'

class UknownVersionError extends Error {
  constructor() {
      super('Uknown verson')
  }
}

function unwrapData(data: {__kind: string; value?: Uint8Array}) {
  switch (data.__kind) {
      case 'Legacy':
      case 'Inline':
      case 'Lookup':
      default:
          return Buffer.from(data.value!).toString('utf-8')

  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const decodeEvent = (
  ctx: Ctx,
  block: Ctx['blocks'][number],
  item: Ctx['blocks'][number]['items'][number]
) => {
  
  let name = item.name

   
  console.log("Traitement de l'event  =====> ", name)

  switch (item.name) {

    // PROPOSALS EVENTS
    case 'Democracy.Proposed': {
      const e = new DemocracyProposedEvent(ctx, item.event)
      console.log("", )
      if (e.isV1090){
        let {proposalIndex, deposit} = e.asV1090
        return {name, 
                args: {
                      id: item.event.id,
                      proposalIndex: String(proposalIndex),
                      propTitle: "tbd",
                      proposalHash: item.event.call?.args.proposalHash,
                      address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      deposit: BigInt(deposit),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height}

        }

      } else if (e.isV1){
          
          let propData = e.asV1
          return {name, 
                  args: {
                        id: item.event.id,
                        proposalIndex: String(propData[0]),
                        propTitle: "tbd",
                        proposalHash: item.event.call?.args.proposalHash,
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        deposit: BigInt(propData[1]),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                  }
      } else {

            return null
      }

    }
    
    case 'Democracy.Tabled': {
      const e = new DemocracyTabledEvent(ctx, item.event)
      if (e.isV1090){
        let {proposalIndex, deposit} = e.asV1090
      
        return {name, 
                args: {
                      id: item.event.id,
                      proposalIndex: String(proposalIndex),
                      deposit: BigInt(deposit),
                      eventHash: block.header.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height}
        }

      } else if (e.isV1199){
        let {proposalIndex, deposit} = e.asV1199
      
        return {name, 
                args: {
                      id: item.event.id,
                      proposalIndex: String(proposalIndex),
                      deposit: BigInt(deposit),
                      eventHash: block.header.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
        }
                    

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                    id: item.event.id,
                        proposalIndex: String(propData[0]),
                        deposit: BigInt(propData[1]),
                        eventHash: block.header.hash,

                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                    }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }


    }
    
    case 'Democracy.Seconded': {
      const e = new DemocracySecondedEvent(ctx, item.event)
      if (e.isV1110){
        let {seconder, propIndex} = e.asV1110    
        return {name, 
                args: {
                       id: item.event.id,
                       proposalIndex: String(propIndex),
                       address: encodeAddress(seconder),
                       nbSeconder: item.event.extrinsic?.call.args.secondsUpperBound,
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                      }
                    }
      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }
    
    case 'Democracy.ExternalTabled': {
      const e = new DemocracyExternalTabledEvent(ctx, item.event)
      if (e.isV1){
        // let {propIndex} = e.asV1   

        return {name, 
                args: {
                      id: item.event.id,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }
      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }

    case 'Democracy.ProposalCanceled': {
      const e = new DemocracyProposalCanceledEvent(ctx, item.event)
      if (e.isV1170){
        let {propIndex} = e.asV1170    
        return {name, 
                args: {
                       id: item.event.id,
                       proposalIndex: String(propIndex),
                       proposalHash: item.event.extrinsic?.call.args.proposalHash,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }
      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }



    // IDENTITY EVENTS
    case 'Identity.IdentitySet': {
      const e = new IdentityIdentitySetEvent(ctx, item.event)
      // console.log("::::::::::: IDENTITY SET ::::::::", item.event.call?.args)
      // console.log("::::::::::: IDENTITY SET ::::::::", item.event.extrinsic)
      // if (item.event.call?.name == 'Identity.set_identity') {
      //   console.log("::::::::::: IDENTITY ::::::::", encodeHash(decodeHex(item.event.call?.args.info.display.value)))
      // }
      // if (item.event.call?.args.info.display.__kind != 'None') {
      //   console.log("::::::::::: IDENTITY ::::::::", encodeHash(decodeHex(item.event.call?.args.info.display.value)))
      // }
      // console.log("::::::::::: IDENTITY ::::::::", Buffer.from(item.event.call?.args.info.display.value).toString())
      if (e.isV1090){
        let {who} = e.asV1090
        return {name, 
                args: {whoAddress: encodeAddress(who),
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                    }
                }
      } else if (e.isV1){
          let who= e.asV1
          return {name, 
                  args: {whoAddress: encodeAddress(who),
                          eventDate: new Date(block.header.timestamp),
                          eventblockHeight: block.header.height
                      }
                  }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }      
    }
    case 'Identity.IdentityCleared': {
      const e = new IdentityIdentityClearedEvent(ctx, item.event)
      if (e.isV1090){
        let {who} = e.asV1090
        return {name, 
                args: {whoAddress: encodeAddress(who),
                        eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                  }

      } else if (e.isV1){
          let who= e.asV1
          return {name, 
                  args: { whoAddress: encodeAddress(who[0]),
                          eventDate: new Date(block.header.timestamp),
                          eventblockHeight: block.header.height}
                  }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }      
    }

    // REFERENDUMS EVENTS
    case 'Democracy.Cancelled': {
      const e = new DemocracyCancelledEvent(ctx, item.event)

      if (e.isV1090){
        let {refIndex} = e.asV1090	
      
        return {name, 
                args: {
                  id: item.event.id,
                  proposalIndex: String(refIndex),
                  eventHash: item.event.extrinsic?.hash,
                  eventDate: new Date(block.header.timestamp),
                  eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                        id: item.event.id,
                        proposalIndex: String(propData),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
  
    }
    
    case 'Democracy.NotPassed': {
      const e = new DemocracyNotPassedEvent(ctx, item.event)
      if (e.isV1090){
        let {refIndex} = e.asV1090	
        return {name, 
                args: {
                      id: item.event.id,
                      proposalIndex: String(refIndex),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                        id: item.event.id,
                        proposalIndex: String(propData),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }
    
    case 'Democracy.Passed': {
      const e = new DemocracyPassedEvent(ctx, item.event)
      if (e.isV1090){
        let {refIndex} = e.asV1090	
      
        return {name, 
                args: {
                      id: item.event.id,
                      proposalIndex: String(refIndex),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                          id: item.event.id,
                          proposalIndex: String(propData),
                          eventHash: item.event.extrinsic?.hash,
                          eventDate: new Date(block.header.timestamp),
                          eventblockHeight: block.header.height
                        }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }[]
     
    case 'Democracy.Started': {
      const e = new DemocracyStartedEvent(ctx, item.event)
      let address = "tbd"
      if (item.event.extrinsic?.call.origin != undefined) {
          address = getOriginAccountId(item.event.extrinsic?.call.origin)
      } else {
          address = "undefined"
      }

      if (e.isV1090){
        let {refIndex, threshold} = e.asV1090
        return {name, 
                args: {
                       id: item.event.id,
                       proposalIndex: String(refIndex),
                       voteType: item.event.args.threshold.__kind,
                       phase: item.event.phase,
                       propTitle: "tbd",
                       proposalHash: item.event.call?.args.proposal.value.proposalHash,
                       address: address,
                       eventSource:  item.event.call?.name,
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                    id: item.event.id,
                        proposalIndex: String(propData[0]),
                        voteType: item.event.args[1].__kind,
                        phase: item.event.phase,
                        propTitle: "tbd",
                        proposalHash: item.event.call?.args.proposal.value.proposalHash,
                        address: address,
                        eventSource:  item.event.call?.name,
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }
  
    case 'Democracy.Voted': {
      const e = new DemocracyVotedEvent(ctx, item.event)
      // console.log("Type =====> ", String(item.event.args.vote.__kind))      
      // console.log("Balance =====> ", BigInt(item.event.args.vote.balance))
      if (e.isV1110){
        let {voter, refIndex, vote} = e.asV1110
        return {name, 
                args: {
                  id: item.event.id,
                       proposalIndex: String(refIndex),
                       address: encodeAddress(voter),
                       voteType: String(item.event.args.vote.__kind),
                       balance: BigInt(item.event.args.vote.balance),
                       vote: String(item.event.args.vote.vote),
                       nbAyes: BigInt(0),
                       nbNay: BigInt(0),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                      }
        }
      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }

    }
    
     // TechnicalCommittee EVENTS   
    //  case 'TechnicalCommittee.Proposed': {
    //   const e = new TechnicalCommitteeProposedEvent(ctx, item.event)

    //   if (e.isV1090){
    //     let {account, proposalIndex, proposalHash, threshold} = e.asV1090

    //     return {name, 
    //             args: {
    //                     id: item.event.id,
    //                     proposalIndex: String(proposalIndex),
    //                     voteType: String(threshold),
    //                     address: encodeAddress(account),
    //                     hash: item.event.call?.args.proposal.proposalHash,
    //                     title: "tbd",
    //                     eventHash: item.event.extrinsic?.hash,
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1){
    //       let propData = e.asV1
    //       return {name, 
    //               args: {
    //                     id: item.event.id,
    //                     proposalIndex: String(propData[1]),
    //                     voteType: propData[3],
    //                     creator: encodeAddress(propData[0]),
    //                     hash: item.event.call?.args.proposal.proposalHash,
    //                     title: "tbd",
    //                     eventHash: item.event.extrinsic?.hash,
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height}
    //             }
    //   } else {
    //         console.log(item.name, " Type not available:", e)
    //         return null
    //   }
    // }

    // case 'TechnicalCommittee.Approved': {
    //   const e = new TechnicalCommitteeApprovedEvent(ctx, item.event)
    //   if (e.isV1090){
    //     let {proposalHash} = e.asV1090
    //     return {name, 
    //             args: {
    //                   id: item.event.id,
    //                    proposalHash: item.event.call?.args.proposal.proposalHash,
    //                    eventHash: item.event.extrinsic?.hash,
    //                    eventDate: new Date(block.header.timestamp),
    //                    eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1){
    //       let propData = e.asV1
    //       return {name, 
    //               args: {
    //                     id: item.event.id,
    //                     pproposalHash: item.event.call?.args.proposal.proposalHash,
    //                     eventHash: item.event.extrinsic?.hash,
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height
    //                   }
    //             }
    //   } else {
    //         console.log(item.name, " Type not available:", e)
    //         return null
    //   }
    // }

    // case 'TechnicalCommittee.Closed': {
    //   const e = new TechnicalCommitteeClosedEvent(ctx, item.event)
    //   /**
    //   * A proposal was closed because its threshold was reached or after its duration was up.
    //   */
    //   if (e.isV1090){
    //     let {proposalHash, yes, no} = e.asV1090

    //     return {name, 
    //             args: {
    //                     id: item.event.id,
                  
    //                    hash: item.event.call?.args.proposal.proposalHash,
    //                    yesThreshold: yes,
    //                    noThreshold: no,
    //                    eventHash: item.event.extrinsic?.hash,
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1){
    //       let propData = e.asV1
    //       return {name, 
    //               args: {
    //                      id: item.event.id,
                    
    //                     hash: item.event.call?.args.proposal.proposalHash,
    //                     yesThreshold: propData[1],
    //                     noThreshold: propData[2],
    //                     eventHash: item.event.extrinsic?.hash,
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height}
    //             }
    //   } else {
    //         console.log(item.name, " Type not available:", e)
    //         return null
    //   }
    // }

    // case 'TechnicalCommittee.Disapproved': {
    //   const e = new TechnicalCommitteeDisapprovedEvent(ctx, item.event)
    //   if (e.isV1090){
    //     let {proposalHash} = e.asV1090
    //     return {name, 
    //             args: {
    //               id: item.event.id,
                  
    //                   proposalHash: item.event.call?.args.proposal.proposalHash,
    //                   eventHash: item.event.extrinsic?.hash,
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1){
    //       let propData = e.asV1
    //       return {name, 
    //               args: {
    //                 id: item.event.id,
    //                     pproposalHash: item.event.call?.args.proposal.proposalHash,
    //                     eventHash: item.event.extrinsic?.hash,
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height}
    //             }
    //   } else {
    //         console.log(item.name, " Type not available:", e)
    //         return null
    //   }
    // }

    case 'TechnicalCommittee.Executed': {
      const e = new TechnicalCommitteeExecutedEvent(ctx, item.event)
      // console.log("\n\n Event \n\n", item.event)
      let prophash = item.event.call?.args.proposal.value.proposalHash


      if (e.isV1090){
        let {proposalHash, result} = e.asV1090
  
        return {name, 
                args: {
                        id: item.event.id,
                        resultVote: result,
                        threshold: String(item.event.call?.args.threshold),
                        hash: prophash,
                        title: "tbd",
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        propSource: String(item.event.call?.args.proposal.__kind),
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1110){
        let {proposalHash, result} = e.asV1110
        return {name, 
                args: {
                      id: item.event.id,
                      resultVote: result,
                      threshold: String(item.event.call?.args.threshold),
                      hash: prophash,
                       title: "tbd",
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       propSource: String(item.event.call?.args.proposal.__kind),
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1120){
        let {proposalHash, result} = e.asV1120
        return {name, 
                args: {
                      id: item.event.id,
                      resultVote: result,
                      threshold: String(item.event.call?.args.threshold),
                      hash: prophash,
                       title: "tbd",
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       propSource: String(item.event.call?.args.proposal.__kind),
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1140){
        let {proposalHash, result} = e.asV1140
        return {name, 
                args: {
                      id: item.event.id,
                      resultVote: result,
                      threshold: String(item.event.call?.args.threshold),
                      hash: prophash,
                       title: "tbd",
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       propSource: String(item.event.call?.args.proposal.__kind),
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1199){
        let {proposalHash, result} = e.asV1199
        return {name, 
                args: {
                        id: item.event.id,
                        resultVote: result,
                        threshold: String(item.event.call?.args.threshold),
                        hash: prophash,
                        title: "tbd",
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        propSource: String(item.event.call?.args.proposal.__kind),
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          // console.log("\n\nproposal Hash  =====> \n\n", propData[0])
          return {name, 
                  args: {
                        id: item.event.id,
                        resultVote: propData[1],
                        threshold: String(item.event.call?.args.threshold),
                        hash: prophash,
                        title: "tbd",
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        propSource: String(item.event.call?.args.proposal.__kind),
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    // case 'TechnicalCommittee.MemberExecuted': {
    //   const e = new TechnicalCommitteeMemberExecutedEvent(ctx, item.event)

    //   if (e.isV1090){
    //     let {proposalHash, result} = e.asV1090

    //     return {name, 
    //             args: {
    //               id: item.event.id,
    //               resultVote: result,
    //                    hash: item.event.call?.args.proposal.proposalHash,
    //                    address: getOriginAccountId(item.event.extrinsic?.call.origin),
    //                    eventHash: item.event.extrinsic?.hash,
    //                    propSource: String(item.event.call?.args.proposal.__kind),
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1110){
    //     let {proposalHash, result} = e.asV1110

    //     return {name, 
    //             args: {
    //               id: item.event.id,
    //               resultVote: result,
    //                    hash: item.event.call?.args.proposal.proposalHash,
    //                    address: getOriginAccountId(item.event.extrinsic?.call.origin),
    //                    eventHash: item.event.extrinsic?.hash,
    //                    propSource: String(item.event.call?.args.proposal.__kind),
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1120){
    //     let {proposalHash, result} = e.asV1120

    //     return {name, 
    //             args: {
    //                       id: item.event.id,
    //                       resultVote: result,
    //                       hash: item.event.call?.args.proposal.proposalHash,
    //                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
    //                       eventHash: item.event.extrinsic?.hash,
    //                       propSource: String(item.event.call?.args.proposal.__kind),
    //                       eventDate: new Date(block.header.timestamp),
    //                       eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1140){
    //     let {proposalHash, result} = e.asV1140

    //     return {name, 
    //             args: {
    //                   id: item.event.id,
    //                   resultVote: result,
    //                    hash: item.event.call?.args.proposal.proposalHash,
    //                    address: getOriginAccountId(item.event.extrinsic?.call.origin),
    //                    eventHash: item.event.extrinsic?.hash,
    //                    propSource: String(item.event.call?.args.proposal.__kind),
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1199){
    //     let {proposalHash, result} = e.asV1199

    //     return {name, 
    //             args: {
    //                   id: item.event.id,
    //                   resultVote: result,
    //                    hash: item.event.call?.args.proposal.proposalHash,
    //                    address: getOriginAccountId(item.event.extrinsic?.call.origin),
    //                    eventHash: item.event.extrinsic?.hash,
    //                    propSource: String(item.event.call?.args.proposal.__kind),
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1){
    //       let propData = e.asV1
    //       return {name, 
    //               args: {
    //                     id: item.event.id,
    //                     resultVote: propData[1],
    //                     hash: item.event.call?.args.proposal.proposalHash,
    //                     address: getOriginAccountId(item.event.extrinsic?.call.origin),
    //                     eventHash: item.event.extrinsic?.hash,
    //                     propSource: String(item.event.call?.args.proposal.__kind),
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height}
    //             }
    //   } else {
    //         console.log(item.name, " Type not available:", e)
    //         return null
    //   }
    // }

    // case 'TechnicalCommittee.Voted': {
    //   const e = new TechnicalCommitteeVotedEvent(ctx, item.event)
    //   // const {refIndex, threshold} = e.asV1090
    //   if (e.isV1090){
    //     let {account, proposalHash, voted, yes, no} = e.asV1090

    //     return {name, 
    //             args: {id: item.event.id,
    //                    voter: encodeAddress(account),
    //                    hash: item.event.call?.args.proposal.proposalHash,
    //                    title: "tbd",
    //                    voteStatus: voted,
    //                    yesCount: yes,
    //                    noCount: no,
    //                    eventHash: item.event.extrinsic?.hash,
    //                   eventDate: new Date(block.header.timestamp),
    //                   eventblockHeight: block.header.height
    //                 }
    //             }

    //   } else if (e.isV1){
    //       let propData = e.asV1
    //       return {name, 
    //               args: {id: item.event.id,
    //                     voter: encodeAddress(propData[0]),
    //                     hash: item.event.call?.args.proposal.proposalHash,
    //                     voteStatus: propData[2],
    //                     yesCount: propData[3],
    //                     noCount: propData[4],
    //                     eventHash: item.event.extrinsic?.hash,
    //                     eventDate: new Date(block.header.timestamp),
    //                     eventblockHeight: block.header.height}
    //                 }
    //   } else {
    //         console.log(item.name, " Type not available:", e)
    //         return null
    //   }
    // }

    // Council EVENTS 
    case 'Council.Proposed': {
      const e = new CouncilProposedEvent(ctx, item.event)
      // console.log("\n\n Council :", item.event)
      if (e.isV1090){
        let {account, proposalIndex, proposalHash, threshold} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(proposalIndex),
                       lengthBound: item.event.call?.args.lengthBound,
                       voteType: threshold,
                       address: encodeAddress(account),
                       hash: item.event.call?.args.proposalHash,
                       title: "tbd",
                       propSource: String(item.event.call?.args.proposal.__kind),
                       eventSource: String(item.event.call?.args.proposal.value.__kind),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1     
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(propData[1]),
                        lengthBound: item.event.call?.args.lengthBound,
                        voteType: propData[3],
                        creator: encodeAddress(propData[0]),
                        hash: item.event.call?.args.proposalHash,
                        title: "tbd",
                        propSource: String(item.event.call?.args.proposal.__kind),
                        eventSource: String(item.event.call?.args.proposal.value.__kind),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Council.Approved': {
      const e = new CouncilApprovedEvent(ctx, item.event)
      if (e.isV1090){
        let {proposalHash} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       hash: item.event.call?.args.proposalHash,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                        id: item.event.id,
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        hash: item.event.call?.args.proposalHash,
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Council.Closed': {
      const e = new CouncilClosedEvent(ctx, item.event)
      /**
      * A proposal was closed because its threshold was reached or after its duration was up.
      */

      if (e.isV1090){
        let {proposalHash, yes, no} = e.asV1090

        return {name, 
                args: {
                        id: item.event.id,
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        hash: item.event.call?.args.proposalHash,
                        yesThreshold: yes,
                        noThreshold: no,
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                        id: item.event.id,
                        hash: item.event.call?.args.proposalHash,
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        title: "tbd",                       
                        yesThreshold: propData[1],
                        noThreshold: propData[2],
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Council.Disapproved': {
      const e = new CouncilDisapprovedEvent(ctx, item.event)
      if (e.isV1090){
        let {proposalHash} = e.asV1090
        return {name, 
                args: {
                        id: item.event.id,
                       hash: item.event.call?.args.proposalHash,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {
                        id: item.event.id,
                        hash: item.event.call?.args.proposalHash,
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Council.Executed': {
      const e = new CouncilExecutedEvent(ctx, item.event)
      // console.log(item.event)
      if (e.isV1090){
        let {proposalHash, result} = e.asV1090
        // console.log("Results  =====> \n", result)
        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       hash: item.event.call?.args.proposalHash,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1110){
        let {proposalHash, result} = e.asV1110

        return {name, 
                args: {id: item.event.id,
                      resultVote: result,
                       hash: item.event.call?.args.proposalHash,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1120){
        let {proposalHash, result} = e.asV1120

        return {name, 
                args: {id: item.event.id,
                      resultVote: result,
                       hash: item.event.call?.args.proposalHash,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1140){
        let {proposalHash, result} = e.asV1140

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       hash: item.event.call?.args.proposalHash,                       
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1199){
        let {proposalHash, result} = e.asV1199

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       hash: item.event.call?.args.proposalHash,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                         resultVote: propData[1],
                        hash: item.event.call?.args.proposalHash,
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Council.MemberExecuted': {
      const e = new CouncilMemberExecutedEvent(ctx, item.event)
      if (e.isV1090){
        let {proposalHash, result} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       hash: item.event.call?.args.proposalHash,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1110){
        let {proposalHash, result} = e.asV1110

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       hash: item.event.call?.args.proposalHash,
                       title: "tbd",
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1120){
        let {proposalHash, result} = e.asV1120

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       hash: item.event.call?.args.proposalHash,
                       title: "tbd",
                      //  proposalHash: item.event.extrinsic?.call.args.proposalHash,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      // deposit: BigInt(deposit)},
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1140){
        let {proposalHash, result} = e.asV1140

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       hash: item.event.call?.args.proposalHash,
                       title: "tbd",
                      //  proposalHash: item.event.extrinsic?.call.args.proposalHash,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      // deposit: BigInt(deposit)},
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1199){
        let {proposalHash, result} = e.asV1199

        return {name, 
                args: {id: item.event.id,
                       resultVote: result,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       hash: item.event.call?.args.proposalHash,
                       title: "tbd",
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      // deposit: BigInt(deposit)},
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        resultVote: propData[1],
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        hash: item.event.call?.args.proposalHash,
                        title: "tbd",
                        // proposalHash: item.event.extrinsic?.call.args.proposalHash,
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        // deposit: String(propData[1])},
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height}
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Council.Voted': {
      const e = new CouncilVotedEvent(ctx, item.event)
      // console.log("\n\n Council.Voted:", item.event)
      if (e.isV1090){
        let {account, proposalHash, voted, yes, no} = e.asV1090
        // console.log("Council.Voted  Hash =====> \n", encodeHash(decodeHex(proposalHash)))
        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(item.event.call?.args.index),
                       lengthBound: item.event.call?.args.lengthBound,
                       address: encodeAddress(account),
                       hash: item.event.call?.args.proposalHash,
                       voteStatus: voted,
                       yesCount: yes,
                       noCount: no,
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(item.event.call?.args.index),
                        lengthBound: item.event.call?.args.lengthBound,
                        address: encodeAddress(propData[0]),
                        hash: item.event.call?.args.proposalHash,
                        voteStatus: propData[2],
                        yesCount: propData[3],
                        noCount: propData[4],
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                        }
                    }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    // Bounties EVENTS 
    case 'Bounties.BountyAwarded': {
      const e = new BountiesBountyAwardedEvent(ctx, item.event)

      if (e.isV1090){
        let {index, beneficiary} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(index),
                       address: encodeAddress(beneficiary),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                         proposalIndex: String(propData[0]),
                        address: encodeAddress(propData[1]),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Bounties.BountyBecameActive': {
      const e = new BountiesBountyBecameActiveEvent(ctx, item.event)

      if (e.isV1090){
        let {index} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(index),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(propData),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Bounties.BountyCanceled': {
      const e = new BountiesBountyCanceledEvent(ctx, item.event)

      if (e.isV1090){
        let {index} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                      proposalIndex: String(index),
                      address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(propData),
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Bounties.BountyClaimed': {
      const e = new BountiesBountyClaimedEvent(ctx, item.event)

      if (e.isV1090){
        let {index, payout, beneficiary} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(index),
                       bountyPayout: BigInt(payout),
                       address: encodeAddress(beneficiary),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                         proposalIndex: String(propData[0]),
                        bountyPayout: BigInt(propData[1]),
                        address: encodeAddress(propData[2]),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Bounties.BountyExtended': {
      const e = new BountiesBountyExtendedEvent(ctx, item.event)
      
      if (e.isV1090){
        let {index} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(index),
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(propData),
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Bounties.BountyProposed': {
      const e = new BountiesBountyProposedEvent(ctx, item.event)

      if (e.isV1090){
        let {index} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(index),
                       title: encodeHash(decodeHex(item.event.call?.args.description)),
                       bountyPayout: BigInt(item.event.extrinsic?.call.args.value),
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(propData),
                        title: encodeHash(decodeHex(item.event.call?.args.description)),
                        bountyPayout: BigInt(item.event.extrinsic?.call.args.value),
                        address: getOriginAccountId(item.event.extrinsic?.call.origin),
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }

    case 'Bounties.BountyRejected': {
      const e = new BountiesBountyRejectedEvent(ctx, item.event)

      if (e.isV1090){
        let {index, bond} = e.asV1090

        return {name, 
                args: {id: item.event.id,
                       proposalIndex: String(index),
                       bondAmount: BigInt(bond),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                }
        }

      } else if (e.isV1){
          let propData = e.asV1
          return {name, 
                  args: {id: item.event.id,
                        proposalIndex: String(propData[0]),
                        bondAmount: BigInt(propData[1]),
                        eventHash: item.event.extrinsic?.hash,
                        eventDate: new Date(block.header.timestamp),
                        eventblockHeight: block.header.height
                      }
                }
      } else {
            console.log(item.name, " Type not available:", e)
            return null
      }
    }


    // Treasury EVENTS 
    case 'Treasury.Awarded': {
      const e = new TreasuryAwardedEvent(ctx, item.event)

      if (e.isV1110){
        let {proposalIndex, award, account} = e.asV1110

        return {name, 
          args: {id: item.event.id,
                proposalIndex: String(proposalIndex),
                awardAccount: encodeAddress(account),
                awardAmount: BigInt(award),
                eventHash: item.event.extrinsic?.hash,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
              }
          }

      } else if (e.isV1){

        let propData = e.asV1
        return {name, 
                args: {id: item.event.id,
                      proposalIndex: String(propData[0]),
                      awardAccount: encodeAddress(propData[2]),
                      awardAmount: BigInt(propData[1]),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
              }

      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }

    case 'Treasury.Proposed': {
      const e = new TreasuryProposedEvent(ctx, item.event)
      // console.log("TREASURY BENEF:::::::: =======>>>>>", item.event.extrinsic?.call.args)
      if (e.isV1110){
        let {proposalIndex} = e.asV1110

        return {name, 
          args: {id: item.event.id,
                proposalIndex: String(proposalIndex),
                awardAccount: encodeAddress(decodeHex(item.event.extrinsic?.call.args.beneficiary.value)),
                title: "tbd",
                address: getOriginAccountId(item.event.extrinsic?.call.origin),
                awardAmount: BigInt(item.event.extrinsic?.call.args.value),
                eventHash: item.event.extrinsic?.hash,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
              }
          }

      } else if (e.isV1){
        let propData = e.asV1
        return {name, 
                args: {id: item.event.id,
                      proposalIndex: String(propData),
                      awardAccount: encodeAddress(decodeHex(item.event.extrinsic?.call.args.beneficiary.value)),
                      title: "tbd",
                      address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      awardAmount: BigInt(item.event.extrinsic?.call.args.value),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
              }
      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }

    case 'Treasury.Rejected': {
      const e = new TreasuryRejectedEvent(ctx, item.event)
      if (e.isV1110){
        let {proposalIndex, slashed} = e.asV1110

        return {name, 
          args: {id: item.event.id,
                proposalIndex: String(proposalIndex),
                address: getOriginAccountId(item.event.extrinsic?.call.origin),
                slashedAmount: BigInt(slashed),
                eventHash: item.event.extrinsic?.hash,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
              }
          }

      } else if (e.isV1){
        let propData = e.asV1
        return {name, 
                args: {id: item.event.id,
                      proposalIndex: String(propData[0]),
                      title: "tbd",
                      address: getOriginAccountId(item.event.extrinsic?.call.origin),
                      slashedAmount: BigInt(propData[1]),
                      eventHash: item.event.extrinsic?.hash,
                      eventDate: new Date(block.header.timestamp),
                      eventblockHeight: block.header.height
                    }
              }
      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }

    case 'Treasury.SpendApproved': {
      const e = new TreasurySpendApprovedEvent(ctx, item.event)

      if (e.isV1170){
        let {proposalIndex, amount,  beneficiary} = e.asV1170

        return {name, 
          args: {id: item.event.id,
                proposalIndex: String(proposalIndex),
                awardAccount: encodeAddress( beneficiary),
                address: getOriginAccountId(item.event.extrinsic?.call.origin),
                awardAmount: BigInt(amount),
                eventHash: item.event.extrinsic?.hash,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
              }
          }

      } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }

    case 'Preimage.Noted': {
      const e = new PreimageNotedEvent(ctx, item.event)
      // console.log("\n\n Bounties events ::::", item.event)
      // console.log("\n\n Bounties Call ::::", item.event.call)
      if (e.isV1110){
        let {hash} = e.asV1110

        return {name, 
                args: {id: item.event.id,
                       proposalHash: item.event.args.hash,
                       proposalData: item.event.call?.args.bytes,
                       address: getOriginAccountId(item.event.extrinsic?.call.origin),
                       eventHash: item.event.extrinsic?.hash,
                       eventDate: new Date(block.header.timestamp),
                       eventblockHeight: block.header.height
                    }
                }
        } else {
          console.log(item.name, " Type not available:", e)
          return null
      }
    }



  }
}

const decodeEvents = (
  ctx: Ctx
): Array<
  Exclude<ReturnType<typeof decodeEvent>, undefined> & {
    block: SubstrateBlock
  }
> => {
  const decodedEvents = []

  for (const block of ctx.blocks) {
    for (const item of block.items) {
      if (item.kind == 'event') {
        const decoded = decodeEvent(ctx, block, item)
        if (decoded != null) {
          decodedEvents.push({...decoded, block: block.header})
        }
      }
    }
  }

  return decodedEvents
}

export default decodeEvents
