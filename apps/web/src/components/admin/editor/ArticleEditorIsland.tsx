import { Component, lazy, type ReactNode, Suspense } from 'react'

interface ArticleData {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  updated_at: string
  content: Record<string, unknown> | null
  summary: string | null
  image_url: string | null
  url: string | null
}

interface ArticleEditorIslandProps {
  article?: ArticleData
}

class EditorErrorBoundary extends Component<
  { children: (hasError: boolean) => ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: (hasError: boolean) => ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    return this.props.children(this.state.hasError)
  }
}

const LazyEditorShell = lazy(() => import('./EditorShell'))

export default function ArticleEditorIsland({ article }: ArticleEditorIslandProps) {
  return (
    <EditorErrorBoundary>
      {(hasError) => {
        if (hasError) {
          return (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Failed to load the editor. Refresh the page to retry.
            </div>
          )
        }

        return (
          <Suspense
            fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-12 rounded-lg bg-muted/30" />
                <div className="h-[70vh] rounded-lg bg-muted/30" />
              </div>
            }
          >
            <LazyEditorShell article={article} />
          </Suspense>
        )
      }}
    </EditorErrorBoundary>
  )
}
