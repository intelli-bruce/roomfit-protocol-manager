'use client';

import React, {useState} from 'react';
import {useProtocol} from '@/context/ProtocolContext';

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({selectedCategory, setSelectedCategory}) => {
  const {state, dispatch} = useProtocol();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  // 카테고리 추가 처리
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      dispatch({
        type: 'ADD_CATEGORY',
        payload: {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || '카테고리 설명 없음'
        }
      });

      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: `새 카테고리 추가: ${newCategoryName.trim()}`
        }
      });

      setNewCategoryName('');
      setNewCategoryDescription('');
      setIsAddingCategory(false);
    }
  };

  // 버전 복원 처리
  const handleRestoreVersion = () => {
    if (selectedHistoryId !== null) {
      dispatch({
        type: 'RESTORE_VERSION',
        payload: selectedHistoryId
      });

      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: `버전 복원: ID ${selectedHistoryId}`
        }
      });

      setShowRestoreModal(false);
      setSelectedHistoryId(null);
    }
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (_) {
      return dateString;
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">프로토콜 정보</h2>
        <div className="text-sm">
          <p><span className="font-medium">이름:</span> {state.name}</p>
          <p><span className="font-medium">버전:</span> {state.version}</p>
          <p><span className="font-medium">최종 수정:</span> {formatDate(state.lastModified)}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">카테고리</h2>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            추가
          </button>
        </div>
        <ul className="text-sm">
          <li
            className={`mb-1 p-1 cursor-pointer rounded ${selectedCategory === 'all' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedCategory('all')}
          >
            모든 카테고리
          </li>
          {state.categories.map((category) => (
            <li
              key={category.id}
              className={`mb-1 p-1 cursor-pointer rounded ${selectedCategory === category.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name} ({category.commands.length})
            </li>
          ))}
        </ul>

        {isAddingCategory && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <input
              type="text"
              className="w-full p-1 mb-1 border border-gray-300 rounded text-sm"
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-1 mb-2 border border-gray-300 rounded text-sm"
              placeholder="카테고리 설명 (옵션)"
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="text-xs px-2 py-1 bg-gray-200 rounded"
                onClick={() => setIsAddingCategory(false)}
              >
                취소
              </button>
              <button
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                onClick={handleAddCategory}
              >
                추가
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">히스토리</h2>
          {state.history.length > 1 && (
            <button
              onClick={() => setShowRestoreModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              복원
            </button>
          )}
        </div>
        <ul className="text-sm overflow-y-auto max-h-40">
          {state.history.map((entry) => (
            <li key={entry.id}
                className="mb-1 hover:bg-gray-100 p-1 rounded">
              <div className="font-medium text-xs">{formatDate(entry.timestamp)}</div>
              <div className="text-gray-600">{entry.description}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* 버전 복원 모달 */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">버전 복원</h3>
            <p className="text-sm mb-3">복원할 버전을 선택하세요. 현재 작업중인 내용은 히스토리에 저장됩니다.</p>

            <div className="max-h-60 overflow-y-auto mb-3">
              {state.history.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-2 my-1 rounded cursor-pointer ${selectedHistoryId === entry.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedHistoryId(entry.id)}
                >
                  <div className="font-medium">{formatDate(entry.timestamp)}</div>
                  <div className="text-sm">{entry.description}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded"
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedHistoryId(null);
                }}
              >
                취소
              </button>
              <button
                className={`px-3 py-1 bg-blue-600 text-white rounded ${!selectedHistoryId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                onClick={handleRestoreVersion}
                disabled={!selectedHistoryId}
              >
                복원
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;