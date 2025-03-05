'use client';

import React, {useEffect} from 'react';
import {Command} from '@/lib/types';
import {useCommandForm} from "@/components/PacketDesigner/CommandEditor/hooks/useCommandForm";
import BasicInfoSection from "@/components/PacketDesigner/CommandEditor/BasicInfoSection";
import RequestPacketSection from "@/components/PacketDesigner/CommandEditor/RequestPacketSection";
import ResponsePacketSection from "@/components/PacketDesigner/CommandEditor/ResponsePacketSection";
import ConversionSection from "@/components/PacketDesigner/CommandEditor/ConversionSection";
import ButtonGroup from "@/components/PacketDesigner/CommandEditor/ButtonGroup";
import {useResponseFields} from "@/components/PacketDesigner/CommandEditor/hooks/useResponseField";

interface CommandEditorProps {
  categoryId: string;
  command?: Command;
  onSave: (categoryId: string, command: any) => void;
  onCancel: () => void;
}

const CommandEditor: React.FC<CommandEditorProps> = ({
                                                       categoryId,
                                                       command,
                                                       onSave,
                                                       onCancel
                                                     }) => {
  // 초기 command prop 로깅
  console.log('[CommandEditor] Initial command prop:', command);
  console.log('[CommandEditor] Command response fields:', command?.response?.fields);

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

  // useCommandForm에서 반환한 responseFields 로깅
  console.log('[CommandEditor] commandFormResponseFields:', commandFormResponseFields);

  // useResponseFields 훅을 직접 사용
  const {
    responseFields,
    orderedResponseFields,
    setResponseFields,
    reorderFields,
  } = useResponseFields(commandFormResponseFields, commandData.code);

  // responseFields와 orderedResponseFields 로깅
  console.log('[CommandEditor] responseFields:', responseFields);
  console.log('[CommandEditor] orderedResponseFields:', orderedResponseFields);

  // commandFormResponseFields가 변경될 때마다 responseFields 업데이트
  useEffect(() => {
    console.log('[CommandEditor] useEffect triggered, commandFormResponseFields:', commandFormResponseFields);
    if (commandFormResponseFields && commandFormResponseFields.length > 0) {
      console.log('[CommandEditor] Updating responseFields');
      setResponseFields(commandFormResponseFields);
    }
  }, [commandFormResponseFields, setResponseFields]);

  // 필드 순서 변경 핸들러
  const handleReorderFields = (activeId: string, overId: string) => {
    console.log('[CommandEditor] handleReorderFields called with activeId:', activeId, 'overId:', overId);
    reorderFields(activeId, overId);
  };

  const handleSave = () => {
    console.log('[CommandEditor] handleSave called, current responseFields:', responseFields);
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