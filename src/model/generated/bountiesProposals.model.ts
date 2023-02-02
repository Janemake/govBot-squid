import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"

@Entity_()
export class BountiesProposals {
    constructor(props?: Partial<BountiesProposals>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: true})
    reason!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    propCreator!: Account | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    beneficiary!: Account | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    curator!: Account | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    bountyAmount!: bigint | undefined | null

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    bountyHash!: string

    @Column_("timestamp with time zone", {nullable: true})
    startDate!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastUpdateDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    startblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    lastUpdateblockHeight!: number | undefined | null

    @Column_("text", {nullable: true})
    statusBounties!: string | undefined | null
}
