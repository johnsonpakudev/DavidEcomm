import { z } from "zod";

/** Accepts Postgres UUID columns, including deterministic seed IDs. */
const postgresUuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const postgresUuidSchema = z
  .string()
  .regex(postgresUuidPattern, "Invalid ID format.");

export const optionalPostgresUuidSchema = postgresUuidSchema.nullable().optional();
