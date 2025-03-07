## 프로젝트 구조

.
├── app
│   ├── components
│   │   ├── PacketDesigner
│   │   │   ├── CommandEditor
│   │   │   │   ├── hooks
│   │   │   │   │   ├── useCommandForm.ts
│   │   │   │   │   ├── useConversions.ts
│   │   │   │   │   ├── useRequestFields.ts
│   │   │   │   │   ├── useRequestPacket.ts
│   │   │   │   │   └── useResponseField.ts
│   │   │   │   ├── BasicInfoSection.tsx
│   │   │   │   ├── ButtonGroup.tsx
│   │   │   │   ├── ConversionSection.tsx
│   │   │   │   ├── RequestPacketSection.tsx
│   │   │   │   ├── ResponsePacketSection.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── shared
│   │   │   │   ├── types.ts
│   │   │   │   └── utils.ts
│   │   │   ├── BasePacketEditor.tsx
│   │   │   ├── CommandCard.tsx
│   │   │   ├── CommandEditor.tsx
│   │   │   ├── CommandList.tsx
│   │   │   ├── PacketDesginer.tsx
│   │   │   └── index.tsx
│   │   └── UI
│   │       ├── Header.tsx
│   │       ├── Modal.tsx
│   │       ├── Sidebar.tsx
│   │       └── TabNavigation.tsx
│   ├── context
│   │   ├── ProtocolContext.tsx
│   │   └── reducer.ts
│   ├── lib
│   │   ├── initialState.ts
│   │   └── types.ts
│   ├── utils
│   │   └── packetUtils.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── docs
│   ├── architecture
│   └── project
│       └── architecture.md
├── public
├── README.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.js
└── tsconfig.json

15 directories, 41 files
