import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "payload"."enum_homepage_heroes_layout" AS ENUM('promo', 'standard');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "payload"."homepage_heroes" ADD COLUMN IF NOT EXISTS "layout" "payload"."enum_homepage_heroes_layout" DEFAULT 'promo' NOT NULL;
    ALTER TABLE "payload"."homepage_heroes" ADD COLUMN IF NOT EXISTS "badge" varchar DEFAULT 'ON SPECIAL';
    ALTER TABLE "payload"."homepage_heroes" ADD COLUMN IF NOT EXISTS "brand_name" varchar;
    ALTER TABLE "payload"."homepage_heroes" ADD COLUMN IF NOT EXISTS "compare_at_price" numeric;
    ALTER TABLE "payload"."homepage_heroes" ADD COLUMN IF NOT EXISTS "price" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload"."homepage_heroes" DROP COLUMN IF EXISTS "layout";
    ALTER TABLE "payload"."homepage_heroes" DROP COLUMN IF EXISTS "badge";
    ALTER TABLE "payload"."homepage_heroes" DROP COLUMN IF EXISTS "brand_name";
    ALTER TABLE "payload"."homepage_heroes" DROP COLUMN IF EXISTS "compare_at_price";
    ALTER TABLE "payload"."homepage_heroes" DROP COLUMN IF EXISTS "price";
    DROP TYPE IF EXISTS "payload"."enum_homepage_heroes_layout";
  `)
}
