import { getServerClient } from "@/src/utils/supabase/server";
import ProjectClient from "./project-client";


export default async function Projects() {
    const client =await getServerClient()
    const { data } = await client.from("projects").select().order("project_date",{ascending:false})
    if (!data) {
        return <div>An error occured</div>
    }
    return <ProjectClient data={data}></ProjectClient>


}


