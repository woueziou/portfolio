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
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              Failed to load the editor. Refresh the page to retry.
            </div>
          )
        }

        return (
          <Suspense
            fallback={
              <div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg h-[500px]" />
            }
          >
            <LazyArticleEditor articleId={articleId} initialContent={initialContent} />
          </Suspense>
        )
      }}
    </EditorErrorBoundary>
  )
}
