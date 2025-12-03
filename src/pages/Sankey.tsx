import { useMemo } from "react"
import { useExpenses } from "../hooks/useExpenses"
import { useSalary } from "../hooks/useSalary"
import { SimpleSankeyChart } from "../components/SimpleSankeyChart"
import { PageLayout } from "../components/PageLayout"

export function Sankey() {
  const { data: expenses = [], isLoading } = useExpenses()
  const { data: salaryData } = useSalary()
  const monthlySalary = salaryData?.monthlySalary ?? 0

  // Créer les liens pour le diagramme Sankey
  const sankeyLinks = useMemo(() => {
    const links = []

    // Liens : Salaire -> Catégories
    const categoryTotals = new Map<string, number>()
    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.category) || 0
      categoryTotals.set(expense.category, current + expense.amount)
    })

    categoryTotals.forEach((amount, category) => {
      links.push({
        source: "Salaire",
        target: category,
        value: amount,
      })
    })

    // Liens : Catégories -> Dépenses individuelles
    expenses.forEach((expense) => {
      links.push({
        source: expense.category,
        target: expense.description,
        value: expense.amount,
      })
    })

    return links
  }, [expenses])

  if (isLoading) {
    return (
      <PageLayout
        title="Flux financier"
        description="Visualisez le flux de vos dépenses par catégorie"
      >
        <div className="text-muted-foreground">Chargement...</div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Flux financier"
      description="Visualisez le flux de vos dépenses par catégorie"
    >
      {sankeyLinks.length > 0 ? (
        <SimpleSankeyChart
          height={600}
          series={{
            data: {
              links: sankeyLinks,
            },
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Aucune dépense à afficher. Ajoutez des dépenses pour voir le flux
          financier.
        </div>
      )}
    </PageLayout>
  )
}
