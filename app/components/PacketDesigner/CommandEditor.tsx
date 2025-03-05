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
  const {
    commandData,
    responseFields: initialResponseFields,
    calculatedSize: initialCalculatedSize,
    calculatedChecksum: initialCalculatedChecksum,
    isPacketValid,
    packetError,
    variables,
    conversions,
    requestPacket,
    handleCommandDataChange,
    handlePacketChange,
    handleVariableChange,
    handleResponseFieldChange: originalHandleResponseFieldChange,
    addResponseField: originalAddResponseField,
    removeResponseField: originalRemoveResponseField,
    handleConversionChange,
    addConversion,
    removeConversion,
    saveCommand
  } = useCommandForm(categoryId, command, onSave);

  // useResponseFields 훅 사용
  const {
    responseFields,
    orderedResponseFields,
    calculatedSize,
    calculatedChecksum,
    setResponseFields,
    addResponseField,
    removeResponseField,
    reorderFields,
  } = useResponseFields(initialResponseFields, commandData.code);

  // useCommandForm의 응답 필드 상태와 동기화
  useEffect(() => {
    setResponseFields(initialResponseFields);
  }, [initialResponseFields, setResponseFields]);

  // 필드 값 변경 핸들러 - 두 훅 모두 호출
  const handleResponseFieldChange = (id: string, field: string, value: string) => {
    // 원래 훅의 핸들러 호출
    originalHandleResponseFieldChange(id, field, value);

    // 새 필드 값으로 로컬 상태도 업데이트
    const updatedFields = responseFields.map(f =>
      f.id === id ? {...f, [field]: value} : f
    );
    setResponseFields(updatedFields);
  };

  // 필드 추가 핸들러
  const handleAddField = () => {
    addResponseField();
    originalAddResponseField();
  };

  // 필드 삭제 핸들러
  const handleRemoveField = (id: string) => {
    removeResponseField(id);
    originalRemoveResponseField(id);
  };

  // 순서 변경 핸들러
  const handleReorderFields = (activeId: string, overId: string) => {
    reorderFields(activeId, overId);

    // 원래 훅에도 재정렬된 필드 반영 (필요시)
    // 이 부분은 useCommandForm 훅이 어떻게 구현되어 있는지에 따라
    // 추가 작업이 필요할 수 있습니다.
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
        responseFields={orderedResponseFields}
        calculatedSize={calculatedSize}
        calculatedChecksum={calculatedChecksum}
        onFieldChange={handleResponseFieldChange}
        onAddField={handleAddField}
        onRemoveField={handleRemoveField}
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