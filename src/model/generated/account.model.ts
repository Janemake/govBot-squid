import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Proposals} from "./proposals.model"
import {Referenda} from "./referenda.model"
import {TreasuryProposals} from "./treasuryProposals.model"
import {CouncilMotions} from "./councilMotions.model"
import {TechComProposals} from "./techComProposals.model"
import {BountiesProposals} from "./bountiesProposals.model"
import {AllEvents} from "./allEvents.model"

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_({unique: true})
    @Column_("text", {nullable: true})
    account!: string | undefined | null

    @Column_("text", {nullable: true})
    identityDisplay!: string | undefined | null

    @Column_("text", {nullable: true})
    councilMember!: string | undefined | null

    @Column_("text", {nullable: true})
    technicalCommitteeMember!: string | undefined | null

    @OneToMany_(() => Proposals, e => e.propCreator)
    prop!: Proposals[]

    @OneToMany_(() => Referenda, e => e.propCreator)
    refs!: Referenda[]

    @OneToMany_(() => TreasuryProposals, e => e.propCreator)
    treasuryProps!: TreasuryProposals[]

    @OneToMany_(() => TreasuryProposals, e => e.beneficiary)
    treasuryBeneficiary!: TreasuryProposals[]

    @OneToMany_(() => CouncilMotions, e => e.propCreator)
    councilProps!: CouncilMotions[]

    @OneToMany_(() => TechComProposals, e => e.propCreator)
    techCommProps!: TechComProposals[]

    @OneToMany_(() => BountiesProposals, e => e.propCreator)
    bountiesProps!: BountiesProposals[]

    @OneToMany_(() => BountiesProposals, e => e.beneficiary)
    bountyBeneficiary!: BountiesProposals[]

    @OneToMany_(() => AllEvents, e => e.eventOwner)
    eventDetails!: AllEvents[]
}
