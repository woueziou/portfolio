

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "cac_auth";


ALTER SCHEMA "cac_auth" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "cac_marketing";


ALTER SCHEMA "cac_marketing" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "cac_store";


ALTER SCHEMA "cac_store" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "chris_test";


ALTER SCHEMA "chris_test" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "degarde";


ALTER SCHEMA "degarde" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "taaseekpaye-dev";


ALTER SCHEMA "taaseekpaye-dev" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "taasekpaye-cms";


ALTER SCHEMA "taasekpaye-cms" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "cac_store"."currency_enum" AS ENUM (
    'XOF',
    'USD',
    'EUR'
);


ALTER TYPE "cac_store"."currency_enum" OWNER TO "postgres";


CREATE TYPE "public"."project_status" AS ENUM (
    'ongoing',
    'finished',
    'production'
);


ALTER TYPE "public"."project_status" OWNER TO "postgres";


CREATE TYPE "public"."project_type" AS ENUM (
    'web',
    'mobile',
    'script',
    'backend',
    'infra',
    'llm',
    'ai'
);


ALTER TYPE "public"."project_type" OWNER TO "postgres";


CREATE TYPE "taaseekpaye-dev"."enum_project_types" AS ENUM (
    'backend',
    'mobile',
    'scripts',
    'web',
    'infra',
    'ai'
);


ALTER TYPE "taaseekpaye-dev"."enum_project_types" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "cac_auth"."account" (
    "id" "text" NOT NULL,
    "account_id" "text" NOT NULL,
    "provider_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "access_token" "text",
    "refresh_token" "text",
    "id_token" "text",
    "access_token_expires_at" timestamp without time zone,
    "refresh_token_expires_at" timestamp without time zone,
    "scope" "text",
    "password" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone NOT NULL
);


ALTER TABLE "cac_auth"."account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_auth"."session" (
    "id" "text" NOT NULL,
    "expires_at" timestamp without time zone NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone NOT NULL,
    "ip_address" "text",
    "user_agent" "text",
    "user_id" "text" NOT NULL
);


