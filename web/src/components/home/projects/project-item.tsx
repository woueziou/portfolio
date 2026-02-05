import { cn } from "@/src/lib/utils"
import { formatDate } from "@/src/utils/formater"
import { Database } from "@/src/utils/supabase/supabase"
import { SiAgora, SiCloudcannon, SiDart, SiDotnet, SiFastapi, SiFlutter, SiGit, SiGnubash, SiHono, SiMongodb, SiNextdotjs, SiNuxt, SiPayloadcms, SiPostgresql, SiPython, SiSanity, SiSupabase, SiTelegram, SiTypescript } from "@icons-pack/react-simple-icons"
import { DatabaseZap, ExternalLink } from "lucide-react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card"
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
        case
            "sanity": return <SiSanity className={iconClass} />
        case
            "sql": return <DatabaseZap className={iconClass} />
        case
            "fastapi": return <SiFastapi className={iconClass} />
        case
            "aws": return <SiCloudcannon className={iconClass} />
        case
            "python": return <SiPython className={iconClass} />
        default:
            return <div></div>
    }
}


export const ProjectItem = ({ item }: { item: Database["public"]["Tables"]["projects"]["Row"] }) => {
    return <div className={
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
            {item.url && <div className="flex items-center space-x-1 border-b-2">
                <a href={item.url} target="_blank" className={cn("text-xl font-bold", " underline-offset-4")}>{item.title}</a>
                <ExternalLink className="w-4 h-4" />
            </div>}
            {!item.url && <div className={cn("text-xl font-bold")}>{item.title}</div>}
            <div className={cn("text-xs")}>{formatDate(item.project_date, "YYYY")}</div>
        </div>

        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="line-clamp-2">{item.description}</div>

            </HoverCardTrigger>
            <HoverCardContent className="w-80 border-none">
                <div className="flex justify-between space-x-4">
                    {item.description}
                </div>
            </HoverCardContent>
        </HoverCard>

        <div className="flex space-x-2">{item.tech_stack.map((tech, ix) => {
            return (<div key={ix} className={cn(
                "flex border  border-secondary/30 text-sm space-x-2 px-2 group hover:bg-primary hover:text-white",
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

    </div>
}