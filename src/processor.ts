
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
  TreasuryProposals, AllEvents
} from './model'

// import {
//       DemocracyProposedEvent, 
//       DemocracyTabledEvent, 
//       DemocracyExternalTabledEvent,
//       DemocracyStartedEvent, 
//       DemocracyPassedEvent, 
//       DemocracyNotPassedEvent,
//       DemocracyCancelledEvent, 
//       DemocracyVotedEvent, 
//       DemocracySecondedEvent,
//       DemocracyProposalCanceledEvent, 
//       IdentityIdentitySetEvent,
//       IdentityIdentityClearedEvent, 
//       IdentityJudgementGivenEvent,
//       BountiesBountyAwardedEvent, 
//       BountiesBountyBecameActiveEvent, 
//       BountiesBountyCanceledEvent,
//       BountiesBountyClaimedEvent, 
//       BountiesBountyExtendedEvent,
//       BountiesBountyProposedEvent,
//       BountiesBountyRejectedEvent
// } from './types/events'


import {getAccount,
        getProposals, 
        getReferenda, 
        getCouncilMotions, 
        getTreasuryProposals,
        join, toMap
} from './utils/common'

import {queryIdentities} from './utils/identity'
import { Block } from './types/support'

const processor = new SubstrateBatchProcessor()

.setDataSource({
  // Lookup archive by the network name in the Subsquid registry
  archive: lookupArchive("khala", {release: "FireSquid"})
})
// .setBlockRange({ from:  2827620})

// PROPOSALS EVENTS
.addEvent("Democracy.Proposed")
.addEvent("Democracy.Tabled")
.addEvent("Democracy.ExternalTabled")
.addEvent("Democracy.Seconded")
.addEvent("Democracy.ProposalCanceled")

// REFERENDA EVENTS
.addEvent("Democracy.Started")
.addEvent("Democracy.Passed")
.addEvent("Democracy.NotPassed")
.addEvent("Democracy.Cancelled")
.addEvent("Democracy.Voted")

// IDENTITY EVENTS
.addEvent("Identity.IdentitySet")
.addEvent("Identity.IdentityCleared")
.addEvent("Identity.JudgementGiven")

// TechnicalCommittee EVENTS
.addEvent("TechnicalCommittee.Proposed")
.addEvent("TechnicalCommittee.Voted")
.addEvent("TechnicalCommittee.Approved")
.addEvent("TechnicalCommittee.Disapproved")
.addEvent("TechnicalCommittee.Executed")
.addEvent("TechnicalCommittee.MemberExecuted")
.addEvent("TechnicalCommittee.Closed")

// COUNCIL EVENTS
.addEvent("Council.Proposed")
.addEvent("Council.Voted")
.addEvent("Council.Approved")
.addEvent("Council.Disapproved")
.addEvent("Council.Executed")
.addEvent("Council.MemberExecuted")
.addEvent("Council.Closed")

// Bounties EVENTS
.addEvent("Bounties.BountyProposed")
.addEvent("Bounties.BountyRejected")
.addEvent("Bounties.BountyBecameActive")
.addEvent("Bounties.BountyAwarded")
.addEvent("Bounties.BountyClaimed")
.addEvent("Bounties.BountyCanceled")
.addEvent("Bounties.BountyExtended")

// TREASURY EVENTS 'Preimage.Noted'
.addEvent("Treasury.Proposed")
.addEvent("Treasury.Awarded")
.addEvent("Treasury.Rejected")
.addEvent("Treasury.SpendApproved")

