import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const nativeClass =
  'w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30'

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function TextField({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = 'text',
  hint,
  className,
}: {
  label: string
  name: string
  defaultValue?: string | number | null
  placeholder?: string
  required?: boolean
  type?: string
  hint?: string
  className?: string
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} className={className}>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
      />
    </Field>
  )
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
  className,
  mono,
}: {
  label: string
  name: string
  defaultValue?: string | null
  rows?: number
  hint?: string
  className?: string
  mono?: boolean
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        className={cn(nativeClass, mono && 'font-mono')}
      />
    </Field>
  )
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  className,
}: {
  label: string
  name: string
  defaultValue?: string
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <Field label={label} htmlFor={name} className={className}>
      <select id={name} name={name} defaultValue={defaultValue} className={cn(nativeClass, 'h-8')}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function CheckField({
  label,
  name,
  defaultChecked,
}: {
  label: string
  name: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-primary" />
      {label}
    </label>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {message}
    </p>
  )
}
