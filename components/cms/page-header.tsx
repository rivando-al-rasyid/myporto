export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </div>
  )
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 p-4 lg:p-6">{children}</div>
}
