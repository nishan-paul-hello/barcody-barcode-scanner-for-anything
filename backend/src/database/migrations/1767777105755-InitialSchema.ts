import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1767777105755 implements MigrationInterface {
  name = 'InitialSchema1767777105755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f10db2949bbea55b44f31108e1a" UNIQUE ("session_token"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f10db2949bbea55b44f31108e1" ON "sessions" ("session_token") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."scans_barcode_type_enum" AS ENUM('EAN13', 'EAN8', 'UPCA', 'UPCE', 'QR', 'CODE128', 'CODE39', 'ITF', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."scans_device_type_enum" AS ENUM('web', 'mobile')`,
    );
    await queryRunner.query(
      `CREATE TABLE "scans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "barcode_data" character varying NOT NULL, "barcode_type" "public"."scans_barcode_type_enum" NOT NULL DEFAULT 'UNKNOWN', "raw_data" text NOT NULL, "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "device_type" "public"."scans_device_type_enum" NOT NULL, "metadata" jsonb, CONSTRAINT "PK_41156c08314b9e541c1cb18c588" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a50f22da9982f3540cf1918728" ON "scans" ("barcode_data") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d1ca01b185b97c12cb5152ee00" ON "scans" ("scanned_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "google_id" character varying NOT NULL, "email" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "last_login" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0bd5012aeb82628e07f6a1be53" ON "users" ("google_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scans" ADD CONSTRAINT "FK_b1d041293c86a1bfbd15c559385" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scans" DROP CONSTRAINT "FK_b1d041293c86a1bfbd15c559385"`);
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_085d540d9f418cfbdc7bd55bb19"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_0bd5012aeb82628e07f6a1be53"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d1ca01b185b97c12cb5152ee00"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a50f22da9982f3540cf1918728"`);
    await queryRunner.query(`DROP TABLE "scans"`);
    await queryRunner.query(`DROP TYPE "public"."scans_device_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."scans_barcode_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f10db2949bbea55b44f31108e1"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
