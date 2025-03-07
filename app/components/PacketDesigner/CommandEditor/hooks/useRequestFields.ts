import {useState, useEffect} from 'react';
import {generateId} from '@/lib/initialState';
import {calculateChecksum} from '@/utils/packetUtils';

export interface RequestField {
  id: string;
  name: string;
  byteIndex: string;
  value: string;
  description: string;
  isVariable?: boolean;
  variableName?: string;
}

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

export const useRequestFields = (
  initialPacket: string = '',
  initialVariables: any[] = []
) => {
  const [requestFields, setRequestFields] = useState<RequestField[]>([]);
  const [requestPacket, setRequestPacket] = useState(initialPacket);
  const [isPacketValid, setIsPacketValid] = useState(true);
  const [packetError, setPacketError] = useState('');
  const [variables, setVariables] = useState<any[]>(initialVariables);
  const [calculatedSize, setCalculatedSize] = useState('0x02');
  const [calculatedChecksum, setCalculatedChecksum] = useState('0x00');

  // 고정 필드 ID 추적
  const [fixedFieldIds, setFixedFieldIds] = useState({
    header1Id: '',
    header2Id: '',
    sizeId: '',
    commandId: '',
    checksumId: ''
  });

  // 초기 고정 필드 생성 함수
  const createInitialFields = (): RequestField[] => {
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

  // 초기화: 패킷 문자열에서 필드 생성
  useEffect(() => {
    if (initialPacket) {
      const fields = parsePacketToFields(initialPacket, initialVariables);
      setRequestFields(fields);

      // 고정 필드 ID 설정
      setFixedFieldIdsFromFields(fields);
    } else if (requestFields.length === 0) {
      // 초기 패킷이 없으면 기본 필드 생성
      const initialFields = createInitialFields();
      setRequestFields(initialFields);
      setFixedFieldIdsFromFields(initialFields);
    }
  }, [initialPacket, initialVariables]);

  // 고정 필드 ID 설정
  const setFixedFieldIdsFromFields = (fields: RequestField[]) => {
    const header1 = fields.find(f => f.name === 'Header' && getStartByteIndex(f.byteIndex) === 0);
    const header2 = fields.find(f => f.name === 'Header' && getStartByteIndex(f.byteIndex) === 1);
    const size = fields.find(f => f.name === 'Size' && getStartByteIndex(f.byteIndex) === 2);
    const command = fields.find(f => f.name === 'Command' && getStartByteIndex(f.byteIndex) === 3);
    const checksum = fields.find(f => f.name === 'Checksum');

    if (header1 && header2 && size && command && checksum) {
      setFixedFieldIds({
        header1Id: header1.id,
        header2Id: header2.id,
        sizeId: size.id,
        commandId: command.id,
        checksumId: checksum.id
      });
    }
  };

  // 패킷 문자열을 필드로 파싱
  const parsePacketToFields = (packetStr: string, vars: any[] = []): RequestField[] => {
    const fields: RequestField[] = [];

    // 기본 고정 필드 먼저 추가
    fields.push({id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '고정 헤더 (첫번째 바이트)'});
    fields.push({id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '고정 헤더 (두번째 바이트)'});
    fields.push({id: generateId(), name: 'Size', byteIndex: '2', value: '0x02', description: '이후 바이트 수'});
    fields.push({id: generateId(), name: 'Command', byteIndex: '3', value: '', description: '명령어 코드'});

    try {
      // "[0xFF, 0xFF, 0x02, 0x04, ${var}, 0xFC]" 형태의 문자열 파싱
      const content = packetStr.substring(1, packetStr.length - 1);
      const bytes = content.split(',').map(b => b.trim());

      // 명령어 코드 (3번 바이트) 값 설정
      if (bytes.length > 3) {
        const commandValue = bytes[3];
        fields[3].value = commandValue;
      }

      // 데이터 필드 (4번 바이트부터)
      let byteIndex = 4;
      for (let i = 4; i < bytes.length - 1; i++) { // 마지막은 체크섬으로 가정
        const byteValue = bytes[i];
        const isVariable = byteValue.includes('${');

        let fieldName = `Data ${i - 3}`;
        let fieldValue = byteValue;
        let variableName = '';

        if (isVariable) {
          // ${변수명} 형식에서 변수명 추출
          const matches = byteValue.match(/\${(.*?)}/);
          if (matches && matches[1]) {
            variableName = matches[1];
            fieldName = variableName;

            // 변수의 기본값 찾기
            const variable = vars.find(v => v.name === variableName);
            if (variable) {
              fieldValue = variable.defaultValue;
            } else {
              fieldValue = '0x00';
            }
          }
        }

        fields.push({
          id: generateId(),
          name: fieldName,
          byteIndex: byteIndex.toString(),
          value: fieldValue,
          description: isVariable ? `변수 ${variableName}` : '',
          isVariable,
          variableName: isVariable ? variableName : undefined
        });

        byteIndex++;
      }

      // 체크섬 추가
      fields.push({
        id: generateId(),
        name: 'Checksum',
        byteIndex: byteIndex.toString(),
        value: '0x00',
        description: '패킷 유효성 검증용 체크섬'
      });

      return fields;
    } catch (error) {
      console.error('패킷 파싱 오류:', error);
      return createInitialFields();
    }
  };

  // 필드에서 패킷 문자열 생성
  const generatePacketFromFields = (fields: RequestField[]): string => {
    const sortedFields = [...fields].sort((a, b) => {
      return getStartByteIndex(a.byteIndex) - getStartByteIndex(b.byteIndex);
    });

    const packetParts = sortedFields.map(field => {
      if (field.isVariable && field.variableName) {
        return `\${${field.variableName}}`;
      }
      return field.value || '0x00';
    });

    return `[${packetParts.join(', ')}]`;
  };

  // 필드 변경 처리
  const handleFieldChange = (id: string, field: string, value: string) => {
    // 고정 필드 식별
    const isHeader = id === fixedFieldIds.header1Id || id === fixedFieldIds.header2Id;
    const isSize = id === fixedFieldIds.sizeId;
    const isChecksum = id === fixedFieldIds.checksumId;

    // 헤더, 사이즈, 체크섬 필드의 값은 수정 불가
    if ((isHeader || isSize || isChecksum) && field === 'value') {
      return;
    }

    // 필드 업데이트
    setRequestFields(prev =>
      prev.map(f => f.id === id ? {...f, [field]: value} : f)
    );
  };

  // 필드 추가
  const addField = () => {
    const commandField = requestFields.find(f => f.id === fixedFieldIds.commandId);
    const checksumField = requestFields.find(f => f.id === fixedFieldIds.checksumId);

    if (!commandField || !checksumField) {
      console.error('Command or Checksum field missing');
      return;
    }

    // 데이터 필드 (Command와 Checksum 사이에 있는 필드들)
    const dataFields = requestFields.filter(f =>
      f.id !== fixedFieldIds.header1Id &&
      f.id !== fixedFieldIds.header2Id &&
      f.id !== fixedFieldIds.sizeId &&
      f.id !== fixedFieldIds.commandId &&
      f.id !== fixedFieldIds.checksumId
    );

    // byteIndex 기준으로 정렬
    const sortedDataFields = [...dataFields].sort((a, b) => {
      const aIndex = getStartByteIndex(a.byteIndex);
      const bIndex = getStartByteIndex(b.byteIndex);
      return aIndex - bIndex;
    });

    // 새 필드의 byteIndex 설정 (마지막 데이터 필드 다음)
    let lastDataByteIndex = 3; // Command 필드는 3번 인덱스
    let lastDataByteLength = 0;

    if (sortedDataFields.length > 0) {
      const lastField = sortedDataFields[sortedDataFields.length - 1];
      lastDataByteIndex = getStartByteIndex(lastField.byteIndex);
      lastDataByteLength = getByteLength(lastField.byteIndex);
    }

    const newByteIndex = (lastDataByteIndex + lastDataByteLength).toString();

    // 체크섬 필드 위치 업데이트
    const updatedFields = requestFields.map(field => {
      if (field.id === fixedFieldIds.checksumId) {
        return {
          ...field,
          byteIndex: (parseInt(newByteIndex) + 1).toString()
        };
      }
      return field;
    });

    // 새 필드 추가
    const newField: RequestField = {
      id: generateId(),
      name: '',
      byteIndex: newByteIndex,
      value: '0x00',
      description: ''
    };

    setRequestFields([...updatedFields, newField]);
  };

  // 필드 삭제
  const removeField = (id: string) => {
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

    setRequestFields(prev => prev.filter(f => f.id !== id));
  };

  // 필드 순서 변경
  const reorderFields = (activeId: string, overId: string) => {
    // 데이터 필드만 필터링
    const dataFields = requestFields.filter(field =>
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
    const fixedFields = requestFields.filter(field =>
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
    setRequestFields(newFields);
  };

  // 필드 상태 체크
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

  // 필드 변경시 패킷 문자열 업데이트 및 변수 추출
  useEffect(() => {
    if (requestFields.length > 0) {
      // 사이즈 계산
      const dataFields = requestFields.filter(f =>
        f.id !== fixedFieldIds.header1Id &&
        f.id !== fixedFieldIds.header2Id &&
        f.id !== fixedFieldIds.sizeId &&
        f.id !== fixedFieldIds.commandId &&
        f.id !== fixedFieldIds.checksumId
      );

      const size = 1 + dataFields.length + 1; // Command(1) + 데이터(n) + Checksum(1)
      const sizeHex = `0x${size.toString(16).padStart(2, '0').toUpperCase()}`;
      setCalculatedSize(sizeHex);

      // Size 필드 업데이트
      const updatedFields = requestFields.map(field => {
        if (field.id === fixedFieldIds.sizeId) {
          return {...field, value: sizeHex};
        }
        return field;
      });

      // 체크섬 계산
      try {
        const packetBytes: number[] = [];

        // 체크섬 제외한 모든 바이트 추가
        for (const field of [...updatedFields].sort((a, b) =>
          getStartByteIndex(a.byteIndex) - getStartByteIndex(b.byteIndex)
        )) {
          if (field.id !== fixedFieldIds.checksumId) {
            if (field.value && field.value.startsWith('0x')) {
              packetBytes.push(parseInt(field.value, 16));
            } else {
              packetBytes.push(0);
            }
          }
        }

        // 체크섬 자리 (0으로 계산)
        packetBytes.push(0);

        // 체크섬 계산
        const checksum = calculateChecksum(packetBytes);
        const checksumHex = `0x${checksum.toString(16).padStart(2, '0').toUpperCase()}`;
        setCalculatedChecksum(checksumHex);

        // 체크섬 필드 업데이트
        const finalFields = updatedFields.map(field => {
          if (field.id === fixedFieldIds.checksumId) {
            return {...field, value: checksumHex};
          }
          return field;
        });

        setRequestFields(finalFields);

        // 패킷 문자열 및 변수 업데이트
        const newPacket = generatePacketFromFields(finalFields);
        setRequestPacket(newPacket);

        // 변수 업데이트 (변수를 사용하는 필드에서 추출)
        const newVariables = finalFields
          .filter(f => f.isVariable && f.variableName)
          .map(f => {
            const existingVar = variables.find(v => v.name === f.variableName);
            return {
              name: f.variableName || '',
              description: existingVar?.description || '',
              defaultValue: f.value || '0x00',
              position: getStartByteIndex(f.byteIndex)
            };
          });

        setVariables(newVariables);
        setIsPacketValid(true);
        setPacketError('');
      } catch (error) {
        console.error('체크섬 계산 오류:', error);
        setIsPacketValid(false);
        setPacketError('패킷 형식이 올바르지 않습니다.');
      }
    }
  }, [requestFields, fixedFieldIds]);

  return {
    requestFields,
    requestPacket,
    isPacketValid,
    packetError,
    variables,
    calculatedSize,
    calculatedChecksum,
    fixedFieldIds,
    setRequestFields,
    setRequestPacket,
    setVariables,
    handleFieldChange,
    addField,
    removeField,
    reorderFields,
    isFixedField,
    isAutoCalculatedField
  };
};