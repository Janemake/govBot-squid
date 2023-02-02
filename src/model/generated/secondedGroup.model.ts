import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Proposals} from "./proposals.model"
import {Account} from "./account.model"

@Entity_()
export class SecondedGroup {
    constructor(props?: Partial<SecondedGroup>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Proposals, {nullable: true})
    propIdx!: Proposals

    @Column_("text", {nullable: true})
    eventHash!: string | undefined | null

    @Column_("timestamp with time zone", {nullable: true})
    eventDate!: Date | undefined | null

    @Column_("int4", {nullable: true})
    eventblockHeight!: number | undefined | null

    @Index_()
    @ManyToOne_(() => Account, {nullable: true})
    seconder!: Account
}
