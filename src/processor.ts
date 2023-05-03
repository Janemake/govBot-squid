
//import {BigDecimal} from '@subsquid/big-decimal'
import {lookupArchive} from '@subsquid/archive-registry'
import {BatchBlock, BlockRangeOption, DataSource} from '@subsquid/substrate-processor'
import {
  BatchContext, decodeHex, 
  BatchProcessorItem, 
  SubstrateBatchProcessor,
  SubstrateBlock
} from '@subsquid/substrate-processor'
import {CallItem, EventItem} from '@subsquid/substrate-processor/lib/interfaces/dataSelection'
import {Store, TypeormDatabase} from '@subsquid/typeorm-store'
//import {PalletReferendaTrackInfo } from '@polkadot/types/lookup';
import assert from 'assert'
import {In} from 'typeorm'
import {decodeAddress, encodeAddress} from './utils/converter'
import {IdentityIdentityOfStorage} from './types/storage'

import decodeEvents from './decodeEvents'
import {
  Proposals, Referenda, BountiesProposals, CouncilMotions,
  Account, MotionsVotes, ReferendaVotes, SecondedGroup, 
  TechComProposals, TechComProposalsVotes,  
  TreasuryProposals, AllEvents, EventPreImageNote 
} from './model'

import {getAccount,
        getProposals, 
        getReferenda, 
        getCouncilMotions, 
        getTreasuryProposals,
        getTechComProposals,
        getBountiesProposals,
        join, toMap
} from './utils/common'

import {queryIdentities,
  queryCouncilMembers        
} from './utils/identity'
import { Block } from './types/support'

// const eventOptions = {
//   data: {
//       event: {
//           args: true,
//           extrinsic: true,
//       },

//   } as const,
// } as const

// const eventOptionsWithCall = {
//   data: {
//       event: {
//           args: true,
//           call: true,
//           extrinsic: true
//       }, 
//   } as const,
// } as const

// const eventOptionsWithCallArgs = {
//   data: {
//       event: {
//           args: true,
//           call: {
//             args: true
//           },
//           extrinsic: {
//             hash: true,
//             call: true
//           }

//       },
//   } as const,
// } as const

// const eventOptionsWithPhase = {
//   data: {
//       event: {
//           args: true,
//           call: {
//                   args: true,
//                   // name: true
//           },
//           extrinsic: {
//                     hash: true,
//                     call: true
//           },
//           phase:true

//       },
//   } as const,
// } as const

// const eventOptionsNoExtrinsic = {
//   data: {
//       event: {
//           args: true
//       }
//   } as const,
// } as const

// const eventOptionsExtrinsicCall = {
//   data: {
//       event: {
//           args: true,
//           extrinsic: {
//               hash: true,
//               call: true
//           }
//       }
//   } as const,
// } as const

// const eventOptionsExtrinsicHash = {
//   data: {
//       event: {
//           args: true,
//           extrinsic: {
//               hash: true
//           }
//       }
//   } as const,
// } as const

const eventOptions = {
  data: {
      event: {
          args: true,
          extrinsic: true,
      },

  } as const,
} as const

const eventOptionsWithCall = {
  data: {
      event: {
          args: true,
          call: true,
          extrinsic: true
      }, 
  } as const,
} as const

const eventOptionsWithCallArgs = {
  data: {
      event: {
          args: true,
          call: true,
          extrinsic:true
      },
  } as const,
} as const

const eventOptionsWithPhase = {
  data: {
      event: {
          args: true,
          call: true,
          extrinsic: true,
          phase:true
      },
  } as const,
} as const

const eventOptionsNoExtrinsic = {
  data: {
      event: {
          args: true
      }
  } as const,
} as const

const eventOptionsExtrinsicCall = {
  data: {
      event: {
          args: true,
          extrinsic: true
      }
  } as const,
} as const

const eventOptionsExtrinsicHash = {
  data: {
      event: {
          args: true,
          extrinsic: true
      }
  } as const,
} as const


const processor = new SubstrateBatchProcessor()

.setDataSource({
  // Lookup archive by the network name in the Subsquid registry
  archive: lookupArchive("khala", {release: "FireSquid"}),
  chain: 'wss://priv-api.phala.network/khala/ws',
})
// .setBlockRange({ from:  2827620})

