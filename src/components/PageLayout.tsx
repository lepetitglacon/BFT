import type { ReactNode } from "react"

interface PageLayoutProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageLayout({
  title,
  description,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  )
}
