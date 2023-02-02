import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Referenda} from "./referenda.model"
import {Account} from "./account.model"

@Entity_()
export class ReferendaVotes {
    constructor(props?: Partial<ReferendaVotes>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Referenda, {nullable: true})
    refIdx!: Referenda

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    voter!: Account

    @Column_("text", {nullable: true})
    voteType!: string | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    balance!: bigint | undefined | null

    @Column_("text", {nullable: true})
    vote!: string | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    nbAyes!: bigint | undefined | null

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    nbNay!: bigint | undefined | null

    @Column_("text", {nullable: true})
    eventHash!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    eventDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    eventblockHeight!: number | undefined | null
}
