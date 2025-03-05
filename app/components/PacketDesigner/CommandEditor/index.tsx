'use client';

import React, {useEffect} from 'react';
import {Command} from '@/lib/types';
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
  const {
    commandData,
    responseFields: commandFormResponseFields,
    calculatedSize,
    calculatedChecksum,
    isPacketValid,
    packetError,
    variables,
    conversions,
    requestPacket,
    handleCommandDataChange,
    handlePacketChange,
    handleVariableChange,
    handleResponseFieldChange,
    addResponseField,
    removeResponseField,
    handleConversionChange,
    addConversion,
    removeConversion,
    saveCommand
  } = useCommandForm(categoryId, command, onSave);

  // useResponseFields 훅을 직접 사용
  const {
    orderedResponseFields,
    setResponseFields,
    reorderFields,
  } = useResponseFields(commandFormResponseFields, commandData.code);

  // commandFormResponseFields가 변경될 때마다 responseFields 업데이트
  useEffect(() => {
    if (commandFormResponseFields && commandFormResponseFields.length > 0) {
      setResponseFields(commandFormResponseFields);
    }
  }, [commandFormResponseFields, setResponseFields]);

  // 필드 순서 변경 핸들러
  const handleReorderFields = (activeId: string, overId: string) => {
    reorderFields(activeId, overId);

    // 필요하다면 여기에 추가 동기화 로직을 구현할 수 있습니다.
    // 현재는 useResponseFields 내의 reorderFields가 내부적으로
    // byteIndex를 올바르게 업데이트하므로 추가 조치 필요 없음
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

      {/* 요청 패킷 섹션 */}
      <RequestPacketSection
        requestPacket={requestPacket}
        variables={variables}
        isPacketValid={isPacketValid}
        packetError={packetError}
        onPacketChange={handlePacketChange}
        onVariableChange={handleVariableChange}
      />

      {/* 응답 패킷 섹션 */}
      <ResponsePacketSection
        responseFields={orderedResponseFields.length > 0 ? orderedResponseFields : commandFormResponseFields}
        calculatedSize={calculatedSize}
        calculatedChecksum={calculatedChecksum}
        onFieldChange={handleResponseFieldChange}
        onAddField={addResponseField}
        onRemoveField={removeResponseField}
        onReorderFields={handleReorderFields}
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