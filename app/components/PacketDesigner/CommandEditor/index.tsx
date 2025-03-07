'use client';

import React, {useEffect, useRef} from 'react';
import {Command, PacketField} from '@/lib/types';
import {useCommandForm} from "@/components/PacketDesigner/CommandEditor/hooks/useCommandForm";
import {useResponseFields} from "./hooks/useResponseField";
import BasicInfoSection from "@/components/PacketDesigner/CommandEditor/BasicInfoSection";
import RequestPacketSection from "@/components/PacketDesigner/CommandEditor/RequestPacketSection";
import ResponsePacketSection from "@/components/PacketDesigner/CommandEditor/ResponsePacketSection";
import ConversionSection from "@/components/PacketDesigner/CommandEditor/ConversionSection";
import ButtonGroup from "@/components/PacketDesigner/CommandEditor/ButtonGroup";

interface CommandEditorProps {
  categoryId: string;
  command?: Command;
  onSave: (categoryId: string, command: Command) => void;
  onCancel: () => void;
}

const CommandEditor: React.FC<CommandEditorProps> = ({
                                                       categoryId,
                                                       command,
                                                       onSave,
                                                       onCancel
                                                     }) => {
  // 이전 응답 필드 상태 참조 - 무한 루프 방지
  const prevResponseFieldsRef = useRef<PacketField[]>([]);

  const {
    commandData,
    requestFields,
    responseFields: commandFormResponseFields,
    requestPacket,
    requestCalculatedSize,
    requestCalculatedChecksum,
    calculatedSize,
    calculatedChecksum,
    isPacketValid,
    packetError,
    variables,
    conversions,
    handleCommandDataChange,
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
    isRequestAutoCalculatedField,
    reorderRequestFields,
  } = useCommandForm(categoryId, command, onSave);

  // useResponseFields 훅을 직접 사용
  const {
    orderedResponseFields,
    setResponseFields,
    reorderFields,
  } = useResponseFields(commandFormResponseFields, commandData.code);

  // commandFormResponseFields가 변경될 때마다 responseFields 업데이트 - 무한 루프 방지 로직 추가
  useEffect(() => {
    if (commandFormResponseFields && commandFormResponseFields.length > 0) {
      // 이전 상태와 현재 상태를 비교하여 실제로 변경된 경우에만 업데이트
      const prevFieldsJson = JSON.stringify(prevResponseFieldsRef.current);
      const currentFieldsJson = JSON.stringify(commandFormResponseFields);

      if (prevFieldsJson !== currentFieldsJson) {
        setResponseFields(commandFormResponseFields);
        prevResponseFieldsRef.current = commandFormResponseFields;
      }
    }
  }, [commandFormResponseFields, setResponseFields]);

  // 응답 필드 순서 변경 핸들러
  const handleReorderResponseFields = (activeId: string, overId: string) => {
    reorderFields(activeId, overId);
  };

  const handleSave = () => {
    saveCommand();
  };

  return (
    <div className="bg-white rounded-lg">
      {/* 기본 정보 섹션 */}
      <BasicInfoSection
        name={commandData.name}
        code={commandData.code}
        description={commandData.description}
        onChange={handleCommandDataChange}
      />

      {/* 요청 패킷 섹션 - 새로운 테이블 기반 인터페이스 */}
      <RequestPacketSection
        requestFields={requestFields}
        requestPacket={requestPacket}
        isPacketValid={isPacketValid}
        packetError={packetError}
        calculatedSize={requestCalculatedSize}
        calculatedChecksum={requestCalculatedChecksum}
        variables={variables}
        onFieldChange={handleRequestFieldChange}
        onVariableChange={handleVariableChange}
        onAddField={addRequestField}
        onRemoveField={removeRequestField}
        onReorderFields={reorderRequestFields}
        isFixedField={isRequestFixedField}
        isAutoCalculatedField={isRequestAutoCalculatedField}
      />

      {/* 응답 패킷 섹션 */}
      <ResponsePacketSection
        responseFields={orderedResponseFields.length > 0 ? orderedResponseFields : commandFormResponseFields}
        calculatedSize={calculatedSize}
        calculatedChecksum={calculatedChecksum}
        onFieldChange={handleResponseFieldChange}
        onAddField={addResponseField}
        onRemoveField={removeResponseField}
        onReorderFields={handleReorderResponseFields}
      />

      {/* 변환 로직 섹션 */}
      <ConversionSection
        conversions={conversions}
        onChange={handleConversionChange}
        onAdd={addConversion}
        onRemove={removeConversion}
      />

      {/* 버튼 그룹 */}
      <ButtonGroup
        onCancel={onCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default CommandEditor;