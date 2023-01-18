
//import {BigDecimal} from '@subsquid/big-decimal'
import {lookupArchive} from '@subsquid/archive-registry'
import {BatchBlock, BlockRangeOption, DataSource} from '@subsquid/substrate-processor'
import {
  BatchContext,
  BatchProcessorItem,
  SubstrateBatchProcessor,
  SubstrateBlock
} from '@subsquid/substrate-processor'
import {EventItem} from '@subsquid/substrate-processor/lib/interfaces/dataSelection'
import {Store, TypeormDatabase} from '@subsquid/typeorm-store'
//import {PalletReferendaTrackInfo } from '@polkadot/types/lookup';
import assert from 'assert'
import {In} from 'typeorm'
// import config from './config'
import {decodeAddress, encodeAddress} from './utils/converter'

// import decodeEvents from './decodeEvents'
// import importDump from './importDump'
import {
  // Proposals, Referenda, 
  // Account, 
  ProposedGroup, TabledGroup, 
  // SecondedGroup, ProposalCanceledGroup, ExternalTabledGroup,
  // RefStartedGroup, RefNotPassedGroup, RefPassedGroup, RefCanceledGroup
} from './model'

import {
  DemocracyProposedEvent,
  DemocracyTabledEvent,
  DemocracyExternalTabledEvent,
  DemocracyStartedEvent,
  DemocracyPassedEvent,
  DemocracyNotPassedEvent,
  DemocracyCancelledEvent,
  DemocracyVotedEvent,
  DemocracySecondedEvent,
  DemocracyProposalCanceledEvent,
  IdentityIdentitySetEvent,
  IdentityIdentityClearedEvent,
  IdentityJudgementGivenEvent,
  BalancesReservedEvent
} from './types/events'

//import {assertGet, getAccount, join, toMap} from './utils/common'
// import {updateDelegationValue} from './utils/delegation'
// import {updateAverageBlockTime} from './utils/globalState'
// import {queryIdentities} from './utils/identity'
import { Block } from './types/support'
// import postUpdate from './utils/postUpdate'

const processor = new SubstrateBatchProcessor()
.setDataSource({
  // Lookup archive by the network name in the Subsquid registry
  archive: lookupArchive("khala", {release: "FireSquid"})
})
.setBlockRange({ from: 2950661 })

.addEvent("Democracy.Proposed", {data: { event: { args: true , extrinsic: true, call:true}}} as const)
.addEvent("Democracy.Tabled", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
.addEvent("Democracy.ExternalTabled", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
.addEvent("Democracy.Seconded", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
.addEvent("Democracy.ProposalCanceled", {data: { event: { args: true , extrinsic: true, call: true}} } as const)

// .addEvent("Democracy.Started", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
// .addEvent("Democracy.Passed", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
// .addEvent("Democracy.NotPassed", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
// .addEvent("Democracy.Cancelled", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
// .addEvent("Democracy.Voted", {data: { event: { args: true , extrinsic: true, call: true} }} as const)

// .addEvent("Identity.IdentitySet", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
// .addEvent("Identity.IdentityCleared", {data: { event: { args: true , extrinsic: true, call: true} }} as const)
// .addEvent("Identity.JudgementGiven", {data: { event: { args: true , extrinsic: true, call: true} }} as const)

type Item = BatchProcessorItem<typeof processor>
export type Ctx = BatchContext<Store, Item>


processor.run(new TypeormDatabase(), async ctx => {


  const events = getDemocracyEvents(ctx);
  for (const pg of events.proposedGroups) {
    console.log("hash proposal", pg[0].titleProposals)
    console.log("address proposal", pg[1])
  }


  // let accounts = await ctx.store
  //   .findBy(Account, { id: In([...events.accountIds]) })
  //   .then((accounts) => {
  //     return new Map(accounts.map((a) => [a.id, a]));
  //   });

  for (const jg of events.proposedGroups) {
    // const accountSignature = getAccount(accounts, jg[1]);
    jg[0].creatorProposals = jg[1];
  }

  // for (const mf of events.refStartedGroups) {
  //   const account = getAccount(accounts, mf[1]);
  //   mf[0].creatorProposals = account;
  // }

  // for (const wr of events.secondedGroups) {
  //   const account = getAccount(accounts, wr[1]);
  //   wr[0].seconder = account;
  // }

  // await ctx.store.save(Array.from(accounts.values()));
  await ctx.store.insert(events.proposedGroups.map(el => el[0]));
  // await ctx.store.insert(events.refStartedGroups.map(el => el[0]));
  // await ctx.store.insert(events.secondedGroups.map(el => el[0]));
  await ctx.store.insert(events.tabledGroups.map(el => el[0]));
  // await ctx.store.insert(events.proposalCanceledGroups.map(el => el[0]));
  // await ctx.store.insert(events.refNotPassedGroups.map(el => el[0]));
  // await ctx.store.insert(events.refPassedGroups.map(el => el[0]));
  // await ctx.store.insert(events.refStartedGroups.map(el => el[0]));
  // await ctx.store.insert(events.refCanceledGroups.map(el => el[0]));

})


function stringifyArray(list: any[]): any[] {
  let listStr: any[] = [];
  for (let vec of list) {
    for (let i = 0; i < vec.length; i++) {
      vec[i] = String(vec[i]);
    }
    listStr.push(vec);
  }
  return listStr;
}


type Tuple<T,K> = [T,K];
interface EventInfo {
  proposedGroups: Tuple<ProposedGroup, string>[];
  tabledGroups: Tuple<TabledGroup, string>[];
  // secondedGroups: Tuple<SecondedGroup, string>[];
  // proposalCanceledGroups: Tuple<ProposalCanceledGroup, string>[];
  // externalTabledGroups: Tuple<ExternalTabledGroup, string>[];
  
  // refStartedGroups: Tuple<RefStartedGroup, string>[];
  // refNotPassedGroups: Tuple<RefNotPassedGroup, string>[];
  // refPassedGroups: Tuple<RefPassedGroup, string>[];
  // refCanceledGroups: Tuple<RefCanceledGroup, string>[];

  // joinGroups: Tuple<JoinGroup, string>[];
  // marketFiles: Tuple<StorageOrder, string>[];
  // workReports: Tuple<WorkReport, string>[];

  // accountIds: Set<string>;
}


function getDemocracyEvents(ctx: Ctx): EventInfo {
  let events: EventInfo = {
                          proposedGroups: [],
                          tabledGroups: [],
                          // secondedGroups: [],
                          // proposalCanceledGroups: [],
                          // // externalTabledGroups: [], 
                          
                          // refStartedGroups: [],
                          // refNotPassedGroups: [],
                          // refPassedGroups: [],
                          // refCanceledGroups: [], 
  
                          // accountIds: new Set<string>(),
  };
  for (let block of ctx.blocks) {
      for (let item of block.items) {

        switch (item.name) {
                
          // case 'Democracy.Cancelled': {
          //   const e = new DemocracyCancelledEvent(ctx, item.event)
          //   const {refIndex} = e.asV1090	  
          //   events.refCanceledGroups.push([new RefCanceledGroup({
          //             id: String(refIndex),
          //             eventDate: new Date(block.header.timestamp),
          //             eventblockHeight: block.header.height
          //   }), item.event.extrinsic?.signature?.address]);
          //           events.accountIds.add(item.event.extrinsic?.signature?.address);
          // }
          
          // case 'Democracy.NotPassed': {
          //   const e = new DemocracyNotPassedEvent(ctx, item.event)
          //   const {refIndex} = e.asV1090	  
          //   events.refNotPassedGroups.push([new RefNotPassedGroup({
          //       id: String(refIndex),
          //       eventDate: new Date(block.header.timestamp),
          //       eventblockHeight: block.header.height
          //   }), item.event.extrinsic?.signature?.address]);
          //     events.accountIds.add(item.event.extrinsic?.signature?.address);
          // }
          
          // case 'Democracy.Passed': {
          //   const e = new DemocracyPassedEvent(ctx, item.event)
          //   const {refIndex} = e.asV1090	  
          //   events.refPassedGroups.push([new RefPassedGroup({
          //     id: String(refIndex),
          //     eventDate: new Date(block.header.timestamp),
          //     eventblockHeight: block.header.height
          //   }), item.event.extrinsic?.signature?.address]);
          //   events.accountIds.add(item.event.extrinsic?.signature?.address);
          // }
                
          // case 'Democracy.Started': {
          //   const e = new DemocracyStartedEvent(ctx, item.event)
          //   const {refIndex, threshold} = e.asV1090
          //   // let accountCreator = encodeAddress(getCreatorAccount())

          //   //let accountCreator = getCreatorAccount()
          //   events.refStartedGroups.push([new RefStartedGroup({
          //       id: String(refIndex),
          //       titleProposals: item.event.extrinsic?.id,
          //       typeVote: threshold.__kind,
          //       //creatorProposals: accountCreator,
          //       eventDate: new Date(block.header.timestamp),
          //       eventblockHeight: block.header.height
          //   }), item.event.extrinsic?.signature?.address]);
          //     events.accountIds.add(item.event.extrinsic?.signature?.address);
          //     // events.accountIds.add(accountCreator);
          //     console.log("Started hash", item.event.extrinsic?.hash)
          //     console.log("Started address", item.event.extrinsic?.signature?.address)
          //   }
          
          // case 'Democracy.ProposalCanceled': {
			    //   const e = new DemocracyProposalCanceledEvent(ctx, item.event)
			    //   const {propIndex} = e.asV1170	 
          //   events.proposalCanceledGroups.push([new ProposalCanceledGroup({
          //             id: String(propIndex),
          //             eventDate: new Date(block.header.timestamp),
          //             eventblockHeight: block.header.height
          //   }), item.event.extrinsic?.signature?.address]);
          //           events.accountIds.add(item.event.extrinsic?.signature?.address);
          // }
          
          // case 'Democracy.Seconded': {
          //   const e = new DemocracySecondedEvent(ctx, item.event)
          //   const {seconder, propIndex} = e.asV1110
                 
          //   events.secondedGroups.push([new SecondedGroup({
          //       id: item.event.id,
          //       propIdx:String(propIndex),
          //       // deposit: BigInt(0),
          //       eventDate: new Date(block.header.timestamp),
          //       eventblockHeight: block.header.height
          //   }), item.event.extrinsic?.signature?.address]);
          //     events.accountIds.add(item.event.extrinsic?.signature?.address);

          //   console.log("Seconded extr hash", item.event.extrinsic?.hash)
          //   console.log("Seconded extr address", item.event.extrinsic?.signature?.address)
          //   console.log("Seconder", encodeAddress(seconder))       
          // }
          
          case 'Democracy.Tabled': {
            const e = new DemocracyTabledEvent(ctx, item.event)
            
            if (e.asV1090){
              let {proposalIndex, deposit, depositors} = e.asV1090
              events.tabledGroups.push([new TabledGroup({
                id: String(proposalIndex),
                // deposit: toBalance(deposit),
                //nbseconders: 0,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
              }), item.event.extrinsic?.signature?.address]);

            } else if (e.asV1199){
              let {proposalIndex, deposit} = e.asV1199
              events.tabledGroups.push([new TabledGroup({
                id: String(proposalIndex),
                // deposit: toBalance(deposit),
                //nbseconders: 0,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
              }), item.event.extrinsic?.signature?.address]);
            } else {
              throw new UknownVersionError()
            }
            
            // events.accountIds.add(item.event.extrinsic?.signature?.address);
          }
                
          case 'Democracy.Proposed': {
			      const e = new DemocracyProposedEvent(ctx, item.event)
			      const {proposalIndex, deposit} = e.asV1090  
            console.log("Proposed hash", item.event.extrinsic?.hash)
            console.log("Proposed address", item.event.extrinsic?.signature?.address)
            events.proposedGroups.push([new ProposedGroup({
                id: String(proposalIndex),
                titleProposals: item.event.extrinsic?.hash,
                // deposit: toBalance(deposit),
                //creatorProposals: accountCreator,
                eventDate: new Date(block.header.timestamp),
                eventblockHeight: block.header.height
            }), item.event.extrinsic?.signature?.address]);
              // events.accountIds.add(item.event.extrinsic?.signature?.address);
              // events.accountIds.add(accountCreator);
          }

        }
        
    

   
      }

  }
  return events;
}


// function getAccount(m: Map<string, Account>, id: string): Account {
//   let acc = m.get(id);
//   if (acc == null) {
//     acc = new Account();
//     acc.id = id;
//     m.set(id, acc);
//   }
//   return acc;
// }

class UknownVersionError extends Error {
  constructor() {
      super('Uknown verson')
  }
}