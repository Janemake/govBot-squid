import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {TechComProposals} from "./techComProposals.model"
import {Account} from "./account.model"

@Entity_()
export class TechComProposalsVotes {
    constructor(props?: Partial<TechComProposalsVotes>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => TechComProposals, {nullable: true})
    propId!: TechComProposals

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    voter!: Account | undefined | null

    @Column_("text", {nullable: true})
    voted!: string | undefined | null

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
