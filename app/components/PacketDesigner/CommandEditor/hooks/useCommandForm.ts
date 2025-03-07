import {useState, useEffect} from 'react';
import {Command, PacketField} from '@/lib/types';
import {generateId} from '@/lib/initialState';
import {useRequestFields, Variable as RequestVariable, RequestField} from './useRequestFields';
import {useConversions} from './useConversions';
import {useResponseFields} from "@/components/PacketDesigner/CommandEditor/hooks/useResponseField";

// 변수 타입 명시적 정의
export interface CommandVariable {
  name: string;
  description: string;
  defaultValue: string;
  position: number;
}

// 컨버전 타입 명시적 정의
export interface Conversion {
  field: string;
  formula: string;
  unit?: string;
}

// 명령어 데이터 타입
export interface CommandData {
  name: string;
  code: string;
  description: string;
  request: {
    packet: string;
    fields: {
      name: string;
      value: string;
    }[];
    variables: CommandVariable[];
  };
  response: {
    fields: PacketField[];
    conversion: Conversion[];
  };
}

export const useCommandForm = (
  categoryId: string,
  initialCommand?: Command,
  onSaveCallback?: (categoryId: string, command: Command) => void
) => {
  // 초기 명령어 로깅
  console.log('useCommandForm initialCommand:', initialCommand);

  // 초기 고정 필드 생성
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

  // 기존 명령어가 있는 경우 그 값을 사용, 없으면 초기값 생성
  const initialFields = initialCommand?.response?.fields || createInitialFields();

  // 초기 변수 타입 변환
  const initialVariables: CommandVariable[] = initialCommand?.request?.variables?.map(v => ({
    name: v.name,
    description: v.description || '',
    defaultValue: v.defaultValue,
    position: v.position || 0
  })) || [];

  // 기본 상태 설정
  const initialCommandState: CommandData = {
    name: initialCommand?.name || '',
    code: initialCommand?.code || '',
    description: initialCommand?.description || '',
    request: {
      packet: initialCommand?.request?.packet || '',
      fields: initialCommand?.request?.fields || [
        {name: 'Size', value: ''},
        {name: 'Data', value: ''}
      ],
      variables: initialVariables
    },
    response: {
      fields: initialFields,
      conversion: initialCommand?.response?.conversion || []
    }
  };

  const [commandData, setCommandData] = useState<CommandData>(initialCommandState);

  // 요청 필드 커스텀 훅 사용
  const {
    requestFields,
    requestPacket,
    isPacketValid,
    packetError,
    variables,
    calculatedSize: requestCalculatedSize,
    calculatedChecksum: requestCalculatedChecksum,
    setRequestFields,
    setRequestPacket,
    setVariables,
    handleFieldChange: handleRequestFieldChange,
    addField: addRequestField,
    removeField: removeRequestField,
    reorderFields: reorderRequestFields,
    isFixedField: isRequestFixedField,
    isAutoCalculatedField: isRequestAutoCalculatedField
  } = useRequestFields(initialCommandState.request.packet, initialCommandState.request.variables);

  // 응답 필드 커스텀 훅 사용
  const {
    responseFields,
    calculatedSize: responseCalculatedSize,
    calculatedChecksum: responseCalculatedChecksum,
    fixedFieldIds,
    setResponseFields,
    addResponseField,
    removeResponseField,
    isFixedField: isResponseFixedField,
    isAutoCalculatedField: isResponseAutoCalculatedField,
    reorderFields: reorderResponseFields
  } = useResponseFields(initialFields, commandData.code);

  // 변환 로직 커스텀 훅 사용
  const {
    conversions,
    addConversion,
    removeConversion,
    handleConversionChange
  } = useConversions(initialCommandState.response.conversion || []);

  // commandData 업데이트시 응답 필드의 Command 값 업데이트
  useEffect(() => {
    if (commandData.code && fixedFieldIds.commandId) {
      setResponseFields(prev =>
        prev.map(field =>
          field.id === fixedFieldIds.commandId
            ? {...field, value: commandData.code}
            : field
        )
      );
    }
  }, [commandData.code, fixedFieldIds.commandId, setResponseFields]);

  // 기본 정보 변경 핸들러
  const handleCommandDataChange = (field: string, value: string) => {
    setCommandData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 요청 패킷 변경 처리 (더 이상 직접 편집하지 않고 필드 기반으로만 수정)
  const handlePacketChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setRequestPacket(newValue);
    setCommandData(prev => ({
      ...prev,
      request: {
        ...prev.request,
        packet: newValue
      }
    }));
  };

  // 변수 정보 변경 처리
  const handleVariableChange = (index: number, field: string, value: string) => {
    setVariables(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {...updated[index], [field]: value};
      }
      return updated;
    });
  };

  // 응답 필드 변경 처리
  const handleResponseFieldChange = (id: string, field: string, value: string) => {
    // 고정 필드 식별
    const isHeader = id === fixedFieldIds.header1Id || id === fixedFieldIds.header2Id;
    const isSize = id === fixedFieldIds.sizeId;
    const isChecksum = id === fixedFieldIds.checksumId;

    // 헤더, 사이즈, 체크섬 필드의 값은 수정 불가
    if ((isHeader || isSize || isChecksum) && field === 'value') {
      return;
    }

    // 필드 업데이트
    setResponseFields(prev =>
      prev.map(f => f.id === id ? {...f, [field]: value} : f)
    );
  };

  // 명령어 저장
  const saveCommand = () => {
    // 필수 필드 검증
    if (!commandData.name.trim()) {
      alert('명령어 이름을 입력해주세요.');
      return;
    }

    if (!commandData.code.trim()) {
      alert('명령어 코드를 입력해주세요.');
      return;
    }

    if (!requestPacket.trim()) {
      alert('요청 패킷을 입력해주세요.');
      return;
    }

    // 패킷 검증
    if (!isPacketValid) {
      alert('유효하지 않은 패킷 형식입니다. 저장하기 전에 수정해주세요.');
      return;
    }

    // 모든 변수가 올바른 설명과 기본값을 가지고 있는지 확인
    const invalidVariables = variables.filter(v => !v.name || !v.defaultValue);
    if (invalidVariables.length > 0) {
      alert('모든 변수에 이름과 기본값을 입력해주세요.');
      return;
    }

    // 응답 필드 검증
    const dataFields = responseFields.filter(f =>
      f.id !== fixedFieldIds.header1Id &&
      f.id !== fixedFieldIds.header2Id &&
      f.id !== fixedFieldIds.sizeId &&
      f.id !== fixedFieldIds.commandId &&
      f.id !== fixedFieldIds.checksumId
    );

    const invalidFields = dataFields.filter(f => !f.name);
    if (invalidFields.length > 0) {
      alert('모든 응답 필드에 이름을 입력해주세요.');
      return;
    }

    // 명령어 코드를 Command 필드에 반영
    const updatedResponseFields = responseFields.map(field => {
      if (field.id === fixedFieldIds.commandId) {
        return {...field, value: commandData.code};
      }
      return field;
    });

    // 요청 필드 정보를 필드 기반으로 업데이트
    const requestFieldsInfo = requestFields.map(field => ({
      name: field.name,
      value: field.value || '',
      description: field.description || ''
    }));

    const updatedCommand: Command = {
      // 기존 명령어 ID 유지 또는 새 ID 생성
      id: initialCommand?.id || generateId(),
      ...commandData,
      request: {
        ...commandData.request,
        packet: requestPacket,
        fields: requestFieldsInfo,
        variables: variables
      },
      response: {
        fields: updatedResponseFields,
        conversion: conversions.length > 0 ? conversions : undefined
      }
    };

    if (onSaveCallback) {
      onSaveCallback(categoryId, updatedCommand);
    }
  };

  return {
    commandData,
    requestFields,
    responseFields,
    requestCalculatedSize,
    requestCalculatedChecksum,
    responseCalculatedSize: responseCalculatedSize,
    calculatedSize: responseCalculatedSize, // 호환성 유지
    responseCalculatedChecksum: responseCalculatedChecksum,
    calculatedChecksum: responseCalculatedChecksum, // 호환성 유지
    fixedFieldIds,
    isPacketValid,
    packetError,
    variables,
    conversions,
    requestPacket,
    handleCommandDataChange,
    handlePacketChange,
    handleVariableChange,
    handleRequestFieldChange,
    handleResponseFieldChange,
    addRequestField,
    removeRequestField,
    addResponseField,
    removeResponseField,
    handleConversionChange,
    addConversion,
    removeConversion,
    saveCommand,
    isRequestFixedField,
    isResponseFixedField,
    isFixedField: isResponseFixedField, // 호환성 유지
    isRequestAutoCalculatedField,
    isResponseAutoCalculatedField,
    isAutoCalculatedField: isResponseAutoCalculatedField, // 호환성 유지
    reorderRequestFields,
    reorderResponseFields
  };
};