import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandBarcodeTypeEnum1768411000000 implements MigrationInterface {
  name = 'ExpandBarcodeTypeEnum1768411000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'AZTEC'`);
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'CODABAR'`);
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'CODE93'`);
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'MAXICODE'`);
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'RSS14'`);
    await queryRunner.query(
      `ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'RSS_EXPANDED'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'DATA_MATRIX'`,
    );
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'PDF417'`);
    await queryRunner.query(`ALTER TYPE "public"."scans_barcode_type_enum" ADD VALUE 'ISBN13'`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Enum values cannot be removed in PostgreSQL without recreating the type.
    // Since these are additional types, leaving them in the enum is harmless.
  }
}
