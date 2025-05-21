import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747846739091 implements MigrationInterface {
  name = 'Migration1747846739091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "text" character varying NOT NULL, "title" character varying NOT NULL, "user_id" integer NOT NULL, "sent_at" TIMESTAMP WITH TIME ZONE, "seen" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_requests" ADD "uid" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" ADD "uid" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "applications" ADD "uid" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisions" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "colonies" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "colonies" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisions" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "applications" DROP COLUMN "uid"`);
    await queryRunner.query(
      `ALTER TABLE "transfer_requests" DROP COLUMN "uid"`,
    );
    await queryRunner.query(`ALTER TABLE "vacancy_requests" DROP COLUMN "uid"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
