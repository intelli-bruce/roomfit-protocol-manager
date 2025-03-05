'use client';

import React from 'react';
import {Command} from '@/lib/types';
import BasicInfoSection from './BasicInfoSection';
import RequestPacketSection from './RequestPacketSection';
import ResponsePacketSection from './ResponsePacketSection';
import ConversionSection from './ConversionSection';
import ButtonGroup from './ButtonGroup';
import {useCommandForm} from './hooks/useCommandForm';

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
  const {
    commandData,
    responseFields,
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
        responseFields={responseFields}
        calculatedSize={calculatedSize}
        calculatedChecksum={calculatedChecksum}
        onFieldChange={handleResponseFieldChange}
        onAddField={addResponseField}
        onRemoveField={removeResponseField}
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