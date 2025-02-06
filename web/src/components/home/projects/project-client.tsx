import { SiAgora, SiDart, SiDotnet, SiFlutter, SiGit, SiGnubash, SiHono, SiMongodb, SiNextdotjs, SiNuxt, SiPayloadcms, SiPostgresql, SiSupabase, SiTelegram, SiTypescript } from "@icons-pack/react-simple-icons";
import { Card, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { ProjectType } from "./model";
import { cn } from "@/src/lib/utils";
import { div } from "framer-motion/client";
import { Database } from "@/src/utils/supabase/supabase";
import { useFormatDate } from "@/src/utils/formater";





function getIcon(arg0: string): import("react").ReactNode {
    const iconClass = "h-5 w-5"
    switch (arg0) {
        case "agora":
            return <SiAgora className={iconClass} />
        case "supabase":
            return <SiSupabase className={iconClass} />
        case "flutter":
            return <SiFlutter className={iconClass} />

        case "next":
            return < SiNextdotjs className={iconClass} />
        case
            "typescript": return <SiTypescript className={iconClass} />
        case
            "dart": return <SiDart className={iconClass} />
        case
            "postgres": return <SiPostgresql className={iconClass} />
        case
            "bash": return <SiGnubash className={iconClass} />
        case
            "hono": return <SiHono className={iconClass} />
        case
            "nuxt": return <SiNuxt className={iconClass} />
        case
            "dotnet": return <SiDotnet className={iconClass} />
        case
            "git": return <SiGit className={iconClass} />
        case
            "mongodb": return <SiMongodb className={iconClass} />
        case
            "telegram": return <SiTelegram className={iconClass} />
        case
            "payloadcms": return <SiPayloadcms className={iconClass} />
        default:
            return <div></div>
    }
}

export default function ProjectClient({ data }: { data: Database["public"]["Tables"]["projects"]["Row"][] }) {


    return <div className={cn("grid md:grid-cols-3 w-full",
        "grid-cols-1",
        "place-content-center"
    )}>
        {data.map((item, index) => <div key={index} className={
            cn("flex py-8 px-4 transition-all  duration-150 ease-linear flex-col space-y-4 ",
                "hover:scale-[1.02] hover:drop-shadow-sm",
                "group/card",
                "items-start",
                "justify-center "

            )
        }>
            <div className="h-[350px] w-full bg-primary"></div>
            <div className="flex space-x-2 ">{item.type.map((item, index) => (<div key={index}
                className={
                    cn("border-r pr-2 last:border-none font-semibold text-sm",

                    )}>{item} </div>))}</div>
            <div className="flex flex-col items-start space-y-2 ">
                {item.url&&<a href={item.url} target="_blank" className={cn("text-xl font-bold","underline underline-offset-4")}>{item.title}</a>}
               {!item.url && <div className={cn("text-xl font-bold")}>{item.title}</div>}
                <div className={cn("text-xs")}>{useFormatDate(item.project_date,"YYYY")}</div>
            </div>

            <div className="line-clamp-2">{item.description}</div>
            <div className="flex space-x-2">{item.tech_stack.map((tech, ix) => {
                return (<div key={ix} className={cn(
                    "flex border  border-secondary/30 text-sm space-x-2 px-2 group hover:bg-secondary",
                    " items-center h-10 min-w-10",
                )}>
                    <span>
                        {getIcon(tech.toLowerCase())}
                    </span>
                    <span className="hidden group-hover:block ">
                        {tech}
                    </span>

                </div>);
            })}</div>

        </div>)}

    </div>
}