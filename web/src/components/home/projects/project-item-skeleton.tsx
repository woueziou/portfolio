import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";


export function ProjectItemSkeleton() {
    return (
        <div className={cn("grid md:grid-cols-3 w-full",
            "grid-cols-1",
            "place-content-center"
        )}>
            {
                [1, 2, 4].map((i) => (
                    <div key={i} className="flex py-8 px-4 transition-all  duration-150 ease-linear flex-col space-y-4 ">
                        <Skeleton className="h-[350px] w-full rounded-xl bg-background/70" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px] bg-background/70" />
                            <Skeleton className="h-4 w-[200px] bg-background/70" />
                        </div>
                    </div>))}
        </div>
    )
}