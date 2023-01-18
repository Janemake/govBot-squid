import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"

@Entity_()
export class ProposedGroup {
    constructor(props?: Partial<ProposedGroup>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    propIdx!: string

    @Column_("text", {nullable: true})
    titleProposals!: string | undefined | null

    @Column_("text", {nullable: true})
    creatorProposals!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    eventDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    eventblockHeight!: number | undefined | null
}
