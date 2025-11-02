import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddHashedRefreshToken1761859999999 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'users',
			new TableColumn({
				name: 'hashedRefreshedToken',
				type: 'varchar',
				length: '255',
				isNullable: true,
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('users', 'hashedRefreshedToken');
	}
}