ALTER TABLE "cac_auth"."session" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_auth"."user" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" "text",
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_auth"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_auth"."verification" (
    "id" "text" NOT NULL,
    "identifier" "text" NOT NULL,
    "value" "text" NOT NULL,
    "expires_at" timestamp without time zone NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_auth"."verification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_marketing"."customer" (
    "id" "text" NOT NULL,
    "email" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_marketing"."customer" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_marketing"."rsvps" (
    "id" "text" NOT NULL,
    "customerInfo" "jsonb" NOT NULL,
    "service" "text" NOT NULL,
    "date" "date" NOT NULL,
    "hour" "text" NOT NULL,
    "is_done" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "is_confirmed" boolean DEFAULT false NOT NULL,
    "note" "text"
);


ALTER TABLE "cac_marketing"."rsvps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_marketing"."services" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "estimated_time" "text" NOT NULL,
    "minPrice" "text" NOT NULL,
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_marketing"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."product" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "added_by" "text" NOT NULL,
    "barcode" "text",
    "product_type_id" "text" NOT NULL,
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."product" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."product_image" (
    "id" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "alt_text" "text",
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."product_image" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."product_type" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."product_type" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."product_variant" (
    "id" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "attributes" "jsonb" DEFAULT '{}'::"jsonb",
    "sku" "text",
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."product_variant" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."purchase_batch" (
    "id" "text" NOT NULL,
    "done_by" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "variant_id" "text",
    "quantity" integer NOT NULL,
    "quantity_remaining" integer NOT NULL,
    "buying_price" double precision NOT NULL,
    "currency" "cac_store"."currency_enum" DEFAULT 'XOF'::"cac_store"."currency_enum" NOT NULL,
    "supplier_name" "text",
    "batch_note" "text",
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."purchase_batch" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."sale" (
    "id" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "variant_id" "text",
    "quantity" integer NOT NULL,
    "selling_price" double precision NOT NULL,
    "buying_price" double precision NOT NULL,
    "currency" "cac_store"."currency_enum" DEFAULT 'XOF'::"cac_store"."currency_enum" NOT NULL,
    "profit" double precision NOT NULL,
    "customer_name" "text",
    "sale_note" "text",
    "done_by" "text" NOT NULL,
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."sale" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."sale_batch_link" (
    "id" "text" NOT NULL,
    "sale_id" "text" NOT NULL,
    "batch_id" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."sale_batch_link" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "cac_store"."selling_price" (
    "id" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "variant_id" "text",
    "price_cents" integer NOT NULL,
    "currency" "cac_store"."currency_enum" DEFAULT 'XOF'::"cac_store"."currency_enum" NOT NULL,
    "price_type" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "valid_from" "text",
    "valid_until" "text",
    "updated_at" timestamp without time zone,
    "disabled_at" timestamp without time zone,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "cac_store"."selling_price" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "chris_test"."message" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "content" "text" NOT NULL
);


ALTER TABLE "chris_test"."message" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."daily_metrics" (
    "date" "date" NOT NULL,
    "visit_count" integer DEFAULT 1 NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "degarde"."daily_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."duty_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "degarde"."duty_periods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "phone" character varying(255),
    "idea" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "degarde"."feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."insurances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "logo_url" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "degarde"."insurances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."pharmacies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "base_address" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "degarde"."pharmacies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."pharmacies_to_insurances" (
    "pharmacy_id" "uuid" NOT NULL,
    "insurance_id" "uuid" NOT NULL
);


ALTER TABLE "degarde"."pharmacies_to_insurances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "degarde"."pharmacy_duties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pharmacy_id" "uuid" NOT NULL,
    "duty_period_id" "uuid" NOT NULL,
    "phones" "text" NOT NULL
);


ALTER TABLE "degarde"."pharmacy_duties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."articles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" character varying NOT NULL,
    "summary" "text",
    "image_url" "text",
    "user_id" "uuid" NOT NULL,
    "url" "text"
);


ALTER TABLE "public"."articles" OWNER TO "postgres";


ALTER TABLE "public"."articles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."articles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contact_providers" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."contact_providers" OWNER TO "postgres";


ALTER TABLE "public"."contact_providers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."contact_providers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "description" "text",
    "title" character varying NOT NULL,
    "socials" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "skills" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "avatar_url" "text",
    "username" character varying NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "main_image_url" "text",
    "url" "text",
    "state" "public"."project_status",
    "user_id" "uuid" NOT NULL,
    "project_date" timestamp with time zone NOT NULL,
    "type" "public"."project_type"[] DEFAULT '{}'::"public"."project_type"[] NOT NULL,
    "tech_stack" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


ALTER TABLE "public"."projects" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."projects_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."language" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "icon_url_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."language" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."language_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."language_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."language_id_seq" OWNED BY "taaseekpaye-dev"."language"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."media" (
    "id" integer NOT NULL,
    "alt" character varying NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "url" character varying,
    "thumbnail_u_r_l" character varying,
    "filename" character varying,
    "mime_type" character varying,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
);


ALTER TABLE "taaseekpaye-dev"."media" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."media_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."media_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."media_id_seq" OWNED BY "taaseekpaye-dev"."media"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."owner" (
    "id" integer NOT NULL,
    "first_name" character varying NOT NULL,
    "last_name" character varying NOT NULL,
    "title" character varying,
    "bio" "jsonb",
    "profile_pic_id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
);


ALTER TABLE "taaseekpaye-dev"."owner" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."owner_contacts" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "provider_id" integer,
    "url" character varying
);


ALTER TABLE "taaseekpaye-dev"."owner_contacts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."owner_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."owner_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."owner_id_seq" OWNED BY "taaseekpaye-dev"."owner"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."payload_kv" (
    "id" integer NOT NULL,
    "key" character varying NOT NULL,
    "data" "jsonb" NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."payload_kv" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."payload_kv_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."payload_kv_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."payload_kv_id_seq" OWNED BY "taaseekpaye-dev"."payload_kv"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."payload_locked_documents" (
    "id" integer NOT NULL,
    "global_slug" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."payload_locked_documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."payload_locked_documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."payload_locked_documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."payload_locked_documents_id_seq" OWNED BY "taaseekpaye-dev"."payload_locked_documents"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."payload_locked_documents_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer,
    "media_id" integer,
    "tech_id" integer,
    "language_id" integer,
    "project_id" integer,
    "provider_id" integer
);


ALTER TABLE "taaseekpaye-dev"."payload_locked_documents_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."payload_locked_documents_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."payload_locked_documents_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."payload_locked_documents_rels_id_seq" OWNED BY "taaseekpaye-dev"."payload_locked_documents_rels"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."payload_migrations" (
    "id" integer NOT NULL,
    "name" character varying,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."payload_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."payload_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."payload_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."payload_migrations_id_seq" OWNED BY "taaseekpaye-dev"."payload_migrations"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."payload_preferences" (
    "id" integer NOT NULL,
    "key" character varying,
    "value" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."payload_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."payload_preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."payload_preferences_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."payload_preferences_id_seq" OWNED BY "taaseekpaye-dev"."payload_preferences"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."payload_preferences_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


ALTER TABLE "taaseekpaye-dev"."payload_preferences_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."payload_preferences_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."payload_preferences_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."payload_preferences_rels_id_seq" OWNED BY "taaseekpaye-dev"."payload_preferences_rels"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."project" (
    "id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "jsonb",
    "link" character varying
);


ALTER TABLE "taaseekpaye-dev"."project" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."project_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."project_id_seq" OWNED BY "taaseekpaye-dev"."project"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."project_photos" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "media_id" integer,
    "is_main" boolean DEFAULT false
);


ALTER TABLE "taaseekpaye-dev"."project_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."project_tech_used" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "techs_id" integer
);


ALTER TABLE "taaseekpaye-dev"."project_tech_used" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."project_types" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "taaseekpaye-dev"."enum_project_types",
    "id" integer NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."project_types" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."project_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."project_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."project_types_id_seq" OWNED BY "taaseekpaye-dev"."project_types"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."provider" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "icon_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."provider" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."provider_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."provider_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."provider_id_seq" OWNED BY "taaseekpaye-dev"."provider"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."tech" (
    "id" integer NOT NULL,
    "name" character varying NOT NULL,
    "icon_url_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."tech" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."tech_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."tech_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."tech_id_seq" OWNED BY "taaseekpaye-dev"."tech"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."users" (
    "id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "email" character varying NOT NULL,
    "reset_password_token" character varying,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" character varying,
    "hash" character varying,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
);


ALTER TABLE "taaseekpaye-dev"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taaseekpaye-dev"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taaseekpaye-dev"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taaseekpaye-dev"."users_id_seq" OWNED BY "taaseekpaye-dev"."users"."id";



CREATE TABLE IF NOT EXISTS "taaseekpaye-dev"."users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
);


ALTER TABLE "taaseekpaye-dev"."users_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."media" (
    "id" integer NOT NULL,
    "alt" character varying NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "url" character varying,
    "thumbnail_u_r_l" character varying,
    "filename" character varying,
    "mime_type" character varying,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
);


ALTER TABLE "taasekpaye-cms"."media" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."media_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."media_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."media_id_seq" OWNED BY "taasekpaye-cms"."media"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."payload_kv" (
    "id" integer NOT NULL,
    "key" character varying NOT NULL,
    "data" "jsonb" NOT NULL
);


ALTER TABLE "taasekpaye-cms"."payload_kv" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."payload_kv_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."payload_kv_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."payload_kv_id_seq" OWNED BY "taasekpaye-cms"."payload_kv"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."payload_locked_documents" (
    "id" integer NOT NULL,
    "global_slug" character varying,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taasekpaye-cms"."payload_locked_documents" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."payload_locked_documents_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."payload_locked_documents_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."payload_locked_documents_id_seq" OWNED BY "taasekpaye-cms"."payload_locked_documents"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."payload_locked_documents_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer,
    "media_id" integer
);


ALTER TABLE "taasekpaye-cms"."payload_locked_documents_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."payload_locked_documents_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."payload_locked_documents_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."payload_locked_documents_rels_id_seq" OWNED BY "taasekpaye-cms"."payload_locked_documents_rels"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."payload_migrations" (
    "id" integer NOT NULL,
    "name" character varying,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taasekpaye-cms"."payload_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."payload_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."payload_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."payload_migrations_id_seq" OWNED BY "taasekpaye-cms"."payload_migrations"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."payload_preferences" (
    "id" integer NOT NULL,
    "key" character varying,
    "value" "jsonb",
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "taasekpaye-cms"."payload_preferences" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."payload_preferences_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."payload_preferences_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."payload_preferences_id_seq" OWNED BY "taasekpaye-cms"."payload_preferences"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."payload_preferences_rels" (
    "id" integer NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" character varying NOT NULL,
    "users_id" integer
);


ALTER TABLE "taasekpaye-cms"."payload_preferences_rels" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."payload_preferences_rels_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."payload_preferences_rels_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."payload_preferences_rels_id_seq" OWNED BY "taasekpaye-cms"."payload_preferences_rels"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."users" (
    "id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT "now"() NOT NULL,
    "email" character varying NOT NULL,
    "reset_password_token" character varying,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" character varying,
    "hash" character varying,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
);


ALTER TABLE "taasekpaye-cms"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "taasekpaye-cms"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "taasekpaye-cms"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "taasekpaye-cms"."users_id_seq" OWNED BY "taasekpaye-cms"."users"."id";



CREATE TABLE IF NOT EXISTS "taasekpaye-cms"."users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" character varying NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
);


