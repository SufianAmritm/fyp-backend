import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1747847766575 implements MigrationInterface {
  name = 'Migration1747847766575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."history_type_enum" AS ENUM('apartment', 'employee')`,
    );
    await queryRunner.query(
      `CREATE TABLE "history" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "type" "public"."history_type_enum" NOT NULL, "text" character varying NOT NULL, "employee_id" integer, "apartment_id" integer, CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ADD CONSTRAINT "history_apartment_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" ADD CONSTRAINT "history_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "history" DROP CONSTRAINT "history_employee_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "history" DROP CONSTRAINT "history_apartment_id_fk"`,
    );
    await queryRunner.query(`DROP TABLE "history"`);
    await queryRunner.query(`DROP TYPE "public"."history_type_enum"`);
  }
}
