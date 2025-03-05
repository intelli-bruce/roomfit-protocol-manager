import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {ProtocolProvider} from '@/context/ProtocolContext';
import React from "react";


export const metadata: Metadata = {
  title: '룸핏 프로토콜 매니저',
  description: '패킷 기반 통신 프로토콜 정의 및 문서화 도구',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
    <body className={'font-pretendard '}>
    <ProtocolProvider>
      {children}
    </ProtocolProvider>
    </body>
    </html>
  );
}