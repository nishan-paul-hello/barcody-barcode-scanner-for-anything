import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingUserApiKeyColumns1768420000000 implements MigrationInterface {
  name = 'AddMissingUserApiKeyColumns1768420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "usda_food_data_api_key" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "go_upc_api_key" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "search_upc_api_key" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "search_upc_api_key"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "go_upc_api_key"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "usda_food_data_api_key"`);
  }
}
