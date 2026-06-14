# 프리미엄 회원 클라우드 LLM 분기 처리 구현 계획

학생(회원)의 등급에 따라 조언을 생성하는 AI 모델을 다르게 라우팅(Routing)하는 아키텍처를 구현하기 위한 사전 계획서입니다. 
일반 회원은 비용이 들지 않는 로컬 AI 모델(Gemma 등)을 사용하고, 프리미엄 유료 회원은 더 정교한 분석을 위해 클라우드 LLM(Gemini, Claude Sonnet 등)을 우선 사용하도록 설계합니다.

## 💡 의사 결정 필요 (Open Questions)
추후 실제 구현에 들어가기 전, 다음 두 가지 정책에 대한 확정이 필요합니다.

1. **회원 등급(Standard vs Premium) 설정 UI 위치**
   - **옵션 A:** 학생 정보를 등록/수정하는 모달(Student Input Modal)에서 "프리미엄 회원 여부" 토글 스위치 추가 (학생 개별 관리)
   - **옵션 B:** 앱 설정 창에서 한꺼번에 관리하는 별도 메뉴 추가

2. **일반 회원 예외 처리 (Fallback 정책)**
   - 일반(Standard) 회원이 AI 조언을 요청할 때, 로컬 AI 모델 구동기(Ollama)가 꺼져 있어서 연동이 실패할 경우 어떻게 처리할 것인가?
   - **대안 1:** 클라우드 LLM으로 자동 대체해서 퀄리티 높은 조언을 임시로 제공 (비용 발생 가능성 있음)
   - **대안 2:** '로컬 AI를 켜주세요' 라는 에러 팝업을 띄우고 생성 중단 (비용 통제 우선)

---

## 🛠️ 코드 수정 계획 (Proposed Changes)

### 1. 데이터 모델 업데이트 (`types.ts`)
- `StudentInfo` 인터페이스에 회원 등급을 식별할 수 있는 속성 추가.
  ```typescript
  export interface StudentInfo {
    // ... 기존 코드 ...
    membershipTier?: 'standard' | 'premium';
  }
  ```

### 2. UI 컴포넌트 업데이트 (`StudentInputModal.tsx`)
- 학생 등록 및 수정 화면에 **[프리미엄 멤버십 적용]** 토글 스위치 UI 추가.
- 저장 시 DB의 학생 정보에 `membershipTier` 값을 함께 저장하도록 `DatabaseService.updateStudent` 호출부 수정.

### 3. AI 라우팅 로직 변경 (`services/aiService.ts`)
- `generateAIResponse` 함수에 파라미터로 `membershipTier` 정보를 전달받도록 수정.
- **라우팅 분기 로직:**
  - **Premium 회원:** 설정에 Cloud API Key(Gemini, Claude 등)가 있다면 **Cloud LLM을 최우선 호출**. (만약 네트워크 오류 등으로 실패하면 로컬 AI로 Fallback)
  - **Standard 회원:** 설정된 **Local Model(Gemma 등)을 최우선 호출**. (실패 시 정책에 따라 에러 반환 또는 Cloud 대체)

### 4. 요청부 업데이트 (`GradeSimulationView.tsx` & `ResultsView.tsx`)
- AI 조언을 요청하는 버튼 클릭 시, 현재 선택된 `student.membershipTier` 정보를 `generateAIResponse` 함수로 함께 넘겨주도록 파라미터 수정.

---

## 🔍 검증 계획 (Verification Plan)

작업이 완료된 후 다음과 같은 방법으로 로직이 정상 작동하는지 테스트합니다.

1. 학생 정보 수정 화면에서 A학생을 "일반", B학생을 "프리미엄"으로 각각 설정.
2. 각 학생의 [상세 공부법] 모달을 열어 조언 생성 버튼 클릭.
3. 앱의 백그라운드 콘솔(네트워크 탭)에서 실제 호출되는 API 주소를 확인:
   - A학생(일반)은 `http://127.0.0.1:11434/api/generate` (Ollama 로컬 서버)를 호출하는지 확인.
   - B학생(프리미엄)은 `https://generativelanguage.googleapis.com` (Gemini) 또는 Anthropic 서버를 호출하는지 확인.
