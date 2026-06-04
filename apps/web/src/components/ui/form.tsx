import { useStore } from '@tanstack/react-store'
import * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------- */
/*  The FieldApi from TanStack Form has 23 generic params.                    */
/*  We use a minimal interface so consumers don't need to type all of them.   */
/* -------------------------------------------------------------------------- */

interface MinimalFieldApi {
  name: string
  // biome-ignore lint/suspicious/noExplicitAny: TanStack form store type is complex
  store: any
  state: {
    value: string
    // biome-ignore lint/suspicious/noExplicitAny: meta type from TanStack is complex
    meta: Record<string, any>
  }
  handleChange: (value: string) => void
  handleBlur: () => void
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                   */
/* -------------------------------------------------------------------------- */

type FormContextValue = {
  formId: string
}

const FormContext = React.createContext<FormContextValue | null>(null)

/* -------------------------------------------------------------------------- */
/*  Form                                                                      */
/* -------------------------------------------------------------------------- */

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  formId?: string
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, formId = 'form', ...props }, ref) => {
    return (
      <FormContext.Provider value={{ formId }}>
        <form ref={ref} className={cn('space-y-8', className)} {...props} />
      </FormContext.Provider>
    )
  },
)
Form.displayName = 'Form'

/* -------------------------------------------------------------------------- */
/*  FormItem                                                                  */
/* -------------------------------------------------------------------------- */

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  ),
)
FormItem.displayName = 'FormItem'

/* -------------------------------------------------------------------------- */
/*  FormLabel                                                                 */
/* -------------------------------------------------------------------------- */

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-destructive" aria-hidden="true">
        *
      </span>
    )}
  </Label>
))
FormLabel.displayName = 'FormLabel'

/* -------------------------------------------------------------------------- */
/*  FormControl                                                               */
/* -------------------------------------------------------------------------- */

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => <div ref={ref} {...props} />,
)
FormControl.displayName = 'FormControl'

/* -------------------------------------------------------------------------- */
/*  FormMessage — shows field-level errors                                    */
/* -------------------------------------------------------------------------- */

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  field: MinimalFieldApi
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, field, ...props }, ref) => {
    // biome-ignore lint/suspicious/noExplicitAny: TanStack store state type is complex
    const errors = useStore(field.store, (state: any) => state.meta.errors) as Array<{
      message?: string
    }>

    if (!errors || errors.length === 0) return null

    return (
      <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} {...props}>
        {errors[0]?.message || 'Invalid value'}
      </p>
    )
  },
)
FormMessage.displayName = 'FormMessage'

/* -------------------------------------------------------------------------- */
/*  FormDescription                                                           */
/* -------------------------------------------------------------------------- */

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
FormDescription.displayName = 'FormDescription'

export {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  type MinimalFieldApi,
}
