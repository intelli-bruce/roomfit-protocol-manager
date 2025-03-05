'use client';

import React, {useState, useEffect} from 'react';
import {Command, PacketField} from '@/lib/types';
import {generateId} from '@/lib/initialState';
import {extractVariables} from '@/utils/packetUtils';

interface CommandEditorProps {
  categoryId: string;
  command?: Command;
  onSave: (categoryId: string, command: any) => void;
  onCancel: () => void;
}

// 명령어 편집 컴포넌트
const CommandEditor: React.FC<CommandEditorProps> = ({categoryId, command, onSave, onCancel}) => {
  const initialCommandState = command || {
    name: '',
    code: '',
    description: '',
    request: {
      packet: '',
      fields: [
        {name: 'Size', value: ''},
        {name: 'Data', value: ''}
      ],
      variables: []
    },
    response: {
      fields: [
        {id: generateId(), name: 'Header', byteIndex: '0-1', value: '0xFF, 0xFF'},
        {id: generateId(), name: 'Size', byteIndex: '2', value: ''},
        {id: generateId(), name: 'Command', byteIndex: '3', value: ''}
      ],
      conversion: []
    }
  };

  const [commandData, setCommandData] = useState<any>(initialCommandState);
  const [requestPacket, setRequestPacket] = useState(initialCommandState.request.packet);
  const [variables, setVariables] = useState<Array<{
    name: string;
    description: string;
    defaultValue: string;
    position: number
  }>>(
    initialCommandState.request.variables || []
  );
  const [responseFields, setResponseFields] = useState<PacketField[]>(initialCommandState.response.fields);
  const [conversions, setConversions] = useState<Array<{ field: string; formula: string; unit?: string }>>(
    initialCommandState.response.conversion || []
  );
  const [isPacketValid, setIsPacketValid] = useState(true);
  const [packetError, setPacketError] = useState('');

  // 패킷 문자열을 파싱하여 바이트 배열로 변환
  const parsePacket = (packetStr: string) => {
    try {
      // "[0xFF, 0xFF, 0x02, 0x04, 0xFC]" 형태의 문자열 파싱
      return packetStr
        .replace(/[\[\]\s]/g, '')
        .split(',')
        .map(byte => {
          if (byte.startsWith('0x')) {
            return parseInt(byte, 16);
          } else if (byte.includes('${')) {
            // 변수 자리는 일단 0으로 처리
            return 0;
          } else if (!isNaN(Number(byte))) {
            return parseInt(byte, 10);
          } else {
            throw new Error(`Invalid byte format: ${byte}`);
          }
        });
    } catch (error) {
      return [];
    }
  };

  // 요청 패킷 검증
  const validateRequestPacket = (packet: string) => {
    try {
      // 기본 패턴 검증
      if (!packet.startsWith('[') || !packet.endsWith(']')) {
        setIsPacketValid(false);
        setPacketError('패킷은 [로 시작하고 ]로 끝나야 합니다.');
        return false;
      }

      // 패킷에서 변수를 제외한 부분만 검증
      let tempPacket = packet;
      const variables = extractVariables(packet);
      variables.forEach(v => {
        tempPacket = tempPacket.replace(`\${${v.name}}`, '0x00');
      });

      // 패킷을 파싱하여 바이트 배열로 변환
      const bytes = parsePacket(tempPacket);

      // 기본 검증: 최소 길이
      if (bytes.length < 4) {
        setIsPacketValid(false);
        setPacketError('패킷이 너무 짧습니다. 최소 4바이트가 필요합니다.');
        return false;
      }

      // 헤더 검증
      if (bytes[0] !== 0xFF || bytes[1] !== 0xFF) {
        setIsPacketValid(false);
        setPacketError('유효하지 않은 헤더입니다. 0xFF 0xFF이어야 합니다.');
        return false;
      }

      setIsPacketValid(true);
      setPacketError('');
      return true;
    } catch (error) {
      setIsPacketValid(false);
      setPacketError('패킷 형식이 올바르지 않습니다.');
      return false;
    }
  };

  // 패킷 문자열 업데이트 및 변수 추출
  useEffect(() => {
    if (requestPacket) {
      // 패킷에서 변수 추출
      const extractedVars = extractVariables(requestPacket);
      setVariables(prev => {
        // 기존 변수의 설명 등 유지
        return extractedVars.map(v => {
          const existingVar = prev.find(existing => existing.name === v.name);
          return existingVar
            ? {...v, description: existingVar.description, defaultValue: existingVar.defaultValue}
            : v;
        });
      });

      validateRequestPacket(requestPacket);
    }
  }, [requestPacket]);

  // 요청 패킷 변경 처리
  const handlePacketChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRequestPacket(newValue);
    setCommandData(prev => ({
      ...prev,
      request: {
        ...prev.request,
        packet: newValue
      }
    }));
  };

  // 변수 정보 변경 처리
  const handleVariableChange = (index: number, field: string, value: string) => {
    setVariables(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  };

  // 응답 필드 변경 처리
  const handleResponseFieldChange = (index: number, field: string, value: string) => {
    setResponseFields(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: value};
      return updated;
    });
  };

  // 응답 필드 추가
  const addResponseField = () => {
    setResponseFields(prev => [
      ...prev,
      {id: generateId(), name: '', byteIndex: '', description: ''}
    ]);
  };

  // 응답 필드 삭제
  const removeResponseField = (index: number) => {
    setResponseFields(prev => prev.filter((_, i) => i !== index));
  };

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

  // 명령어 저장
  const handleSave = () => {
    // 필수 필드 검증
    if (!commandData.name.trim()) {
      alert('명령어 이름을 입력해주세요.');
      return;
    }

    if (!commandData.code.trim()) {
      alert('명령어 코드를 입력해주세요.');
      return;
    }

    if (!requestPacket.trim()) {
      alert('요청 패킷을 입력해주세요.');
      return;
    }

    // 패킷 검증
    if (!isPacketValid) {
      alert('유효하지 않은 패킷 형식입니다. 저장하기 전에 수정해주세요.');
      return;
    }

    // 모든 변수가 올바른 설명과 기본값을 가지고 있는지 확인
    const invalidVariables = variables.filter(v => !v.name || !v.defaultValue);
    if (invalidVariables.length > 0) {
      alert('모든 변수에 이름과 기본값을 입력해주세요.');
      return;
    }

    // 응답 필드 검증
    const invalidFields = responseFields.filter(f => !f.name || !f.byteIndex);
    if (invalidFields.length > 0) {
      alert('모든 응답 필드에 이름과 바이트 인덱스를 입력해주세요.');
      return;
    }

    const updatedCommand = {
      ...commandData,
      request: {
        ...commandData.request,
        packet: requestPacket,
        variables: variables
      },
      response: {
        fields: responseFields,
        conversion: conversions.length > 0 ? conversions : undefined
      }
    };

    onSave(categoryId, updatedCommand);
  };

  // 코드 값이 변경될 때 응답 명령어 필드도 업데이트
  useEffect(() => {
    if (commandData.code) {
      const cmdIndex = responseFields.findIndex(f => f.name === 'Command');
      if (cmdIndex !== -1) {
        handleResponseFieldChange(cmdIndex, 'value', commandData.code);
      }
    }
  }, [commandData.code]);

  return (
    <div className="bg-white rounded-lg">
      {/* 기본 정보 섹션 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">기본 정보</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">명령어 이름</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={commandData.name}
              onChange={(e) => setCommandData({...commandData, name: e.target.value})}
              placeholder="Get Position Data"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">명령어 코드 (16진수)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={commandData.code}
              onChange={(e) => setCommandData({...commandData, code: e.target.value})}
              placeholder="0x04"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={commandData.description}
            onChange={(e) => setCommandData({...commandData, description: e.target.value})}
            placeholder="위치 데이터를 반환합니다."
            rows={2}
          />
        </div>
      </div>

      {/* 요청 패킷 섹션 */}
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
              onChange={handlePacketChange}
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
                      onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                      placeholder="0x00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">설명</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      value={variable.description}
                      onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                      placeholder="체크섬 값"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 응답 패킷 섹션 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">응답 패킷</h3>
          <button
            type="button"
            onClick={addResponseField}
            className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
          >
            + 필드 추가
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">바이트</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">필드명</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">값</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {responseFields.map((field, index) => (
              <tr key={field.id}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={field.byteIndex}
                    onChange={(e) => handleResponseFieldChange(index, 'byteIndex', e.target.value)}
                    placeholder="0-1"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={field.name}
                    onChange={(e) => handleResponseFieldChange(index, 'name', e.target.value)}
                    placeholder="Header"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={field.value || ''}
                    onChange={(e) => handleResponseFieldChange(index, 'value', e.target.value)}
                    placeholder="0xFF, 0xFF"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={field.description || ''}
                    onChange={(e) => handleResponseFieldChange(index, 'description', e.target.value)}
                    placeholder="고정 헤더 값"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  {index > 2 && (
                    <button
                      type="button"
                      onClick={() => removeResponseField(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 변환 로직 섹션 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">변환 로직 (응답 데이터 처리)</h3>
          <button
            type="button"
            onClick={addConversion}
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
              <div key={index}
                   className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-md">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">필드</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={conversion.field}
                    onChange={(e) => handleConversionChange(index, 'field', e.target.value)}
                    placeholder="Position"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">공식</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={conversion.formula}
                    onChange={(e) => handleConversionChange(index, 'formula', e.target.value)}
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
                      onChange={(e) => handleConversionChange(index, 'unit', e.target.value)}
                      placeholder="미정"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeConversion(index)}
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

      {/* 버튼 그룹 */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default CommandEditor;