// PROPOSALS EVENTS
.addEvent("Democracy.Proposed", eventOptionsExtrinsicCall)

.addEvent("Democracy.Tabled", eventOptionsNoExtrinsic)

.addEvent("Democracy.ExternalTabled", eventOptionsNoExtrinsic)

.addEvent("Democracy.Seconded", eventOptionsExtrinsicCall)
.addEvent("Democracy.ProposalCanceled", eventOptionsExtrinsicCall)

// IDENTITY EVENTS

.addEvent("Identity.IdentitySet", eventOptionsWithCall)
.addEvent("Identity.IdentityCleared" , eventOptionsWithCall)

// REFERENDA EVENTS
.addEvent("Democracy.Started", eventOptionsWithPhase)
.addEvent("Democracy.Passed", eventOptionsExtrinsicHash )
.addEvent("Democracy.NotPassed", eventOptionsExtrinsicHash )
.addEvent("Democracy.Cancelled", eventOptionsExtrinsicHash )
.addEvent("Democracy.Voted", eventOptionsExtrinsicHash)

// TechnicalCommittee EVENTS
// .addEvent("TechnicalCommittee.Proposed", eventOptionsExtrinsicHash)
// .addEvent("TechnicalCommittee.Voted", eventOptionsExtrinsicHash)
// .addEvent("TechnicalCommittee.Approved", eventOptionsExtrinsicHash)
// .addEvent("TechnicalCommittee.Disapproved", eventOptionsExtrinsicHash)
.addEvent("TechnicalCommittee.Executed", eventOptionsWithCallArgs)
// .addEvent("TechnicalCommittee.MemberExecuted", eventOptionsWithCallArgs)
// .addEvent("TechnicalCommittee.Closed", eventOptionsExtrinsicHash)

// COUNCIL EVENTS
.addEvent("Council.Proposed", eventOptionsWithCallArgs)
.addEvent("Council.Voted", eventOptionsWithCallArgs)
.addEvent("Council.Approved", eventOptionsWithCallArgs)
.addEvent("Council.Disapproved", eventOptionsWithCallArgs)
.addEvent("Council.Executed", eventOptionsWithCallArgs)
.addEvent("Council.MemberExecuted", eventOptionsWithCall)
.addEvent("Council.Closed", eventOptionsWithCallArgs)

// Bounties EVENTS
.addEvent("Bounties.BountyProposed", eventOptionsWithCall)
.addEvent("Bounties.BountyBecameActive", eventOptionsExtrinsicHash)
.addEvent("Bounties.BountyAwarded", eventOptionsExtrinsicHash)
.addEvent("Bounties.BountyClaimed", eventOptionsExtrinsicHash)
.addEvent("Bounties.BountyCanceled", eventOptionsExtrinsicCall)
.addEvent("Bounties.BountyExtended", eventOptionsExtrinsicCall)
.addEvent("Bounties.BountyRejected", eventOptionsExtrinsicHash)

// TREASURY EVENTS 'Preimage.Noted'
.addEvent("Treasury.Proposed", eventOptionsExtrinsicCall)
.addEvent("Treasury.Awarded", eventOptionsExtrinsicHash)
.addEvent("Treasury.Rejected", eventOptionsExtrinsicCall)
.addEvent("Treasury.SpendApproved", eventOptionsExtrinsicCall)

.addEvent("Preimage.Noted", eventOptionsWithCallArgs)

.addEvent('PhalaStakePoolv2.OwnerRewardsWithdrawn', eventOptionsWithCall)

.addEvent('PhalaStakePoolv2.RewardReceived', eventOptionsWithCall)   


type Item = BatchProcessorItem<typeof processor>
export type Ctx = BatchContext<Store, Item>


