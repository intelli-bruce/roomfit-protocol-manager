import './globals.css';
import type {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {ProtocolProvider} from '@/context/ProtocolContext';

const inter = Inter({subsets: ['latin']});

export const metadata: Metadata = {
  title: '패킷 프로토콜 디자이너',
  description: '패킷 기반 통신 프로토콜 정의 및 문서화 도구',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
    <body className={inter.className}>
    <ProtocolProvider>
      {children}
    </ProtocolProvider>
    </body>
    </html>
  );
}