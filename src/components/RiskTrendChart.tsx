import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestResult } from "@/lib/storage";

interface RiskTrendChartProps {
  reports: TestResult[];
}

const RiskTrendChart = ({ reports }: RiskTrendChartProps) => {
  const chartData = useMemo(() => {
    // Sort reports by date ascending for chronological display
    const sorted = [...reports].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((report, index) => ({
      date: new Date(report.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      fullDate: new Date(report.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      testNumber: index + 1,
      pancreatic: report.predictions?.pancreatic?.probability ?? null,
      colon: report.predictions?.colon?.probability ?? null,
      blood: report.predictions?.blood?.probability ?? null,
    }));
  }, [reports]);

  if (reports.length < 2) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Risk Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-center">
              Complete at least 2 tests to see trend visualization
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Risk Trend Over Time
          <span className="text-sm font-normal text-muted-foreground">
            ({reports.length} tests)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.5}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name.charAt(0).toUpperCase() + name.slice(1) + ' Cancer'
                ]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Test ${payload[0].payload.testNumber} - ${payload[0].payload.fullDate}`;
                  }
                  return label;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '16px' }}
                formatter={(value: string) => (
                  <span style={{ color: 'hsl(var(--foreground))' }}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </span>
                )}
              />
              {/* Reference lines for risk thresholds */}
              <ReferenceLine 
                y={30} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                opacity={0.5}
              />
              <ReferenceLine 
                y={60} 
                stroke="hsl(var(--destructive))" 
                strokeDasharray="5 5" 
                opacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="pancreatic"
                stroke="hsl(280, 70%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(280, 70%, 50%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="colon"
                stroke="hsl(200, 70%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(200, 70%, 50%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="blood"
                stroke="hsl(340, 70%, 50%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(340, 70%, 50%)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-px w-6 border-t border-dashed border-muted-foreground" />
            <span>30% Medium threshold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px w-6 border-t border-dashed border-destructive" />
            <span>60% High threshold</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskTrendChart;
