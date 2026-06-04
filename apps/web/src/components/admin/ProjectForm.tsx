import { actions } from 'astro:actions'
import { navigate } from 'astro:transitions/client'

import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronDown,
  Code2,
  FileCode,
  FileText,
  Globe,
  ImageIcon,
  Layers,
  PenLine,
  Plus,
  Save,
  Send,
  Tag,
  Type,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { generateSlug } from '@/lib/slug'
import { cn } from '@/lib/utils'

interface ProjectFormProps {
  project?: {
    id: number
    title: string
    description: string
    main_image_url: string | null
    url: string | null
    access_link: string | null
    state: string
    project_date: string | null
    type: string[]
    tech_stack: string[]
    slug: string
  }
  articles?: Array<{
    id: number
    title: string
    slug: string
    status: string
  }>
  onSuccess?: (project: Record<string, unknown>) => void
  onCancel?: () => void
  onSuccessPath?: string
  onCancelPath?: string
}

const PROJECT_TYPES = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'script', label: 'Script' },
  { value: 'backend', label: 'Backend' },
  { value: 'infra', label: 'Infrastructure' },
  { value: 'llm', label: 'LLM' },
  { value: 'ai', label: 'AI' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'api', label: 'API' },
  { value: 'library', label: 'Library' },
  { value: 'other', label: 'Other' },
]

const PROJECT_STATES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'finished', label: 'Finished' },
  { value: 'production', label: 'Production' },
]

interface ProjectFormData {
  title: string
  description: string
  main_image_url: string
  url: string
  access_link: string
  state: string
  project_date: string
  type: string[]
  tech_stack: string[]
  slug: string
}