ALTER TABLE "taasekpaye-cms"."users_sessions" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."language" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."language_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."media" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."media_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."owner" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."owner_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_kv" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."payload_kv_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."payload_locked_documents_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."payload_locked_documents_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."payload_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."payload_preferences_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_preferences_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."payload_preferences_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."project" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."project_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."project_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."project_types_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."provider" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."provider_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."tech" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."tech_id_seq"'::"regclass");



ALTER TABLE ONLY "taaseekpaye-dev"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"taaseekpaye-dev"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."media" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."media_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."payload_kv" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."payload_kv_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."payload_locked_documents_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."payload_locked_documents_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."payload_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."payload_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."payload_preferences" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."payload_preferences_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."payload_preferences_rels" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."payload_preferences_rels_id_seq"'::"regclass");



ALTER TABLE ONLY "taasekpaye-cms"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"taasekpaye-cms"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "cac_auth"."account"
    ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_auth"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_auth"."session"
    ADD CONSTRAINT "session_token_unique" UNIQUE ("token");



ALTER TABLE ONLY "cac_auth"."user"
    ADD CONSTRAINT "user_email_unique" UNIQUE ("email");



ALTER TABLE ONLY "cac_auth"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_auth"."verification"
    ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_marketing"."customer"
    ADD CONSTRAINT "customer_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_marketing"."rsvps"
    ADD CONSTRAINT "rsvps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_marketing"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."product_image"
    ADD CONSTRAINT "product_image_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."product"
    ADD CONSTRAINT "product_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."product_type"
    ADD CONSTRAINT "product_type_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "cac_store"."product_type"
    ADD CONSTRAINT "product_type_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."product_variant"
    ADD CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."purchase_batch"
    ADD CONSTRAINT "purchase_batch_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."sale_batch_link"
    ADD CONSTRAINT "sale_batch_link_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."sale"
    ADD CONSTRAINT "sale_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "cac_store"."selling_price"
    ADD CONSTRAINT "selling_price_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "chris_test"."message"
    ADD CONSTRAINT "message_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "degarde"."daily_metrics"
    ADD CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("date");



ALTER TABLE ONLY "degarde"."duty_periods"
    ADD CONSTRAINT "duty_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "degarde"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "degarde"."insurances"
    ADD CONSTRAINT "insurances_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "degarde"."insurances"
    ADD CONSTRAINT "insurances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "degarde"."pharmacies"
    ADD CONSTRAINT "pharmacies_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "degarde"."pharmacies"
    ADD CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "degarde"."pharmacies_to_insurances"
    ADD CONSTRAINT "pharmacies_to_insurances_pharmacy_id_insurance_id_pk" PRIMARY KEY ("pharmacy_id", "insurance_id");



ALTER TABLE ONLY "degarde"."pharmacy_duties"
    ADD CONSTRAINT "pharmacy_duties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_providers"
    ADD CONSTRAINT "contact_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."language"
    ADD CONSTRAINT "language_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."media"
    ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."owner_contacts"
    ADD CONSTRAINT "owner_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."owner"
    ADD CONSTRAINT "owner_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_kv"
    ADD CONSTRAINT "payload_kv_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents"
    ADD CONSTRAINT "payload_locked_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_migrations"
    ADD CONSTRAINT "payload_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_preferences"
    ADD CONSTRAINT "payload_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."project_photos"
    ADD CONSTRAINT "project_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."project"
    ADD CONSTRAINT "project_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."project_tech_used"
    ADD CONSTRAINT "project_tech_used_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."project_types"
    ADD CONSTRAINT "project_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."provider"
    ADD CONSTRAINT "provider_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."tech"
    ADD CONSTRAINT "tech_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taaseekpaye-dev"."users_sessions"
    ADD CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."media"
    ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."payload_kv"
    ADD CONSTRAINT "payload_kv_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents"
    ADD CONSTRAINT "payload_locked_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."payload_migrations"
    ADD CONSTRAINT "payload_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."payload_preferences"
    ADD CONSTRAINT "payload_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "taasekpaye-cms"."users_sessions"
    ADD CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id");



CREATE INDEX "account_userId_idx" ON "cac_auth"."account" USING "btree" ("user_id");



CREATE INDEX "session_userId_idx" ON "cac_auth"."session" USING "btree" ("user_id");



CREATE INDEX "verification_identifier_idx" ON "cac_auth"."verification" USING "btree" ("identifier");



CREATE INDEX "batch_product_idx" ON "cac_store"."purchase_batch" USING "btree" ("product_id");



CREATE INDEX "batch_quantity_idx" ON "cac_store"."purchase_batch" USING "btree" ("quantity_remaining");



CREATE INDEX "batch_variant_idx" ON "cac_store"."purchase_batch" USING "btree" ("variant_id");



CREATE INDEX "price_product_idx" ON "cac_store"."selling_price" USING "btree" ("product_id");



CREATE INDEX "price_variant_idx" ON "cac_store"."selling_price" USING "btree" ("variant_id");



CREATE INDEX "product_barcode_idx" ON "cac_store"."product" USING "btree" ("barcode");



CREATE INDEX "product_image_product_idx" ON "cac_store"."product_image" USING "btree" ("product_id");



CREATE INDEX "product_type_idx" ON "cac_store"."product" USING "btree" ("product_type_id");



CREATE INDEX "sale_batch_batch_idx" ON "cac_store"."sale_batch_link" USING "btree" ("batch_id");



CREATE INDEX "sale_batch_sale_idx" ON "cac_store"."sale_batch_link" USING "btree" ("sale_id");



CREATE INDEX "sale_date_idx" ON "cac_store"."sale" USING "btree" ("created_at");



CREATE INDEX "sale_product_idx" ON "cac_store"."sale" USING "btree" ("product_id");



CREATE INDEX "sale_variant_idx" ON "cac_store"."sale" USING "btree" ("variant_id");



CREATE INDEX "variant_product_idx" ON "cac_store"."product_variant" USING "btree" ("product_id");



CREATE UNIQUE INDEX "date_range_idx" ON "degarde"."duty_periods" USING "btree" ("start_date", "end_date");



CREATE INDEX "language_created_at_idx" ON "taaseekpaye-dev"."language" USING "btree" ("created_at");



CREATE INDEX "language_icon_url_idx" ON "taaseekpaye-dev"."language" USING "btree" ("icon_url_id");



CREATE INDEX "language_updated_at_idx" ON "taaseekpaye-dev"."language" USING "btree" ("updated_at");



CREATE INDEX "media_created_at_idx" ON "taaseekpaye-dev"."media" USING "btree" ("created_at");



CREATE UNIQUE INDEX "media_filename_idx" ON "taaseekpaye-dev"."media" USING "btree" ("filename");



CREATE INDEX "media_updated_at_idx" ON "taaseekpaye-dev"."media" USING "btree" ("updated_at");



CREATE INDEX "owner_contacts_order_idx" ON "taaseekpaye-dev"."owner_contacts" USING "btree" ("_order");



CREATE INDEX "owner_contacts_parent_id_idx" ON "taaseekpaye-dev"."owner_contacts" USING "btree" ("_parent_id");



CREATE INDEX "owner_contacts_provider_idx" ON "taaseekpaye-dev"."owner_contacts" USING "btree" ("provider_id");



CREATE INDEX "owner_profile_pic_idx" ON "taaseekpaye-dev"."owner" USING "btree" ("profile_pic_id");



CREATE UNIQUE INDEX "payload_kv_key_idx" ON "taaseekpaye-dev"."payload_kv" USING "btree" ("key");



CREATE INDEX "payload_locked_documents_created_at_idx" ON "taaseekpaye-dev"."payload_locked_documents" USING "btree" ("created_at");



CREATE INDEX "payload_locked_documents_global_slug_idx" ON "taaseekpaye-dev"."payload_locked_documents" USING "btree" ("global_slug");



CREATE INDEX "payload_locked_documents_rels_language_id_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("language_id");



CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("media_id");



CREATE INDEX "payload_locked_documents_rels_order_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("order");



CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("parent_id");



CREATE INDEX "payload_locked_documents_rels_path_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("path");



CREATE INDEX "payload_locked_documents_rels_project_id_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("project_id");



CREATE INDEX "payload_locked_documents_rels_provider_id_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("provider_id");



