import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExerciseRelations1743100248762 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE "exercise"
          ADD COLUMN "duration" int;
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE "exercise"
          DROP COLUMN "duration";
        `);
      }

}
