import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1761314772874 implements MigrationInterface {
    name = 'InitialMigration1761314772874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "location" ("location_id" int NOT NULL IDENTITY(1,1), "locatin_name" varchar(255) NOT NULL, "address" varchar(255) NOT NULL, "contact_number" varchar(100) NOT NULL, CONSTRAINT "PK_b6e6c23b493859e5875de66c18d" PRIMARY KEY ("location_id"))`);
        await queryRunner.query(`CREATE TABLE "maintenance" ("maintenance_id" int NOT NULL IDENTITY(1,1), "maintenance_date" datetime2 NOT NULL, "description" text NOT NULL, "cost" decimal(10,2) NOT NULL, "CarID" int, CONSTRAINT "PK_7ba32feeb1b035188d3a2294422" PRIMARY KEY ("maintenance_id"))`);
        await queryRunner.query(`CREATE TABLE "insuarance" ("insuarance_id" int NOT NULL IDENTITY(1,1), "insuarance_provider" varchar(255) NOT NULL, "policy_number" varchar(100) NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "car_id" int, CONSTRAINT "PK_f610bd63e132576a7900925489a" PRIMARY KEY ("insuarance_id"))`);
        await queryRunner.query(`CREATE TABLE "car" ("car_id" int NOT NULL IDENTITY(1,1), "carModel" varchar(100) NOT NULL, "Manufacturer" varchar(100) NOT NULL, "year" int NOT NULL, "color" varchar(50) NOT NULL, "RentalRate" varchar(20) NOT NULL, "availabilityStatus" bit NOT NULL CONSTRAINT "DF_32d95d2410116956e048368ee82" DEFAULT 1, "locationID" int NOT NULL, CONSTRAINT "UQ_0a3c4f2e612986aeed6295a1631" UNIQUE ("RentalRate"), CONSTRAINT "UQ_49b573337964b1c2a6973ded105" UNIQUE ("locationID"), CONSTRAINT "PK_1755d5edaf7738f5780f57a445f" PRIMARY KEY ("car_id"))`);
        await queryRunner.query(`CREATE TABLE "payment" ("payment_id" int NOT NULL IDENTITY(1,1), "payment_date" datetime2 NOT NULL, "amount" decimal(10,2) NOT NULL, "payment_method" varchar(100) NOT NULL, "RentalID" int, CONSTRAINT "PK_9fff60ac6ac1844ea4e0cfba67a" PRIMARY KEY ("payment_id"))`);
        await queryRunner.query(`CREATE TABLE "rental" ("rental_id" int NOT NULL IDENTITY(1,1), "rentalStart_date" datetime2 NOT NULL, "rentalEnd_date" datetime2 NOT NULL, "total_amount" decimal(10,2) NOT NULL, "CustomerID" int, "CarID" int, CONSTRAINT "PK_c9401b91637d3f3b6c821c3a3d4" PRIMARY KEY ("rental_id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("customer_id" int NOT NULL IDENTITY(1,1), "first_name" varchar(100) NOT NULL, "last_name" varchar(100) NOT NULL, "email" varchar(255) NOT NULL, "phone_number" varchar(15) NOT NULL, "address" varchar(255) NOT NULL, CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_cde3d123fc6077bcd75eb051226" PRIMARY KEY ("customer_id"))`);
        await queryRunner.query(`CREATE TABLE "reservation" ("reservation_id" int NOT NULL IDENTITY(1,1), "reservation_date" datetime2 NOT NULL, "pickup_date" datetime2 NOT NULL, "return_date" datetime2 NOT NULL, "CustomerID" int, "CarID" int, CONSTRAINT "PK_1c8fc6b24242c3d8cd5fde324ea" PRIMARY KEY ("reservation_id"))`);
        await queryRunner.query(`ALTER TABLE "maintenance" ADD CONSTRAINT "FK_5645f4b87b48f145847efbe30cd" FOREIGN KEY ("CarID") REFERENCES "car"("car_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "insuarance" ADD CONSTRAINT "FK_263ce1144eda7f030a27fc161c4" FOREIGN KEY ("car_id") REFERENCES "car"("car_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car" ADD CONSTRAINT "FK_49b573337964b1c2a6973ded105" FOREIGN KEY ("locationID") REFERENCES "location"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_1b306ff68479859f05bc62c8dbc" FOREIGN KEY ("RentalID") REFERENCES "rental"("rental_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rental" ADD CONSTRAINT "FK_48858513022f2c40f851b44b5d9" FOREIGN KEY ("CustomerID") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rental" ADD CONSTRAINT "FK_308464233cdc170c9be608e9b19" FOREIGN KEY ("CarID") REFERENCES "car"("car_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_9174488bc189d68615a4b3aa166" FOREIGN KEY ("CustomerID") REFERENCES "customer"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation" ADD CONSTRAINT "FK_32c7717f65bda30d782518e71bb" FOREIGN KEY ("CarID") REFERENCES "car"("car_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_32c7717f65bda30d782518e71bb"`);
        await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT "FK_9174488bc189d68615a4b3aa166"`);
        await queryRunner.query(`ALTER TABLE "rental" DROP CONSTRAINT "FK_308464233cdc170c9be608e9b19"`);
        await queryRunner.query(`ALTER TABLE "rental" DROP CONSTRAINT "FK_48858513022f2c40f851b44b5d9"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_1b306ff68479859f05bc62c8dbc"`);
        await queryRunner.query(`ALTER TABLE "car" DROP CONSTRAINT "FK_49b573337964b1c2a6973ded105"`);
        await queryRunner.query(`ALTER TABLE "insuarance" DROP CONSTRAINT "FK_263ce1144eda7f030a27fc161c4"`);
        await queryRunner.query(`ALTER TABLE "maintenance" DROP CONSTRAINT "FK_5645f4b87b48f145847efbe30cd"`);
        await queryRunner.query(`DROP TABLE "reservation"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "rental"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TABLE "car"`);
        await queryRunner.query(`DROP TABLE "insuarance"`);
        await queryRunner.query(`DROP TABLE "maintenance"`);
        await queryRunner.query(`DROP TABLE "location"`);
    }

}
