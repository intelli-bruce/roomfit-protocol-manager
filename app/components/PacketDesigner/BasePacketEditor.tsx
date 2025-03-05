'use client';

import React, {useState} from 'react';
import {useProtocol} from '@/context/ProtocolContext';
import {PacketField} from '@/lib/types';
import {generateId} from '@/lib/initialState';

const BasePacketEditor = () => {
  const {state, dispatch} = useProtocol();
  const [editingField, setEditingField] = useState<(PacketField & { index: number }) | null>(null);
  const [newField, setNewField] = useState<Omit<PacketField, 'id'>>({
    name: '',
    byteIndex: '',
    description: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // 필드 수정 모드 활성화
  const handleEditField = (field: PacketField, index: number) => {
    setEditingField({...field, index});
  };

  // 필드 삭제
  const handleDeleteField = (id: string) => {
    if (window.confirm('정말 이 필드를 삭제하시겠습니까?')) {
      dispatch({
        type: 'REMOVE_BASE_FIELD',
        payload: id
      });

      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: '기본 패킷 필드 삭제'
        }
      });
    }
  };

  // 필드 업데이트
  const handleUpdateField = () => {
    if (!editingField) return;

    dispatch({
      type: 'UPDATE_BASE_FIELD',
      payload: {
        id: editingField.id,
        field: {
          name: editingField.name,
          byteIndex: editingField.byteIndex,
          value: editingField.value,
          description: editingField.description
        }
      }
    });

    dispatch({
      type: 'ADD_HISTORY_ENTRY',
      payload: {
        description: `기본 패킷 필드 업데이트: ${editingField.name}`
      }
    });

    setEditingField(null);
  };

  // 새 필드 추가
  const handleAddField = () => {
    if (!newField.name || !newField.byteIndex) {
      alert('필드 이름과 바이트 인덱스는 필수입니다.');
      return;
    }

    dispatch({
      type: 'ADD_BASE_FIELD',
      payload: newField
    });

    dispatch({
      type: 'ADD_HISTORY_ENTRY',
      payload: {
        description: `기본 패킷에 새 필드 추가: ${newField.name}`
      }
    });

    setNewField({
      name: '',
      byteIndex: '',
      description: '',
    });
    setShowAddForm(false);
  };

  // 필드 값 변경
  const handleFieldChange = (field: string, value: string) => {
    if (editingField) {
      setEditingField({...editingField, [field]: value});
    } else {
      setNewField({...newField, [field]: value});
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">기본 패킷 구조</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-3 py-1 rounded-md"
        >
          + 필드 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">바이트 인덱스</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">필드</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">값</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설명</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {state.basePacket.fields.map((field, idx) => (
            <tr key={field.id}>
              {editingField && editingField.id === field.id ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={editingField.byteIndex}
                      onChange={(e) => handleFieldChange('byteIndex', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={editingField.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={editingField.value || ''}
                      onChange={(e) => handleFieldChange('value', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      value={editingField.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={handleUpdateField}
                      className="text-green-600 hover:text-green-900 mr-2"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      취소
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{field.byteIndex}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.value || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{field.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      onClick={() => handleEditField(field, idx)}
                    >
                      편집
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      삭제
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}

          {showAddForm && (
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  value={newField.byteIndex}
                  onChange={(e) => handleFieldChange('byteIndex', e.target.value)}
                  placeholder="예: 4 또는 4-5"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  value={newField.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="필드 이름"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  value={newField.value || ''}
                  onChange={(e) => handleFieldChange('value', e.target.value)}
                  placeholder="필드 값 (옵션)"
                />
              </td>
              <td className="px-6 py-4">
                <input
                  type="text"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                  value={newField.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="필드 설명"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={handleAddField}
                  className="text-green-600 hover:text-green-900 mr-2"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  취소
                </button>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-bold mb-2">패킷 체크섬 계산</h3>
        <p className="text-gray-700">
          패킷의 모든 바이트를 더한 값이 256으로 나눴을 때 나머지가 <code className="bg-gray-100 px-1 rounded">0</code>이어야 유효합니다.
        </p>
        <div className="mt-2 text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
          <p>체크섬 계산 공식:</p>
          <code className="block mt-1 font-mono">
            Checksum = (256 - (sum(모든 바이트) % 256)) % 256
          </code>
        </div>
      </div>
    </div>
  );
};

export default BasePacketEditor;