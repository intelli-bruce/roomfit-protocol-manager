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
        byteIndex: '0',
        value: '0xFF',
        description: '첫번째 바이트 고정값'
      },
      {
        id: generateId(),
        name: 'Header',
        byteIndex: '1',
        value: '0xFF',
        description: '두번째 바이트 고정값'
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
        byteIndex: '4',
        description: '명령어에 따른 데이터 시작 위치 (없을 수도 있음)'
      },
      {
        id: generateId(),
        name: 'Checksum',
        byteIndex: '5',
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
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x06', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x04', description: ''},
              {id: generateId(), name: 'Raw Position L', byteIndex: '4', description: '왼쪽 위치 (상위 바이트)'},
              {id: generateId(), name: 'Raw Position L', byteIndex: '5', description: '왼쪽 위치 (하위 바이트)'},
              {id: generateId(), name: 'Raw Position R', byteIndex: '6', description: '오른쪽 위치 (상위 바이트)'},
              {id: generateId(), name: 'Raw Position R', byteIndex: '7', description: '오른쪽 위치 (하위 바이트)'},
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
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x04', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x05', description: ''},
              {id: generateId(), name: 'Voltage', byteIndex: '4', description: '전압 (상위 바이트)'},
              {id: generateId(), name: 'Voltage', byteIndex: '5', description: '전압 (하위 바이트)'},
              {id: generateId(), name: 'Checksum', byteIndex: '6', description: '체크섬'}
            ],
            conversion: [
              {field: 'Voltage', formula: 'Voltage / 100.0', unit: 'V'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'System Info Data',
          code: '0x06',
          description: '시스템 정보를 반환합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x06, 0xFA]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x09', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x06', description: ''},
              {id: generateId(), name: 'Voltage', byteIndex: '4', description: '전압 (상위 바이트)'},
              {id: generateId(), name: 'Voltage', byteIndex: '5', description: '전압 (하위 바이트)'},
              {id: generateId(), name: 'Left Weight', byteIndex: '6', description: '왼쪽 무게'},
              {id: generateId(), name: 'Left Weight Mode', byteIndex: '7', description: '왼쪽 무게 모드'},
              {id: generateId(), name: 'Right Weight', byteIndex: '8', description: '오른쪽 무게'},
              {id: generateId(), name: 'Right Weight Mode', byteIndex: '9', description: '오른쪽 무게 모드'},
              {id: generateId(), name: 'On/Off', byteIndex: '10', description: '전원 상태 (0x00 또는 0x01)'},
              {id: generateId(), name: 'Checksum', byteIndex: '11', description: '체크섬'}
            ],
            conversion: [
              {field: 'Voltage', formula: 'Voltage / 100.0', unit: 'V'},
              {field: 'Weight Mode', formula: 'modeToString(mode)', unit: ''}
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
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x65', description: ''},
              {id: generateId(), name: 'On/Off', byteIndex: '4', description: '현재 상태 (0x00 또는 0x01)'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Start Report',
          code: '0x41',
          description: '리포트 데이터 전송을 시작합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x41, 0xBF]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x0C', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x41', description: ''},
              {id: generateId(), name: 'Time', byteIndex: '4', description: '시간 (상위 바이트)'},
              {id: generateId(), name: 'Time', byteIndex: '5', description: '시간 (하위 바이트)'},
              {id: generateId(), name: 'Raw Position L', byteIndex: '6', description: '왼쪽 위치 (상위 바이트)'},
              {id: generateId(), name: 'Raw Position L', byteIndex: '7', description: '왼쪽 위치 (하위 바이트)'},
              {id: generateId(), name: 'Raw Position R', byteIndex: '8', description: '오른쪽 위치 (상위 바이트)'},
              {id: generateId(), name: 'Raw Position R', byteIndex: '9', description: '오른쪽 위치 (하위 바이트)'},
              {id: generateId(), name: 'Raw Force L', byteIndex: '10', description: '왼쪽 힘 (상위 바이트)'},
              {id: generateId(), name: 'Raw Force L', byteIndex: '11', description: '왼쪽 힘 (하위 바이트)'},
              {id: generateId(), name: 'Raw Force R', byteIndex: '12', description: '오른쪽 힘 (상위 바이트)'},
              {id: generateId(), name: 'Raw Force R', byteIndex: '13', description: '오른쪽 힘 (하위 바이트)'},
              {id: generateId(), name: 'Checksum', byteIndex: '14', description: '체크섬'}
            ],
            conversion: [
              {field: 'Position', formula: 'Raw Position * 0.05', unit: '미정'},
              {field: 'Force', formula: 'Raw Force', unit: 'N'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Stop Report',
          code: '0x42',
          description: '리포트 데이터 전송을 중지합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x42, 0xBE]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x42', description: ''},
              {id: generateId(), name: 'Status', byteIndex: '4', description: '상태'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Weight Data',
          code: '0x66',
          description: '무게를 조절합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x04, 0x66, ${targetType}, ${amount}, ${checksum}]',
            fields: [
              {name: 'Size', value: '0x04'},
              {name: 'Data', value: 'Byte 4 = 타겟(0x01-좌측, 0x02-우측, 0x03-양쪽), Byte 5 = 증가량(0x01-1단위, 0x02-5단위)'}
            ],
            variables: [
              {name: 'targetType', description: '타겟 유형', defaultValue: '0x02'},
              {name: 'amount', description: '증가량', defaultValue: '0x01'},
              {name: 'checksum', description: '체크섬', defaultValue: 'auto'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x04', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x66', description: ''},
              {id: generateId(), name: 'Weight', byteIndex: '4', description: '현재 무게'},
              {id: generateId(), name: 'Mode', byteIndex: '5', description: '현재 모드'},
              {id: generateId(), name: 'Checksum', byteIndex: '6', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Weight Decrease',
          code: '0x67',
          description: '무게를 감소시킵니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x04, 0x67, ${targetType}, ${amount}, ${checksum}]',
            fields: [
              {name: 'Size', value: '0x04'},
              {name: 'Data', value: 'Byte 4 = 타겟(0x01-좌측, 0x02-우측, 0x03-양쪽), Byte 5 = 감소량(0x01-1단위, 0x02-5단위)'}
            ],
            variables: [
              {name: 'targetType', description: '타겟 유형', defaultValue: '0x02'},
              {name: 'amount', description: '감소량', defaultValue: '0x01'},
              {name: 'checksum', description: '체크섬', defaultValue: 'auto'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x04', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x67', description: ''},
              {id: generateId(), name: 'Weight', byteIndex: '4', description: '현재 무게'},
              {id: generateId(), name: 'Mode', byteIndex: '5', description: '현재 모드'},
              {id: generateId(), name: 'Checksum', byteIndex: '6', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Toggle Mode',
          code: '0x68',
          description: '운동 모드를 변경합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x68, 0x98]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x04', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x68', description: ''},
              {id: generateId(), name: 'Left Weight Mode', byteIndex: '4', description: '왼쪽 무게 모드'},
              {id: generateId(), name: 'Right Weight Mode', byteIndex: '5', description: '오른쪽 무게 모드'},
              {id: generateId(), name: 'Checksum', byteIndex: '6', description: '체크섬'}
            ],
            conversion: [
              {field: 'Mode', formula: 'modeToString(mode)', unit: ''}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Eccentric Level',
          code: '0x69',
          description: '편심성 레벨을 설정합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x69, 0x97]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x69', description: ''},
              {id: generateId(), name: 'Level', byteIndex: '4', description: '현재 레벨'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Calibration',
          code: '0x63',
          description: '보정을 수행합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x03, 0x63, 0x03, 0x99]',
            fields: [
              {name: 'Size', value: '0x03'},
              {name: 'Data', value: 'Byte 4 = 0x03 (보정 유형)'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x63', description: ''},
              {id: generateId(), name: 'Status', byteIndex: '4', description: '상태'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Range Setting',
          code: '0x62',
          description: '범위를 설정합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x04, 0x62, 0x02, ${rangeType}, ${checksum}]',
            fields: [
              {name: 'Size', value: '0x04'},
              {name: 'Data', value: 'Byte 5 = 0x00 (낮음) 또는 0x01 (높음)'}
            ],
            variables: [
              {name: 'rangeType', description: '범위 유형', defaultValue: '0x00'},
              {name: 'checksum', description: '체크섬', defaultValue: 'auto'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x62', description: ''},
              {id: generateId(), name: 'Range', byteIndex: '4', description: '현재 범위 설정'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Emergency Stop',
          code: '0x64',
          description: '긴급 정지를 실행합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0x64, 0x9C]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0x64', description: ''},
              {id: generateId(), name: 'Status', byteIndex: '4', description: '상태'},
              {id: generateId(), name: 'Checksum', byteIndex: '5', description: '체크섬'}
            ]
          }
        },
        {
          id: generateId(),
          name: 'Reboot',
          code: '0xFC',
          description: '장치를 재부팅합니다.',
          request: {
            packet: '[0xFF, 0xFF, 0x02, 0xFC, 0x04]',
            fields: [
              {name: 'Size', value: '0x02'},
              {name: 'Data', value: '없음'}
            ]
          },
          response: {
            fields: [
              {id: generateId(), name: 'Header', byteIndex: '0', value: '0xFF', description: '첫번째 헤더 바이트'},
              {id: generateId(), name: 'Header', byteIndex: '1', value: '0xFF', description: '두번째 헤더 바이트'},
              {id: generateId(), name: 'Size', byteIndex: '2', value: '0x03', description: ''},
              {id: generateId(), name: 'Command', byteIndex: '3', value: '0xFC', description: ''},
              {id: generateId(), name: 'Status', byteIndex: '4', description: '상태'},
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