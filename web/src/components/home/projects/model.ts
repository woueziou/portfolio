export type ProjectType = {
    id: number,
    title: string,
    url: string,
    type: ("Mobile" | "Web" | "Backend")[],
    techs: string[],
    image?: string,
    description:string,
    date:string
}