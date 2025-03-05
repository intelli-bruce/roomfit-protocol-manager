'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Protocol, ProtocolAction } from '@/lib/types';
import { initialState } from '@/lib/initialState';
import { protocolReducer } from './reducer';

interface ProtocolContextType {
  state: Protocol;
  dispatch: React.Dispatch<ProtocolAction>;
  exportProtocol: () => void;
  importProtocol: (file: File) => Promise<void>;
}

const ProtocolContext = createContext<ProtocolContextType | undefined>(undefined);

export const ProtocolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 로컬 스토리지에서 상태 복원 (클라이언트 사이드에서만 실행)
  const [state, dispatch] = useReducer(protocolReducer, initialState);

  // 클라이언트 사이드에서만 로컬 스토리지 사용
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('protocolDesigner');
      if (savedState) {
        const parsedState = JSON.parse(savedState) as Protocol;
        dispatch({ type: 'IMPORT_PROTOCOL', payload: parsedState });
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
  }, []);

  // 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem('protocolDesigner', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
    }
  }, [state]);

  // 프로토콜 내보내기 - JSON 파일로 다운로드
  const exportProtocol = () => {
    try {
      const dataStr = JSON.stringify(state, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

      const exportFileName = `${state.name}_v${state.version}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();

      // 내보내기 기록 추가
      dispatch({
        type: 'ADD_HISTORY_ENTRY',
        payload: {
          description: `프로토콜 내보내기: ${state.name} v${state.version}`
        }
      });
    } catch (error) {
      console.error('Failed to export protocol:', error);
      alert('프로토콜 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 프로토콜 가져오기 - JSON 파일 읽기
  const importProtocol = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            if (e.target?.result) {
              const protocol = JSON.parse(e.target.result as string) as Protocol;
              dispatch({ type: 'IMPORT_PROTOCOL', payload: protocol });
              resolve();
            }
          } catch (error) {
            console.error('프로토콜 가져오기 오류:', error);
            alert('유효하지 않은 프로토콜 파일입니다.');
            reject(error);
          }
        };
        reader.onerror = (e) => {
          console.error('파일 읽기 오류:', e);
          alert('파일을 읽는 중 오류가 발생했습니다.');
          reject(e);
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('프로토콜 가져오기 오류:', error);
        alert('프로토콜 가져오기 중 오류가 발생했습니다.');
        reject(error);
      }
    });
  };

  return (
    <ProtocolContext.Provider value={{ state, dispatch, exportProtocol, importProtocol }}>
      {children}
    </ProtocolContext.Provider>
  );
};

// 커스텀 훅
export const useProtocol = () => {
  const context = useContext(ProtocolContext);
  if (context === undefined) {
    throw new Error('useProtocol must be used within a ProtocolProvider');
  }
  return context;
};