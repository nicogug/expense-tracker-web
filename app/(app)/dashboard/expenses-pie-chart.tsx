"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CategoryTotal {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
}

interface ExpensesPieChartProps {
  categoryTotals: CategoryTotal[];
}

function convertToChartData(categoryTotals: CategoryTotal[]) {
  // Define chart colors using CSS variables - following the shadcn pattern
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  return categoryTotals.map((cat, index) => ({
    category: cat.category_name,
    amount: cat.total,
    fill: chartColors[index % chartColors.length],
  }));
}

export function ExpensesPieChart({ categoryTotals }: ExpensesPieChartProps) {
  const chartData = convertToChartData(categoryTotals);
  const hasData = chartData.some((item) => item.amount > 0);

  const totalExpenses = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  // Create chart config dynamically based on categories
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Amount",
      },
    };

    // Define chart colors using CSS variables - following the shadcn pattern
    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    chartData.forEach((item, index) => {
      config[item.category] = {
        label: item.category,
        color: chartColors[index % chartColors.length],
      };
    });

    return config;
  }, [chartData]);

  if (!hasData) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Your spending breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex h-[250px] items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                No expense data available
              </p>
              <p className="text-xs text-muted-foreground">
                Start adding expenses to see your spending breakdown
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Your spending breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto max-h-[350px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent hideLabel className="min-w-[120px]" />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={80}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 8}
                          className="fill-foreground text-2xl font-bold"
                        >
                          ${totalExpenses.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Expenses
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Expenses breakdown by category <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing your spending patterns
        </div>
      </CardFooter>
    </Card>
  );
}
