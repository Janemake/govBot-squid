import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {SecondedGroup} from "./secondedGroup.model"

@Entity_()
export class Proposals {
    constructor(props?: Partial<Proposals>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: true})
    titleProposals!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    propCreator!: Account | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    deposit!: bigint | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    startDate!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastUpdateDate!: Date | undefined | null

    @Column_("text", {nullable: true})
    proposalHash!: string | undefined | null

    @Column_("int4", {nullable: true})
    nbSeconder!: number | undefined | null

    @OneToMany_(() => SecondedGroup, e => e.propIdx)
    seconders!: SecondedGroup[]

    @Column_("int4", {nullable: true})
    startblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    lastUpdateblockHeight!: number | undefined | null

    @Column_("text", {nullable: true})
    typeVote!: string | undefined | null

    @Column_("text", {nullable: true})
    statusProposals!: string | undefined | null
}
