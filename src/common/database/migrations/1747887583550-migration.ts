import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747887583550 implements MigrationInterface {
  name = 'Migration1747887583550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "user_email_ukey"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "user_email_ukey" ON "users" ("email") WHERE deleted_at is null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."user_email_ukey"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "user_email_ukey" UNIQUE ("email")`,
    );
  }
}
