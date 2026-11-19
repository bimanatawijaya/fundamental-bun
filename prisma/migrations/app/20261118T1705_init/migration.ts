#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/ff2421f934e59bc012ddd04c764c55dfd2c23fc499312a8fb1274813673ae8ad/contract';
import endContract from '../../snapshots/ff2421f934e59bc012ddd04c764c55dfd2c23fc499312a8fb1274813673ae8ad/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-mysql/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: 'contacts',
        columns: [
          col('email', 'varchar(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('id', 'int', {
            notNull: true,
            default: fn(sql`autoincrement()`),
            codecRef: { codecId: 'mysql/int@1' },
          }),
          col('name', 'varchar(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('phone', 'varchar(28)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 28 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