processor.run(new TypeormDatabase(), async ctx => {

  const events = decodeEvents(ctx)
  // console.log("Processor :::: events \n:", events)

  const identityUpdatedAccountIdSet = new Set<string>()
  const referendaIdSet = new Set<string>()
  const proposalIdSet = new Set<string>()
  const motionIdSet = new Set<string>()
  const techComPropIdSet = new Set<string>()
  const treasuryIdSet = new Set<string>()
  const bountyIdSet = new Set<string>()
  const accountIds = new Set<string>()

  for (const {name, args} of events) {
    if (name === 'Democracy.Proposed'||
       name === 'Democracy.Tabled' ||
       name === 'Democracy.ProposalCanceled' ||
       name === 'Democracy.Seconded'
      ) {
      proposalIdSet.add(String(args.proposalIndex))
    } 
    
    if (name === 'Democracy.Voted'||
         name === 'Democracy.Cancelled' ||
         name === 'Democracy.Passed' ||
         name === 'Democracy.NotPassed' ||
         name === 'Democracy.Started'
    ) {
          referendaIdSet.add(String(args.proposalIndex))
    }

    if (name === 'TechnicalCommittee.Executed'
    //    name === 'TechnicalCommittee.Approved' ||
    //    name === 'TechnicalCommittee.Closed' ||
    //    name === 'TechnicalCommittee.Proposed' ||
    //    name === 'TechnicalCommittee.Disapproved' ||
    //    name === 'TechnicalCommittee.MemberExecuted' ||
    //    name === 'TechnicalCommittee.Voted'
       ) {
        // console.log("name: ===>", name)
        techComPropIdSet.add(String(args.hash))
    }  

    if ((name === 'Identity.IdentitySet' ||
       name === 'Identity.IdentityCleared'
       ) && (args.whoAddress != undefined))  {
      identityUpdatedAccountIdSet.add(String(args.whoAddress))
      accountIds.add(String(args.whoAddress))
    }    

    if (name === 'Council.Executed'||
       name === 'Council.Approved' ||
       name === 'Council.Closed' ||
       name === 'Council.Proposed' ||
       name === 'Council.Disapproved' ||
       name === 'Council.MemberExecuted' ||
       name === 'Council.Voted'
    ){
        motionIdSet.add(String(args.proposalIndex))
    }  

    if (name === 'Treasury.Awarded'||
       name === 'Treasury.SpendApproved' ||
       name === 'Treasury.Rejected' ||
       name === 'Treasury.Proposed'
      ) {
        // console.log("name: ===>", name)
        treasuryIdSet.add(String(args.proposalIndex))

        if (name != 'Treasury.Rejected' && (args.awardAccount != undefined) ){
          accountIds.add(String(args.awardAccount))  
        }
    }  

    if (name === 'Bounties.BountyAwarded'||
       name === 'Bounties.BountyBecameActive' ||
       name === 'Bounties.BountyCanceled' ||
       name === 'Bounties.BountyClaimed' ||
       name === 'Bounties.BountyExtended' ||
       name === 'Bounties.BountyRejected' ||
       name === 'Bounties.BountyProposed'
      ) {
        // console.log("name: ===>", name) 
        bountyIdSet.add(String(args.proposalIndex))

        if (name != 'Bounties.BountyBecameActive' && 
            name != 'Bounties.BountyRejected' && args.address != undefined) {
            accountIds.add(String(args.address))  
        }
    }  

    if ((name === 'Council.Executed'||
       name === 'Council.Approved' ||
       name === 'Council.Closed' ||
       name === 'Council.Proposed' ||
       name === 'Council.Disapproved' ||
       name === 'Council.MemberExecuted' ||
       name === 'Council.Voted' ||
      //  name === 'TechnicalCommittee.Proposed' ||
      //  name === 'TechnicalCommittee.MemberExecuted' ||
       name === 'TechnicalCommittee.Executed' ||
      //  name === 'TechnicalCommittee.Voted' ||

       name === 'Treasury.SpendApproved' ||
       name === 'Treasury.Rejected' ||
       name === 'Treasury.Proposed' ||

       name === 'Democracy.Proposed' ||
       name === 'Democracy.Seconded' ||
       name === 'Democracy.ProposalCanceled' ||
       name === 'Democracy.Voted'
    ) && (args.address != undefined)) {
        // console.log("name: ===>", name)
        accountIds.add(String(args.address))  

    }  




  }

  let accountMap = await ctx.store.findBy(Account, {id: In([...accountIds])}).then(accountMap => {
    return new Map(accountMap.map(a => [a.id, a]))
  })

  let referendaMap = await ctx.store.findBy(Referenda, {id: In([...referendaIdSet])}).then(referendaMap=> {
    return new Map(referendaMap.map(a => [a.id, a]))
  })

  let proposalsMap = await ctx.store.findBy(Proposals, {id: In([...proposalIdSet])}).then(proposalsMap=> {
    return new Map(proposalsMap.map(a => [a.id, a]))
  })

  let treasuryPropsMap = await ctx.store.findBy(TreasuryProposals, {id: In([...treasuryIdSet])}).then(treasuryPropsMap=> {
    return new Map(treasuryPropsMap.map(a => [a.id, a]))
  })
  let bountyPropsMap = await ctx.store.findBy(BountiesProposals, {id: In([...bountyIdSet])}).then(bountyPropsMap=> {
    return new Map(bountyPropsMap.map(a => [a.id, a]))
  })

  let councilPropsMap = await ctx.store.findBy(CouncilMotions, {id: In([...motionIdSet])}).then(councilPropsMap=> {
    return new Map(councilPropsMap.map(a => [a.id, a]))
  })

  let techComPropsMap = await ctx.store.findBy(TechComProposals, {id: In([...techComPropIdSet])}).then(techComPropsMap => {
    return new Map(techComPropsMap .map(a => [a.id, a]))
  })
 
  for (const {name, args, block} of events) {
    // console.log("Before switch:::: name:", name)
    switch (name) {
      
      // PROPOSALS EVENTS
      case 'Democracy.Proposed': {
          
          const {id, proposalIndex, propTitle, proposalHash, address,  deposit, eventHash, eventDate, eventblockHeight} = args
          
          // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
          const accountId = getAccount(accountMap, String(address))
          const proposalId = getProposals(proposalsMap, String(proposalIndex))

          const eventStore = new AllEvents ({
                                          id: String(id),
                                          eventId: String(proposalIndex),
                                          eventName: name,
                                          proposalHash: proposalHash,
                                          eventOwner: accountId,
                                          eventDate: eventDate,
                                          eventblockHeight: eventblockHeight,
                                          eventHash: eventHash,
                                        })
            
          proposalId.titleProposals = propTitle
          proposalId.propCreator = accountId
          proposalId.proposalHash = proposalHash
          proposalId.deposit = deposit
          proposalId.startDate = eventDate
          proposalId.lastUpdateDate = eventDate
          proposalId.startblockHeight = eventblockHeight    
          proposalId.lastUpdateblockHeight = eventblockHeight
          proposalId.statusProposals = name

          // await ctx.store.insert(eventStore)
          await ctx.store.save(accountId)
          await ctx.store.save(proposalId)
          await ctx.store.insert(eventStore)
          break
      }
      
      case 'Democracy.Tabled': {
          // console.log("Democracy.Tabled :::: ", name)
          const {id, proposalIndex, deposit, eventHash, eventDate, eventblockHeight} = args
          // console.log("Democracy.Tabled :::: name:", name)
          // console.log("Democracy.Tabled :::: id:", String(eventHash), "Date: ", eventDate)        
          // const accountId = getAccount(accountMap, String(address))
          const proposalId = getProposals(proposalsMap, String(proposalIndex))

          const eventStore = new AllEvents ({
                                          id: String(id),
                                          eventId: String(proposalIndex),
                                          eventName: name,
                                          eventHash:eventHash,
                                          eventDate: eventDate,
                                          eventblockHeight: eventblockHeight,
                                        })
            
          proposalId.deposit = deposit
          proposalId.lastUpdateDate = eventDate
          proposalId.lastUpdateblockHeight = eventblockHeight
          proposalId.statusProposals = name

          await ctx.store.save(proposalId)
          await ctx.store.insert(eventStore)
          break
      }
      
      case 'Democracy.Seconded': {
        const {id, proposalIndex, address,  eventHash, eventDate, eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getProposals(proposalsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        const seconder = new SecondedGroup ({
                                      id: String(id),
                                      propIdx: proposalId,
                                      seconder: accountId,
                                      eventDate: eventDate,
                                      eventblockHeight: eventblockHeight,
                                      eventHash: eventHash,
                                })
                          

        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        await ctx.store.insert(seconder)
        break
      }
  
      case 'Democracy.ProposalCanceled': {
        const {id, proposalIndex, proposalHash, address,  eventHash, eventDate, eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getProposals(proposalsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: proposalHash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        proposalId.propCreator = accountId
        proposalId.proposalHash = proposalHash
        proposalId.lastUpdateDate = eventDate
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusProposals = name

        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
      
      case 'Democracy.ExternalTabled': {
          const {id, eventDate, eventblockHeight} = args
          // console.log("Democracy.Tabled :::: id:", "Date: ", eventDate)        

          const eventStore = new AllEvents ({
                                          id: String(id),
                                          eventId: String(id),
                                          eventName: name,
                                          eventDate: eventDate,
                                          eventblockHeight: eventblockHeight,
                                        })
            
          await ctx.store.insert(eventStore)
          break      
      }
  
      // // REFERENDUMS EVENTS
      case 'Democracy.Started': {
        const {id,
          proposalIndex,
          voteType,
          phase,
          propTitle,
          proposalHash,
          address,
          eventSource,
          eventHash,
          eventDate,
          eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: proposalHash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
        referendumId.titleReferendum = propTitle
        referendumId.propCreator = accountId
        referendumId.referendumHash = proposalHash
        referendumId.typeVote = voteType
        referendumId.startDate = eventDate
        referendumId.lastUpdateDate = eventDate
        referendumId.startblockHeight = eventblockHeight    
        referendumId.lastUpdateblockHeight = eventblockHeight
        referendumId.statusReferendum = name

        if (phase === "ApplyExtrinsic") {
          referendumId.refSource = eventSource
        } else {
          referendumId.refSource = "Initialization"
        }

        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(referendumId)
        await ctx.store.insert(eventStore)
        break
      }

      case 'Democracy.Cancelled': {
        const {id,
          proposalIndex,
          eventHash,
          eventDate,
          eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        referendumId.lastUpdateDate = eventDate
        referendumId.lastUpdateblockHeight = eventblockHeight
        referendumId.statusReferendum = name

 
        // await ctx.store.insert(eventStore)
        await ctx.store.save(referendumId)
        await ctx.store.insert(eventStore)
        break
      }
      
      case 'Democracy.NotPassed': {
        const {id,
          proposalIndex,
          eventHash,
          eventDate,
          eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        referendumId.lastUpdateDate = eventDate
        referendumId.lastUpdateblockHeight = eventblockHeight
        referendumId.statusReferendum = name

 
        // await ctx.store.insert(eventStore)
        await ctx.store.save(referendumId)
        await ctx.store.insert(eventStore)
        break
      }
      
      case 'Democracy.Passed': {
        const {id,
          proposalIndex,
          eventHash,
          eventDate,
          eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        referendumId.lastUpdateDate = eventDate 
        referendumId.lastUpdateblockHeight = eventblockHeight
        referendumId.statusReferendum = name

 
        // await ctx.store.insert(eventStore)
        await ctx.store.save(referendumId)
        await ctx.store.insert(eventStore)
        break  
      }
       
    
      case 'Democracy.Voted': {
        const {id,
          proposalIndex,
          address,
          voteType,
          balance,
          vote,
          nbAyes,
          nbNay,
          eventHash,
          eventDate,
          eventblockHeight} = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
          const voter = new ReferendaVotes ({
                                        id: String(id),
                                        refIdx: referendumId,
                                        voter: accountId,
                                        voteType: voteType,
                                        balance: balance,
                                        vote: vote,
                                        nbAyes: nbAyes,
                                        nbNay: nbNay,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                  })

        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(referendumId)
        await ctx.store.insert(eventStore)
        await ctx.store.insert(voter)
        break 
      }
      
      //  // TechnicalCommittee EVENTS   
      //  case 'TechnicalCommittee.Proposed': {
          
      // }
  
      // case 'TechnicalCommittee.Approved': {
  
      // }
  
      // case 'TechnicalCommittee.Closed': {
  
      // }
  
      // case 'TechnicalCommittee.Disapproved': {
   
      // }
  
      case 'TechnicalCommittee.Executed': {
        const {id,
              resultVote,
              threshold,
              hash,
              title,
              address,
              eventHash,
              propSource,
              eventDate,
              eventblockHeight
            } = args
          
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getTechComProposals(techComPropsMap, String(hash))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(hash),
                                        eventName: name,
                                        proposalHash: hash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
        proposalId.titleProposals = title
        proposalId.propCreator = accountId
        proposalId.proposalHash = hash
        proposalId.threshold = threshold
        proposalId.startDate = eventDate
        proposalId.lastUpdateDate = eventDate
        proposalId.startblockHeight = eventblockHeight    
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusProposals = name
        proposalId.proposalSource= propSource

        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
  
      // case 'TechnicalCommittee.MemberExecuted': {
  
      // }
  
      // case 'TechnicalCommittee.Voted': {
  
      // }
  
      // // Council EVENTS 
      case 'Council.Proposed': {
              const {id,
                proposalIndex,
                lengthBound,
                voteType,
                address,
                hash,
                title,
                propSource,
                eventSource,
                eventHash,
                eventDate,
                eventblockHeight
              } = args
            
          // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
          const accountId = getAccount(accountMap, String(address))
          const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

          const eventStore = new AllEvents ({
                                          id: String(id),
                                          eventId: String(proposalIndex),
                                          eventName: name,
                                          proposalHash: hash,
                                          eventOwner: accountId,
                                          eventDate: eventDate,
                                          eventblockHeight: eventblockHeight,
                                          eventHash: eventHash,
                                        })
            
          proposalId.titleMotions = title
          proposalId.propCreator = accountId
          proposalId.proposalHash = hash
          proposalId.threshold = voteType
          proposalId.startDate = eventDate
          proposalId.lastUpdateDate = eventDate
          proposalId.startblockHeight = eventblockHeight    
          proposalId.lastUpdateblockHeight = eventblockHeight
          proposalId.status = name
          proposalId.proposalSource= propSource
          proposalId.eventSource= eventSource

          // await ctx.store.insert(eventStore)
          await ctx.store.save(accountId)
          await ctx.store.save(proposalId)
          await ctx.store.insert(eventStore)
          break
      }
  
      case 'Council.Approved': {
          const {id,
                proposalIndex,
                lengthBound,
                address,
                hash,
                eventHash,
                eventDate,
                eventblockHeight
              } = args
            
          // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
          const accountId = getAccount(accountMap, String(address))
          const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

          const eventStore = new AllEvents ({
                                          id: String(id),
                                          eventId: String(proposalIndex),
                                          eventName: name,
                                          proposalHash: hash,
                                          eventOwner: accountId,
                                          eventDate: eventDate,
                                          eventblockHeight: eventblockHeight,
                                          eventHash: eventHash,
                                        })

          proposalId.lastUpdateDate = eventDate
          proposalId.lastUpdateblockHeight = eventblockHeight
          proposalId.status = name


          // await ctx.store.insert(eventStore)
          await ctx.store.save(accountId)
          await ctx.store.save(proposalId)
          await ctx.store.insert(eventStore)
          break
      }
  
      case 'Council.Closed': {
        const {id,
          proposalIndex,
          lengthBound,
          address,
          hash,
          yesThreshold,
          noThreshold,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: hash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        proposalId.lastUpdateDate = eventDate
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.yesAfterThreshold = yesThreshold
        proposalId.noAfterThreshold = noThreshold
        proposalId.status = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  
      }
  
      case 'Council.Disapproved': {
        const {id,
          proposalIndex,
          lengthBound,
          address,
          hash,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: hash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        proposalId.lastUpdateDate = eventDate
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  
      }
  
      case 'Council.Executed': {
        const {id,
          proposalIndex,
          lengthBound,
          address,
          hash,
          resultVote,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: hash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        proposalId.lastUpdateDate = eventDate
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  

      }
  
      case 'Council.MemberExecuted': {
        const {id,
          proposalIndex,
          lengthBound,
          address,
          hash,
          resultVote,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: hash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        proposalId.lastUpdateDate = eventDate
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  
      }
  
      case 'Council.Voted': {
        // voteStatus: voted,

        const {id,
          proposalIndex,
          lengthBound,
          address,
          hash,
          voteStatus,
          yesCount,
          noCount,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getCouncilMotions (councilPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        proposalHash: hash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })


        const motionVote = new MotionsVotes ({
          id: String(id),
          motionHash: hash,
          motionsId: proposalId,
          memberAddress: accountId,
          approve: String(voteStatus),
          nbAyes: yesCount,
          nbNay: noCount,
          eventHash: eventHash,
          lastUpdateDate: eventDate,
          lastUpdateblockHeight: eventblockHeight
 
        })



        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        await ctx.store.insert(motionVote)
        break  
      }
  
      // Bounties EVENTS 
      case 'Bounties.BountyAwarded': {
        const {id,
          proposalIndex,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
        proposalId.beneficiary= accountId    
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
  
      case 'Bounties.BountyBecameActive': {
        const {id,
          proposalIndex,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name

        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  
      }
  
      case 'Bounties.BountyCanceled': {
        const {id,
          proposalIndex,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
  
      case 'Bounties.BountyClaimed': {
        const {id,
          proposalIndex,
          bountyPayout,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
        proposalId.bountyAmount = bountyPayout
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  
      }
  
      case 'Bounties.BountyExtended': {
        const {id,
          proposalIndex,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
  
      case 'Bounties.BountyProposed': {
        const {id,
          proposalIndex,
          title,
          bountyPayout,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
        
        proposalId.reason = title                             
        proposalId.bountyAmount = bountyPayout
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break  
      }
  
      case 'Bounties.BountyRejected': {
        const {id,
          proposalIndex,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getBountiesProposals(bountyPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
          
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.statusBounties = name


        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
  
  
      // Treasury EVENTS 
      case 'Treasury.Awarded': {
        const {id,
          proposalIndex,
          awardAccount,
          awardAmount,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(awardAccount))
        const proposalId = getTreasuryProposals(treasuryPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
        proposalId.beneficiary= accountId   
        proposalId.amount= awardAmount   
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name  

        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break

      }
  
      case 'Treasury.Proposed': {
        const {id,
          proposalIndex,
          awardAccount,
          title,
          address,
          awardAmount,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)    
        const awardAccountId = getAccount(accountMap, String(awardAccount))   
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getTreasuryProposals(treasuryPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
                      
        proposalId.titleProposals = title  
        proposalId.propCreator = accountId                                 
        proposalId.beneficiary = awardAccountId  
        proposalId.amount= awardAmount   
        proposalId.startDate = eventDate  
        proposalId.startblockHeight = eventblockHeight
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name   

        await ctx.store.save(awardAccountId)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }
  
      case 'Treasury.Rejected': {
        const {id,
          proposalIndex,
          address,
          slashedAmount,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)    
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getTreasuryProposals(treasuryPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
                                                       
        proposalId.slashAmount= slashedAmount  
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name   

        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break

      }
  
      case 'Treasury.SpendApproved': {
        const {id,
          proposalIndex,
          awardAccount,
          address,
          awardAmount,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)    
        const awardAccountId = getAccount(accountMap, String(awardAccount))   
        const accountId = getAccount(accountMap, String(address))
        const proposalId = getTreasuryProposals(treasuryPropsMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })
                      
        // proposalId.beneficiary = awardAccountId  
        proposalId.amount= awardAmount   
        proposalId.lastUpdateDate = eventDate  
        proposalId.lastUpdateblockHeight = eventblockHeight
        proposalId.status = name   

        await ctx.store.save(awardAccountId)
        await ctx.store.save(accountId)
        await ctx.store.save(proposalId)
        await ctx.store.insert(eventStore)
        break
      }

      case 'Preimage.Noted': {

        const {id,
          proposalHash,
          proposalData,
          address,
          eventHash,
          eventDate,
          eventblockHeight
        } = args
      
        // console.log("Processor :::: Name:",name, ":::: Hash:", String(eventHash), " :::::: Date: ", eventDate)       
        const accountId = getAccount(accountMap, String(address))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalHash),
                                        eventName: name,
                                        proposalHash: proposalHash,
                                        eventOwner: accountId,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        const preimageNote = new EventPreImageNote({
          id: String(id),
          proposalHash: proposalHash,
          proposalData: proposalData,
          eventOwner: accountId,
          eventHash: eventHash,
          eventDate: eventDate,
          eventblockHeight: eventblockHeight

        })

        // await ctx.store.insert(eventStore)
        await ctx.store.save(accountId)
        await ctx.store.insert(eventStore)
        await ctx.store.insert(preimageNote)
        break  

      }
    }
  }
  
  await queryIdentities(ctx, [...identityUpdatedAccountIdSet], accountMap)
  await queryCouncilMembers(ctx, accountMap)


  for (const x of [
    accountMap,
    referendaMap,
    proposalsMap,
    treasuryPropsMap,
    bountyPropsMap,
    councilPropsMap,
    techComPropsMap,

  ]) {
    if (x instanceof Map) {
      await ctx.store.save([...x.values()])
    } else if (Array.isArray(x)) {
      // Bypass type check
      await ctx.store.save(x)
    } else {
      await ctx.store.save(x)
    }
  }










})

