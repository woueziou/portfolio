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
] as const

const MISSING_COLUMN_ERROR_CODE = '42703'
const MISSING_TABLE_ERROR_CODE = '42P01'

export async function assertCoreSchema(supabase: SupabaseSchemaClient): Promise<void> {
  for (const requirement of REQUIRED_QUERIES) {
    const { error } = (await supabase
      .from(requirement.table)
      .select(requirement.columns)
      .limit(1)) as { error: QueryError | null }

    if (!error) {
      continue
    }

    if (error.code === MISSING_COLUMN_ERROR_CODE || error.code === MISSING_TABLE_ERROR_CODE) {
      throw new Error(
        `Database schema mismatch for '${requirement.table}'. Missing required columns in '${requirement.columns}'. Apply pending Supabase migrations before serving admin routes.`,
      )
    }

    throw new Error(`Schema health check failed for '${requirement.table}': ${error.message}`)
  }
}
