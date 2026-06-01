import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1779891272252 implements MigrationInterface {
    name = 'CreateNotificationsTable1779891272252'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('NEW_REQUEST', 'REJECTED', 'ACCEPTED')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "receiverId" character varying NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "skillName" character varying NOT NULL, "fromUserId" character varying NOT NULL, "fromUserName" character varying NOT NULL, "requestId" character varying, "message" character varying, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    }

}
