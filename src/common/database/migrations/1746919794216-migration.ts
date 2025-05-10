import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746919794216 implements MigrationInterface {
  name = 'Migration1746919794216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "managers_station_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "employees_colony_id_fk" FOREIGN KEY ("colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employees" DROP CONSTRAINT "employees_colony_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employees" ADD CONSTRAINT "managers_station_id_fk" FOREIGN KEY ("station_id", "colony_id") REFERENCES "colonies"("id","id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
