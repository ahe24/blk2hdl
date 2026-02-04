# Block to Verilog HDL Specification

## 1. 개요 (Overview)
웹 브라우저 상에서 디지털 논리 회로(Signal, Logic Gate, Flip-Flop 등)를 블록 다이어그램 형태로 디자인하면, 이를 실시간으로 분석하여 합성 가능한(Synthesizable) Verilog HDL 코드로 변환해주는 도구입니다.

## 2. 목표 (Goals)
- **직관적인 UX**: 마우스 드래그 & 드롭으로 회로를 구성.
- **실시간성**: 회로 변경 즉시 Verilog 코드가 업데이트되어야 함.
- **편의성**: 자동 배선 정리, 스냅(Snap), 코드 내보내기 기능 지원.

## 3. 기술 스택 (Tech Stack)
### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router 기반)
- **Diagram Library**: [React Flow](https://reactflow.dev/) (노드 기반 에디터 구현의 표준)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (간결한 전역 상태 관리)
- **Styling**: CSS Modules or Vanilla CSS (TailwindCSS 사용 시 별도 요청 필요)
- **Algorithm**: `dagre` (자동 레이아웃/배선 정리를 위함)

### Backend (API)
- **Runtime**: Node.js (Next.js API Routes 활용)
- **Language**: TypeScript

### Database
- **DB Engine**: SQLite (로컬 파일 기반, 배포 용이성)
- **ORM**: Prisma (Type-safe DB 접근)

## 4. 상세 기능 (Features)

### 4.1. 에디터 (Editor)
- **Drag & Drop**: 사이드바의 컴포넌트(AND, OR, D-FF 등)를 캔버스로 드래그하여 배치.
- **Smart Wiring**:
    - **Persistence**: 블록 이동 시 연결 상태가 끊어지지 않고 유지됨.
    - **Line Jump**: 배선이 서로 교차할 경우 자동으로 점프(Bridge) 스타일 렌더링.
    - **Obstacle Avoidance** (Smart Routing): 배선이 컴포넌트(블록) 위를 지나가지 않고 자동으로 우회 경로를 생성.
- **Auto Snap**: 그리드(Grid) 시스템을 도입하여 컴포넌트와 배선이 깔끔하게 정렬되도록 함.
- **Properties Panel**: 선택한 컴포넌트나 배선의 속성(이름, 비트 폭, 초기값 등) 변경.
    - *예: Wire 클릭 -> 이름 'clk'로 변경.*

### 4.2. 코드 생성 (Code Generation)
- **Real-time Translation**: 그래프 데이터(Nodes/Edges)가 변경될 때마다 Verilog 생성 로직이 트리거됨.
- **Netlist Logic**:
    1. 그래프 위상 정렬 (Topological Sort) 또는 순회.
    2. Input/Output 포트 정의 선언.
    3. 내부 `wire` 선언.
    4. 각 노드(Gate/Module) 인스턴스화 또는 `assign` 문 생성.
- **Header Formatting**: 사용자 설정(작성자, 날짜, 모듈명, 버전)을 포함한 표준 헤더 자동 추가.

### 4.3. 파일 관리 (File Management)
- **Save/Load**: 프로젝트를 JSON 포맷으로 DB에 저장 및 불러오기.
- **Export**:
    - `.v` (Verilog Source) 다운로드.
    - `.svg` / `.png` (회로도 이미지) 다운로드.
    - Copy to Clipboard 기능.

### 4.4. 편의 기능 (Utilities)
- **Auto Layout**: 뒤엉킨 노드와 배선을 알고리즘(Dagre)을 이용해 보기 좋게 자동 정렬.
- **Minimap**: 거대한 회로도 탐색을 위한 미니맵 지원.

### 4.5. 사용자 관리 (User Management)
- **Identity**: 사용자별 작업 공간 분리를 위한 고유 ID 부여.
- **Projects Scope**: 내 프로젝트 목록만 조회 및 편집 가능.

## 5. 데이터 모델 (Data Model Draft)

### Schema (Prisma)
```ts
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  projects  Project[]
}

model Project {
  id        String   @id @default(uuid())
  name      String
  content   String   // JSON string
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  content   String   // JSON string of { nodes: [], edges: [] }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Supported Components (Initial)
- **Basic Gates**: AND, OR, NOT, NAND, NOR, XOR, XNOR, Buffer, Tri-state Buffer
- **Combinational**: Multiplexer (2:1, 4:1, 8:1), Demultiplexer (1:2, 1:4, 1:8), Encoder, Decoder
- **Arithmetic**: Operators (+, -, *, /, %), Comparator (==, !=, <, >)
- **Storage**: D Flip-Flop (with async Set/Reset)
- **I/O**: Input Pin, Output Pin, Inout Pin, Clock Input (Global/Local auto-routing supported)
- **Source**: Constant (0, 1)

## 6. UI 레이아웃 (Layout)
- **Header**: 로고, 프로젝트 명, 저장/내보내기 버튼.
- **Left Sidebar**: 컴포넌트 라이브러리 (Drag source).
- **Main Canvas**: React Flow 영역 (Infinite pan/zoom).
- **Right Panel**:
    - **Top**: Generated Verilog Code Preview (Read-only).
    - **Bottom**: Properties Inspector (선택된 요소 속성 편집).

## 7. 배포 및 환경 설정 (Deployment & Configuration)

### 7.1. 프로세스 관리
- **PM2**: 프로덕션 환경에서 서버 프로세스 관리 및 자동 재시작을 위해 PM2 사용.
- **ecosystem.config.js**: PM2 설정 파일에서 **하드코딩 금지**. 환경 변수 참조 방식 사용.

### 7.2. 환경 변수 (.env)
- **HOST**: 서버 바인딩 주소 (예: `0.0.0.0`, `localhost`)
- **PORT**: 서버 포트 번호 (예: `3000`)
- **DATABASE_URL**: SQLite DB 경로 (예: `file:./dev.db`)

### 7.3. 설정 예시
```bash
# .env
HOST=0.0.0.0
PORT=3000
DATABASE_URL=file:./production.db
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'block2hdl',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      HOST: process.env.HOST || '0.0.0.0',
      PORT: process.env.PORT || 3000
    }
  }]
};
```
