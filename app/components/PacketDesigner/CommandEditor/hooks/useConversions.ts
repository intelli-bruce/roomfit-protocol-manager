import {useState} from 'react';

type Conversion = {
  field: string;
  formula: string;
  unit?: string;
};

export const useConversions = (initialConversions: Conversion[] = []) => {
  const [conversions, setConversions] = useState<Conversion[]>(initialConversions);

  // 변환 로직 추가
  const addConversion = () => {
    setConversions(prev => [...prev, {field: '', formula: '', unit: ''}]);
  };

  // 변환 로직 변경
  const handleConversionChange = (index: number, field: string, value: string) => {
    setConversions(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  };

  // 변환 로직 삭제
  const removeConversion = (index: number) => {
    setConversions(prev => prev.filter((_, i) => i !== index));
  };

  return {
    conversions,
    addConversion,
    removeConversion,
    handleConversionChange,
    setConversions
  };
};