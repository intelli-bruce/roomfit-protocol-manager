'use client';

import React from 'react';
import {Command} from '@/lib/types';
import {useCommandForm} from "@/components/PacketDesigner/CommandEditor/hooks/useCommandForm";
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
  // 초기 command prop 로깅
  console.log('[CommandEditor] Initial command prop:', command);
  console.log('[CommandEditor] Command response fields:', command?.response?.fields);

  const {
    commandData,
    requestFields,
    responseFields,
    requestPacket,
    requestCalculatedSize,
    requestCalculatedChecksum,
    responseCalculatedSize,
    responseCalculatedChecksum,
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
    reorderResponseFields
  } = useCommandForm(categoryId, command, onSave);

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
        responseFields={responseFields}
        calculatedSize={responseCalculatedSize}
        calculatedChecksum={responseCalculatedChecksum}
        onFieldChange={handleResponseFieldChange}
        onAddField={addResponseField}
        onRemoveField={removeResponseField}
        onReorderFields={reorderResponseFields}
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