CREATE INDEX "payload_locked_documents_rels_tech_id_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("tech_id");



CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "taaseekpaye-dev"."payload_locked_documents_rels" USING "btree" ("users_id");



CREATE INDEX "payload_locked_documents_updated_at_idx" ON "taaseekpaye-dev"."payload_locked_documents" USING "btree" ("updated_at");



CREATE INDEX "payload_migrations_created_at_idx" ON "taaseekpaye-dev"."payload_migrations" USING "btree" ("created_at");



CREATE INDEX "payload_migrations_updated_at_idx" ON "taaseekpaye-dev"."payload_migrations" USING "btree" ("updated_at");



CREATE INDEX "payload_preferences_created_at_idx" ON "taaseekpaye-dev"."payload_preferences" USING "btree" ("created_at");



CREATE INDEX "payload_preferences_key_idx" ON "taaseekpaye-dev"."payload_preferences" USING "btree" ("key");



CREATE INDEX "payload_preferences_rels_order_idx" ON "taaseekpaye-dev"."payload_preferences_rels" USING "btree" ("order");



CREATE INDEX "payload_preferences_rels_parent_idx" ON "taaseekpaye-dev"."payload_preferences_rels" USING "btree" ("parent_id");



CREATE INDEX "payload_preferences_rels_path_idx" ON "taaseekpaye-dev"."payload_preferences_rels" USING "btree" ("path");



CREATE INDEX "payload_preferences_rels_users_id_idx" ON "taaseekpaye-dev"."payload_preferences_rels" USING "btree" ("users_id");



CREATE INDEX "payload_preferences_updated_at_idx" ON "taaseekpaye-dev"."payload_preferences" USING "btree" ("updated_at");



CREATE INDEX "project_created_at_idx" ON "taaseekpaye-dev"."project" USING "btree" ("created_at");



CREATE INDEX "project_updated_at_idx" ON "taaseekpaye-dev"."project" USING "btree" ("updated_at");



CREATE INDEX "provider_created_at_idx" ON "taaseekpaye-dev"."provider" USING "btree" ("created_at");



CREATE INDEX "provider_icon_idx" ON "taaseekpaye-dev"."provider" USING "btree" ("icon_id");



CREATE INDEX "provider_updated_at_idx" ON "taaseekpaye-dev"."provider" USING "btree" ("updated_at");



CREATE INDEX "tech_created_at_idx" ON "taaseekpaye-dev"."tech" USING "btree" ("created_at");



CREATE INDEX "tech_icon_url_idx" ON "taaseekpaye-dev"."tech" USING "btree" ("icon_url_id");



CREATE UNIQUE INDEX "tech_name_idx" ON "taaseekpaye-dev"."tech" USING "btree" ("name");



CREATE INDEX "tech_updated_at_idx" ON "taaseekpaye-dev"."tech" USING "btree" ("updated_at");



CREATE INDEX "users_created_at_idx" ON "taaseekpaye-dev"."users" USING "btree" ("created_at");



CREATE UNIQUE INDEX "users_email_idx" ON "taaseekpaye-dev"."users" USING "btree" ("email");



CREATE INDEX "users_sessions_order_idx" ON "taaseekpaye-dev"."users_sessions" USING "btree" ("_order");



CREATE INDEX "users_sessions_parent_id_idx" ON "taaseekpaye-dev"."users_sessions" USING "btree" ("_parent_id");



CREATE INDEX "users_updated_at_idx" ON "taaseekpaye-dev"."users" USING "btree" ("updated_at");



CREATE INDEX "media_created_at_idx" ON "taasekpaye-cms"."media" USING "btree" ("created_at");



CREATE UNIQUE INDEX "media_filename_idx" ON "taasekpaye-cms"."media" USING "btree" ("filename");



CREATE INDEX "media_updated_at_idx" ON "taasekpaye-cms"."media" USING "btree" ("updated_at");



CREATE UNIQUE INDEX "payload_kv_key_idx" ON "taasekpaye-cms"."payload_kv" USING "btree" ("key");



CREATE INDEX "payload_locked_documents_created_at_idx" ON "taasekpaye-cms"."payload_locked_documents" USING "btree" ("created_at");



CREATE INDEX "payload_locked_documents_global_slug_idx" ON "taasekpaye-cms"."payload_locked_documents" USING "btree" ("global_slug");



CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "taasekpaye-cms"."payload_locked_documents_rels" USING "btree" ("media_id");



