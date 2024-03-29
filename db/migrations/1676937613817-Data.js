module.exports = class Data1676937613817 {
    name = 'Data1676937613817'

    async up(db) {
        await db.query(`CREATE TABLE "seconded_group" ("id" character varying NOT NULL, "event_hash" text, "event_date" TIMESTAMP WITH TIME ZONE, "eventblock_height" integer, "prop_idx_id" character varying, "seconder_id" character varying, CONSTRAINT "PK_a2b67db76a239dfbc4ba4aa81fb" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_a2e596cbcba92ad97cc0a0b4f5" ON "seconded_group" ("prop_idx_id") `)
        await db.query(`CREATE INDEX "IDX_4d8a28523419d4a43d464066ec" ON "seconded_group" ("seconder_id") `)
        await db.query(`CREATE TABLE "proposals" ("id" character varying NOT NULL, "title_proposals" text, "deposit" numeric, "start_date" TIMESTAMP WITH TIME ZONE, "last_update_date" TIMESTAMP WITH TIME ZONE, "proposal_hash" text, "nb_seconder" integer, "startblock_height" integer, "last_updateblock_height" integer, "type_vote" text, "status_proposals" text, "prop_creator_id" character varying, CONSTRAINT "PK_db524c8db8e126a38a2f16d8cac" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_1cee8f26187d6ede074aef9c87" ON "proposals" ("prop_creator_id") `)
        await db.query(`CREATE TABLE "referenda_votes" ("id" character varying NOT NULL, "vote_type" text, "balance" numeric, "vote" text, "nb_ayes" numeric, "nb_nay" numeric, "event_hash" text, "event_date" TIMESTAMP WITH TIME ZONE, "eventblock_height" integer, "ref_idx_id" character varying, "voter_id" character varying, CONSTRAINT "PK_1a1ad0c8d408b12e9c5c64b3630" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_8ec6f85941eb0b10a174463435" ON "referenda_votes" ("ref_idx_id") `)
        await db.query(`CREATE INDEX "IDX_c8839cd2ce02d57701a51972f9" ON "referenda_votes" ("voter_id") `)
        await db.query(`CREATE TABLE "referenda" ("id" character varying NOT NULL, "ref_index" text NOT NULL, "title_referendum" text, "start_date" TIMESTAMP WITH TIME ZONE, "last_update_date" TIMESTAMP WITH TIME ZONE, "startblock_height" integer, "last_updateblock_height" integer, "ref_source" text, "referendum_hash" text, "type_vote" text, "status_referendum" text, "prop_creator_id" character varying, CONSTRAINT "PK_f0f6e007527e88aa79a974970f6" PRIMARY KEY ("id"))`)
        await db.query(`CREATE UNIQUE INDEX "IDX_9f7aac19364980460ffe846743" ON "referenda" ("ref_index") `)
        await db.query(`CREATE INDEX "IDX_a187128f1646ef3685c34f9747" ON "referenda" ("prop_creator_id") `)
        await db.query(`CREATE TABLE "treasury_proposals" ("id" character varying NOT NULL, "title_proposals" text, "amount" numeric, "slash_amount" numeric, "start_date" TIMESTAMP WITH TIME ZONE, "last_update_date" TIMESTAMP WITH TIME ZONE, "proposal_hash" text, "startblock_height" integer, "last_updateblock_height" integer, "motion_hash" text, "motion_type" text, "status" text, "prop_creator_id" character varying, "beneficiary_id" character varying, "last_event_owner_id" character varying, CONSTRAINT "PK_46890ff96ee49457290b4d46357" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_1a9af39b4013c522e7aae3c2f2" ON "treasury_proposals" ("prop_creator_id") `)
        await db.query(`CREATE INDEX "IDX_547d99cb86cb3f0fc5241f59ab" ON "treasury_proposals" ("beneficiary_id") `)
        await db.query(`CREATE INDEX "IDX_ec1191ebb60da6365ec3bb331c" ON "treasury_proposals" ("last_event_owner_id") `)
        await db.query(`CREATE TABLE "motions_votes" ("id" character varying NOT NULL, "motion_hash" text, "approve" text, "nb_ayes" integer, "nb_nay" integer, "event_hash" text, "last_update_date" TIMESTAMP WITH TIME ZONE, "last_updateblock_height" integer, "motions_id_id" character varying, "member_address_id" character varying, CONSTRAINT "PK_ca47023215ec85302d2a5ac5149" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_4c2b7f12f0fd85c43140927844" ON "motions_votes" ("motions_id_id") `)
        await db.query(`CREATE INDEX "IDX_4f2b9c080e8af0d5fe86b28246" ON "motions_votes" ("member_address_id") `)
        await db.query(`CREATE TABLE "council_motions" ("id" character varying NOT NULL, "title_motions" text, "proposal_hash" text, "proposal_source" text, "event_source" text, "threshold" integer, "yes_after_threshold" integer, "no_after_threshold" integer, "start_date" TIMESTAMP WITH TIME ZONE, "last_update_date" TIMESTAMP WITH TIME ZONE, "startblock_height" integer, "last_updateblock_height" integer, "status" text, "prop_creator_id" character varying, CONSTRAINT "PK_4b6b85730de7712d35c307509f7" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_23250abe555a8dbabeeb689f14" ON "council_motions" ("prop_creator_id") `)
        await db.query(`CREATE TABLE "tech_com_proposals_votes" ("id" character varying NOT NULL, "voted" text, "nb_ayes" integer, "nb_nay" integer, "event_hash" text, "last_update_date" TIMESTAMP WITH TIME ZONE, "startblock_height" integer, "last_updateblock_height" integer, "prop_id_id" character varying, "voter_id" character varying, CONSTRAINT "PK_745c0f6821c3d11ff59aae18cc6" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_7163fcf683dc72fa5e6585d280" ON "tech_com_proposals_votes" ("prop_id_id") `)
        await db.query(`CREATE INDEX "IDX_f3f27ce568b9836bbd9ed47c88" ON "tech_com_proposals_votes" ("voter_id") `)
        await db.query(`CREATE TABLE "tech_com_proposals" ("id" character varying NOT NULL, "title_proposals" text, "threshold" text, "start_date" TIMESTAMP WITH TIME ZONE, "last_update_date" TIMESTAMP WITH TIME ZONE, "proposal_hash" text, "proposal_source" text, "startblock_height" integer, "last_updateblock_height" integer, "status_proposals" text, "prop_creator_id" character varying, CONSTRAINT "PK_de595bc332125875d1ab80ae520" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_08fd58f7fdd4a19b548e4b6dbf" ON "tech_com_proposals" ("prop_creator_id") `)
        await db.query(`CREATE TABLE "bounties_proposals" ("id" character varying NOT NULL, "reason" text, "bounty_amount" numeric, "bounty_hash" text, "start_date" TIMESTAMP WITH TIME ZONE, "last_update_date" TIMESTAMP WITH TIME ZONE, "startblock_height" integer, "last_updateblock_height" integer, "status_bounties" text, "prop_creator_id" character varying, "beneficiary_id" character varying, "curator_id" character varying, CONSTRAINT "PK_912395d45bdd8a4ef8312fd86d9" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_ec95714128a151b900434ba745" ON "bounties_proposals" ("prop_creator_id") `)
        await db.query(`CREATE INDEX "IDX_f07ad47fadc52d28d75887f1fa" ON "bounties_proposals" ("beneficiary_id") `)
        await db.query(`CREATE INDEX "IDX_e052962a1b843eccaf62e600e1" ON "bounties_proposals" ("curator_id") `)
        await db.query(`CREATE TABLE "all_events" ("id" character varying NOT NULL, "event_id" text, "event_name" text, "proposal_hash" text, "event_date" TIMESTAMP WITH TIME ZONE, "eventblock_height" integer, "event_hash" text, "event_owner_id" character varying, CONSTRAINT "PK_bbbcaa54adc9376df107e374298" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_6533cf4da320233f8013ad9c89" ON "all_events" ("event_owner_id") `)
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "account" text, "identity_display" text, "council_member" text, "technical_committee_member" text, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`CREATE UNIQUE INDEX "IDX_a120ffb28f7d5c34fa907eb7f8" ON "account" ("account") `)
        await db.query(`CREATE TABLE "event_pre_image_note" ("id" character varying NOT NULL, "proposal_hash" text, "proposal_data" text, "event_hash" text, "event_date" TIMESTAMP WITH TIME ZONE, "eventblock_height" integer, "event_owner_id" character varying, CONSTRAINT "PK_1624a976bd32941825446ee56e5" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_78d15f960ff430e079fd563fb5" ON "event_pre_image_note" ("event_owner_id") `)
        await db.query(`ALTER TABLE "seconded_group" ADD CONSTRAINT "FK_a2e596cbcba92ad97cc0a0b4f56" FOREIGN KEY ("prop_idx_id") REFERENCES "proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "seconded_group" ADD CONSTRAINT "FK_4d8a28523419d4a43d464066ec5" FOREIGN KEY ("seconder_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "proposals" ADD CONSTRAINT "FK_1cee8f26187d6ede074aef9c876" FOREIGN KEY ("prop_creator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "referenda_votes" ADD CONSTRAINT "FK_8ec6f85941eb0b10a174463435f" FOREIGN KEY ("ref_idx_id") REFERENCES "referenda"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "referenda_votes" ADD CONSTRAINT "FK_c8839cd2ce02d57701a51972f97" FOREIGN KEY ("voter_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "referenda" ADD CONSTRAINT "FK_a187128f1646ef3685c34f97474" FOREIGN KEY ("prop_creator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "treasury_proposals" ADD CONSTRAINT "FK_1a9af39b4013c522e7aae3c2f25" FOREIGN KEY ("prop_creator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "treasury_proposals" ADD CONSTRAINT "FK_547d99cb86cb3f0fc5241f59ab4" FOREIGN KEY ("beneficiary_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "treasury_proposals" ADD CONSTRAINT "FK_ec1191ebb60da6365ec3bb331c1" FOREIGN KEY ("last_event_owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "motions_votes" ADD CONSTRAINT "FK_4c2b7f12f0fd85c431409278442" FOREIGN KEY ("motions_id_id") REFERENCES "council_motions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "motions_votes" ADD CONSTRAINT "FK_4f2b9c080e8af0d5fe86b282464" FOREIGN KEY ("member_address_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "council_motions" ADD CONSTRAINT "FK_23250abe555a8dbabeeb689f140" FOREIGN KEY ("prop_creator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "tech_com_proposals_votes" ADD CONSTRAINT "FK_7163fcf683dc72fa5e6585d2808" FOREIGN KEY ("prop_id_id") REFERENCES "tech_com_proposals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "tech_com_proposals_votes" ADD CONSTRAINT "FK_f3f27ce568b9836bbd9ed47c883" FOREIGN KEY ("voter_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "tech_com_proposals" ADD CONSTRAINT "FK_08fd58f7fdd4a19b548e4b6dbfd" FOREIGN KEY ("prop_creator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "bounties_proposals" ADD CONSTRAINT "FK_ec95714128a151b900434ba745d" FOREIGN KEY ("prop_creator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "bounties_proposals" ADD CONSTRAINT "FK_f07ad47fadc52d28d75887f1fa8" FOREIGN KEY ("beneficiary_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "bounties_proposals" ADD CONSTRAINT "FK_e052962a1b843eccaf62e600e1c" FOREIGN KEY ("curator_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "all_events" ADD CONSTRAINT "FK_6533cf4da320233f8013ad9c897" FOREIGN KEY ("event_owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "event_pre_image_note" ADD CONSTRAINT "FK_78d15f960ff430e079fd563fb55" FOREIGN KEY ("event_owner_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "seconded_group"`)
        await db.query(`DROP INDEX "public"."IDX_a2e596cbcba92ad97cc0a0b4f5"`)
        await db.query(`DROP INDEX "public"."IDX_4d8a28523419d4a43d464066ec"`)
        await db.query(`DROP TABLE "proposals"`)
        await db.query(`DROP INDEX "public"."IDX_1cee8f26187d6ede074aef9c87"`)
        await db.query(`DROP TABLE "referenda_votes"`)
        await db.query(`DROP INDEX "public"."IDX_8ec6f85941eb0b10a174463435"`)
        await db.query(`DROP INDEX "public"."IDX_c8839cd2ce02d57701a51972f9"`)
        await db.query(`DROP TABLE "referenda"`)
        await db.query(`DROP INDEX "public"."IDX_9f7aac19364980460ffe846743"`)
        await db.query(`DROP INDEX "public"."IDX_a187128f1646ef3685c34f9747"`)
        await db.query(`DROP TABLE "treasury_proposals"`)
        await db.query(`DROP INDEX "public"."IDX_1a9af39b4013c522e7aae3c2f2"`)
        await db.query(`DROP INDEX "public"."IDX_547d99cb86cb3f0fc5241f59ab"`)
        await db.query(`DROP INDEX "public"."IDX_ec1191ebb60da6365ec3bb331c"`)
        await db.query(`DROP TABLE "motions_votes"`)
        await db.query(`DROP INDEX "public"."IDX_4c2b7f12f0fd85c43140927844"`)
        await db.query(`DROP INDEX "public"."IDX_4f2b9c080e8af0d5fe86b28246"`)
        await db.query(`DROP TABLE "council_motions"`)
        await db.query(`DROP INDEX "public"."IDX_23250abe555a8dbabeeb689f14"`)
        await db.query(`DROP TABLE "tech_com_proposals_votes"`)
        await db.query(`DROP INDEX "public"."IDX_7163fcf683dc72fa5e6585d280"`)
        await db.query(`DROP INDEX "public"."IDX_f3f27ce568b9836bbd9ed47c88"`)
        await db.query(`DROP TABLE "tech_com_proposals"`)
        await db.query(`DROP INDEX "public"."IDX_08fd58f7fdd4a19b548e4b6dbf"`)
        await db.query(`DROP TABLE "bounties_proposals"`)
        await db.query(`DROP INDEX "public"."IDX_ec95714128a151b900434ba745"`)
        await db.query(`DROP INDEX "public"."IDX_f07ad47fadc52d28d75887f1fa"`)
        await db.query(`DROP INDEX "public"."IDX_e052962a1b843eccaf62e600e1"`)
        await db.query(`DROP TABLE "all_events"`)
        await db.query(`DROP INDEX "public"."IDX_6533cf4da320233f8013ad9c89"`)
        await db.query(`DROP TABLE "account"`)
        await db.query(`DROP INDEX "public"."IDX_a120ffb28f7d5c34fa907eb7f8"`)
        await db.query(`DROP TABLE "event_pre_image_note"`)
        await db.query(`DROP INDEX "public"."IDX_78d15f960ff430e079fd563fb5"`)
        await db.query(`ALTER TABLE "seconded_group" DROP CONSTRAINT "FK_a2e596cbcba92ad97cc0a0b4f56"`)
        await db.query(`ALTER TABLE "seconded_group" DROP CONSTRAINT "FK_4d8a28523419d4a43d464066ec5"`)
        await db.query(`ALTER TABLE "proposals" DROP CONSTRAINT "FK_1cee8f26187d6ede074aef9c876"`)
        await db.query(`ALTER TABLE "referenda_votes" DROP CONSTRAINT "FK_8ec6f85941eb0b10a174463435f"`)
        await db.query(`ALTER TABLE "referenda_votes" DROP CONSTRAINT "FK_c8839cd2ce02d57701a51972f97"`)
        await db.query(`ALTER TABLE "referenda" DROP CONSTRAINT "FK_a187128f1646ef3685c34f97474"`)
        await db.query(`ALTER TABLE "treasury_proposals" DROP CONSTRAINT "FK_1a9af39b4013c522e7aae3c2f25"`)
        await db.query(`ALTER TABLE "treasury_proposals" DROP CONSTRAINT "FK_547d99cb86cb3f0fc5241f59ab4"`)
        await db.query(`ALTER TABLE "treasury_proposals" DROP CONSTRAINT "FK_ec1191ebb60da6365ec3bb331c1"`)
        await db.query(`ALTER TABLE "motions_votes" DROP CONSTRAINT "FK_4c2b7f12f0fd85c431409278442"`)
        await db.query(`ALTER TABLE "motions_votes" DROP CONSTRAINT "FK_4f2b9c080e8af0d5fe86b282464"`)
        await db.query(`ALTER TABLE "council_motions" DROP CONSTRAINT "FK_23250abe555a8dbabeeb689f140"`)
        await db.query(`ALTER TABLE "tech_com_proposals_votes" DROP CONSTRAINT "FK_7163fcf683dc72fa5e6585d2808"`)
        await db.query(`ALTER TABLE "tech_com_proposals_votes" DROP CONSTRAINT "FK_f3f27ce568b9836bbd9ed47c883"`)
        await db.query(`ALTER TABLE "tech_com_proposals" DROP CONSTRAINT "FK_08fd58f7fdd4a19b548e4b6dbfd"`)
        await db.query(`ALTER TABLE "bounties_proposals" DROP CONSTRAINT "FK_ec95714128a151b900434ba745d"`)
        await db.query(`ALTER TABLE "bounties_proposals" DROP CONSTRAINT "FK_f07ad47fadc52d28d75887f1fa8"`)
        await db.query(`ALTER TABLE "bounties_proposals" DROP CONSTRAINT "FK_e052962a1b843eccaf62e600e1c"`)
        await db.query(`ALTER TABLE "all_events" DROP CONSTRAINT "FK_6533cf4da320233f8013ad9c897"`)
        await db.query(`ALTER TABLE "event_pre_image_note" DROP CONSTRAINT "FK_78d15f960ff430e079fd563fb55"`)
    }
}
