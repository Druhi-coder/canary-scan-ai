import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { RiskFactor } from '@/lib/predictionEngine';

interface FactorsListProps {
  factors: RiskFactor[];
  maxFactors?: number;
}

export const FactorsList = ({ factors, maxFactors = 5 }: FactorsListProps) => {
  const displayFactors = factors.slice(0, maxFactors);
  const increasingFactors = displayFactors.filter(f => f.impact === 'increases');
  const decreasingFactors = displayFactors.filter(f => f.impact === 'decreases');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI Interpretation
        </CardTitle>
        <CardDescription>
          Top factors influencing your risk profile, ranked by significance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Increasing Factors */}
        {increasingFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-danger-red" />
              Factors That May Increase Risk
            </h4>
            <ul className="space-y-2">
              {increasingFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-3 p-2 rounded-lg bg-danger-red/5 border border-danger-red/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-danger-red/20 text-danger-red flex items-center justify-center text-xs font-semibold">
                    ↑
                  </span>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{factor.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({factor.cancerType === 'general' ? 'all cancers' : `${factor.cancerType} cancer`})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Decreasing Factors */}
        {decreasingFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-success-green" />
              Protective Factors
            </h4>
            <ul className="space-y-2">
              {decreasingFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-3 p-2 rounded-lg bg-success-green/5 border border-success-green/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success-green/20 text-success-green flex items-center justify-center text-xs font-semibold">
                    ↓
                  </span>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{factor.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({factor.cancerType === 'general' ? 'all cancers' : `${factor.cancerType} cancer`})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {displayFactors.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No significant risk factors identified based on your profile.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
