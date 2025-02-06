import { Suspense } from "react";
import Hero from "../components/home/hero/hero";
import { ProjectItemSkeleton } from "../components/home/projects/project-item-skeleton";
import Projects from "../components/home/projects/project-server";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center  min-h-screen ">
      <Hero />
      <div className="grid w-full grid-cols-1 container mx-auto place-items-center pt-8 gap-y-10">
        <h1 className="text-2xl font-bold uppercase underline underline-offset-8">Projects </h1>
        <Suspense fallback={
          <ProjectItemSkeleton />}>
          <Projects />
        </Suspense>
      </div>

    </div >
  );
}
