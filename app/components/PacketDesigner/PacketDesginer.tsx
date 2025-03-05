'use client';

import React from 'react';

interface PacketVisualizerProps {
  packetString: string;
  className?: string;
}

// 패킷 시각화 컴포넌트 - 변수 부분 강조
const PacketVisualizer: React.FC<PacketVisualizerProps> = ({packetString, className = ''}) => {
  // 변수 부분 강조 처리
  const renderHighlightedPacket = () => {
    if (!packetString) return null;

    // ${변수명} 패턴을 찾아 강조
    const parts = [];
    const regex = /\$\{([^}]+)\}/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(packetString)) !== null) {
      // 변수 앞부분 추가
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}
                className="text-gray-800">
            {packetString.substring(lastIndex, match.index)}
          </span>
        );
      }

      // 변수 부분 강조
      parts.push(
        <span key={key++}
              className="bg-yellow-200 text-blue-800 px-1 rounded">
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // 남은 부분 추가
    if (lastIndex < packetString.length) {
      parts.push(
        <span key={key++}
              className="text-gray-800">
          {packetString.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className={`font-mono text-sm bg-gray-50 p-2 rounded-md ${className}`}>
      {renderHighlightedPacket()}
    </div>
  );
};

export default PacketVisualizer;