type QueryError = {
  code?: string
  message: string
}

type SupabaseSchemaClient = {
  from: (table: string) => {
    select: (columns: string) => {
      limit: (count: number) => unknown
    }
  }
}

const REQUIRED_QUERIES = [
  {
    table: 'articles',
    columns: 'id,slug,status,published_at,created_at',
  },
  {
    table: 'projects',
    columns: 'id,slug,publication_status,published_at,created_at',
  },
  {
    table: 'techstacks',
    columns: 'id,name,icon',
  },
  {
    table: 'project_techstacks',
    columns: 'project_id,techstack_id',
  },
  {
    table: 'page_views',
    columns: 'id,path,date,count',
  },
  {
    table: 'site_config',
    columns: 'id,site_title',
  },
] as const

const REQUIRED_VIEWS = [
  {
    name: 'project_types_view',
    columns: 'value,label',
  },
] as const

export async function assertViewsExist(supabase: SupabaseSchemaClient): Promise<void> {
  const results = await Promise.all(
    REQUIRED_VIEWS.map(async (requirement) => {
      const { error } = (await supabase
        .from(requirement.name)
        .select(requirement.columns)
        .limit(1)) as { error: QueryError | null }
      return { requirement, error }
    }),
  )

  for (const { requirement, error } of results) {
    if (error) {
      throw new Error(
        `Database schema mismatch: required view '${requirement.name}' is missing or has wrong columns. Apply pending Supabase migrations before serving admin routes.`,
      )
    }
  }
}

const MISSING_COLUMN_ERROR_CODE = '42703'
const MISSING_TABLE_ERROR_CODE = '42P01'

export async function assertCoreSchema(supabase: SupabaseSchemaClient): Promise<void> {
  // Run all table checks + view checks concurrently — they are independent queries.
  const [tableResults] = await Promise.all([
    Promise.all(
      REQUIRED_QUERIES.map(async (requirement) => {
        const { error } = (await supabase
          .from(requirement.table)
          .select(requirement.columns)
          .limit(1)) as { error: QueryError | null }
        return { requirement, error }
      }),
    ),
    assertViewsExist(supabase),
  ])

  for (const { requirement, error } of tableResults) {
    if (!error) continue

    if (error.code === MISSING_COLUMN_ERROR_CODE || error.code === MISSING_TABLE_ERROR_CODE) {
      throw new Error(
        `Database schema mismatch for '${requirement.table}'. Missing required columns in '${requirement.columns}'. Apply pending Supabase migrations before serving admin routes.`,
      )
    }

    throw new Error(`Schema health check failed for '${requirement.table}': ${error.message}`)
  }
}
