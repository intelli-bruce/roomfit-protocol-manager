module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // 사용하지 않는 변수 경고 비활성화
    '@typescript-eslint/no-unused-vars': 'off',

    // any 타입 사용 경고 비활성화
    '@typescript-eslint/no-explicit-any': 'off',

    // React Hook 의존성 경고 비활성화
    'react-hooks/exhaustive-deps': 'off',

    // 사용하지 않는 eslint-disable 주석 경고 비활성화
    'eslint-comments/no-unused-disable': 'off',
  },
};