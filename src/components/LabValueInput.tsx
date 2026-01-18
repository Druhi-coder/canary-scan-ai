import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LAB_RANGES } from '@/lib/predictionEngine';

interface LabValueInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit: string;
  normalRange: string;
  min?: number;
  max?: number;
  step?: string;
}

export const LabValueInput = ({
  id,
  label,
  value,
  onChange,
  unit,
  normalRange,
  min = 0,
  max,
  step = '0.1',
}: LabValueInputProps) => {
  const numValue = parseFloat(value);
  const isAbnormal = value && !isNaN(numValue) && (
    (min !== undefined && numValue < min) || 
    (max !== undefined && numValue > max)
  );

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground font-normal">{unit}</span>
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={isAbnormal ? 'border-warning-yellow focus:ring-warning-yellow' : ''}
      />
      <p className="text-xs text-muted-foreground">{normalRange}</p>
      {isAbnormal && (
        <p className="text-xs text-warning-yellow">Value outside normal range</p>
      )}
    </div>
  );
};

// Pre-configured lab inputs
export const HemoglobinInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <LabValueInput
    id="hemoglobin"
    label="Hemoglobin"
    value={value}
    onChange={onChange}
    unit={LAB_RANGES.hemoglobin.unit}
    normalRange={LAB_RANGES.hemoglobin.label}
    min={LAB_RANGES.hemoglobin.min}
    max={LAB_RANGES.hemoglobin.max}
  />
);

export const WBCInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <LabValueInput
    id="wbcCount"
    label="White Blood Cell Count"
    value={value}
    onChange={onChange}
    unit={LAB_RANGES.wbc.unit}
    normalRange={LAB_RANGES.wbc.label}
    min={LAB_RANGES.wbc.min}
    max={LAB_RANGES.wbc.max}
    step="100"
  />
);

export const PlateletInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <LabValueInput
    id="plateletCount"
    label="Platelet Count"
    value={value}
    onChange={onChange}
    unit={LAB_RANGES.platelets.unit}
    normalRange={LAB_RANGES.platelets.label}
    min={LAB_RANGES.platelets.min}
    max={LAB_RANGES.platelets.max}
    step="1000"
  />
);

export const BilirubinInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <LabValueInput
    id="bilirubin"
    label="Bilirubin"
    value={value}
    onChange={onChange}
    unit={LAB_RANGES.bilirubin.unit}
    normalRange={LAB_RANGES.bilirubin.label}
    min={LAB_RANGES.bilirubin.min}
    max={LAB_RANGES.bilirubin.max}
  />
);

export const BloodSugarInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <LabValueInput
    id="bloodSugar"
    label="Fasting Blood Sugar"
    value={value}
    onChange={onChange}
    unit={LAB_RANGES.bloodSugar.unit}
    normalRange={LAB_RANGES.bloodSugar.label}
    min={LAB_RANGES.bloodSugar.min}
    max={LAB_RANGES.bloodSugar.max}
    step="1"
  />
);
