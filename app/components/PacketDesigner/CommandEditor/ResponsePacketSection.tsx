import React, {useMemo} from 'react';
import {PacketField} from '@/lib/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

interface ResponsePacketSectionProps {
  responseFields: PacketField[];
  calculatedSize: string;
  calculatedChecksum: string;
  onFieldChange: (id: string, field: string, value: string) => void;
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onReorderFields: (activeId: string, overId: string) => void; // 수정됨
}

// 드래그 가능한 행 컴포넌트
const SortableRow = ({
                       field,
                       onFieldChange,
                       onRemoveField
                     }: {
  field: PacketField;
  onFieldChange: (id: string, field: string, value: string) => void;
  onRemoveField: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id: field.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#e5f0ff' : undefined,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 ${isDragging ? 'opacity-70' : ''}`}
    >
      <td className="px-3 py-2 whitespace-nowrap">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-2 cursor-move text-gray-400 px-1"
            {...attributes}
            {...listeners}
          >
            ⋮⋮
          </button>
          <span className="font-mono text-gray-800">{field.byteIndex}</span>
        </div>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <input
          type="text"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
          value={field.name || ''}
          onChange={(e) => onFieldChange(field.id, 'name', e.target.value)}
          placeholder="필드명"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <input
          type="text"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
          value={field.value || ''}
          onChange={(e) => onFieldChange(field.id, 'value', e.target.value)}
          placeholder="0x00"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="text"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
          value={field.description || ''}
          onChange={(e) => onFieldChange(field.id, 'description', e.target.value)}
          placeholder="설명"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-center">
        <button
          type="button"
          onClick={() => onRemoveField(field.id)}
          className="text-red-600 hover:text-red-900"
        >
          삭제
        </button>
      </td>
    </tr>
  );
};

const ResponsePacketSection: React.FC<ResponsePacketSectionProps> = ({
                                                                       responseFields,
                                                                       calculatedSize,
                                                                       calculatedChecksum,
                                                                       onFieldChange,
                                                                       onAddField,
                                                                       onRemoveField,
                                                                       onReorderFields
                                                                     }) => {
  // 센서 설정 - 드래그 앤 드롭의 입력 방식 정의
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px 이상 움직여야 드래그 시작
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 고정 필드 식별
  const isFixedField = (field: PacketField): boolean => {
    return field.name === 'Header' || field.name === 'Size' ||
      field.name === 'Command' || field.name === 'Checksum';
  };

  const isAutoCalculatedField = (field: PacketField): boolean => {
    return field.name === 'Size' || field.name === 'Checksum';
  };

  const isCommandField = (field: PacketField): boolean => {
    return field.name === 'Command';
  };

  // 중요: byteIndex 기준으로 필드 정렬
  const sortedFields = [...responseFields].sort((a, b) => {
    const aIndex = parseInt(a.byteIndex);
    const bIndex = parseInt(b.byteIndex);

    if (isNaN(aIndex)) return 1;
    if (isNaN(bIndex)) return -1;

    return aIndex - bIndex;
  });

  // 일반 데이터 필드와 고정 필드 분리
  const fixedFields = sortedFields.filter(field => isFixedField(field));
  const dataFields = sortedFields.filter(field => !isFixedField(field));

  // 데이터 필드 ID 목록 (SortableContext 용)
  const dataFieldIds = useMemo(() => dataFields.map(field => field.id), [dataFields]);

  // 헤더 필드 (상단)
  const headerFields = fixedFields.filter(field =>
    parseInt(field.byteIndex) < 4 // Headers, Size, Command
  );

  // 체크섬 필드 (하단)
  const checksumField = fixedFields.find(field => field.name === 'Checksum');

  // 드래그 앤 드롭 완료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      onReorderFields(active.id.toString(), over.id.toString());
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">응답 패킷</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Size:</span>
            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              {calculatedSize}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-600 mr-2">Checksum:</span>
            <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              {calculatedChecksum}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              console.log('Add field button clicked');
              e.preventDefault(); // 이벤트 버블링 방지
              onAddField();
            }}
            className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
          >
            + 필드 추가
          </button>
        </div>
      </div>

      {/* 패킷 구조 설명 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
        <p className="text-xs text-blue-800">
          <strong>참고:</strong> Header(0-1 바이트), Size(2 바이트), Command(3 바이트), Checksum(마지막)은 고정 필드입니다.
                               Size와 Checksum은 자동으로 계산됩니다. 필드 순서는 드래그하여 변경할 수 있습니다.
        </p>
      </div>

      {/* 전체 테이블을 DndContext로 감싸기 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">바이트</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">필드명</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">값</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
              <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">작업</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {/* 고정 헤더 필드 (0, 1, 2, 3 바이트) */}
            {headerFields.map(field => (
              <tr key={field.id}
                  className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-mono text-gray-800">{field.byteIndex}</span>
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">고정</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-medium">{field.name}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {isAutoCalculatedField(field) ? (
                    <div className="flex items-center">
                      <span className="text-gray-500">{field.value}</span>
                      <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">자동</span>
                    </div>
                  ) : isCommandField(field) ? (
                    <input
                      type="text"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      value={field.value || ''}
                      onChange={(e) => onFieldChange(field.id, 'value', e.target.value)}
                      placeholder="명령어 코드와 동일"
                      readOnly={isCommandField(field)}
                    />
                  ) : (
                    <span className="text-gray-500">{field.value}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={field.description || ''}
                    onChange={(e) => onFieldChange(field.id, 'description', e.target.value)}
                    placeholder="설명"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  {/* 고정 필드는 삭제 버튼 없음 */}
                </td>
              </tr>
            ))}

            {/* 구분선 */}
            {dataFields.length > 0 && (
              <tr className="bg-gray-100"
                  style={{height: '2px'}}>
                <td colSpan={5}
                    className="p-0"></td>
              </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* 데이터 필드 (드래그 가능) - 별도 테이블로 분리 */}
        {dataFields.length > 0 && (
          <div className="border-l-2 border-r-2 border-blue-200">
            <table className="min-w-full">
              <tbody>
              <SortableContext
                items={dataFieldIds}
                strategy={verticalListSortingStrategy}
              >
                {dataFields.map((field) => (
                  <SortableRow
                    key={field.id}
                    field={field}
                    onFieldChange={onFieldChange}
                    onRemoveField={onRemoveField}
                  />
                ))}
              </SortableContext>
              </tbody>
            </table>
          </div>
        )}

        {/* 체크섬 필드 (마지막 바이트) */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* 구분선 */}
            {dataFields.length > 0 && (
              <thead>
              <tr className="bg-gray-100"
                  style={{height: '2px'}}>
                <th colSpan={5}
                    className="p-0"></th>
              </tr>
              </thead>
            )}

            <tbody>
            {checksumField && (
              <tr key={checksumField.id}
                  className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-mono text-gray-800">{checksumField.byteIndex}</span>
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">고정</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="font-medium">{checksumField.name}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-gray-500">{checksumField.value}</span>
                    <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">자동</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    value={checksumField.description || ''}
                    onChange={(e) => onFieldChange(checksumField.id, 'description', e.target.value)}
                    placeholder="설명"
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-center">
                  {/* 고정 필드는 삭제 버튼 없음 */}
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </DndContext>
    </div>
  );
};

export default ResponsePacketSection;