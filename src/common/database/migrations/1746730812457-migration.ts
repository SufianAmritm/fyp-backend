import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1746730812457 implements MigrationInterface {
  name = 'Migration1746730812457';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "apartments" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "house_no" character varying NOT NULL, "street_no" character varying NOT NULL, "address" character varying NOT NULL, "description" character varying NOT NULL, "colony_id" integer NOT NULL, "created_by_id" integer NOT NULL, CONSTRAINT "PK_f6058e85d6d715dbe22b72fe722" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "colonies" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" character varying NOT NULL, "station_id" integer NOT NULL, "created_by_id" integer NOT NULL, CONSTRAINT "PK_1ec375177f47ca493ae5c0048af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "managers" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "stations" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisions" ADD "description" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "apartments" ADD CONSTRAINT "apartments_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "apartments" ADD CONSTRAINT "apartments_colony_id_fk" FOREIGN KEY ("colony_id") REFERENCES "colonies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "colonies" ADD CONSTRAINT "colonies_created_by_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "colonies" ADD CONSTRAINT "colonies_station_id_fk" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "colonies" DROP CONSTRAINT "colonies_station_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "colonies" DROP CONSTRAINT "colonies_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "apartments" DROP CONSTRAINT "apartments_colony_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "apartments" DROP CONSTRAINT "apartments_created_by_id_fk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisions" DROP COLUMN "description"`,
    );
    await queryRunner.query(`ALTER TABLE "stations" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "managers" DROP COLUMN "description"`);
    await queryRunner.query(`DROP TABLE "colonies"`);
    await queryRunner.query(`DROP TABLE "apartments"`);
  }
}
