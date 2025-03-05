import React from 'react';

interface Variable {
  name: string;
  description: string;
  defaultValue: string;
  position: number;
}

interface RequestPacketSectionProps {
  requestPacket: string;
  variables: Variable[];
  isPacketValid: boolean;
  packetError: string;
  onPacketChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onVariableChange: (index: number, field: string, value: string) => void;
}

const RequestPacketSection: React.FC<RequestPacketSectionProps> = ({
                                                                     requestPacket,
                                                                     variables,
                                                                     isPacketValid,
                                                                     packetError,
                                                                     onPacketChange,
                                                                     onVariableChange
                                                                   }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">요청 패킷</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          패킷 형식 (변수는 ${'{변수명}'} 형식으로 지정)
        </label>
        <div className="relative">
          <textarea
            className={`w-full px-3 py-2 border rounded-md font-mono ${isPacketValid ? 'border-gray-300' : 'border-red-500'}`}
            value={requestPacket}
            onChange={onPacketChange}
            placeholder="[0xFF, 0xFF, 0x02, ${cmd}, ${checksum}]"
            rows={3}
          />
          {!isPacketValid && <p className="text-red-500 text-xs mt-1">{packetError}</p>}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          예시: [0xFF, 0xFF, 0x02, 0x04, 0xFC] 또는 [0xFF, 0xFF, ${'{size}'}, ${'{cmd}'}, ${'{checksum}'}]
        </p>
      </div>

      {/* 변수 설정 */}
      {variables.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">변수 정의</h4>
          <div className="bg-gray-50 p-3 rounded-md">
            {variables.map((variable, index) => (
              <div key={index}
                   className="grid grid-cols-3 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">변수명</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-gray-100"
                    value={variable.name}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">기본값</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={variable.defaultValue}
                    onChange={(e) => onVariableChange(index, 'defaultValue', e.target.value)}
                    placeholder="0x00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">설명</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={variable.description}
                    onChange={(e) => onVariableChange(index, 'description', e.target.value)}
                    placeholder="체크섬 값"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPacketSection;