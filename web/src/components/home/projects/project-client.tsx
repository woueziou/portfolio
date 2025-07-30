import { cn } from "@/src/lib/utils";
import { formatDate } from "@/src/utils/formater";
import { Database } from "@/src/utils/supabase/supabase";
import { SiAgora, SiCloudcannon, SiDart, SiDotnet, SiFastapi, SiFlutter, SiGit, SiGnubash, SiHono, SiMongodb, SiNextdotjs, SiNuxt, SiPayloadcms, SiPostgresql, SiPython, SiSanity, SiSupabase, SiTelegram, SiTypescript } from "@icons-pack/react-simple-icons";
import { DatabaseZap, ExternalLink } from "lucide-react";
import { ProjectItem } from "./project-item";






export default function ProjectClient({ data }: { data: Database["public"]["Tables"]["projects"]["Row"][] }) {
    return <div className={cn("grid md:grid-cols-3 w-full",
        "grid-cols-1",
        "place-content-center"
    )}>
        {data.map((item, index) =>
            <ProjectItem item={item} key={index} />)
        }

    </div>
}