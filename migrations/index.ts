import * as migration_20260729_123325_initial from './20260729_123325_initial';
import * as migration_20260729_125941_hero_promo_fields from './20260729_125941_hero_promo_fields';

export const migrations = [
  {
    up: migration_20260729_123325_initial.up,
    down: migration_20260729_123325_initial.down,
    name: '20260729_123325_initial',
  },
  {
    up: migration_20260729_125941_hero_promo_fields.up,
    down: migration_20260729_125941_hero_promo_fields.down,
    name: '20260729_125941_hero_promo_fields'
  },
];
