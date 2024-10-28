import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Slider } from "./ui/slider"

 
const chartConfig = {
    views: {
      label: "Sampled Data",
    },
    value: {
        label: "Avg Value ",
        color: "hsl(var(--chart-1))"
    }
  } satisfies ChartConfig

const getTitle = (granularity : number) => {
  if(granularity === 1000){
    return (<CardDescription>Showing data each 1 second</CardDescription>)
  }else if(granularity === 100){
    return (<CardDescription>Showing data each 100 millisecond</CardDescription>)
  }else if(granularity === 10){
    return (<CardDescription>Showing data each 10 millisecond</CardDescription>)
  }else{
    return (<CardDescription>Showing data each millisecond</CardDescription>)
  }
}

export function MainChart({data, granularity} : {data : {name?: string, value?: number}[], granularity: number}){
    return (
      <div>
      <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
        {getTitle(granularity)}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
          >
            <CartesianGrid vertical={false} />
            <XAxis  
              dataKey="name"
              tickLine={true}
              axisLine={true}
              tickMargin={10}
              tickFormatter={(value) => value}
            />
            <YAxis/>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel/>}
            />
            <Line
              dataKey="value"
              type="natural"
              stroke="var(--color-value)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </div>
    )
}