import { cn } from "@/lib/utils";
import { Database } from "@repo/shared";
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
