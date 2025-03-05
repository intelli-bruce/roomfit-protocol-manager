import {useState, useEffect} from 'react';
import {PacketField} from '@/lib/types';
import {generateId} from '@/lib/initialState';
import {calculateChecksum} from '@/utils/packetUtils';

// byteIndex 문자열을 분석하여 시작 바이트 인덱스를 반환
const getStartByteIndex = (byteIndexStr: string): number => {
  // '4-5', '6-7'와 같은 형식 처리
  if (byteIndexStr.includes('-')) {
    return parseInt(byteIndexStr.split('-')[0]);
  }
  // 'x ~ y' 형식 처리
  if (byteIndexStr.includes('~')) {
    const parts = byteIndexStr.split('~').map(p => p.trim());
    return parseInt(parts[0]);
  }
  // 단일 숫자 처리
  return parseInt(byteIndexStr);
};

// byteIndex 문자열을 분석하여 바이트 길이 계산
const getByteLength = (byteIndexStr: string): number => {
  // '4-5', '6-7'와 같은 형식 처리
  if (byteIndexStr.includes('-')) {
    const [start, end] = byteIndexStr.split('-').map(n => parseInt(n));
    return end - start + 1;
  }
  // 'x ~ y' 형식 처리
  if (byteIndexStr.includes('~')) {
    const parts = byteIndexStr.split('~').map(p => p.trim());
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end)) {
        return end - start + 1;
      }
    }
  }
  // 단일 숫자는 1 바이트
  return 1;
};

// 새 byteIndex 형식 생성 (기존 형식 유지)
const createByteIndexFormat = (startByte: number, length: number, originalFormat: string): string => {
  // 기존 형식이 'x-y' 형태인 경우
  if (originalFormat.includes('-')) {
    return `${startByte}-${startByte + length - 1}`;
  }
  // 기존 형식이 'x ~ y' 형태인 경우
  if (originalFormat.includes('~')) {
    return `${startByte} ~ ${startByte + length - 1}`;
  }
  // 단일 바이트인 경우 그냥 숫자로 반환
  if (length === 1) {
    return startByte.toString();
  }
  // 기본적으로 'x-y' 형식 사용
  return `${startByte}-${startByte + length - 1}`;
};

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

  // 초기 고정 필드 생성 함수
  const createInitialFields = (): PacketField[] => {
    return [
      {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '고정 헤더 (첫번째 바이트)'},
      {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '고정 헤더 (두번째 바이트)'},
      {
        id: generateId(),
        name: 'Size',
        byteIndex: '2',
        value: '0x02',
        description: '이후 바이트 수 (Command + Data + Checksum)'
      },
      {id: generateId(), name: 'Command', byteIndex: '3', value: '', description: '명령어 코드'},
      {id: generateId(), name: 'Checksum', byteIndex: '4', value: '0x00', description: '패킷 유효성 검증용 체크섬'}
    ];
  };

  // 초기 고정 필드 ID 설정 - 강화된 로직
  useEffect(() => {
    if (responseFields.length > 0) {
      // 0번 byteIndex를 가진 Header 필드 찾기 (첫 번째 바이트)
      const header1 = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Header' && startByte === 0;
      });

      // 1번 byteIndex를 가진 Header 필드 찾기 (두 번째 바이트)
      const header2 = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Header' && startByte === 1;
      });

      // 2번 byteIndex를 가진 Size 필드 찾기
      const size = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Size' && startByte === 2;
      });

      // 3번 byteIndex를 가진 Command 필드 찾기
      const command = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Command' && startByte === 3;
      });

      // Checksum 필드 찾기 (마지막 바이트)
      const checksum = responseFields.find(f => f.name === 'Checksum');

      // 필수 필드가 누락된 경우 기본 필드로 초기화
      if (!header1 || !header2 || !size || !command || !checksum) {
        console.warn('Required fields missing, initializing default fields');
        const newFields = createInitialFields();
        setResponseFields(newFields);
        return;
      }

      setFixedFieldIds({
        header1Id: header1.id,
        header2Id: header2.id,
        sizeId: size.id,
        commandId: command.id,
        checksumId: checksum.id
      });
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
      const aIndex = getStartByteIndex(a.byteIndex);
      const bIndex = getStartByteIndex(b.byteIndex);
      if (isNaN(aIndex) || isNaN(bIndex)) return 0;
      return aIndex - bIndex;
    });

    // 바이트 인덱스 재할당
    const updatedFields = [...responseFields];
    let needsUpdate = false;
    let currentByteIndex = 4; // Command(3) 이후부터 시작

    sortedDataFields.forEach((field) => {
      const fieldIndex = updatedFields.findIndex(f => f.id === field.id);
      const currentStartByte = getStartByteIndex(field.byteIndex);
      const byteLength = getByteLength(field.byteIndex);

      if (fieldIndex !== -1 && currentStartByte !== currentByteIndex) {
        // 기존 형식을 유지하면서 새 바이트 인덱스 생성
        const newByteIndex = createByteIndexFormat(currentByteIndex, byteLength, field.byteIndex);

        updatedFields[fieldIndex] = {
          ...updatedFields[fieldIndex],
          byteIndex: newByteIndex
        };
        needsUpdate = true;
      }

      // 다음 필드의 시작 위치는 현재 필드 길이만큼 이동
      currentByteIndex += byteLength;
    });

    // 체크섬 위치 계산 및 업데이트
    const checksumByteIndex = currentByteIndex.toString();
    const checksumIndex = updatedFields.findIndex(f => f.id === fixedFieldIds.checksumId);
    if (checksumIndex !== -1 && getStartByteIndex(updatedFields[checksumIndex].byteIndex).toString() !== checksumByteIndex) {
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

    // 사이즈 계산 (Command + 데이터 필드 총 길이 + Checksum)
    // 각 필드의 바이트 길이를 계산하여 합산
    let totalDataByteLength = 0;
    sortedDataFields.forEach(field => {
      totalDataByteLength += getByteLength(field.byteIndex);
    });

    const sizeValue = 1 + totalDataByteLength + 1; // Command(1) + 데이터 필드(n) + Checksum(1)
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

      // 데이터 필드 - 각 필드의 바이트 길이에 맞게 추가
      sortedDataFields.forEach(field => {
        const byteLength = getByteLength(field.byteIndex);

        // 값이 있는 경우
        if (field.value && field.value.startsWith('0x')) {
          // 단일 바이트 값
          if (byteLength === 1) {
            packetBytes.push(parseInt(field.value, 16));
          }
          // 다중 바이트 값 (예: 0xABCD)는 분리해서 처리
          else if (field.value.length > 2) {
            const valueInt = parseInt(field.value, 16);
            // 상위 바이트부터 순서대로 추가
            for (let i = byteLength - 1; i >= 0; i--) {
              const byteMask = 0xFF << (i * 8);
              const byteValue = (valueInt & byteMask) >> (i * 8);
              packetBytes.push(byteValue);
            }
          }
          // 기본 처리 (각 바이트를 0으로 추가)
          else {
            for (let i = 0; i < byteLength; i++) {
              packetBytes.push(0);
            }
          }
        }
        // 값이 없는 경우 0으로 채움
        else {
          for (let i = 0; i < byteLength; i++) {
            packetBytes.push(0);
          }
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

  // 응답 필드 추가 - 최종 개선 버전
  const addResponseField = () => {
    console.log('Adding new field, current fields:', responseFields);
    console.log('Fixed field IDs:', fixedFieldIds);

    // 고정 필드 ID가 초기화되지 않았다면 초기화
    if (!fixedFieldIds.checksumId) {
      console.warn('Fixed field IDs not initialized');
      const header1 = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Header' && startByte === 0;
      });

      const header2 = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Header' && startByte === 1;
      });

      const size = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Size' && startByte === 2;
      });

      const command = responseFields.find(f => {
        const startByte = getStartByteIndex(f.byteIndex);
        return f.name === 'Command' && startByte === 3;
      });

      const checksum = responseFields.find(f => f.name === 'Checksum');

      if (header1 && header2 && size && command && checksum) {
        setFixedFieldIds({
          header1Id: header1.id,
          header2Id: header2.id,
          sizeId: size.id,
          commandId: command.id,
          checksumId: checksum.id
        });
        // 다음 렌더링에서 처리하도록 리턴
        return;
      }
    }

    // 1. 체크섬 필드 인덱스 및 바이트 인덱스 확인
    const commandField = responseFields.find(f => f.id === fixedFieldIds.commandId);
    const checksumField = responseFields.find(f => f.id === fixedFieldIds.checksumId);

    // 고정 필드가 없으면 함수 종료
    if (!commandField || !checksumField) {
      console.error('Command or Checksum field missing');
      return;
    }

    // 2. 데이터 필드 (Command와 Checksum 사이에 있는 필드들)
    const dataFields = responseFields.filter(f =>
      f.id !== fixedFieldIds.header1Id &&
      f.id !== fixedFieldIds.header2Id &&
      f.id !== fixedFieldIds.sizeId &&
      f.id !== fixedFieldIds.commandId &&
      f.id !== fixedFieldIds.checksumId
    );

    // 3. byteIndex 기준으로 정렬
    const sortedDataFields = [...dataFields].sort((a, b) => {
      const aIndex = getStartByteIndex(a.byteIndex);
      const bIndex = getStartByteIndex(b.byteIndex);
      if (isNaN(aIndex) || isNaN(bIndex)) return 0;
      return aIndex - bIndex;
    });

    // 4. 새 필드의 byteIndex 설정 (마지막 데이터 필드 다음)
    let lastDataByteIndex = 3; // Command 필드는 3번 인덱스
    let lastDataByteLength = 0;

    if (sortedDataFields.length > 0) {
      const lastField = sortedDataFields[sortedDataFields.length - 1];
      lastDataByteIndex = getStartByteIndex(lastField.byteIndex);
      lastDataByteLength = getByteLength(lastField.byteIndex);
    }

    const newByteIndex = (lastDataByteIndex + lastDataByteLength).toString();

    // 5. 체크섬 필드 위치 업데이트
    const updatedFields = responseFields.map(field => {
      if (field.id === fixedFieldIds.checksumId) {
        return {
          ...field,
          byteIndex: (parseInt(newByteIndex) + 1).toString()
        };
      }
      return field;
    });

    // 6. 새 필드 추가
    const newField: PacketField = {
      id: generateId(),
      name: '',
      byteIndex: newByteIndex,
      description: ''
    };

    const finalFields = [...updatedFields, newField];
    console.log('Updated fields after adding new field:', finalFields);
    setResponseFields(finalFields);

    // 7. 다음 렌더링 시 useEffect에서 모든 필드의 byteIndex가 올바르게 재정렬됨
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

  // 드래그 앤 드롭으로 필드 위치 변경
  const reorderFields = (activeId: string, overId: string) => {
    // 데이터 필드만 필터링
    const dataFields = responseFields.filter(field =>
      !isFixedField(field.id)
    ).sort((a, b) => {
      return getStartByteIndex(a.byteIndex) - getStartByteIndex(b.byteIndex);
    });

    // activeId와 overId에 해당하는 인덱스 찾기
    const activeIndex = dataFields.findIndex(field => field.id === activeId);
    const overIndex = dataFields.findIndex(field => field.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // 배열 순서 변경
    const newDataFields = [...dataFields];
    const [movedItem] = newDataFields.splice(activeIndex, 1);
    newDataFields.splice(overIndex, 0, movedItem);

    // 고정 필드 분리
    const fixedFields = responseFields.filter(field =>
      isFixedField(field.id)
    );

    // 데이터 필드 byteIndex 재할당
    const updatedDataFields = [];
    let currentByteIndex = 4; // Command(3) 이후부터 시작

    for (const field of newDataFields) {
      const byteLength = getByteLength(field.byteIndex);
      const newByteIndex = createByteIndexFormat(currentByteIndex, byteLength, field.byteIndex);

      updatedDataFields.push({
        ...field,
        byteIndex: newByteIndex
      });

      currentByteIndex += byteLength;
    }

    // 체크섬 위치 업데이트
    const checksumField = fixedFields.find(f => f.id === fixedFieldIds.checksumId);
    if (checksumField) {
      checksumField.byteIndex = currentByteIndex.toString();
    }

    // 업데이트된 필드 배열 생성
    const newFields = [
      ...fixedFields,
      ...updatedDataFields
    ];

    // 상태 업데이트
    setResponseFields(newFields);
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
    isAutoCalculatedField,
    reorderFields
  };
};