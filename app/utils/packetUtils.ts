'use client';

/**
 * 패킷 체크섬 계산
 * @param {number[]} bytes - 체크섬을 제외한 패킷 바이트 배열
 * @returns {number} - 계산된 체크섬 값
 */
export const calculateChecksum = (bytes: number[]): number => {
  let sum = 0;
  for (let i = 0; i < bytes.length; i++) {
    sum += bytes[i];
  }
  return (256 - (sum % 256)) % 256;
};

/**
 * 템플릿 패킷 문자열에서 실제 데이터로 변환
 * @param {string} packetTemplate - 템플릿 패킷 (예: "[0xFF, 0xFF, ${size}, ${cmd}, ${checksum}]")
 * @param {Object} variables - 변수값 객체 (예: { size: "0x02", cmd: "0x04" })
 * @returns {string} - 실제 값이 채워진 패킷 문자열
 */
export const fillPacketTemplate = (packetTemplate: string, variables: Record<string, string>): string => {
  let filledPacket = packetTemplate;

  // 모든 변수를 값으로 대체 (체크섬 제외)
  Object.keys(variables).forEach(varName => {
    if (varName !== 'checksum') {
      const regex = new RegExp(`\\$\\{${varName}\\}`, 'g');
      filledPacket = filledPacket.replace(regex, variables[varName]);
    }
  });

  // 체크섬 계산 필요 여부 확인
  if (filledPacket.includes('${checksum}')) {
    // 현재 패킷 파싱
    const bytesWithoutChecksum = parsePacketToBytes(filledPacket.replace('${checksum}', '0x00'));

    // 체크섬 계산
    const checksumValue = calculateChecksum(bytesWithoutChecksum);

    // 체크섬 값 삽입
    filledPacket = filledPacket.replace('${checksum}', `0x${checksumValue.toString(16).padStart(2, '0').toUpperCase()}`);
  }

  return filledPacket;
};

/**
 * 패킷 문자열을 바이트 배열로 변환
 * @param {string} packetStr - 패킷 문자열 (예: "[0xFF, 0xFF, 0x02, 0x04, 0xFC]")
 * @returns {number[]} - 바이트 배열
 */
export const parsePacketToBytes = (packetStr: string): number[] => {
  try {
    // 패킷 문자열에서 실제 숫자 배열로 변환
    return packetStr
      .replace(/[\[\]\s]/g, '')  // 대괄호 및 공백 제거
      .split(',')                // 쉼표로 분리
      .map(byte => {
        if (byte.startsWith('0x')) {
          return parseInt(byte, 16);  // 16진수 처리
        } else if (!isNaN(Number(byte))) {
          return parseInt(byte, 10);  // 10진수 처리
        } else if (byte.includes('${')) {
          return 0; // 아직 변수 부분은 0으로 처리
        } else {
          throw new Error(`Invalid byte format: ${byte}`);
        }
      });
  } catch (error) {
    console.error('패킷 파싱 오류:', error);
    return [];
  }
};

/**
 * 패킷 유효성 검사
 * @param {string} packetHexString - 16진수 패킷 문자열 (예: "FF FF 02 04 FC")
 * @returns {Object} - 검사 결과 객체 { isValid, error }
 */
export const validatePacket = (packetHexString: string): { isValid: boolean; error?: string } => {
  try {
    // 16진수 문자열을 바이트 배열로 변환
    const bytes = packetHexString
      .replace(/\s+/g, '')
      .match(/.{1,2}/g)
      ?.map(byte => parseInt(byte, 16)) || [];

    // 기본 검증: 최소 길이
    if (bytes.length < 5) {
      return {isValid: false, error: '패킷이 너무 짧습니다. 최소 5바이트가 필요합니다.'};
    }

    // 헤더 검증
    if (bytes[0] !== 0xFF || bytes[1] !== 0xFF) {
      return {isValid: false, error: '유효하지 않은 헤더입니다. 0xFF 0xFF이어야 합니다.'};
    }

    // 사이즈 필드 검증
    const size = bytes[2];
    if (bytes.length !== size + 3) { // 헤더(2) + 사이즈(1) + 페이로드(size)
      return {isValid: false, error: `사이즈 필드(${size})와 실제 패킷 길이(${bytes.length})가 일치하지 않습니다.`};
    }

    // 체크섬 계산
    let sum = 0;
    for (let i = 0; i < bytes.length; i++) {
      sum += bytes[i];
    }

    if (sum % 256 !== 0) {
      return {isValid: false, error: '체크섬이 유효하지 않습니다.'};
    }

    return {isValid: true};
  } catch (error) {
    return {isValid: false, error: '패킷 분석 중 오류가 발생했습니다.'};
  }
};

