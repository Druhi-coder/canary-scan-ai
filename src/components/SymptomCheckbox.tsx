import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SymptomCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showDuration?: boolean;
  duration?: string;
  onDurationChange?: (duration: string) => void;
}

export const SymptomCheckbox = ({
  id,
  label,
  checked,
  onCheckedChange,
  showDuration = false,
  duration,
  onDurationChange,
}: SymptomCheckboxProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(c) => onCheckedChange(c as boolean)}
        />
        <Label htmlFor={id} className="cursor-pointer">{label}</Label>
      </div>
      {showDuration && checked && onDurationChange && (
        <div className="ml-6">
          <Select value={duration || ''} onValueChange={onDurationChange}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<2weeks">&lt;2 weeks</SelectItem>
              <SelectItem value="2-6weeks">2–6 weeks</SelectItem>
              <SelectItem value=">6weeks">&gt;6 weeks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
