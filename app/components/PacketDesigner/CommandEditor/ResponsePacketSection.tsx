import React from 'react';
import {PacketField} from '@/lib/types';

interface ResponsePacketSectionProps {
  responseFields: PacketField[];
  calculatedSize: string;
  calculatedChecksum: string;
  onFieldChange: (id: string, field: string, value: string) => void;
  onAddField: () => void;
  onRemoveField: (id: string) => void;
}

const ResponsePacketSection: React.FC<ResponsePacketSectionProps> = ({
                                                                       responseFields,
                                                                       calculatedSize,
                                                                       calculatedChecksum,
                                                                       onFieldChange,
                                                                       onAddField,
                                                                       onRemoveField
                                                                     }) => {
  // 고정 필드 식별
  const isFixedField = (field: PacketField): boolean => {
    return field.name === 'Header' || field.name === 'Size' ||
      field.name === 'Command' || field.name === 'Checksum';
  };

  const isAutoCalculatedField = (field: PacketField): boolean => {
    return field.name === 'Size' || field.name === 'Checksum';
  };

  const isCommandField = (field: PacketField): boolean => {
    return field.name === 'Command';
  };

  // 중요: byteIndex 기준으로 필드 정렬
  const sortedFields = [...responseFields].sort((a, b) => {
    const aIndex = parseInt(a.byteIndex);
    const bIndex = parseInt(b.byteIndex);

    if (isNaN(aIndex)) return 1;
    if (isNaN(bIndex)) return -1;

    return aIndex - bIndex;
  });

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">응답 패킷</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Size:</span>
            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              {calculatedSize}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Checksum:</span>
            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              {calculatedChecksum}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              console.log('Add field button clicked');
              e.preventDefault(); // 이벤트 버블링 방지
              onAddField();
            }}
            className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
          >
            + 필드 추가
          </button>
        </div>
      </div>

      {/* 패킷 구조 설명 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
        <p className="text-xs text-blue-800">
          <strong>참고:</strong> Header(0-1 바이트), Size(2 바이트), Command(3 바이트), Checksum(마지막)은 고정 필드입니다.
                               Size와 Checksum은 자동으로 계산됩니다. 새 필드는 Command와 Checksum 사이에 순서대로 추가됩니다.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">바이트</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">필드명</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">값</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">작업</th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {/* 중요: 정렬된 필드 사용 */}
          {sortedFields.map((field) => {
            const fixed = isFixedField(field);
            const autoCalculated = isAutoCalculatedField(field);
            const isCommand = isCommandField(field);

            return (
              <tr key={field.id}
                  className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-mono text-gray-800">{field.byteIndex}</span>
                    {fixed && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">고정</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fixed ? (
                    <span className="font-medium">{field.name}</span>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      value={field.name || ''}
                      onChange={(e) => onFieldChange(field.id, 'name', e.target.value)}
                      placeholder="필드명"
                    />
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {autoCalculated ? (
                    <div className="flex items-center">
                      <span className="text-gray-500">{field.value}</span>
                      <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">자동</span>
                    </div>
                  ) : fixed && !isCommand ? (
                    <span className="text-gray-500">{field.value}</span>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      value={field.value || ''}
                      onChange={(e) => onFieldChange(field.id, 'value', e.target.value)}
                      placeholder={isCommand ? '명령어 코드와 동일' : '0x00'}
                      readOnly={isCommand} // Command는 자동으로 명령어 코드 사용
                    />
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={field.description || ''}
                    onChange={(e) => onFieldChange(field.id, 'description', e.target.value)}
                    placeholder="설명"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  {!fixed && (
                    <button
                      type="button"
                      onClick={() => onRemoveField(field.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsePacketSection;