'use client';

import React from 'react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({activeTab, setActiveTab}) => {
  const tabs = [
    {id: 'commands', label: '명령어'},
    {id: 'editor', label: '기본 패킷'},
    {id: 'documentation', label: '문서'},
    {id: 'preview', label: '테스트'}
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;