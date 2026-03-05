import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandBarcodeTypeEnum1768411000000 implements MigrationInterface {
  name = 'ExpandBarcodeTypeEnum1768411000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enumTypes = [
      'AZTEC',
      'CODABAR',
      'CODE93',
      'MAXICODE',
      'RSS14',
      'RSS_EXPANDED',
      'DATA_MATRIX',
      'PDF417',
      'ISBN13',
    ];

    for (const type of enumTypes) {
      await queryRunner.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type t 
                           JOIN pg_enum e ON t.oid = e.enumtypid 
                           WHERE t.typname = 'scans_barcode_type_enum' 
                           AND e.enumlabel = '${type}') THEN
                ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE '${type}';
            END IF;
        END
        $$;
      `);
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Enum values cannot be removed in PostgreSQL without recreating the type.
    // Since these are additional types, leaving them in the enum is harmless.
  }
}
