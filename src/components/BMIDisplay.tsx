import { useMemo } from 'react';
import { calculateBMI } from '@/lib/predictionEngine';

interface BMIDisplayProps {
  height: string;
  weight: string;
}

export const BMIDisplay = ({ height, weight }: BMIDisplayProps) => {
  const bmiData = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    return calculateBMI(h, w);
  }, [height, weight]);

  if (!bmiData.bmi || bmiData.bmi === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Underweight':
        return 'text-warning-yellow bg-warning-yellow-light';
      case 'Normal':
        return 'text-success-green bg-success-green/10';
      case 'Overweight':
        return 'text-warning-yellow bg-warning-yellow-light';
      case 'Obese':
        return 'text-danger-red bg-danger-red/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="md:col-span-2 p-4 rounded-lg bg-accent/50 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Calculated BMI</p>
          <p className="text-2xl font-bold">{bmiData.bmi}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(bmiData.category)}`}>
          {bmiData.category}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        BMI Categories: Underweight (&lt;18.5) | Normal (18.5-24.9) | Overweight (25-29.9) | Obese (≥30)
      </p>
    </div>
  );
};
