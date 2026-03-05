import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsEventsTable1768388637242 implements MigrationInterface {
  name = 'CreateAnalyticsEventsTable1768388637242';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "analytics_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "event_type" character varying NOT NULL,
                "user_id" character varying NOT NULL,
                "metadata" jsonb,
                "timestamp" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_analytics_events_id" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_analytics_event_type" ON "analytics_events" ("event_type")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_analytics_timestamp" ON "analytics_events" ("timestamp")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_analytics_timestamp"`);
    await queryRunner.query(`DROP INDEX "IDX_analytics_event_type"`);
    await queryRunner.query(`DROP TABLE "analytics_events"`);
  }
}
