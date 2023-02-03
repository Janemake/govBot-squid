import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Account} from "./account.model"

@Entity_()
export class EventPreImageNote {
    constructor(props?: Partial<EventPreImageNote>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Column_("text", {nullable: true})
    proposalHash!: string | undefined | null

    @Column_("text", {nullable: true})
    proposalData!: string | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    eventOwner!: Account | undefined | null

    @Column_("text", {nullable: true})
    eventHash!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    eventDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    eventblockHeight!: number | undefined | null
}
