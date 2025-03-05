'use client';

import React, {useState, useMemo} from 'react';
import {useProtocol} from '@/context/ProtocolContext';
import CommandCard from './CommandCard';
import Modal from '../UI/Modal';
import CommandEditor from './CommandEditor';
import {Command} from '@/lib/types';

const CommandList: React.FC<{ selectedCategory: string }> = ({selectedCategory}) => {
  const {state, dispatch} = useProtocol();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCommandModal, setShowAddCommandModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [editingCommand, setEditingCommand] = useState<(Command & {
    categoryName: string;
    categoryId: string
  }) | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 드롭다운 상태 추가

  // 필터링된 명령어 목록
  const filteredCommands = useMemo(() => {
    let commands: Array<Command & { categoryName: string; categoryId: string }> = [];

    state.categories.forEach(category => {
      category.commands.forEach(command => {
        commands.push({
          ...command,
          categoryName: category.name,
          categoryId: category.id
        });
      });
    });

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      commands = commands.filter(cmd => cmd.categoryId === selectedCategory);
    }

    // 검색어 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      commands = commands.filter(
        cmd => cmd.name.toLowerCase().includes(term) ||
          cmd.code.toLowerCase().includes(term) ||
          cmd.description.toLowerCase().includes(term)
      );
    }

    return commands;
  }, [state.categories, selectedCategory, searchTerm]);

  // 명령어 편집 핸들러
  const handleEditCommand = (command: Command & { categoryName: string; categoryId: string }) => {
    setEditingCommand(command);
    setCurrentCategoryId(command.categoryId);
    setShowAddCommandModal(true);
  };

  // 명령어 삭제 핸들러
  const handleDeleteCommand = (command: Command & { categoryName: string; categoryId: string }) => {
    if (window.confirm(`정말 "${command.name}" 명령어를 삭제하시겠습니까?`)) {
      dispatch({
        type: 'REMOVE_COMMAND',
        payload: {
          categoryId: command.categoryId,
          commandId: command.id
        }
      });

      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: `명령어 삭제: ${command.name} (${command.code})`
        }
      });
    }
  };

  // 새 명령어 추가 핸들러
  const handleAddNewCommand = (categoryId: string) => {
    setEditingCommand(null);
    setCurrentCategoryId(categoryId);
    setShowAddCommandModal(true);
    setIsDropdownOpen(false); // 드롭다운 닫기
  };

  // 명령어 저장 핸들러
  const handleSaveCommand = (categoryId: string, commandData: Omit<Command, 'id'>) => {
    if (editingCommand) {
      dispatch({
        type: 'UPDATE_COMMAND',
        payload: {
          id: editingCommand.id,
          categoryId,
          command: commandData
        }
      });

      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: `명령어 업데이트: ${commandData.name} (${commandData.code})`
        }
      });
    } else {
      dispatch({
        type: 'ADD_COMMAND',
        payload: {
          categoryId,
          command: commandData
        }
      });

      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: `새 명령어 추가: ${commandData.name} (${commandData.code})`
        }
      });
    }

    setShowAddCommandModal(false);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">명령어 목록</h2>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
              placeholder="명령어 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="relative inline-block text-left">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // 클릭 시 드롭다운 토글
            >
              <span>명령어 추가</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {state.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleAddNewCommand(category.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {category.name}에 추가
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 명령어 카드 리스트 */}
      {filteredCommands.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">명령어가 없습니다</h3>
          <p className="mt-1 text-gray-500">검색 조건에 맞는 명령어가 없거나 아직 명령어가 추가되지 않았습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCommands.map((command) => (
            <CommandCard
              key={command.id}
              command={command}
              onEdit={() => handleEditCommand(command)}
              onDelete={() => handleDeleteCommand(command)}
            />
          ))}
        </div>
      )}

      {/* 명령어 추가/편집 모달 */}
      <Modal
        isOpen={showAddCommandModal}
        onClose={() => setShowAddCommandModal(false)}
        title={editingCommand ? "명령어 편집" : "새 명령어 추가"}
        maxWidth="max-w-4xl"
      >
        {currentCategoryId && (
          <CommandEditor
            categoryId={currentCategoryId}
            command={editingCommand || undefined}
            onSave={handleSaveCommand}
            onCancel={() => setShowAddCommandModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default CommandList;