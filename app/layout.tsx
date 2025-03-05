import './globals.css';
import {ProtocolProvider} from "@/context/ProtocolContext";

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
    <body>
    <ProtocolProvider>
      {children}
    </ProtocolProvider>
    </body>
    </html>
  );
}