import {useState, useEffect} from 'react';
import {extractVariables} from '@/utils/packetUtils';

type Variable = {
  name: string;
  description: string;
  defaultValue: string;
  position: number;
};

export const useRequestPacket = (
  initialPacket: string = '',
  initialVariables: Variable[] = []
) => {
  const [requestPacket, setRequestPacket] = useState(initialPacket);
  const [isPacketValid, setIsPacketValid] = useState(true);
  const [packetError, setPacketError] = useState('');
  const [variables, setVariables] = useState<Variable[]>(initialVariables);

  // 패킷 문자열을 파싱하여 바이트 배열로 변환
  const parsePacket = (packetStr: string): number[] => {
    try {
      // "[0xFF, 0xFF, 0x02, 0x04, 0xFC]" 형태의 문자열 파싱
      return packetStr
        .replace(/[\[\]\s]/g, '')
        .split(',')
        .map(byte => {
          if (byte.startsWith('0x')) {
            return parseInt(byte, 16);
          } else if (byte.includes('${')) {
            // 변수 자리는 일단 0으로 처리
            return 0;
          } else if (!isNaN(Number(byte))) {
            return parseInt(byte, 10);
          } else {
            throw new Error(`Invalid byte format: ${byte}`);
          }
        });
    } catch (error) {
      return [];
    }
  };

  // 요청 패킷 검증
  const validateRequestPacket = (packet: string): boolean => {
    try {
      // 기본 패턴 검증
      if (!packet.startsWith('[') || !packet.endsWith(']')) {
        setIsPacketValid(false);
        setPacketError('패킷은 [로 시작하고 ]로 끝나야 합니다.');
        return false;
      }

      // 패킷에서 변수를 제외한 부분만 검증
      let tempPacket = packet;
      const extractedVars = extractVariables(packet);
      extractedVars.forEach(v => {
        tempPacket = tempPacket.replace(`\${${v.name}}`, '0x00');
      });

      // 패킷을 파싱하여 바이트 배열로 변환
      const bytes = parsePacket(tempPacket);

      // 기본 검증: 최소 길이
      if (bytes.length < 4) {
        setIsPacketValid(false);
        setPacketError('패킷이 너무 짧습니다. 최소 4바이트가 필요합니다.');
        return false;
      }

      // 헤더 검증
      if (bytes[0] !== 0xFF || bytes[1] !== 0xFF) {
        setIsPacketValid(false);
        setPacketError('유효하지 않은 헤더입니다. 0xFF 0xFF이어야 합니다.');
        return false;
      }

      setIsPacketValid(true);
      setPacketError('');
      return true;
    } catch (error) {
      setIsPacketValid(false);
      setPacketError('패킷 형식이 올바르지 않습니다.');
      return false;
    }
  };

  // 패킷 문자열 업데이트 및 변수 추출
  useEffect(() => {
    if (requestPacket) {
      // 패킷에서 변수 추출
      const extractedVars = extractVariables(requestPacket);
      setVariables(prev => {
        // 기존 변수의 설명 등 유지
        return extractedVars.map(v => {
          const existingVar = prev.find(existing => existing.name === v.name);
          return existingVar
            ? {...v, description: existingVar.description, defaultValue: existingVar.defaultValue}
            : v;
        });
      });

      validateRequestPacket(requestPacket);
    }
  }, [requestPacket]);

  return {
    requestPacket,
    isPacketValid,
    packetError,
    variables,
    setRequestPacket,
    setVariables,
    validateRequestPacket,
    parsePacket
  };
};