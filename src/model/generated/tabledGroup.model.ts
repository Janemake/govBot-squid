import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"

@Entity_()
export class TabledGroup {
    constructor(props?: Partial<TabledGroup>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_({unique: true})
    @Column_("text", {nullable: false})
    propIdx!: string

    @Column_("timestamp with time zone", {nullable: true})
    eventDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    eventblockHeight!: number | undefined | null

    @Column_("int4", {nullable: true})
    nbseconders!: number | undefined | null
}
