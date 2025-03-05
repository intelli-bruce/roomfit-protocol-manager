// 프로토콜 데이터 모델 타입 정의
export interface Protocol {
  id: string;
  name: string;
  version: string;
  basePacket: {
    fields: PacketField[];
  };
  categories: CommandCategory[];
  history: HistoryEntry[];
  lastModified: string;
}

export interface PacketField {
  id: string;
  name: string;
  byteIndex: string;
  value?: string;
  description: string;
}

export interface CommandCategory {
  id: string;
  name: string;
  description: string;
  commands: Command[];
}

export interface Command {
  id: string;
  name: string;
  code: string; // 16진수 코드
  description: string;
  request: {
    packet: string; // 예: [0xFF, 0xFF, 0x02, 0x04, 0xFC]
    fields: {
      name: string;
      value: string;
    }[];
    variables?: {
      name: string;
      description: string;
      defaultValue: string;
      position?: number;
    }[];
  };
  response: {
    fields: PacketField[];
    conversion?: {
      field: string;
      formula: string;
      unit?: string;
    }[];
  };
}

export interface HistoryEntry {
  id: number;
  timestamp: string;
  description: string;
  snapshot?: Protocol; // 전체 프로토콜 스냅샷(옵션)
}

// 상태 관리 액션 타입
export type ProtocolAction =
  | { type: 'UPDATE_PROTOCOL_INFO'; payload: { name?: string; version?: string } }
  | { type: 'ADD_BASE_FIELD'; payload: Omit<PacketField, 'id'> }
  | { type: 'UPDATE_BASE_FIELD'; payload: { id: string; field: Partial<PacketField> } }
  | { type: 'REMOVE_BASE_FIELD'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<CommandCategory, 'id' | 'commands'> }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; category: Partial<CommandCategory> } }
  | { type: 'REMOVE_CATEGORY'; payload: string }
  | { type: 'ADD_COMMAND'; payload: { categoryId: string; command: Omit<Command, 'id'> } }
  | { type: 'UPDATE_COMMAND'; payload: { id: string; categoryId: string; command: Partial<Command> } }
  | { type: 'REMOVE_COMMAND'; payload: { categoryId: string; commandId: string } }
  | { type: 'ADD_HISTORY_ENTRY'; payload: Omit<HistoryEntry, 'id' | 'timestamp'> }
  | { type: 'RESTORE_VERSION'; payload: number }
  | { type: 'IMPORT_PROTOCOL'; payload: Protocol }
  | { type: 'EXPORT_PROTOCOL' };