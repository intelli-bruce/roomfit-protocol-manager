import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 프로덕션 빌드 시 ESLint 에러가 있어도 빌드 실패하지 않음
    ignoreDuringBuilds: true,
  },

  // TypeScript 에러가 있어도 빌드 진행
  typescript: {
    // 프로덕션 빌드 시 타입 체크 에러가 있어도 빌드 실패하지 않음
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
