import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdvancedSearchIndex1768402099000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns if they don't exist (safety for environments without synchronize: true)
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scans' AND column_name='product_name') THEN
          ALTER TABLE scans ADD COLUMN product_name varchar;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scans' AND column_name='category') THEN
          ALTER TABLE scans ADD COLUMN category varchar;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scans' AND column_name='nutrition_grade') THEN
          ALTER TABLE scans ADD COLUMN nutrition_grade varchar;
        END IF;
      END $$;
    `);

    // Create the GIN index for full-text search as requested
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_scans_search ON scans USING GIN(to_tsvector('english', barcode_data || ' ' || COALESCE(product_name, '')));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_scans_search;`);
    await queryRunner.query(`ALTER TABLE scans DROP COLUMN IF EXISTS nutrition_grade;`);
    await queryRunner.query(`ALTER TABLE scans DROP COLUMN IF EXISTS category;`);
    await queryRunner.query(`ALTER TABLE scans DROP COLUMN IF EXISTS product_name;`);
  }
}