CREATE INDEX "payload_locked_documents_rels_order_idx" ON "taasekpaye-cms"."payload_locked_documents_rels" USING "btree" ("order");



CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "taasekpaye-cms"."payload_locked_documents_rels" USING "btree" ("parent_id");



CREATE INDEX "payload_locked_documents_rels_path_idx" ON "taasekpaye-cms"."payload_locked_documents_rels" USING "btree" ("path");



CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "taasekpaye-cms"."payload_locked_documents_rels" USING "btree" ("users_id");



CREATE INDEX "payload_locked_documents_updated_at_idx" ON "taasekpaye-cms"."payload_locked_documents" USING "btree" ("updated_at");



CREATE INDEX "payload_migrations_created_at_idx" ON "taasekpaye-cms"."payload_migrations" USING "btree" ("created_at");



CREATE INDEX "payload_migrations_updated_at_idx" ON "taasekpaye-cms"."payload_migrations" USING "btree" ("updated_at");



CREATE INDEX "payload_preferences_created_at_idx" ON "taasekpaye-cms"."payload_preferences" USING "btree" ("created_at");



CREATE INDEX "payload_preferences_key_idx" ON "taasekpaye-cms"."payload_preferences" USING "btree" ("key");



CREATE INDEX "payload_preferences_rels_order_idx" ON "taasekpaye-cms"."payload_preferences_rels" USING "btree" ("order");



CREATE INDEX "payload_preferences_rels_parent_idx" ON "taasekpaye-cms"."payload_preferences_rels" USING "btree" ("parent_id");



CREATE INDEX "payload_preferences_rels_path_idx" ON "taasekpaye-cms"."payload_preferences_rels" USING "btree" ("path");



CREATE INDEX "payload_preferences_rels_users_id_idx" ON "taasekpaye-cms"."payload_preferences_rels" USING "btree" ("users_id");



CREATE INDEX "payload_preferences_updated_at_idx" ON "taasekpaye-cms"."payload_preferences" USING "btree" ("updated_at");



CREATE INDEX "users_created_at_idx" ON "taasekpaye-cms"."users" USING "btree" ("created_at");



CREATE UNIQUE INDEX "users_email_idx" ON "taasekpaye-cms"."users" USING "btree" ("email");



CREATE INDEX "users_sessions_order_idx" ON "taasekpaye-cms"."users_sessions" USING "btree" ("_order");



CREATE INDEX "users_sessions_parent_id_idx" ON "taasekpaye-cms"."users_sessions" USING "btree" ("_parent_id");



CREATE INDEX "users_updated_at_idx" ON "taasekpaye-cms"."users" USING "btree" ("updated_at");



ALTER TABLE ONLY "cac_auth"."account"
    ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cac_auth"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "cac_auth"."session"
    ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "cac_auth"."user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "cac_marketing"."rsvps"
    ADD CONSTRAINT "rsvps_service_services_id_fk" FOREIGN KEY ("service") REFERENCES "cac_marketing"."services"("id");



ALTER TABLE ONLY "cac_store"."product"
    ADD CONSTRAINT "product_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "cac_auth"."user"("id");



ALTER TABLE ONLY "cac_store"."product_image"
    ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "cac_store"."product"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "cac_store"."product"
    ADD CONSTRAINT "product_product_type_id_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "cac_store"."product_type"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "cac_store"."product_variant"
    ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "cac_store"."product"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "cac_store"."purchase_batch"
    ADD CONSTRAINT "purchase_batch_done_by_user_id_fk" FOREIGN KEY ("done_by") REFERENCES "cac_auth"."user"("id");



ALTER TABLE ONLY "cac_store"."purchase_batch"
    ADD CONSTRAINT "purchase_batch_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "cac_store"."product"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "cac_store"."purchase_batch"
    ADD CONSTRAINT "purchase_batch_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "cac_store"."product_variant"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "cac_store"."sale_batch_link"
    ADD CONSTRAINT "sale_batch_link_batch_id_purchase_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "cac_store"."purchase_batch"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "cac_store"."sale_batch_link"
    ADD CONSTRAINT "sale_batch_link_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "cac_store"."sale"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "cac_store"."sale"
    ADD CONSTRAINT "sale_done_by_user_id_fk" FOREIGN KEY ("done_by") REFERENCES "cac_auth"."user"("id");



