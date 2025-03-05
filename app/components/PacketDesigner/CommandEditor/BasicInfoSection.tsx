import React from 'react';

interface BasicInfoSectionProps {
  name: string;
  code: string;
  description: string;
  onChange: (field: string, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
                                                             name,
                                                             code,
                                                             description,
                                                             onChange
                                                           }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">기본 정보</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">명령어 이름</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Get Position Data"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">명령어 코드 (16진수)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={code}
            onChange={(e) => onChange('code', e.target.value)}
            placeholder="0x04"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="위치 데이터를 반환합니다."
          rows={2}
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;