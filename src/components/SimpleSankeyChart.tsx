import React, { useMemo } from "react"

interface SankeyLink {
  source: string
  target: string
  value: number
}

interface SankeyData {
  links: SankeyLink[]
}

interface SimpleSankeyChartProps {
  height: number
  series: {
    data: SankeyData
  }
}

export function SimpleSankeyChart({ height, series }: SimpleSankeyChartProps) {
  const { nodes, links } = useMemo(() => {
    const nodeSet = new Set<string>()
    series.data.links.forEach((link) => {
      nodeSet.add(link.source)
      nodeSet.add(link.target)
    })

    // Organize nodes by columns
    const sources = new Set(series.data.links.map((l) => l.source))
    const targets = new Set(series.data.links.map((l) => l.target))
    const sourceOnlyNodes = Array.from(sources).filter((s) => !targets.has(s))
    const targetOnlyNodes = Array.from(targets).filter((t) => !sources.has(t))
    const middleNodes = Array.from(nodeSet).filter(
      (n) => !sourceOnlyNodes.includes(n) && !targetOnlyNodes.includes(n)
    )

    const columns = [sourceOnlyNodes, middleNodes, targetOnlyNodes].filter(
      (col) => col.length > 0
    )

    // Calculate node values
    const nodeValues = new Map<string, number>()
    series.data.links.forEach((link) => {
      nodeValues.set(
        link.source,
        (nodeValues.get(link.source) || 0) + link.value
      )
      nodeValues.set(
        link.target,
        (nodeValues.get(link.target) || 0) + link.value
      )
    })

    return {
      nodes: columns,
      links: series.data.links,
      nodeValues,
    }
  }, [series.data.links])

  const width = 800
  const padding = 40
  const nodeWidth = 20
  const columnSpacing = (width - 2 * padding - nodeWidth) / (nodes.length - 1)

  const nodePositions = new Map<string, { x: number; y: number; height: number }>()

  nodes.forEach((column, colIndex) => {
    const x = padding + colIndex * columnSpacing
    const columnHeight = height - 2 * padding
    const spacing = columnHeight / (column.length + 1)

    column.forEach((nodeName, nodeIndex) => {
      const y = padding + spacing * (nodeIndex + 1)
      const nodeHeight = 40
      nodePositions.set(nodeName, { x, y, height: nodeHeight })
    })
  })

  // Generate curved path for links
  const generatePath = (
    x1: number,
    y1: number,
    h1: number,
    x2: number,
    y2: number,
    h2: number
  ) => {
    const midX = (x1 + x2) / 2
    const startY = y1 + h1 / 2
    const endY = y2 + h2 / 2

    return `
      M ${x1 + nodeWidth} ${startY}
      C ${midX} ${startY},
        ${midX} ${endY},
        ${x2} ${endY}
    `
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Draw links */}
      {links.map((link, index) => {
        const sourcePos = nodePositions.get(link.source)
        const targetPos = nodePositions.get(link.target)
        if (!sourcePos || !targetPos) return null

        return (
          <g key={index}>
            <path
              d={generatePath(
                sourcePos.x,
                sourcePos.y,
                sourcePos.height,
                targetPos.x,
                targetPos.y,
                targetPos.height
              )}
              stroke="#94a3b8"
              strokeWidth={link.value * 2}
              fill="none"
              opacity={0.4}
            />
          </g>
        )
      })}

      {/* Draw nodes */}
      {Array.from(nodePositions.entries()).map(([nodeName, pos]) => (
        <g key={nodeName}>
          <rect
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={pos.height}
            fill="#3b82f6"
            rx={4}
          />
          <text
            x={pos.x + nodeWidth / 2}
            y={pos.y - 8}
            textAnchor="middle"
            fill="#64748b"
            fontSize="14"
            fontWeight="500"
          >
            {nodeName}
          </text>
        </g>
      ))}
    </svg>
  )
}
