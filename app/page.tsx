'use client';

import {useState} from 'react';
import Link from 'next/link';
import {useProtocol} from '@/context/ProtocolContext';
import CommandList from "@/components/PacketDesigner/CommandList";

export default function Home() {
  const {state} = useProtocol();
  const [activeTab, setActiveTab] = useState('commands');

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">패킷 프로토콜 디자이너</h1>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded">
              내보내기
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded">
              가져오기
            </button>
          </div>
        </div>
      </header>

      {/* 메인 내용 */}
      <main className="flex-grow flex overflow-hidden">
        {/* 좌측 사이드바 */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
          {/* 사이드바 내용 */}
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 탭 네비게이션 */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'commands' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('commands')}
              >
                명령어
              </button>
              {/* 다른 탭 버튼들 */}
            </div>
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'commands' && <CommandList />}
            {/* 다른 탭 콘텐츠 */}
          </div>
        </div>
      </main>
    </div>
  );
}