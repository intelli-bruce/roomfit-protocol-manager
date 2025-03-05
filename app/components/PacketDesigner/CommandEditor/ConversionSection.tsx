import React from 'react';

type Conversion = {
  field: string;
  formula: string;
  unit?: string;
};

interface ConversionSectionProps {
  conversions: Conversion[];
  onChange: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ConversionSection: React.FC<ConversionSectionProps> = ({
                                                               conversions,
                                                               onChange,
                                                               onAdd,
                                                               onRemove
                                                             }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">변환 로직 (응답 데이터 처리)</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
        >
          + 변환 추가
        </button>
      </div>

      {conversions.length === 0 ? (
        <p className="text-sm text-gray-500 italic">변환 로직이 정의되지 않았습니다.</p>
      ) : (
        <div className="space-y-3">
          {conversions.map((conversion, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-md"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">필드</label>
                <input
                  type="text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  value={conversion.field}
                  onChange={(e) => onChange(index, 'field', e.target.value)}
                  placeholder="Position"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">공식</label>
                <input
                  type="text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  value={conversion.formula}
                  onChange={(e) => onChange(index, 'formula', e.target.value)}
                  placeholder="Raw Position * 0.05"
                />
              </div>
              <div className="flex items-end">
                <div className="flex-grow">
                  <label className="block text-xs font-medium text-gray-700 mb-1">단위 (옵션)</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={conversion.unit || ''}
                    onChange={(e) => onChange(index, 'unit', e.target.value)}
                    placeholder="미정"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="ml-2 text-red-600 hover:text-red-900 px-2 py-1"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversionSection;