import { Database } from "@/src/utils/supabase/supabase";

export type ProjectType = Database["public"]['Tables']["projects"]['Row']