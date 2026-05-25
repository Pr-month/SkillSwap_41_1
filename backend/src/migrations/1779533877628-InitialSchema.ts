import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1779533877628 implements MigrationInterface {
    name = 'InitialSchema1779533877628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "parentId" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying(500), "images" text array NOT NULL DEFAULT '{}', "categoryId" uuid NOT NULL, "ownerId" uuid, CONSTRAINT "UQ_e7dd509fc6a2dddb2ec6a72b108" UNIQUE ("title"), CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "city" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_f8c0858628830a35f19efdc0ecf" UNIQUE ("name"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(80) NOT NULL, "email" character varying(50) NOT NULL, "password" character varying(255) NOT NULL, "about" character varying(500), "birthdate" date, "gender" "public"."users_gender_enum", "avatar" character varying(256), "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "refreshToken" character varying(256), "cityId" integer, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'inProgress', 'done')`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."requests_status_enum" NOT NULL DEFAULT 'pending', "isRead" boolean NOT NULL DEFAULT false, "senderId" uuid, "receiverId" uuid, "offeredSkillId" uuid, "requestedSkillId" uuid, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_want_to_learn_categories" ("usersId" uuid NOT NULL, "categoriesId" uuid NOT NULL, CONSTRAINT "PK_1e550a44f0cb49ca1d8c0347776" PRIMARY KEY ("usersId", "categoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_faef053712bbfb769bb4db2ef5" ON "users_want_to_learn_categories" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7431e8f4874375aaefdc796d37" ON "users_want_to_learn_categories" ("categoriesId") `);
        await queryRunner.query(`CREATE TABLE "users_favorite_skills_skills" ("usersId" uuid NOT NULL, "skillsId" uuid NOT NULL, CONSTRAINT "PK_5b02519a834ac18df11ed5483c9" PRIMARY KEY ("usersId", "skillsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ac039a65510394e1b3d6d67d62" ON "users_favorite_skills_skills" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b42e516adfb3478eb326ea020d" ON "users_favorite_skills_skills" ("skillsId") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "FK_06d267f85858229c10a01a08ad7" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skills" ADD CONSTRAINT "FK_7f11181516e823da9421dc5433d" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_3785318df310caf8cb8e1e37d85" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_df2b65da9fe84c28e82f221bcd5" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_305aae1d71ec0c00921c91aeae8" FOREIGN KEY ("offeredSkillId") REFERENCES "skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_e7acd23bb9c360b83cb3bfecfa6" FOREIGN KEY ("requestedSkillId") REFERENCES "skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_want_to_learn_categories" ADD CONSTRAINT "FK_faef053712bbfb769bb4db2ef5a" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_want_to_learn_categories" ADD CONSTRAINT "FK_7431e8f4874375aaefdc796d37b" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favorite_skills_skills" ADD CONSTRAINT "FK_ac039a65510394e1b3d6d67d624" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favorite_skills_skills" ADD CONSTRAINT "FK_b42e516adfb3478eb326ea020d2" FOREIGN KEY ("skillsId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_favorite_skills_skills" DROP CONSTRAINT "FK_b42e516adfb3478eb326ea020d2"`);
        await queryRunner.query(`ALTER TABLE "users_favorite_skills_skills" DROP CONSTRAINT "FK_ac039a65510394e1b3d6d67d624"`);
        await queryRunner.query(`ALTER TABLE "users_want_to_learn_categories" DROP CONSTRAINT "FK_7431e8f4874375aaefdc796d37b"`);
        await queryRunner.query(`ALTER TABLE "users_want_to_learn_categories" DROP CONSTRAINT "FK_faef053712bbfb769bb4db2ef5a"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_e7acd23bb9c360b83cb3bfecfa6"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_305aae1d71ec0c00921c91aeae8"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_df2b65da9fe84c28e82f221bcd5"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_3785318df310caf8cb8e1e37d85"`);
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "FK_7f11181516e823da9421dc5433d"`);
        await queryRunner.query(`ALTER TABLE "skills" DROP CONSTRAINT "FK_06d267f85858229c10a01a08ad7"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b42e516adfb3478eb326ea020d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ac039a65510394e1b3d6d67d62"`);
        await queryRunner.query(`DROP TABLE "users_favorite_skills_skills"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7431e8f4874375aaefdc796d37"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_faef053712bbfb769bb4db2ef5"`);
        await queryRunner.query(`DROP TABLE "users_want_to_learn_categories"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP TABLE "city"`);
        await queryRunner.query(`DROP TABLE "skills"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
