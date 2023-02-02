import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_, OneToMany as OneToMany_} from "typeorm"
import {Account} from "./account.model"
import {ReferendaVotes} from "./referendaVotes.model"

@Entity_()
export class Referenda {
    constructor(props?: Partial<Referenda>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    refIndex!: string

    @Column_("text", {nullable: true})
    titleReferendum!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    propCreator!: Account | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    startDate!: Date | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    lastUpdateDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    startblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    lastUpdateblockHeight!: number | undefined | null

    @Column_("text", {nullable: true})
    refSource!: string | undefined | null

    @Column_("text", {nullable: true})
    referendumHash!: string | undefined | null

    @OneToMany_(() => ReferendaVotes, e => e.refIdx)
    votes!: ReferendaVotes[]

    @Column_("text", {nullable: true})
    typeVote!: string | undefined | null

    @Column_("text", {nullable: true})
    statusReferendum!: string | undefined | null
}
