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
  Search,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
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
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

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

interface ProjectTypeItem {
  value: string
  label: string | null
}

// Known PG enum values — anything outside this set is a custom type
const PRESET_ENUM_VALUES = new Set([
  'web', 'mobile', 'script', 'backend', 'infra',
  'llm', 'ai', 'desktop', 'api', 'library', 'other',
])

const PROJECT_STATES = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'finished', label: 'Finished' },
  { value: 'production', label: 'Production' },
]

interface TechStackItem {
  id: string
  name: string
  icon: string
  description: string | null
}

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

  // ——— Type (classification) state ———
  const [projectTypes, setProjectTypes] = useState<ProjectTypeItem[]>([])
  const [typeSearch, setTypeSearch] = useState('')
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [newTypeDrawerOpen, setNewTypeDrawerOpen] = useState(false)

  // ——— Tech stack state ———
  const [techStacks, setTechStacks] = useState<TechStackItem[]>([])
  const [techSearch, setTechSearch] = useState('')
  const [techPopoverOpen, setTechPopoverOpen] = useState(false)
  const [newTechName, setNewTechName] = useState('')
  const [newTechDrawerOpen, setNewTechDrawerOpen] = useState(false)

  const closeDrawer = () => setNewTechDrawerOpen(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const wordCount = countWords(formData.description)

  // —— Fetch project types from DB view + tech stacks from server ———
  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient()

      // Fetch project types from the database view
      const { data: typeData } = await supabase
        .from('project_types_view')
        .select('value, label')
      if (typeData) {
        setProjectTypes(typeData as ProjectTypeItem[])
      }

      // Fetch tech stacks
      const { data: techData } = await supabase
        .from('techstacks')
        .select('id, name, icon, description')
        .order('name', { ascending: true })
      if (techData) {
        setTechStacks(techData as TechStackItem[])
      }
    }
    init()
  }, [])

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
      const supabase = createSupabaseBrowserClient()

      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      const { data, error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(filename, file, { upsert: false })

      if (uploadError) {
        setError(uploadError.message)
        return
      }

      const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(data.path)
      setFormData((prev) => ({ ...prev, main_image_url: urlData.publicUrl }))
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
      if (e.target) e.target.value = ''
    }
  }, [])

  // ——— Type handlers ———
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

  const handleCreateType = useCallback(() => {
    const trimmed = newTypeName.trim()
    if (!trimmed) return

    // Determine the value to store: if it matches a known enum use it, otherwise "other"
    const matched = projectTypes.find(
      (t) =>
        (t.label && t.label.toLowerCase() === trimmed.toLowerCase()) ||
        t.value.toLowerCase() === trimmed.toLowerCase(),
    )
    const valueToStore = matched ? matched.value : 'other'

    setFormData((prev) => ({
      ...prev,
      type: prev.type.includes(valueToStore) ? prev.type : [...prev.type, valueToStore],
    }))
    setNewTypeName('')
    setNewTypeDrawerOpen(false)
  }, [newTypeName, projectTypes])

  const filteredTypes = projectTypes.filter(
    (t) =>
      t.label &&
      !formData.type.includes(t.value) &&
      t.label.toLowerCase().includes(typeSearch.toLowerCase()),
  )

  // Whether the current search text is a custom type (not in the predefined list)
  const isCustomType =
    typeSearch.trim().length > 0 &&
    !projectTypes.some(
      (t) =>
        (t.label && t.label.toLowerCase() === typeSearch.trim().toLowerCase()) ||
        t.value.toLowerCase() === typeSearch.trim().toLowerCase(),
    )

  // ——— Tech stack handlers ———
  const handleAddTech = useCallback(
    (techId: string) => {
      if (techId && !formData.tech_stack.includes(techId)) {
        setFormData((prev) => ({
          ...prev,
          tech_stack: [...prev.tech_stack, techId],
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

  const handleCreateTech = useCallback(async () => {
    const trimmed = newTechName.trim()
    if (!trimmed) {
      setError('Technology name is required')
      return
    }

    const supabase = createSupabaseBrowserClient()
    const id = trimmed.toLowerCase().replace(/\s+/g, '-')

    // Check for duplicates
    if (techStacks.some((ts) => ts.id === id || ts.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`"${trimmed}" already exists in the tech stack list`)
      return
    }

    // Insert into techstacks table
    const { error: insertError } = await supabase.from('techstacks').insert({
      id,
      name: trimmed,
      icon: '',
      description: null,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    // Add to local form state
    handleAddTech(id)
    setNewTechName('')
    setError(null)
    closeDrawer()

    // Refetch tech stacks to update the list
    const { data } = await supabase
      .from('techstacks')
      .select('id, name, icon, description')
      .order('name', { ascending: true })
    if (data) {
      setTechStacks(data as TechStackItem[])
    }
  }, [newTechName, techStacks, handleAddTech, closeDrawer])

  // Filter tech stacks by search
  const filteredTechStacks = techStacks.filter(
    (ts) =>
      !formData.tech_stack.includes(ts.id) &&
      (ts.name.toLowerCase().includes(techSearch.toLowerCase()) ||
        ts.id.toLowerCase().includes(techSearch.toLowerCase())),
  )

  // Get display name for a tech id
  const getTechName = useCallback(
    (id: string) => {
      const match = techStacks.find((ts) => ts.id === id)
      return match?.name || id
    },
    [techStacks],
  )

  // Get display label for a type value
  const getTypeLabel = useCallback(
    (value: string) => {
      const match = projectTypes.find((t) => t.value === value)
      return match?.label || value
    },
    [projectTypes],
  )

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    setError(null)

    if (formData.tech_stack.length === 0) {
      setError('Please add at least one technology to the tech stack')
      return
    }

    if (formData.type.length === 0) {
      setError('Please select at least one project type')
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/admin/login')
        return
      }

      // Map custom types (non-enum) to "other" for DB persistence
      const dbTypes = formData.type.map((t) => (PRESET_ENUM_VALUES.has(t) ? t : 'other'))

      const payload = {
        title: formData.title,
        description: formData.description,
        main_image_url: formData.main_image_url || null,
        url: formData.url || null,
        access_link: formData.access_link || null,
        state: formData.state,
        project_date: formData.project_date || null,
        type: dbTypes,
        tech_stack: formData.tech_stack,
        slug: formData.slug,
      }

      let savedProject: Record<string, unknown>

      if (isEditing && project) {
        const { data, error: updateError } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', project.id)
          .select()
          .single()

        if (updateError) {
          setError(updateError.message)
          return
        }
        savedProject = data as Record<string, unknown>
      } else {
        const { data, error: insertError } = await supabase
          .from('projects')
          .insert({ ...payload, user_id: session.session.user.id, publication_status: 'draft' })
          .select()
          .single()

        if (insertError) {
          setError(insertError.message)
          return
        }
        savedProject = data as Record<string, unknown>
      }

      // Sync project_techstacks
      const { data: matchingStacks } = await supabase
        .from('techstacks')
        .select('id')
        .in('id', formData.tech_stack.map((t) => t.toLowerCase()))

      if (matchingStacks && matchingStacks.length > 0) {
        const techstackIds = matchingStacks.map((ts: { id: string }) => ts.id)

        // Remove existing
        await supabase.from('project_techstacks').delete().eq('project_id', savedProject.id)

        // Insert new
        await supabase.from('project_techstacks').insert(
          techstackIds.map((techstackId: string) => ({
            project_id: savedProject.id,
            techstack_id: techstackId,
          })),
        )
      }

      // Handle publish status
      if (!asDraft) {
        await supabase
          .from('projects')
          .update({
            publication_status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', savedProject.id)
      } else {
        await supabase
          .from('projects')
          .update({ publication_status: 'draft' })
          .eq('id', savedProject.id)
      }

      onSuccess?.(savedProject)
      if (!onSuccess && onSuccessPath) {
        await navigate(onSuccessPath)
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
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            Status & Schedule
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="h-4 w-4" />
            Basic Information
          </div>
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

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            Media
          </div>
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
              accept="image/jpeg,image/png,image/gif,image/webp,image/heif,image/heic"
              hidden
              onChange={handleFileSelected}
            />
          </div>
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

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="h-4 w-4" />
            Classification
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Project Types</Label>
              <Sheet open={newTypeDrawerOpen} onOpenChange={setNewTypeDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Create New
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md">
                  <SheetHeader className="px-6 pt-6 pb-2">
                    <SheetTitle>Create Project Type</SheetTitle>
                    <SheetDescription>
                      Add a new project classification to categorize your work.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-6 space-y-5 pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-type">Type Name</Label>
                      <Input
                        id="new-type"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="e.g., CLI, Game, Blockchain..."
                        className="border-0 bg-muted/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateType()
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Custom types are mapped to &quot;Other&quot; in the database but displayed
                        with their original name in the form.
                      </p>
                    </div>
                    <Button onClick={handleCreateType} className="w-full">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Type
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {formData.type.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.type.map((t) => {
                  const isEnum = PRESET_ENUM_VALUES.has(t)
                  const label = isEnum ? getTypeLabel(t) : t
                  return (
                    <Badge
                      key={t}
                      variant={isEnum ? 'secondary' : 'outline'}
                      className={cn('gap-1 pr-1 font-normal', !isEnum && 'border-dashed')}
                    >
                      {label}
                      {!isEnum && (
                        <span className="text-[10px] text-muted-foreground ml-0.5">(custom)</span>
                      )}
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
                  {filteredTypes.length === 0 && !isCustomType ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No types found</div>
                  ) : (
                    <>
                      {filteredTypes.map((type) => (
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
                      ))}
                      {isCustomType && (
                        <button
                          type="button"
                          onClick={() => handleTypeToggle(typeSearch.trim())}
                          className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-t border-border"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add &quot;{typeSearch.trim()}&quot; as custom type
                        </button>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Tech Stack
              </Label>
              <Sheet open={newTechDrawerOpen} onOpenChange={setNewTechDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Create New
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="sm:max-w-md">
                  <SheetHeader className="px-6 pt-6 pb-2">
                    <SheetTitle>Create Tech Stack</SheetTitle>
                    <SheetDescription>
                      Add a new technology to your tech stack list. It will be saved to the server
                      and available for all projects.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-6 space-y-5 pb-6">
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
                            void handleCreateTech()
                          }
                        }}
                      />
                    </div>
                    <Button onClick={() => void handleCreateTech()} className="w-full">
                      <Plus className="h-4 w-4 mr-1.5" />
                      Create & Add
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formData.tech_stack.map((techId) => (
                  <Badge key={techId} variant="outline" className="gap-1 pr-1 font-normal">
                    {getTechName(techId)}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(techId)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <Popover open={techPopoverOpen} onOpenChange={setTechPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    value={techSearch}
                    onChange={(e) => {
                      setTechSearch(e.target.value)
                      if (!techPopoverOpen) setTechPopoverOpen(true)
                    }}
                    onFocus={() => setTechPopoverOpen(true)}
                    placeholder="Search technologies..."
                    className="border-0 bg-muted/50 pl-9"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <Command>
                  <CommandInput
                    placeholder="Search technologies..."
                    value={techSearch}
                    onValueChange={setTechSearch}
                    className="border-0"
                  />
                  <CommandList>
                    <CommandEmpty>
                      {techSearch.trim() ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          No technology found. Use the &quot;Create New&quot; button to add it.
                        </div>
                      ) : (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Type to search technologies
                        </div>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredTechStacks.length > 0 &&
                        filteredTechStacks.map((ts) => (
                          <CommandItem
                            key={ts.id}
                            value={ts.id}
                            onSelect={() => {
                              handleAddTech(ts.id)
                              setTechSearch('')
                              setTechPopoverOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.tech_stack.includes(ts.id) ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <span>{ts.name}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </section>

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
                  href={`/admin/articles/edit?id=${article.id}`}
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
