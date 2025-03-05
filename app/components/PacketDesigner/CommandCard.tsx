'use client';

import React, {useState} from 'react';
import {Command} from '@/lib/types';
import PacketVisualizer from "@/components/PacketDesigner/PacketDesginer";

interface CommandCardProps {
  command: Command & { categoryName: string; categoryId: string };
  onEdit: (command: Command & { categoryName: string; categoryId: string }) => void;
  onDelete: (command: Command & { categoryName: string; categoryId: string }) => void;
}

const CommandCard: React.FC<CommandCardProps> = ({command, onEdit, onDelete}) => {
  const [expanded, setExpanded] = useState(false);

  // 명령어 코드 16진수 표시 처리
  const formatCode = (code: string) => {
    if (!code) return '';
    return code.startsWith('0x') ? code : `0x${code}`;
  };

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
                <div className="text-sm font-medium text-gray-700 mb-2">요청 패킷:</div>
                <PacketVisualizer packetString={command.request.packet} />

                {command.request.variables && command.request.variables.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {command.request.variables.map((variable, idx) => (
                      <div key={idx}
                           className="text-xs bg-gray-100 p-1 rounded flex justify-between">
                        <span className="font-medium">${'{' + variable.name + '}'}</span>
                        <span className="text-gray-600">{variable.defaultValue}</span>
                      </div>
                    ))}
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
                      <th className="px-2 py-1 text-left font-medium text-gray-500">설명</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {command.response?.fields.map((field, fieldIdx) => (
                      <tr key={fieldIdx}
                          className="hover:bg-gray-50">
                        <td className="px-2 py-1 whitespace-nowrap">{field.byteIndex}</td>
                        <td className="px-2 py-1 whitespace-nowrap font-medium">{field.name}</td>
                        <td className="px-2 py-1">
                          {field.description || field.value || ''}
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {command.response?.conversion && command.response.conversion.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">변환 로직:</div>
                    <ul className="text-xs space-y-1">
                      {command.response.conversion.map((conv, convIdx) => (
                        <li key={convIdx}
                            className="bg-gray-50 p-1 rounded">
                          <span className="font-medium">{conv.field}:</span> {conv.formula}
                          {conv.unit && <span className="text-gray-500"> (단위: {conv.unit})</span>}
                        </li>
                      ))}
                    </ul>
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