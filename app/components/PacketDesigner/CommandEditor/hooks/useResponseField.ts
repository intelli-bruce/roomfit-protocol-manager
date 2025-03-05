import {useState, useEffect} from 'react';
import {PacketField} from '@/lib/types';
import {generateId} from '@/lib/initialState';
import {calculateChecksum} from '@/utils/packetUtils';

export const useResponseFields = (
  initialFields: PacketField[],
  commandCode: string
) => {
  // 응답 패킷 필드 관리
  const [responseFields, setResponseFields] = useState<PacketField[]>(initialFields);

  // 고정 필드 ID 추적
  const [fixedFieldIds, setFixedFieldIds] = useState({
    header1Id: '',
    header2Id: '',
    sizeId: '',
    commandId: '',
    checksumId: ''
  });

  // 정렬된 응답 필드
  const [orderedResponseFields, setOrderedResponseFields] = useState<PacketField[]>([]);

  // 자동 계산 값
  const [calculatedSize, setCalculatedSize] = useState('0x02');
  const [calculatedChecksum, setCalculatedChecksum] = useState('0x00');

  // 초기 고정 필드 ID 설정
  useEffect(() => {
    if (responseFields.length > 0) {
      const header1 = responseFields.find(f => f.name === 'Header' && f.byteIndex === '0');
      const header2 = responseFields.find(f => f.name === 'Header' && f.byteIndex === '1');
      const size = responseFields.find(f => f.name === 'Size' && f.byteIndex === '2');
      const command = responseFields.find(f => f.name === 'Command' && f.byteIndex === '3');
      const checksum = responseFields.find(f => f.name === 'Checksum');

      if (header1 && header2 && size && command && checksum) {
        setFixedFieldIds({
          header1Id: header1.id,
          header2Id: header2.id,
          sizeId: size.id,
          commandId: command.id,
          checksumId: checksum.id
        });
      }
    }
  }, [responseFields]);

  // 응답 필드 정렬 및 관리
  useEffect(() => {
    if (!fixedFieldIds.header1Id || responseFields.length === 0) return;

    // 필수 고정 필드 확인
    const header1 = responseFields.find(f => f.id === fixedFieldIds.header1Id);
    const header2 = responseFields.find(f => f.id === fixedFieldIds.header2Id);
    const size = responseFields.find(f => f.id === fixedFieldIds.sizeId);
    const cmd = responseFields.find(f => f.id === fixedFieldIds.commandId);
    const checksum = responseFields.find(f => f.id === fixedFieldIds.checksumId);

    if (!header1 || !header2 || !size || !cmd || !checksum) return;

    // Command 값 업데이트
    if (commandCode && cmd.value !== commandCode) {
      const newFields = responseFields.map(f =>
        f.id === fixedFieldIds.commandId ? {...f, value: commandCode} : f
      );
      setResponseFields(newFields);
      return; // 다음 렌더링에서 나머지 처리
    }

    // 데이터 필드 (Command와 Checksum 사이에 있는 필드들)
    const dataFields = responseFields.filter(f =>
      f.id !== fixedFieldIds.header1Id &&
      f.id !== fixedFieldIds.header2Id &&
      f.id !== fixedFieldIds.sizeId &&
      f.id !== fixedFieldIds.commandId &&
      f.id !== fixedFieldIds.checksumId
    );

    // 데이터 필드 순서 정렬 (바이트 인덱스 기준)
    const sortedDataFields = [...dataFields].sort((a, b) => {
      const aIndex = parseInt(a.byteIndex);
      const bIndex = parseInt(b.byteIndex);
      if (isNaN(aIndex) || isNaN(bIndex)) return 0;
      return aIndex - bIndex;
    });

    // 바이트 인덱스 재할당
    const updatedFields = [...responseFields];
    let needsUpdate = false;

    sortedDataFields.forEach((field, index) => {
      const correctByteIndex = (4 + index).toString(); // Command(3) 이후
      const fieldIndex = updatedFields.findIndex(f => f.id === field.id);
      if (fieldIndex !== -1 && updatedFields[fieldIndex].byteIndex !== correctByteIndex) {
        updatedFields[fieldIndex] = {
          ...updatedFields[fieldIndex],
          byteIndex: correctByteIndex
        };
        needsUpdate = true;
      }
    });

    // 체크섬 위치 계산 및 업데이트
    const checksumByteIndex = (4 + sortedDataFields.length).toString();
    const checksumIndex = updatedFields.findIndex(f => f.id === fixedFieldIds.checksumId);
    if (checksumIndex !== -1 && updatedFields[checksumIndex].byteIndex !== checksumByteIndex) {
      updatedFields[checksumIndex] = {
        ...updatedFields[checksumIndex],
        byteIndex: checksumByteIndex
      };
      needsUpdate = true;
    }

    if (needsUpdate) {
      setResponseFields(updatedFields);
      return; // 다음 렌더링에서 나머지 처리
    }

    // 사이즈 계산 (Command + 데이터 필드 + Checksum)
    const sizeValue = sortedDataFields.length + 2; // Command(1) + 데이터 필드(n) + Checksum(1)
    const sizeHex = `0x${sizeValue.toString(16).padStart(2, '0').toUpperCase()}`;
    setCalculatedSize(sizeHex);

    // Size 필드 업데이트
    const sizeIndex = updatedFields.findIndex(f => f.id === fixedFieldIds.sizeId);
    if (sizeIndex !== -1 && updatedFields[sizeIndex].value !== sizeHex) {
      updatedFields[sizeIndex] = {
        ...updatedFields[sizeIndex],
        value: sizeHex
      };
      setResponseFields(updatedFields);
      return; // 다음 렌더링에서 나머지 처리
    }

    // 체크섬 계산
    try {
      // 패킷 구성
      const packetBytes: number[] = [];

      // 헤더1
      packetBytes.push(0xFF);

      // 헤더2
      packetBytes.push(0xFF);

      // 사이즈
      packetBytes.push(parseInt(sizeHex, 16));

      // 명령어
      if (cmd.value && cmd.value.startsWith('0x')) {
        packetBytes.push(parseInt(cmd.value, 16));
      } else {
        packetBytes.push(0);
      }

      // 데이터 필드
      sortedDataFields.forEach(field => {
        if (field.value && field.value.startsWith('0x')) {
          packetBytes.push(parseInt(field.value, 16));
        } else {
          packetBytes.push(0);
        }
      });

      // 체크섬 자리 (0으로 계산)
      packetBytes.push(0);

      // 체크섬 계산
      const checksum = calculateChecksum(packetBytes);
      const checksumHex = `0x${checksum.toString(16).padStart(2, '0').toUpperCase()}`;
      setCalculatedChecksum(checksumHex);

      // 체크섬 필드 업데이트
      if (checksum && checksumIndex !== -1 && updatedFields[checksumIndex].value !== checksumHex) {
        updatedFields[checksumIndex] = {
          ...updatedFields[checksumIndex],
          value: checksumHex
        };
        setResponseFields(updatedFields);
        return;
      }
    } catch (error) {
      console.error('체크섬 계산 오류:', error);
    }

    // 정렬된 필드 목록 생성
    const ordered = [
      // 고정 헤더 (0번 바이트)
      {
        ...header1,
        isFixed: true,
        canEditValue: false
      },
      // 고정 헤더 (1번 바이트)
      {
        ...header2,
        isFixed: true,
        canEditValue: false
      },
      // 사이즈 필드 (2번 바이트)
      {
        ...size,
        isFixed: true,
        canEditValue: false,
        calculatedValue: sizeHex
      },
      // 명령어 필드 (3번 바이트)
      {
        ...cmd,
        isFixed: true,
        canEditValue: true
      },
      // 데이터 필드들 (4~n 바이트)
      ...sortedDataFields.map(field => ({
        ...field,
        isFixed: false,
        canEditValue: true
      })),
      // 체크섬 필드 (마지막 바이트)
      {
        ...checksum,
        isFixed: true,
        canEditValue: false,
        calculatedValue: calculatedChecksum
      }
    ];

    setOrderedResponseFields(ordered);
  }, [responseFields, fixedFieldIds, commandCode]);

  // 응답 필드 추가
  const addResponseField = () => {
    // 데이터 필드 수 계산
    const dataFields = responseFields.filter(f =>
      f.id !== fixedFieldIds.header1Id &&
      f.id !== fixedFieldIds.header2Id &&
      f.id !== fixedFieldIds.sizeId &&
      f.id !== fixedFieldIds.commandId &&
      f.id !== fixedFieldIds.checksumId
    );

    // 새 필드 위치 (Command 다음, Checksum 이전)
    const newByteIndex = (4 + dataFields.length).toString();

    // 새 필드 추가
    const newField: PacketField = {
      id: generateId(),
      name: '',
      byteIndex: newByteIndex,
      description: ''
    };

    setResponseFields(prev => [...prev, newField]);
  };

  // 응답 필드 삭제
  const removeResponseField = (id: string) => {
    // 고정 필드는 삭제 불가
    if (
      id === fixedFieldIds.header1Id ||
      id === fixedFieldIds.header2Id ||
      id === fixedFieldIds.sizeId ||
      id === fixedFieldIds.commandId ||
      id === fixedFieldIds.checksumId
    ) {
      alert('고정 필드는 삭제할 수 없습니다.');
      return;
    }

    setResponseFields(prev => prev.filter(f => f.id !== id));
  };

  // 필드 상태 확인을 위한 함수
  const isFixedField = (id: string): boolean => {
    return id === fixedFieldIds.header1Id ||
      id === fixedFieldIds.header2Id ||
      id === fixedFieldIds.sizeId ||
      id === fixedFieldIds.commandId ||
      id === fixedFieldIds.checksumId;
  };

  const isAutoCalculatedField = (id: string): boolean => {
    return id === fixedFieldIds.sizeId || id === fixedFieldIds.checksumId;
  };

  return {
    responseFields,
    orderedResponseFields,
    calculatedSize,
    calculatedChecksum,
    fixedFieldIds,
    setResponseFields,
    addResponseField,
    removeResponseField,
    isFixedField,
    isAutoCalculatedField
  };
};