// Word count helper
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export default function ProjectForm({
  project,
  articles = [],
  onSuccess,
  onCancel,
  onSuccessPath,
  onCancelPath,
}: ProjectFormProps) {
  const isEditing = !!project

  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || '',
    main_image_url: project?.main_image_url || '',
    url: project?.url || '',
    access_link: project?.access_link || '',
    state: project?.state || 'ongoing',
    project_date: project?.project_date?.split('T')[0] || '',
    type: project?.type || [],
    tech_stack: project?.tech_stack || [],
    slug: project?.slug || '',
  })

  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!project?.slug)
  const [typeSearch, setTypeSearch] = useState('')
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const [newTechName, setNewTechName] = useState('')
  const [drawerOpened, setDrawerOpened] = useState(false)
  const closeDrawer = () => setDrawerOpened(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const wordCount = countWords(formData.description)

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }))
    }
  }, [formData.title, slugManuallyEdited])

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data, error: uploadError } = await actions.projects.uploadImage(formData)

      if (uploadError) {
        setError(uploadError.message)
      } else if (data?.url) {
        setFormData((prev) => ({ ...prev, main_image_url: data.url }))
      }
    } catch (_err) {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
      // Reset so the same file can be re-selected
      if (e.target) e.target.value = ''
    }
  }, [])

  const handleTypeToggle = useCallback((type: string) => {
    setFormData((prev) => ({
      ...prev,
      type: prev.type.includes(type) ? prev.type.filter((t) => t !== type) : [...prev.type, type],
    }))
    setTypeSearch('')
    setTypePopoverOpen(false)
  }, [])

  const handleRemoveType = useCallback((type: string) => {
    setFormData((prev) => ({
      ...prev,
      type: prev.type.filter((t) => t !== type),
    }))
  }, [])

  const handleAddTech = useCallback(
    (tech: string) => {
      const trimmed = tech.trim()
      if (trimmed && !formData.tech_stack.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          tech_stack: [...prev.tech_stack, trimmed],
        }))
      }
    },
    [formData.tech_stack],
  )

  const handleRemoveTech = useCallback((tech: string) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((t) => t !== tech),
    }))
  }, [])

  const handleCreateTech = useCallback(() => {
    if (newTechName.trim()) {
      handleAddTech(newTechName.trim())
      setNewTechName('')
      closeDrawer()
    }
  }, [newTechName, handleAddTech, closeDrawer])

  const filteredTypes = PROJECT_TYPES.filter(
    (t) =>
      !formData.type.includes(t.value) && t.label.toLowerCase().includes(typeSearch.toLowerCase()),
  )

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    setError(null)

    // Validate tech_stack has at least one item
    if (formData.tech_stack.length === 0) {
      setError('Please add at least one technology to the tech stack')
      return
    }

    // Validate type has at least one item
    if (formData.type.length === 0) {
      setError('Please select at least one project type')
      return
    }

    setLoading(true)

    try {
      // biome-ignore lint/suspicious/noExplicitAny: server action return types are complex
      let result: any

      const submitData = {
        ...formData,
        main_image_url: formData.main_image_url || undefined,
        url: formData.url || undefined,
        access_link: formData.access_link || undefined,
        project_date: formData.project_date || undefined,
        state: formData.state as 'ongoing' | 'finished' | 'production',
        type: formData.type as ('web' | 'mobile' | 'desktop' | 'api' | 'library' | 'other')[],
      }

      if (isEditing && project) {
        result = await actions.projects.update({
          id: project.id,
          ...submitData,
        })
      } else {
        result = await actions.projects.create(submitData)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        const savedProject = result.data.project

        // Handle publish/draft status separately
        if (!asDraft) {
          const publishResult = await actions.projects.publish({
            id: savedProject.id,
            publish: true,
          })
          if (publishResult.error) {
            setError(publishResult.error.message)
            return
          }
        }

        onSuccess?.(savedProject)
        if (!onSuccess && onSuccessPath) {
          await navigate(onSuccessPath)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (onCancel) {
      onCancel()
      return
    }
    if (onCancelPath) {
      await navigate(onCancelPath)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => void handleCancel()}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={(e) => void handleSubmit(e, true)}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save as Draft
          </Button>
          <Button size="sm" disabled={loading} onClick={(e) => void handleSubmit(e, false)}>
            <Send className="h-4 w-4 mr-1.5" />
            Publish
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        {/* Status & Date Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Status & Schedule
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">Project State</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, state: value }))}
              >
                <SelectTrigger className="border-0 bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Project Date
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-left font-normal border-0 bg-muted/50',
                      !formData.project_date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.project_date ? (
                      format(new Date(formData.project_date), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.project_date ? new Date(formData.project_date) : undefined}
                    onSelect={(date) => {
                      setFormData((prev) => ({
                        ...prev,
                        project_date: date ? format(date, 'yyyy-MM-dd') : '',
                      }))
                      setDatePickerOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>

        {/* Basic Info Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="h-4 w-4" />
            Basic Information
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
              maxLength={200}
              placeholder="My Awesome Project"
              className="border-0 bg-muted/50 text-lg font-medium"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">/projects/</span>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true)
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="my-awesome-project"
                className="border-0 bg-muted/50"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <span
                className={cn(
                  'text-xs',
                  wordCount > 150
                    ? 'text-destructive'
                    : wordCount > 130
                      ? 'text-yellow-600'
                      : 'text-muted-foreground',
                )}
              >
                {wordCount}/150 words
              </span>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => {
                const newText = e.target.value
                if (countWords(newText) <= 150) {
                  setFormData((prev) => ({ ...prev, description: newText }))
                }
              }}
              required
              rows={4}
              placeholder="A brief description of your project..."
              className="border-0 bg-muted/50 resize-none"
            />
          </div>
        </section>

        {/* Media Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            Media
          </div>

          {/* Image Picker */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <button
              type="button"
              onClick={() => !uploadingImage && fileInputRef.current?.click()}
              className={cn(
                'relative cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors overflow-hidden',
                formData.main_image_url ? 'h-48' : 'h-32',
                uploadingImage && 'pointer-events-none opacity-70',
              )}
            >
              {uploadingImage ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="h-8 w-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : formData.main_image_url ? (
                <>
                  <img
                    src={formData.main_image_url}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-background/90 px-3 py-1.5 text-sm font-medium flex items-center gap-1.5">
                      <Upload className="h-4 w-4" />
                      Change Image
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-40" />
                  <span className="text-sm">Click to upload cover image</span>
                  <span className="text-xs mt-1 opacity-60">PNG, JPG, WebP up to 5MB</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              hidden
              onChange={handleFileSelected}
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5" />
                Repository URL
              </Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://github.com/..."
                className="border-0 bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="access_link" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Live Demo URL
              </Label>
              <Input
                id="access_link"
                type="url"
                value={formData.access_link}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    access_link: e.target.value,
                  }))
                }
                placeholder="https://..."
                className="border-0 bg-muted/50"
              />
            </div>
          </div>
        </section>

        {/* Classification Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="h-4 w-4" />
            Classification
          </div>

          {/* Project Type - Autocomplete Input */}
          <div className="space-y-2">
            <Label>Project Types</Label>
            {/* Selected types */}
            {formData.type.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.type.map((t) => {
                  const type = PROJECT_TYPES.find((pt) => pt.value === t)
                  return (
                    <Badge key={t} variant="secondary" className="gap-1 pr-1 font-normal">
                      {type?.label || t}
                      <button
                        type="button"
                        onClick={() => handleRemoveType(t)}
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
            {/* Autocomplete input */}
            <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    type="text"
                    value={typeSearch}
                    onChange={(e) => {
                      setTypeSearch(e.target.value)
                      if (!typePopoverOpen) setTypePopoverOpen(true)
                    }}
                    onFocus={() => setTypePopoverOpen(true)}
                    placeholder="Type to search project types..."
                    className="border-0 bg-muted/50 pr-8"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="max-h-60 overflow-auto">
                  {filteredTypes.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No types found</div>
                  ) : (
                    filteredTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeToggle(type.value)}
                        className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.type.includes(type.value) ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {type.label}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tech Stack - Select Component */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Tech Stack
              </Label>
              <Sheet open={drawerOpened} onOpenChange={setDrawerOpened}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Create New
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Create Tech Stack</SheetTitle>
                    <SheetDescription>
                      Add a new technology to your tech stack list.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-tech">Technology Name</Label>
                      <Input
                        id="new-tech"
                        value={newTechName}
                        onChange={(e) => setNewTechName(e.target.value)}
                        placeholder="e.g., React, Node.js..."
                        className="border-0 bg-muted/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateTech()
                          }
                        }}
                      />
                    </div>
                    <Button onClick={handleCreateTech} className="w-full">
                      Create & Add
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Selected techs */}
            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tech_stack.map((tech) => (
                  <Badge key={tech} variant="outline" className="gap-1 pr-1 font-normal">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Tech select */}
            <Select onValueChange={handleAddTech}>
              <SelectTrigger className="border-0 bg-muted/50">
                <SelectValue placeholder="Select technologies..." />
              </SelectTrigger>
              <SelectContent>
                {/* Show common tech options - in real app, fetch from server */}
                {[
                  'React',
                  'Vue',
                  'Angular',
                  'Next.js',
                  'Nuxt.js',
                  'Svelte',
                  'Node.js',
                  'Express',
                  'NestJS',
                  'Python',
                  'Django',
                  'Flask',
                  'TypeScript',
                  'JavaScript',
                  'Go',
                  'Rust',
                  'Java',
                  'Spring',
                  'PostgreSQL',
                  'MongoDB',
                  'Redis',
                  'Docker',
                  'Kubernetes',
                  'AWS',
                  'Tailwind CSS',
                  'GraphQL',
                  'REST API',
                ]
                  .filter((tech) => !formData.tech_stack.includes(tech))
                  .map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={(e) => void handleSubmit(e, true)}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save as Draft
          </Button>
          <Button type="submit" disabled={loading}>
            <Send className="h-4 w-4 mr-1.5" />
            {loading ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </form>

      {/* Linked Articles Section */}
      {isEditing && project && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileCode className="h-4 w-4" />
              Linked Articles
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href={`/admin/articles/new?project=${project.id}`}>
                <Plus className="h-3 w-3 mr-1" />
                New Article
              </a>
            </Button>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-1">
              {articles.map((article) => (
                <a
                  key={article.id}
                  href={`/admin/articles/${article.id}/edit`}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group -mx-3"
                >
                  <FileCode className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-foreground/80">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">/{article.slug}</p>
                  </div>
                  <Badge
                    variant={article.status === 'published' ? 'default' : 'secondary'}
                    className="text-[10px] px-1.5 py-0 h-4 font-normal"
                  >
                    {article.status || 'draft'}
                  </Badge>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/30">
              <FileCode className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                No articles linked to this project yet
              </p>
              <Button variant="ghost" size="sm" className="mt-2" asChild>
                <a href={`/admin/articles/new?project=${project.id}`}>
                  <PenLine className="h-4 w-4 mr-1.5" />
                  Write an article
                </a>
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Invite to write article card for new projects */}
      {!isEditing && (
        <div className="bg-muted/50 p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-background flex items-center justify-center shrink-0">
              <PenLine className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">
                Write an article about this project
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                After creating the project, you can write articles to share the story behind it,
                technical decisions, and lessons learned.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
