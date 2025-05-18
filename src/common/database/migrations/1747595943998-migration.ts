import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1747595943998 implements MigrationInterface {
    name = 'Migration1747595943998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartments" ADD "rooms" integer`);
        await queryRunner.query(`ALTER TABLE "apartments" ADD "bathrooms" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartments" DROP COLUMN "bathrooms"`);
        await queryRunner.query(`ALTER TABLE "apartments" DROP COLUMN "rooms"`);
    }

}
