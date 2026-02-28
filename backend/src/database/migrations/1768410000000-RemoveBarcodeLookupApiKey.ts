import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBarcodeLookupApiKey1768410000000 implements MigrationInterface {
  name = 'RemoveBarcodeLookupApiKey1768410000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "barcode_lookup_api_key"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "barcode_lookup_api_key" character varying`,
    );
  }
}
