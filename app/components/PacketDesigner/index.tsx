'use client';

import React, {useState} from 'react';
import Header from '../UI/Header';
import Sidebar from '../UI/Sidebar';
import TabNavigation from '../UI/TabNavigation';
import CommandList from './CommandList';
import BasePacketEditor from './BasePacketEditor';

const PacketDesigner = () => {
  const [activeTab, setActiveTab] = useState('commands');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 각 탭에 맞는 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'commands':
        return <CommandList selectedCategory={selectedCategory} />;
      case 'editor':
        return <BasePacketEditor />;
      case 'documentation':
        return (
          <div className="prose max-w-none">
            <h2>문서화 뷰</h2>
            <p>이 탭은 정의된 프로토콜의 문서화된 뷰를 제공합니다. (향후 구현)</p>
          </div>
        );
      case 'preview':
        return (
          <div className="prose max-w-none">
            <h2>패킷 테스트</h2>
            <p>이 탭은 정의된 패킷을 테스트하는 기능을 제공합니다. (향후 구현)</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="flex-grow flex overflow-hidden">
        {/* 좌측 사이드바 */}
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 탭 네비게이션 */}
          <TabNavigation activeTab={activeTab}
                         setActiveTab={setActiveTab} />

          {/* 탭 컨텐츠 */}
          <div className="flex-1 overflow-auto p-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PacketDesigner;