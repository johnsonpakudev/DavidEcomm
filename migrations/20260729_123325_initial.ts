import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE SCHEMA IF NOT EXISTS "payload";
   CREATE TYPE "payload"."enum_homepage_category_shortcuts_icon_key" AS ENUM('vanities', 'bath-tubs', 'toilet-suites', 'tapware', 'doors', 'kitchen-sinks', 'basins', 'mirrors', 'shower-screens', 'floor-wastes', 'door-handles', 'bidets');
  CREATE TYPE "payload"."enum_homepage_product_carousels_key" AS ENUM('featured', 'best-sellers', 'new-arrivals');
  CREATE TYPE "payload"."enum_homepage_product_carousels_selection_mode" AS ENUM('collection', 'manual', 'rule');
  CREATE TYPE "payload"."enum_homepage_product_carousels_sort" AS ENUM('featured', 'newest', 'price-asc', 'price-desc');
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_heroes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"subheadline" varchar,
  	"cta_text" varchar,
  	"cta_href" varchar,
  	"image_id" integer,
  	"external_image_url" varchar,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "payload"."homepage_collections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"cta_text" varchar DEFAULT 'Shop collection',
  	"image_id" integer,
  	"external_image_url" varchar
  );
  
  CREATE TABLE "payload"."homepage_inspiration" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"external_image_url" varchar,
  	"alt_text" varchar NOT NULL,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "payload"."homepage_category_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon_key" "payload"."enum_homepage_category_shortcuts_icon_key" NOT NULL
  );
  
  CREATE TABLE "payload"."homepage_product_carousels_product_slugs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar
  );
  
  CREATE TABLE "payload"."homepage_product_carousels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "payload"."enum_homepage_product_carousels_key" NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"view_all_href" varchar,
  	"cta_label" varchar DEFAULT 'View collection',
  	"selection_mode" "payload"."enum_homepage_product_carousels_selection_mode" DEFAULT 'collection' NOT NULL,
  	"collection_slug" varchar,
  	"sort" "payload"."enum_homepage_product_carousels_sort" DEFAULT 'featured',
  	"limit" numeric DEFAULT 4,
  	"active" boolean DEFAULT true
  );
  
  CREATE TABLE "payload"."homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"promo_eyebrow" varchar,
  	"promo_headline" varchar NOT NULL,
  	"promo_subtext" varchar,
  	"promo_cta_text" varchar,
  	"promo_cta_href" varchar,
  	"promo_image_id" integer,
  	"promo_external_image_url" varchar,
  	"promo_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_heroes" ADD CONSTRAINT "homepage_heroes_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_heroes" ADD CONSTRAINT "homepage_heroes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_collections" ADD CONSTRAINT "homepage_collections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_collections" ADD CONSTRAINT "homepage_collections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_inspiration" ADD CONSTRAINT "homepage_inspiration_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."homepage_inspiration" ADD CONSTRAINT "homepage_inspiration_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_category_shortcuts" ADD CONSTRAINT "homepage_category_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_product_carousels_product_slugs" ADD CONSTRAINT "homepage_product_carousels_product_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage_product_carousels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage_product_carousels" ADD CONSTRAINT "homepage_product_carousels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."homepage" ADD CONSTRAINT "homepage_promo_image_id_media_id_fk" FOREIGN KEY ("promo_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_heroes_order_idx" ON "payload"."homepage_heroes" USING btree ("_order");
  CREATE INDEX "homepage_heroes_parent_id_idx" ON "payload"."homepage_heroes" USING btree ("_parent_id");
  CREATE INDEX "homepage_heroes_image_idx" ON "payload"."homepage_heroes" USING btree ("image_id");
  CREATE INDEX "homepage_collections_order_idx" ON "payload"."homepage_collections" USING btree ("_order");
  CREATE INDEX "homepage_collections_parent_id_idx" ON "payload"."homepage_collections" USING btree ("_parent_id");
  CREATE INDEX "homepage_collections_image_idx" ON "payload"."homepage_collections" USING btree ("image_id");
  CREATE INDEX "homepage_inspiration_order_idx" ON "payload"."homepage_inspiration" USING btree ("_order");
  CREATE INDEX "homepage_inspiration_parent_id_idx" ON "payload"."homepage_inspiration" USING btree ("_parent_id");
  CREATE INDEX "homepage_inspiration_image_idx" ON "payload"."homepage_inspiration" USING btree ("image_id");
  CREATE INDEX "homepage_category_shortcuts_order_idx" ON "payload"."homepage_category_shortcuts" USING btree ("_order");
  CREATE INDEX "homepage_category_shortcuts_parent_id_idx" ON "payload"."homepage_category_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "homepage_product_carousels_product_slugs_order_idx" ON "payload"."homepage_product_carousels_product_slugs" USING btree ("_order");
  CREATE INDEX "homepage_product_carousels_product_slugs_parent_id_idx" ON "payload"."homepage_product_carousels_product_slugs" USING btree ("_parent_id");
  CREATE INDEX "homepage_product_carousels_order_idx" ON "payload"."homepage_product_carousels" USING btree ("_order");
  CREATE INDEX "homepage_product_carousels_parent_id_idx" ON "payload"."homepage_product_carousels" USING btree ("_parent_id");
  CREATE INDEX "homepage_promo_promo_image_idx" ON "payload"."homepage" USING btree ("promo_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."homepage_heroes" CASCADE;
  DROP TABLE "payload"."homepage_collections" CASCADE;
  DROP TABLE "payload"."homepage_inspiration" CASCADE;
  DROP TABLE "payload"."homepage_category_shortcuts" CASCADE;
  DROP TABLE "payload"."homepage_product_carousels_product_slugs" CASCADE;
  DROP TABLE "payload"."homepage_product_carousels" CASCADE;
  DROP TABLE "payload"."homepage" CASCADE;
  DROP TYPE "payload"."enum_homepage_category_shortcuts_icon_key";
  DROP TYPE "payload"."enum_homepage_product_carousels_key";
  DROP TYPE "payload"."enum_homepage_product_carousels_selection_mode";
  DROP TYPE "payload"."enum_homepage_product_carousels_sort";`)
}
