'use client';

import React, {useRef} from 'react';
import {useProtocol} from '@/context/ProtocolContext';

const Header: React.FC = () => {
  const {state, exportProtocol, importProtocol} = useProtocol();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importProtocol(file);
      } catch (error) {
        console.error('Import failed:', error);
      }

      // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className=" mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">룸핏 프로토콜 매니저</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm mr-4">
            <span className="opacity-75">현재 버전:</span> {state.name} v{state.version}
          </div>
          <button
            onClick={exportProtocol}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition"
          >
            내보내기
          </button>
          <button
            onClick={handleImportClick}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded transition"
          >
            가져오기
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;