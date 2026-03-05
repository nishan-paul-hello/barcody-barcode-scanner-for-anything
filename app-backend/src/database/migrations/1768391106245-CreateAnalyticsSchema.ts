import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsSchema1768391106245 implements MigrationInterface {
  name = 'CreateAnalyticsSchema1768391106245';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "analytics"`);
    await queryRunner.query(
      `CREATE TABLE "analytics"."user_behavior" ("id" SERIAL NOT NULL, "hashed_user_id" character varying(64) NOT NULL, "session_length" integer NOT NULL DEFAULT '0', "scan_frequency" double precision NOT NULL DEFAULT '0', "retention_day" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5a7cd6d00de0e036b185f6a23eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_user_behavior_hashed_id" ON "analytics"."user_behavior" ("hashed_user_id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics"."usage_stats" ("date" date NOT NULL, "total_scans" integer NOT NULL DEFAULT '0', "active_users" integer NOT NULL DEFAULT '0', "new_users" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_02071b6ee0bd553ee79536624f0" PRIMARY KEY ("date"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usage_stats_date" ON "analytics"."usage_stats" ("date" DESC)`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics"."scan_metrics" ("id" SERIAL NOT NULL, "date" date NOT NULL, "barcode_type" character varying(50) NOT NULL, "success_count" integer NOT NULL DEFAULT '0', "error_count" integer NOT NULL DEFAULT '0', "avg_scan_time" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_27964cbc657fc96d261f6069e88" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_scan_metrics_date_type" ON "analytics"."scan_metrics" ("date" DESC, "barcode_type")`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics"."device_stats" ("id" SERIAL NOT NULL, "device_model" character varying(100) NOT NULL, "os_version" character varying(50) NOT NULL, "camera_specs" text, "scan_count" integer NOT NULL DEFAULT '0', "avg_fps" double precision NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c18b57b6439d19a9ed29248f0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics"."error_stats" ("id" SERIAL NOT NULL, "date" date NOT NULL, "error_type" character varying(100) NOT NULL, "count" integer NOT NULL DEFAULT '0', "device_type" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_013f169dab04af0f4cfed295f91" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_error_stats_date" ON "analytics"."error_stats" ("date" DESC)`,
    );
    await queryRunner.query(
      `CREATE TABLE "analytics"."api_metrics" ("id" SERIAL NOT NULL, "endpoint" character varying(200) NOT NULL, "method" character varying(10) NOT NULL, "response_time" integer NOT NULL DEFAULT '0', "status_code" integer NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_344e25f39432fcda56730db7bfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_api_metrics_timestamp" ON "analytics"."api_metrics" ("timestamp" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "analytics"."idx_api_metrics_timestamp"`);
    await queryRunner.query(`DROP TABLE "analytics"."api_metrics"`);
    await queryRunner.query(`DROP INDEX "analytics"."idx_error_stats_date"`);
    await queryRunner.query(`DROP TABLE "analytics"."error_stats"`);
    await queryRunner.query(`DROP TABLE "analytics"."device_stats"`);
    await queryRunner.query(`DROP INDEX "analytics"."idx_scan_metrics_date_type"`);
    await queryRunner.query(`DROP TABLE "analytics"."scan_metrics"`);
    await queryRunner.query(`DROP INDEX "analytics"."idx_usage_stats_date"`);
    await queryRunner.query(`DROP TABLE "analytics"."usage_stats"`);
    await queryRunner.query(`DROP INDEX "analytics"."idx_user_behavior_hashed_id"`);
    await queryRunner.query(`DROP TABLE "analytics"."user_behavior"`);
  }
}
