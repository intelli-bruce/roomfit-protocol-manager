'use client';

import React, { useState, useMemo } from 'react';
import { Command } from '@/lib/types';

interface CommandCardProps {
  command: Command & { categoryName: string; categoryId: string };
  onEdit: (command: Command & { categoryName: string; categoryId: string }) => void;
  onDelete: (command: Command & { categoryName: string; categoryId: string }) => void;
}

const CommandCard: React.FC<CommandCardProps> = ({ command, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  // 명령어 코드 16진수 표시 처리
  const formatCode = (code: string) => {
    if (!code) return '';
    return code.startsWith('0x') ? code : `0x${code}`;
  };

  // 요청 패킷 문자열을 파싱하여 각 바이트의 의미를 정리
  const parsedRequestPacket = useMemo(() => {
    if (!command.request.packet) return [];

    // 패킷 문자열에서 바이트 배열 추출
    const bytesMatch = command.request.packet.match(/\[(.*)\]/);
    if (!bytesMatch) return [];

    const bytesStr = bytesMatch[1];
    const bytes = bytesStr.split(',').map(b => b.trim());

    // 각 바이트의 의미 결정
    const result = [];

    // Header (0xFF, 0xFF)
    if (bytes.length > 0) {
      result.push({
        byteIndex: '0',
        name: 'Header',
        value: bytes[0],
        description: '고정 헤더 (첫번째 바이트)'
      });
    }

    if (bytes.length > 1) {
      result.push({
        byteIndex: '1',
        name: 'Header',
        value: bytes[1],
        description: '고정 헤더 (두번째 바이트)'
      });
    }

    // Size
    if (bytes.length > 2) {
      result.push({
        byteIndex: '2',
        name: 'Size',
        value: bytes[2],
        description: '이후 바이트 수'
      });
    }

    // Command
    if (bytes.length > 3) {
      result.push({
        byteIndex: '3',
        name: 'Command',
        value: bytes[3],
        description: '명령어 코드'
      });
    }

    // Data bytes
    for (let i = 4; i < bytes.length - 1; i++) {
      const byteValue = bytes[i];
      let name = `Data ${i-3}`;
      let description = '';

      // 변수 확인
      if (byteValue.includes('${')) {
        const varMatch = byteValue.match(/\${(.*?)}/);
        if (varMatch && varMatch[1]) {
          const varName = varMatch[1];
          const variable = command.request.variables?.find(v => v.name === varName);

          if (variable) {
            name = variable.name;
            description = variable.description || '';
          }
        }
      }

      result.push({
        byteIndex: i.toString(),
        name,
        value: byteValue,
        description
      });
    }

    // Checksum (마지막 바이트) - 간소화된 표시
    if (bytes.length > 4) {
      const lastByteValue = bytes[bytes.length - 1];
      let checksumValue = lastByteValue;
      let checksumDescription = '자동 계산됨';

      // ${checksum} 또는 auto 같은 placeholder인 경우 값 숨기기
      if (lastByteValue.includes('${checksum}') || lastByteValue.toLowerCase() === 'auto') {
        checksumValue = '';
        checksumDescription = '패킷 유효성 검증용 체크섬 (자동 계산됨)';
      }

      result.push({
        byteIndex: (bytes.length - 1).toString(),
        name: 'Checksum',
        value: checksumValue,
        description: checksumDescription
      });
    }

    return result;
  }, [command.request.packet, command.request.variables]);

  // 변수가 어떤 바이트에 매핑되는지 확인
  const variableMappings = useMemo(() => {
    if (!command.request.variables || !command.request.packet) return [];

    const result = [];
    const packetStr = command.request.packet;

    for (const variable of command.request.variables) {
      // checksum 변수는 표시하지 않기
      if (variable.name === 'checksum') continue;

      // 변수 위치 찾기
      const varPattern = new RegExp(`\\$\\{${variable.name}\\}`);
      const match = packetStr.match(varPattern);

      if (match) {
        // 이 변수가 있는 위치(바이트 인덱스) 대략적으로 추정
        const parts = packetStr.substring(0, match.index).split(',');
        const byteIndex = parts.length - 1; // 0-based index

        // 기존 속성인 position을 그대로 사용하면서 추가 정보 저장
        result.push({
          ...variable,
          position: variable.position || byteIndex // 기존 position 값 유지하되 없으면 계산된 값 사용
        });
      } else {
        result.push(variable);
      }
    }

    return result;
  }, [command.request.variables, command.request.packet]);

  return (
    <div className="hover:bg-gray-50 transition-colors duration-100">
      <div className="p-4">
        <div className="flex justify-between">
          {/* 왼쪽: 기본 정보 */}
          <div className="flex-1 flex items-center">
            <div className="mr-4 text-lg font-semibold text-blue-800 w-20 text-center">
              {formatCode(command.code)}
            </div>
            <button className="flex-1 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
            >
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900">{command.name}</h3>
                <span className="ml-3 text-sm text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                  {command.categoryName}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 truncate text-start">{command.description}</p>
            </button>
          </div>

          {/* 오른쪽: 액션 버튼 */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit(command)}
              className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
              title="편집"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-5 w-5"
                   viewBox="0 0 20 20"
                   fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(command)}
              className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
              title="삭제"
            >
              <svg xmlns="http://www.w3.org/2000/svg"
                   className="h-5 w-5"
                   viewBox="0 0 20 20"
                   fill="currentColor">
                <path fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-transform duration-200 ${expanded ? 'transform rotate-180' : ''}`}
              title={expanded ? "접기" : "펼치기"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 요청 패킷 섹션 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">요청 패킷:</div>
                <div className="text-xs text-gray-500 mb-2 font-mono">{command.request.packet}</div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-gray-500 w-16">바이트</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500 w-24">필드</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">값</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">설명</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {parsedRequestPacket.map((field, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap">{field.byteIndex}</td>
                        <td className="px-2 py-1 whitespace-nowrap font-medium">{field.name}</td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {field.value}
                          {field.value && field.value.includes('${') && field.name !== 'Checksum' && (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">변수</span>
                          )}
                          {field.name === 'Checksum' && !field.value && (
                            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">자동</span>
                          )}
                        </td>
                        <td className="px-2 py-1">{field.description || ''}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {variableMappings.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">변수:</div>
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 w-24">변수명</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 w-16">위치</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 w-24">기본값</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500">설명</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                      {variableMappings.map((variable, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-2 py-1 whitespace-nowrap font-medium">${variable.name}</td>
                          <td className="px-2 py-1 whitespace-nowrap">
                            {variable.position !== undefined ? `바이트 ${variable.position}` : '-'}
                          </td>
                          <td className="px-2 py-1 whitespace-nowrap">{variable.defaultValue}</td>
                          <td className="px-2 py-1">{variable.description || ''}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 응답 패킷 섹션 */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">응답 패킷:</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-gray-500 w-16">바이트</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500 w-24">필드</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500 w-24">값</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-500">설명</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {command.response?.fields.map((field, fieldIdx) => (
                      <tr key={fieldIdx}
                          className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap">{field.byteIndex}</td>
                        <td className="px-2 py-1 whitespace-nowrap font-medium">{field.name}</td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          {field.value || ''}
                          {field.name === 'Checksum' && (
                            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">자동</span>
                          )}
                        </td>
                        <td className="px-2 py-1">{field.description || ''}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {command.response?.conversion && command.response.conversion.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">변환 로직:</div>
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 w-24">필드</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500">계산식</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 w-16">단위</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                      {command.response.conversion.map((conv, convIdx) => (
                        <tr key={convIdx} className="hover:bg-gray-50">
                          <td className="px-2 py-1 whitespace-nowrap font-medium">{conv.field}</td>
                          <td className="px-2 py-1">{conv.formula}</td>
                          <td className="px-2 py-1 text-gray-500">{conv.unit || ''}</td>
                        </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandCard;