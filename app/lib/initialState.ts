import {Protocol} from './types';

// UUID 생성 함수 (클라이언트 사이드용)
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 초기 프로토콜 상태
export const initialState: Protocol = {
  id: generateId(),
  name: '패킷 통신 프로토콜',
  version: '1.0.0',
  basePacket: {
    fields: [
      {
        id: generateId(),
        name: 'Header',
        byteIndex: '0-1',
        value: '0xFF, 0xFF',
        description: '고정값'
      },
      {
        id: generateId(),
        name: 'Size',
        byteIndex: '2',
        description: '이후 바이트 수 (Command + Data + Checksum)'
      },
      {
        id: generateId(),
        name: 'Command',
        byteIndex: '3',
        description: '명령어 코드'
      },
      {
        id: generateId(),
        name: 'Data',
        byteIndex: '4 ~ (2 + Size - 1)',
        description: '명령어에 따른 데이터 (없을 수도 있음)'
      },
      {
        id: generateId(),
        name: 'Checksum',
        byteIndex: '(2 + Size)',
        description: '패킷 유효성 검증용 체크섬'
      }
    ]
  },
  categories: [
    {
      id: generateId(),
      name: '데이터 조회 명령어',
      description: '시스템 상태 및 데이터를 조회하는 명령어',
      commands: [
        {
          id: generateId(),
          name: 'Get Position Data',
          code: '0x04',
          description: '위치 데이터를 반환합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x04, 0xFC]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0-1', value: '0xFF, 0xFF'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x06'},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x04'},
              {id: generateId(), name: 'Raw Position L', byteIndex: '4-5', description: '왼쪽 위치 (16비트, 상위 바이트 먼저)'},
              {id: generateId(), name: 'Raw Position R', byteIndex: '6-7', description: '오른쪽 위치 (16비트, 상위 바이트 먼저)'},
              {id: generateId(), name: 'Checksum', byteIndex: '8', description: '체크섬'}
            ],
            conversion: [
              {field: 'Position', formula: 'Raw Position * 0.05', unit: '미정'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Voltage Data',
          code: '0x05',
          description: '전압 데이터를 반환합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x05, 0xFB]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0-1', value: '0xFF, 0xFF'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x04'},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x05'},
              {id: generateId(), name: 'Voltage', byteIndex: '4-5', description: '전압 (16비트, 상위 바이트 먼저)'},
              {id: generateId(), name: 'Checksum', byteIndex: '6', description: '체크섬'}
            ],
            conversion: [
              {field: 'Voltage', formula: 'Voltage / 100.0', unit: 'V'}
            ]
          }
        }
      ]
    },
    {
      id: generateId(),
      name: '제어 명령어',
      description: '시스템을 제어하는 명령어',
      commands: [
        {
          id: generateId(),
          name: 'On/Off',
          code: '0x65',
          description: '기기를 켜거나 끕니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x03, 0x65, ${power}, ${checksum}]',
            fields: [
              {name: 'Size', value: '0x03'},
              {name: 'Data', value: 'Byte 4 = 0x01 (On) 또는 0x00 (Off)'}
            ],
            variables: [
              {name: 'power', description: '전원 상태', defaultValue: '0x01'},
              {name: 'checksum', description: '체크섬', defaultValue: 'auto'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0-1', value: '0xFF, 0xFF'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03'},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x65'},
              {id: generateId(), name: 'On/Off', byteIndex: '4', description: '현재 상태 (0x00 또는 0x01)'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        }
      ]
    }
  ],
  history: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      description: '초기 프로토콜 정의'
    }
  ],
  lastModified: new Date().toISOString()
};