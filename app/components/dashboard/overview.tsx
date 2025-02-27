"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface BarChartData {
  count: number
  month: string
}

export function Overview() {
  const [data, setData] = useState<BarChartData[]>([])

  useEffect(() => {
    fetch("https://appcraft-go-web-production.up.railway.app/users/barchart")
      .then((response) => response.json())
      .then((json) => {
        const formattedData = json.map((item: BarChartData) => ({
          name: item.month,
          total: item.count,
        }))
        setData(formattedData)
      })
      .catch((error) => console.error("Error fetching bar chart data:", error))
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

