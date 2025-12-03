import { useMemo } from "react"
import { ParentSize } from "@visx/responsive"
import { sankey, sankeyLinkHorizontal } from "@visx/sankey"
import { Group } from "@visx/group"
import { useExpenses } from "../hooks/useExpenses"

interface SankeyNode {
  name: string
}

interface SankeyLink {
  source: number
  target: number
  value: number
}

interface SankeyData {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

const colors = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
]

function SankeyChart({
  width,
  height,
  data,
}: {
  width: number
  height: number
  data: SankeyData
}) {
  const sankeyGenerator = useMemo(
    () =>
      sankey<SankeyData, SankeyNode, SankeyLink>({
        nodeId: (d) => d.name,
        nodeWidth: 20,
        nodePadding: 40,
        extent: [
          [10, 10],
          [width - 10, height - 10],
        ],
      }),
    [width, height]
  )

  const { nodes, links } = useMemo(
    () => sankeyGenerator(data),
    [sankeyGenerator, data]
  )

  return (
    <svg width={width} height={height}>
      <Group>
        {links.map((link, i) => {
          const linkPath = sankeyLinkHorizontal()
          return (
            <g key={`link-${i}`}>
              <path
                d={linkPath(link) || ""}
                fill="none"
                stroke={colors[link.source.index % colors.length]}
                strokeWidth={Math.max(1, link.width || 0)}
                opacity={0.4}
                style={{ transition: "opacity 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.7"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.4"
                }}
              />
            </g>
          )
        })}

        {nodes.map((node, i) => {
          const nodeHeight =
            node.y1 !== undefined && node.y0 !== undefined
              ? node.y1 - node.y0
              : 0
          const nodeX = node.x0 ?? 0
          const nodeY = node.y0 ?? 0

          return (
            <g key={`node-${i}`}>
              <rect
                x={nodeX}
                y={nodeY}
                width={node.x1 !== undefined ? node.x1 - nodeX : 0}
                height={nodeHeight}
                fill={colors[i % colors.length]}
                rx={4}
                style={{ cursor: "pointer" }}
              />
              <text
                x={nodeX < width / 2 ? (node.x1 ?? 0) + 6 : nodeX - 6}
                y={nodeY + nodeHeight / 2}
                dy="0.35em"
                textAnchor={nodeX < width / 2 ? "start" : "end"}
                fontSize={14}
                fontWeight={600}
                fill="currentColor"
                className="text-foreground"
              >
                {node.name}
              </text>
              <text
                x={nodeX < width / 2 ? (node.x1 ?? 0) + 6 : nodeX - 6}
                y={nodeY + nodeHeight / 2 + 18}
                textAnchor={nodeX < width / 2 ? "start" : "end"}
                fontSize={12}
                fill="currentColor"
                className="text-muted-foreground"
              >
                {node.value?.toFixed(0)}€
              </text>
            </g>
          )
        })}
      </Group>
    </svg>
  )
}

export function Graph() {
  const { data: expenses = [], isLoading } = useExpenses()

  const data = useMemo(() => {
    // Calculer les totaux par catégorie
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const totalExpenses = Object.values(categoryTotals).reduce(
      (sum, val) => sum + val,
      0
    )

    // Créer les nœuds : Revenus → Budget → Catégories
    const nodes: SankeyNode[] = [
      { name: "Revenus" },
      { name: "Budget disponible" },
      ...Object.keys(categoryTotals).map((category) => ({ name: category })),
    ]

    // Créer les liens
    const links: SankeyLink[] = [
      // Revenus → Budget
      { source: 0, target: 1, value: totalExpenses },
      // Budget → Catégories
      ...Object.entries(categoryTotals).map(([category, amount], index) => ({
        source: 1,
        target: index + 2,
        value: amount,
      })),
    ]

    return { nodes, links }
  }, [expenses])

  if (isLoading) {
    return (
      <div className="text-muted-foreground">Chargement des données...</div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Flux financiers</h1>
        <p className="text-muted-foreground mt-2">
          Visualisation de vos revenus et dépenses avec un diagramme Sankey
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Diagramme de flux</h2>
        <div className="w-full h-[600px]">
          <ParentSize>
            {({ width, height }) => (
              <SankeyChart width={width} height={height} data={data} />
            )}
          </ParentSize>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Résumé par catégorie</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.nodes.slice(2).map((node, i) => {
            const expense = expenses.find((e) => e.category === node.name)
            const total = expenses
              .filter((e) => e.category === node.name)
              .reduce((sum, e) => sum + e.amount, 0)
            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[(i + 2) % colors.length] }}
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">{node.name}</span>
                  <p className="text-xs text-muted-foreground">
                    {total.toFixed(2)}€
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
