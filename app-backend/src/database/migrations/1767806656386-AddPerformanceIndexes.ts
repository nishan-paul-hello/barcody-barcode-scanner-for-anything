import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1767806656386 implements MigrationInterface {
  name = 'AddPerformanceIndexes1767806656386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_f10db2949bbea55b44f31108e1"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a50f22da9982f3540cf1918728"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d1ca01b185b97c12cb5152ee00"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0bd5012aeb82628e07f6a1be53"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_sessions_token" ON "sessions" ("session_token") `,
    );
    await queryRunner.query(`CREATE INDEX "idx_scans_barcode_data" ON "scans" ("barcode_data") `);
    await queryRunner.query(
      `CREATE INDEX "idx_scans_user_id_scanned_at" ON "scans" ("user_id", "scanned_at" DESC) `,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_users_google_id" ON "users" ("google_id") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_users_google_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_scans_user_id_scanned_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_scans_barcode_data"`);
    await queryRunner.query(`DROP INDEX "public"."idx_sessions_token"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0bd5012aeb82628e07f6a1be53" ON "users" ("google_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d1ca01b185b97c12cb5152ee00" ON "scans" ("scanned_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a50f22da9982f3540cf1918728" ON "scans" ("barcode_data") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f10db2949bbea55b44f31108e1" ON "sessions" ("session_token") `,
    );
  }
}
