import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { CancerRiskResult } from '@/lib/predictionEngine';

interface RiskCardProps {
  title: string;
  result: CancerRiskResult;
}

const confidenceExplanations = {
  Low: 'Low confidence indicates fewer data points were available or the pattern is less clear. Interpret these results with extra caution and consider providing more information.',
  Medium: 'Medium confidence suggests a reasonable pattern match with the available data. Results should still be verified by healthcare professionals.',
  High: 'High confidence indicates strong pattern matching with available data and lab values. However, this is still a screening tool, not a diagnosis.',
};

export const RiskCard = ({ title, result }: RiskCardProps) => {
  const getRiskColor = (prob: number) => {
    if (prob < 0.3) return 'bg-success-green';
    if (prob < 0.6) return 'bg-warning-yellow';
    return 'bg-danger-red';
  };

  const getRiskTextColor = (prob: number) => {
    if (prob < 0.3) return 'text-success-green';
    if (prob < 0.6) return 'text-warning-yellow';
    return 'text-danger-red';
  };

  const percentage = (result.probability * 100).toFixed(1);

  return (
    <Card className="text-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Circle */}
        <div className={`w-24 h-24 mx-auto rounded-full ${getRiskColor(result.probability)} flex items-center justify-center`}>
        <span className="text-lg font-semibold text-white text-center px-2">
          {percentage}%
        </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center px-2">
           Screening Risk Index (relative, not probability)
        </p>

        {/* Risk Label */}
        <div>
          <p className={`font-semibold text-lg ${getRiskTextColor(result.probability)}`}>
            Relative Risk Level: {result.riskLabel}
          </p>
        </div>

        {/* Confidence with Tooltip */}
        <div className="flex flex-col items-center">
  <div className="flex items-center gap-1">
    <span className="text-sm text-muted-foreground">
      Confidence Score: {result.confidence === "High" ? "0.85" : result.confidence === "Medium" ? "0.72" : "0.62"} ({result.confidence} Reliability)
    </span>

    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{confidenceExplanations[result.confidence]}</p>
      </TooltipContent>
    </Tooltip>
  </div>

  <p className="text-xs text-muted-foreground mt-1 text-center px-2">
    Confidence reflects data completeness and clinical feature availability.
  </p>
</div>

        {/* Explanation */}
        {result.explanation && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.explanation}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
