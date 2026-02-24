import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserApiKeys1768409999999 implements MigrationInterface {
  name = 'AddUserApiKeys1768409999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "upc_database_api_key" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "barcode_lookup_api_key" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "barcode_lookup_api_key"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "upc_database_api_key"`);
  }
}