/**
 * 패킷 문자열에서 변수 추출
 * @param {string} packetStr - 패킷 문자열 (예: "[0xFF, 0xFF, ${size}, ${cmd}, ${checksum}]")
 * @returns {Array} - 추출된 변수 객체 배열
 */
export const extractVariables = (packetStr: string): Array<{
  name: string;
  description: string;
  defaultValue: string;
  position: number
}> => {
  const regex = /\$\{([^}]+)\}/g;
  let match;
  const vars: Array<{ name: string; description: string; defaultValue: string; position: number }> = [];

  while ((match = regex.exec(packetStr)) !== null) {
    const varName = match[1];
    const existingVar = vars.find(v => v.name === varName);

    if (!existingVar) {
      vars.push({
        name: varName,
        description: '',
        defaultValue: varName === 'checksum' ? 'auto' : '0x00',
        position: match.index
      });
    }
  }

  return vars;
};

/**
 * 응답 패킷 분석 및 해석
 * @param {string} hexString - 16진수 응답 패킷 문자열
 * @param {Object} commandDef - 명령어 정의 객체
 * @returns {Object} - 분석 결과 객체
 */
export const analyzeResponsePacket = (hexString: string, commandDef: any): any => {
  try {
    // 공백 제거 및 2자리씩 분리
    const bytes = hexString
      .replace(/\s+/g, '')
      .match(/.{1,2}/g)
      ?.map(byte => parseInt(byte, 16)) || [];

    // 기본 검증
    if (bytes.length < 4) {
      return {
        isValid: false,
        error: '패킷이 너무 짧습니다',
        bytes
      };
    }

    // 명령어 확인
    const cmdCode = bytes[3];
    const cmdHex = '0x' + cmdCode.toString(16).padStart(2, '0').toUpperCase();
    if (cmdHex !== commandDef.code) {
      return {
        isValid: false,
        error: `명령어 코드 불일치: 예상 ${commandDef.code}, 실제 ${cmdHex}`,
        bytes
      };
    }

    // 응답 필드 분석
    const fields: any[] = [];

    commandDef.response.fields.forEach((fieldDef: any) => {
      const [startStr, endStr] = fieldDef.byteIndex.split('-').map((b: string) => b.trim());

      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : start;

      // 바이트 범위 추출
      const fieldBytes = bytes.slice(start, end + 1);

      // 다양한 형식 지원 (1바이트, 2바이트 등)
      let value;
      if (fieldBytes.length === 1) {
        value = fieldBytes[0];
      } else if (fieldBytes.length === 2) {
        value = (fieldBytes[0] << 8) | fieldBytes[1]; // 16비트 값 계산 (상위 바이트 먼저)
      } else {
        value = fieldBytes;
      }

      // 변환 로직 적용
      let convertedValue = value;
      if (commandDef.response.conversion) {
        const conversion = commandDef.response.conversion.find(
          (conv: any) => conv.field === fieldDef.name ||
            (fieldDef.name.includes(conv.field) && !conv.field.includes('Raw'))
        );

        if (conversion) {
          // 변환 공식 적용 (예: "Raw Position * 0.05")
          const formula = conversion.formula
            .replace(/Raw\s+\w+/g, value.toString()); // Raw 값을 실제 값으로 대체

          try {
            // eslint-disable-next-line no-eval
            convertedValue = eval(formula);
          } catch (e) {
            console.error('변환 오류:', e);
          }
        }
      }

      fields.push({
        name: fieldDef.name,
        byteIndex: fieldDef.byteIndex,
        rawValue: value,
        hexValue: '0x' + (Array.isArray(value)
          ? value.map((b: number) => b.toString(16).padStart(2, '0').toUpperCase()).join('')
          : value.toString(16).padStart(2, '0').toUpperCase()),
        convertedValue
      });
    });

    // 체크섬 검증
    let sum = 0;
    for (let i = 0; i < bytes.length; i++) {
      sum += bytes[i];
    }
    const checksumValid = sum % 256 === 0;

    return {
      isValid: true,
      checksumValid,
      command: commandDef.name,
      code: commandDef.code,
      fields,
      bytes
    };
  } catch (error) {
    console.error('응답 패킷 분석 오류:', error);
    return {isValid: false, error: '패킷 분석 중 오류가 발생했습니다.'};
  }
};