.addEvent("Preimage.Noted")

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

    if (name === 'TechnicalCommittee.Executed'||
       name === 'TechnicalCommittee.Approved' ||
       name === 'TechnicalCommittee.Closed' ||
       name === 'TechnicalCommittee.Proposed' ||
       name === 'TechnicalCommittee.Disapproved' ||
       name === 'TechnicalCommittee.MemberExecuted' ||
       name === 'TechnicalCommittee.Voted') {
        // console.log("name: ===>", name)
        techComPropIdSet.add(String(args.hash))
    }  

    if (name === 'Identity.IdentitySet' ||
       name === 'Identity.IdentityCleared' ||
       name === 'Identity.JudgementGiven'
    ) {
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

        if (name != 'Treasury.Rejected'){
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
            name != 'Bounties.BountyRejected'){
            accountIds.add(String(args.address))  
        }
    }  

    if (name === 'Council.Executed'||
       name === 'Council.Approved' ||
       name === 'Council.Closed' ||
       name === 'Council.Proposed' ||
       name === 'Council.Disapproved' ||
       name === 'Council.MemberExecuted' ||
       name === 'Council.Voted' ||
       name === 'TechnicalCommittee.Proposed' ||
       name === 'TechnicalCommittee.MemberExecuted' ||
       name === 'TechnicalCommittee.Executed' ||
       name === 'TechnicalCommittee.Voted' ||

       name === 'Treasury.SpendApproved' ||
       name === 'Treasury.Rejected' ||
       name === 'Treasury.Proposed' ||

       name === 'Democracy.Proposed' ||
       name === 'Democracy.Seconded' ||
       name === 'Democracy.ProposalCanceled' ||
       name === 'Democracy.Voted'
    ) {
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
          
          // console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
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
          
        // console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
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
          
        // console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
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
          
        console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
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
          
        console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        referendumId.startDate = eventDate
        referendumId.lastUpdateDate = eventDate
        referendumId.startblockHeight = eventblockHeight    
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
          
        console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        referendumId.startDate = eventDate
        referendumId.lastUpdateDate = eventDate
        referendumId.startblockHeight = eventblockHeight    
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
          
        console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
        const referendumId = getReferenda(referendaMap, String(proposalIndex))

        const eventStore = new AllEvents ({
                                        id: String(id),
                                        eventId: String(proposalIndex),
                                        eventName: name,
                                        eventDate: eventDate,
                                        eventblockHeight: eventblockHeight,
                                        eventHash: eventHash,
                                      })

        referendumId.startDate = eventDate
        referendumId.lastUpdateDate = eventDate
        referendumId.startblockHeight = eventblockHeight    
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
          
        console.log("Processor :::: id:", String(eventHash), "Date: ", eventDate)       
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
  
      // case 'TechnicalCommittee.Executed': {
  
      // }
  
      // case 'TechnicalCommittee.MemberExecuted': {
  
      // }
  
      // case 'TechnicalCommittee.Voted': {
  
      // }
  
      // // Council EVENTS 
      // case 'Council.Proposed': {
  
      // }
  
      // case 'Council.Approved': {
  
      // }
  
      // case 'Council.Closed': {
  
      // }
  
      // case 'Council.Disapproved': {
  
      // }
  
      // case 'Council.Executed': {
  
      // }
  
      // case 'Council.MemberExecuted': {
   
      // }
  
      // case 'Council.Voted': {
  
      // }
  
      // // Bounties EVENTS 
      // case 'Bounties.BountyAwarded': {
   
      // }
  
      // case 'Bounties.BountyBecameActive': {
   
      // }
  
      // case 'Bounties.BountyCanceled': {
   
      // }
  
      // case 'Bounties.BountyClaimed': {
  
      // }
  
      // case 'Bounties.BountyExtended': {
  
      // }
  
      // case 'Bounties.BountyProposed': {
  
      // }
  
      // case 'Bounties.BountyRejected': {
  
      // }
  
  
      // // Treasury EVENTS 
      // case 'Treasury.Awarded': {
   
      // }
  
      // case 'Treasury.Proposed': {
   
      // }
  
      // case 'Treasury.Rejected': {
  
      // }
  
      // case 'Treasury.SpendApproved': {
  
      // }






    }




  }

  for (const x of [
    accountMap,
    referendaMap,
    proposalsMap,
    treasuryPropsMap,
    bountyPropsMap,
    councilPropsMap,
    techComPropsMap
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

