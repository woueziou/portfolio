import { Suspense } from "react";
import { ProjectType } from "./model";
import ProjectClient from "./project.client";


export default async function Projects() {

    const generateProjects = async (): Promise<ProjectType[]> => {
        console.log("starting wait")
        // await new Promise(resolve => setTimeout(resolve, 4000));
        const projects: ProjectType[] = [];
        for (let i = 0; i < 10; i++) {
            projects.push({
                id: i,
                title: `Project ${i}`,
                url: `https://example.com/project${i}`,
                type: [i % 3 === 0 ? "Mobile" : i % 3 === 1 ? "Web" : "Backend", i % 3 === 0 ? "Web" : "Backend",],
                techs: ["Next", "TypeScript", "Flutter"],
                image: `https://example.com/image${i}.png`,
                description: `Incididunt qui exercitation quis veniam exercitation proident reprehenderit consectetur officia veniam culpa magna laboris officia. Veniam sit fugiat excepteur pariatur sint ad veniam sit irure nostrud ad officia elit anim tempor. Fugiat eu voluptate consectetur. Amet dolor deserunt incididunt elit qui labore duis. Nisi anim elit ex sint adipisicing do irure nisi elit sunt. Reprehenderit sunt fugiat do duis magna laborum cillum irure. Sit eu id culpa ipsum tempor sunt.${i}`,
                date: "2024-03-02"
            });
        }
        return projects;
    };

    const projects = await generateProjects();
    return <ProjectClient data={projects}></ProjectClient>


}


