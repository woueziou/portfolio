import { Database } from "@/src/utils/supabase/supabase";

export type ProjectType = Database["public"]['Tables']["projects"]['Row']
// export type ProjectType = {
//     id: number,
//     title: string,
//     url: string,
//     type: ("Mobile" | "Web" | "Backend")[],
//     techs: string[],
//     image?: string,
//     description:string,
//     date:string
// }