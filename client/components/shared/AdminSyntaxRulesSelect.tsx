'use client';

import {
  cloneSyntaxRules,
  getSyntaxRulePresetByRules,
  SYNTAX_RULE_PRESETS,
  SyntaxRulePresetValue,
} from '@/lib/constants/syntax-rules';

import { SyntaxRules } from '@/types';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  value: SyntaxRules;
  onChange: (value: SyntaxRules) => void;
};

export default function AdminSyntaxRulesSelect({ value, onChange }: Props) {
  const selectedPreset = getSyntaxRulePresetByRules(value);

  const activePreset = SYNTAX_RULE_PRESETS.find(
    (preset) => preset.value === selectedPreset,
  );

  const handleChange = (presetValue: SyntaxRulePresetValue) => {
    const preset = SYNTAX_RULE_PRESETS.find(
      (item) => item.value === presetValue,
    );

    if (!preset) {
      return;
    }

    onChange(cloneSyntaxRules(preset.rules));
  };

  return (
    <div className='flex flex-col gap-y-3'>
      <Select
        value={selectedPreset}
        onValueChange={(nextValue) =>
          handleChange(nextValue as SyntaxRulePresetValue)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder='Choose syntax rule preset' />
        </SelectTrigger>

        <SelectContent>
          {SYNTAX_RULE_PRESETS.map((preset) => (
            <SelectItem
              key={preset.value}
              value={preset.value}
            >
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='rounded-2xl border bg-muted/40 p-4'>
        <p className='text-sm font-medium'>
          {activePreset?.label ?? 'No syntax restriction'}
        </p>

        <p className='pt-1 text-xs leading-relaxed text-muted-foreground'>
          {activePreset?.description ??
            'Students can use any basic JavaScript syntax.'}
        </p>

        <pre className='overflow-x-auto pt-4 text-xs leading-relaxed'>
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
}
