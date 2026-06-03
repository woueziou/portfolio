declare module "astro:actions" {
	type Actions = typeof import("/Users/woueziou/works/personal_projects/portfolio/apps/web/src/actions/index.ts")["server"];

	export const actions: Actions;
}