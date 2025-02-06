import { Suspense } from "react";
import { ProjectType } from "./model";
import ProjectClient from "./project-client";
import { getBrowserClient } from "@/src/utils/supabase/client";
import { getServerClient } from "@/src/utils/supabase/server";


export default async function Projects() {
    const client =await getServerClient()
    const { data } = await client.from("projects").select().order("project_date",{ascending:false})
    console.log(data)
    if (!data) {
        return <div>An error occured</div>
    }
    return <ProjectClient data={data}></ProjectClient>


}


