import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import {CouncilMotions} from "./councilMotions.model"
import {Account} from "./account.model"

@Entity_()
export class MotionsVotes {
    constructor(props?: Partial<MotionsVotes>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    motionHash!: string

    @Index_()
    @ManyToOne_(() => CouncilMotions, {nullable: true})
    motionsId!: CouncilMotions

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    memberAddress!: Account

    @Column_("text", {nullable: true})
    approve!: string | undefined | null

    @Column_("int4", {nullable: true})
    nbAyes!: number | undefined | null

    @Column_("int4", {nullable: true})
    nbNay!: number | undefined | null

    @Column_("text", {nullable: true})
    eventHash!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastUpdateDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    startblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    lastUpdateblockHeight!: number | undefined | null
}