ALTER TABLE ONLY "cac_store"."sale"
    ADD CONSTRAINT "sale_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "cac_store"."product"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "cac_store"."sale"
    ADD CONSTRAINT "sale_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "cac_store"."product_variant"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "cac_store"."selling_price"
    ADD CONSTRAINT "selling_price_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "cac_store"."product"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "cac_store"."selling_price"
    ADD CONSTRAINT "selling_price_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "cac_store"."product_variant"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "degarde"."pharmacies_to_insurances"
    ADD CONSTRAINT "pharmacies_to_insurances_insurance_id_insurances_id_fk" FOREIGN KEY ("insurance_id") REFERENCES "degarde"."insurances"("id");



ALTER TABLE ONLY "degarde"."pharmacies_to_insurances"
    ADD CONSTRAINT "pharmacies_to_insurances_pharmacy_id_pharmacies_id_fk" FOREIGN KEY ("pharmacy_id") REFERENCES "degarde"."pharmacies"("id");



ALTER TABLE ONLY "degarde"."pharmacy_duties"
    ADD CONSTRAINT "pharmacy_duties_duty_period_id_duty_periods_id_fk" FOREIGN KEY ("duty_period_id") REFERENCES "degarde"."duty_periods"("id");



ALTER TABLE ONLY "degarde"."pharmacy_duties"
    ADD CONSTRAINT "pharmacy_duties_pharmacy_id_pharmacies_id_fk" FOREIGN KEY ("pharmacy_id") REFERENCES "degarde"."pharmacies"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."articles"
    ADD CONSTRAINT "articles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."language"
    ADD CONSTRAINT "language_icon_url_id_media_id_fk" FOREIGN KEY ("icon_url_id") REFERENCES "taaseekpaye-dev"."media"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "taaseekpaye-dev"."owner_contacts"
    ADD CONSTRAINT "owner_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "taaseekpaye-dev"."owner"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."owner_contacts"
    ADD CONSTRAINT "owner_contacts_provider_id_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "taaseekpaye-dev"."provider"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "taaseekpaye-dev"."owner"
    ADD CONSTRAINT "owner_profile_pic_id_media_id_fk" FOREIGN KEY ("profile_pic_id") REFERENCES "taaseekpaye-dev"."media"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_language_fk" FOREIGN KEY ("language_id") REFERENCES "taaseekpaye-dev"."language"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "taaseekpaye-dev"."media"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "taaseekpaye-dev"."payload_locked_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_project_fk" FOREIGN KEY ("project_id") REFERENCES "taaseekpaye-dev"."project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_provider_fk" FOREIGN KEY ("provider_id") REFERENCES "taaseekpaye-dev"."provider"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_tech_fk" FOREIGN KEY ("tech_id") REFERENCES "taaseekpaye-dev"."tech"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "taaseekpaye-dev"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "taaseekpaye-dev"."payload_preferences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "taaseekpaye-dev"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taaseekpaye-dev"."provider"
    ADD CONSTRAINT "provider_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "taaseekpaye-dev"."media"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "taaseekpaye-dev"."tech"
    ADD CONSTRAINT "tech_icon_url_id_media_id_fk" FOREIGN KEY ("icon_url_id") REFERENCES "taaseekpaye-dev"."media"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "taaseekpaye-dev"."users_sessions"
    ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "taaseekpaye-dev"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "taasekpaye-cms"."media"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "taasekpaye-cms"."payload_locked_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taasekpaye-cms"."payload_locked_documents_rels"
    ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "taasekpaye-cms"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taasekpaye-cms"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "taasekpaye-cms"."payload_preferences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taasekpaye-cms"."payload_preferences_rels"
    ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "taasekpaye-cms"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "taasekpaye-cms"."users_sessions"
    ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "taasekpaye-cms"."users"("id") ON DELETE CASCADE;



ALTER TABLE "chris_test"."message" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "allow_public_access" ON "public"."articles" FOR SELECT USING (true);



CREATE POLICY "allow_public_access" ON "public"."contact_providers" FOR SELECT USING (true);



CREATE POLICY "allow_public_access" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "allow_public_access" ON "public"."projects" FOR SELECT USING (true);



ALTER TABLE "public"."articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
































































































































































































GRANT ALL ON TABLE "public"."articles" TO "anon";
GRANT ALL ON TABLE "public"."articles" TO "authenticated";
GRANT ALL ON TABLE "public"."articles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."articles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_providers" TO "anon";
GRANT ALL ON TABLE "public"."contact_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_providers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contact_providers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contact_providers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contact_providers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























