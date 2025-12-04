import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from "d3-sankey"

interface SankeyLinkData {
  source: string
  target: string
  value: number
}

interface SankeyData {
  links: SankeyLinkData[]
}

interface SimpleSankeyChartProps {
  height: number
  series: {
    data: SankeyData
  }
}

interface GraphNode {
  name: string
  x0?: number
  x1?: number
  y0?: number
  y1?: number
  value?: number
}

interface GraphLink {
  source: number | GraphNode
  target: number | GraphNode
  value: number
  width?: number
  y0?: number
  y1?: number
}

export function SimpleSankeyChart({ height, series }: SimpleSankeyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !series.data.links.length) return

    const width = 800
    const margin = { top: 40, right: 120, bottom: 40, left: 120 }

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove()

    // Create nodes from links
    const nodeNames = new Set<string>()
    series.data.links.forEach((link) => {
      nodeNames.add(link.source)
      nodeNames.add(link.target)
    })

    const nodes: GraphNode[] = Array.from(nodeNames).map((name) => ({
      name,
    }))

    const nodeMap = new Map(nodes.map((node, i) => [node.name, i]))

    // Create links with indices
    const links: GraphLink[] = series.data.links.map((link) => ({
      source: nodeMap.get(link.source)!,
      target: nodeMap.get(link.target)!,
      value: link.value,
    }))

    // Create Sankey layout
    const sankeyGenerator = sankey<GraphNode, GraphLink>()
      .nodeWidth(20)
      .nodePadding(20)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])

    const graph = sankeyGenerator({
      nodes: nodes.map((d) => ({ ...d })),
      links: links.map((d) => ({ ...d })),
    })

    const svg = d3.select(svgRef.current)

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    // Draw links
    svg
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", (d) => Math.max(1, d.width!))
      .attr("stroke", (d) => {
        const sourceNode = d.source as GraphNode
        return color(sourceNode.name)
      })
      .attr("stroke-opacity", 0.5)
      .attr("fill", "none")
      .append("title")
      .text((d) => {
        const sourceNode = d.source as GraphNode
        const targetNode = d.target as GraphNode
        return `${sourceNode.name} → ${targetNode.name}\n${d.value.toFixed(2)}€`
      })

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("rect")
      .data(graph.nodes)
      .join("rect")
      .attr("x", (d) => d.x0!)
      .attr("y", (d) => d.y0!)
      .attr("height", (d) => d.y1! - d.y0!)
      .attr("width", (d) => d.x1! - d.x0!)
      .attr("fill", (d) => color(d.name))
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .attr("rx", 4)

    // Add tooltips to nodes
    node.append("title").text((d) => {
      const value = d.value || 0
      return `${d.name}\n${value.toFixed(2)}€`
    })

    // Add value labels to nodes
    svg
      .append("g")
      .selectAll("text")
      .data(graph.nodes)
      .join("text")
      .attr("x", (d) => (d.x0! + d.x1!) / 2)
      .attr("y", (d) => (d.y1! + d.y0!) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "#fff")
      .attr("pointer-events", "none")
      .text((d) => {
        const value = d.value || 0
        const nodeHeight = (d.y1! - d.y0!)
        if (nodeHeight < 20) return ""

        // Tronquer le nom à 15 caractères
        const shortName = d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name
        return `${value.toFixed(0)}€ - ${shortName}`
      })
  }, [series.data.links, height])

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 800 ${height}`}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  )
}
