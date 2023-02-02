import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"

@Entity_()
export class TreasuryProposals {
    constructor(props?: Partial<TreasuryProposals>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: true})
    titleProposals!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    propCreator!: Account | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    beneficiary!: Account | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    amount!: bigint | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    slashAmount!: bigint | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    startDate!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    endDate!: Date | undefined | null

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    proposalHash!: string

    @Column_("int4", {nullable: true})
    startblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    endblockHeight!: number | undefined | null

    @Column_("text", {nullable: true})
    motionHash!: string | undefined | null

    @Column_("text", {nullable: true})
    motionType!: string | undefined | null

    @Column_("text", {nullable: true})
    status!: string | undefined | null
}
