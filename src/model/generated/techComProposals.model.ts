import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import {Account} from "./account.model"
import {TechComProposalsVotes} from "./techComProposalsVotes.model"

@Entity_()
export class TechComProposals {
    constructor(props?: Partial<TechComProposals>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: true})
    titleProposals!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    propCreator!: Account | undefined | null

    @Column_("text", {nullable: true})
    threshold!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    startDate!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastUpdateDate!: Date | undefined | null

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    proposalHash!: string

    @Column_("text", {nullable: true})
    proposalSource!: string | undefined | null

    @OneToMany_(() => TechComProposalsVotes, e => e.propId)
    votes!: TechComProposalsVotes[]

    @Column_("int4", {nullable: true})
    startblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    lastUpdateblockHeight!: number | undefined | null

    @Column_("text", {nullable: true})
    statusProposals!: string | undefined | null
}
