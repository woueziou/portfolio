import { Component, lazy, type ReactNode, Suspense } from 'react'

interface ArticleEditorIslandProps {
  articleId: number
  initialContent?: any
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

const LazyArticleEditor = lazy(() => import('./ArticleEditor'))

export default function ArticleEditorIsland({
  articleId,
  initialContent,
}: ArticleEditorIslandProps) {
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
              <div className="animate-pulse bg-muted rounded-lg h-[500px]" />
            }
          >
            <LazyArticleEditor articleId={articleId} initialContent={initialContent} />
          </Suspense>
        )
      }}
    </EditorErrorBoundary>
  )
}
