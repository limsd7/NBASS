// 학년별 및 과목별 세부 교육과정 단원 데이터

import { SUNEUNG_SUBJECTS } from './suneungSubjects';

export interface CurriculumUnitGroup {
  gradeCategory: 'middle' | 'high_1' | 'high_2_3';
  gradeName: string;
  subjects: {
    subjectId: string;
    subjectName: string;
    units: CurriculumUnitItem[];
  }[];
}

export interface CurriculumUnitItem {
  id: string;
  name: string;
  category?: string;
  coreConcepts: string[];
  recommendedPreparation: string;
}

export const CURRICULUM_DATA: CurriculumUnitGroup[] = [
  {
    gradeCategory: 'middle',
    gradeName: '중학교 (중1~중3 공통/심화)',
    subjects: [
      {
        subjectId: 'math',
        subjectName: '수학',
        units: [
          {
            id: 'm_factorization_primes',
            name: '소인수분해와 최대공약수/최소공배수',
            category: '수와 연산',
            coreConcepts: ['소수와 합성수', '소인수분해', '최대공약수와 최소공배수의 성질'],
            recommendedPreparation: '자연수의 성질 및 나눗셈 규칙 점검'
          },
          {
            id: 'm_integers_rationals',
            name: '정수와 유리수의 사칙연산',
            category: '수와 연산',
            coreConcepts: ['부호 규칙', '절댓값', '유리수의 덧셈·곱셈 분배법칙'],
            recommendedPreparation: '음수 계산 부호 실수 방지 루틴'
          },
          {
            id: 'm_linear_equations',
            name: '문자와 식 & 일차방정식의 활용',
            category: '변화와 관계',
            coreConcepts: ['방정식의 해', '등식의 성질', '거리·속력·시간 및 농도 활용 공식'],
            recommendedPreparation: '미지수 x 설정 및 문장제 조건 식 세우기'
          },
          {
            id: 'm_coordinates_graphs',
            name: '좌표평면과 그래프 & 정비례/반비례',
            category: '변화와 관계',
            coreConcepts: ['사분면과 순서쌍', '정비례 y=ax', '반비례 y=a/x 그래프 특징'],
            recommendedPreparation: '원점 대칭 및 좌표 읽기 훈련'
          },
          {
            id: 'm_linear_inequalities',
            name: '일차부등식과 연립일차방정식',
            category: '변화와 관계',
            coreConcepts: ['음수를 곱할 때 부등호 방향 반전', '가감법과 대입법', '연립방정식 활용'],
            recommendedPreparation: '부등호 방향 주의 및 미지수 소거 훈련'
          },
          {
            id: 'm_linear_functions',
            name: '일차함수와 그래프의 성질',
            category: '함수',
            coreConcepts: ['기울기와 절편 (y=ax+b)', '두 직선의 위치 관계', '일차방정식과 일차함수의 일치'],
            recommendedPreparation: '기울기의 정의(x의 증가량에 대한 y의 증가량) 직관화'
          },
          {
            id: 'm_polynomial_factorization',
            name: '다항식의 곱셈공식과 인수분해',
            category: '문자와 식',
            coreConcepts: ['합차공식 (a+b)(a-b)', '완전제곱식', '이차식의 대각선 인수분해'],
            recommendedPreparation: '공통인수 묶기 및 곱셈공식 역과정 암기'
          },
          {
            id: 'm_quadratic_equations',
            name: '이차방정식의 풀이와 판별식',
            category: '문자와 식',
            coreConcepts: ['인수분해를 통한 풀이', '근의 공식', '판별식 D의 부호와 근의 개수'],
            recommendedPreparation: '근의 공식 유도 및 계수 대입 정확도 훈련'
          },
          {
            id: 'm_quadratic_functions',
            name: '이차함수의 그래프와 최대·최소',
            category: '함수',
            coreConcepts: ['꼭짓점과 축의 방정식', '표준형 y=a(x-p)²+q 변형', '제한된 범위에서의 최대·최소'],
            recommendedPreparation: '완전제곱식 변형 및 대칭축 그리기 훈련'
          },
          {
            id: 'm_pythagoras_similarity',
            name: '도형의 닮음과 피타고라스 정리',
            category: '기하',
            coreConcepts: ['AA/SAS 닮음 조건', '삼각형의 무게중심 (2:1)', '피타고라스 정리 a²+b²=c²'],
            recommendedPreparation: '도형 비례식 전개 및 직각삼각형 변의 비 확인'
          },
          {
            id: 'm_trigonometric_ratios',
            name: '삼각비와 활용 (sin, cos, tan)',
            category: '기하',
            coreConcepts: ['특수각의 삼각비 (30°, 45°, 60°)', '삼각비를 이용한 높이와 거리', '삼각형의 넓이 공식'],
            recommendedPreparation: '특수각 직각삼각형 변의 비율 (1:√3:2, 1:1:√2) 시각화'
          },
          {
            id: 'm_circle_properties',
            name: '원의 성질과 원주각',
            category: '기하',
            coreConcepts: ['원주각과 중심각의 관계 (1/2배)', '원에 내접하는 사각형의 성질', '접선과 현이 이루는 각'],
            recommendedPreparation: '원주각 불변의 성질 및 접현각 선 긋기'
          },
          {
            id: 'm_probability_statistics',
            name: '경우의 수, 확률 및 통계(산포도)',
            category: '확률과 통계',
            coreConcepts: ['합의 법칙과 곱의 법칙', '여사건의 확률', '평균, 분산, 표준편차 구하기'],
            recommendedPreparation: '경우의 수 빠짐없이 세기와 편차 제곱의 평균 계산'
          }
        ]
      },
      {
        subjectId: 'korean',
        subjectName: '국어',
        units: [
          { id: 'm_kor_reading', name: '비문학 독해 (설명문/논설문)', coreConcepts: ['중심 문장 찾기', '글의 구조 분석', '사실과 의견 구별'], recommendedPreparation: '문단별 요약 훈련' },
          { id: 'm_kor_literature', name: '문학 (시/소설/수필의 갈래 특성)', coreConcepts: ['화자의 태도', '소설의 시점과 갈등', '비유와 상징'], recommendedPreparation: '작품의 배경과 주제어 파악' },
          { id: 'm_kor_grammar', name: '문법 (품사, 음운 변동, 문장 성분)', coreConcepts: ['9품사의 분류', '음운의 변동 현상', '주어/서술어/목적어 관계'], recommendedPreparation: '기본 품사 구분 및 예시 암기' }
        ]
      },
      {
        subjectId: 'english',
        subjectName: '영어',
        units: [
          { id: 'm_eng_grammar_tense', name: '기본 문법 (시제, 수동태, 조동사)', coreConcepts: ['현재완료 시제', '수동태 be+p.p.', '조동사의 뉘앙스'], recommendedPreparation: '기본 5형식 문장 구조 확인' },
          { id: 'm_eng_relatives', name: '관계대명사와 접속사', coreConcepts: ['who/which/that 용법', '관계부사 where/when', '명사절 접속사'], recommendedPreparation: '수식받는 선행사 찾기' },
          { id: 'm_eng_reading', name: '단문 및 중문 독해 / 어휘', coreConcepts: ['주제문 추론', '지시대명사 가리키는 대상', '필수 중학 단어'], recommendedPreparation: '직독직해 구 끊어 읽기' }
        ]
      }
    ]
  },
  {
    gradeCategory: 'high_1',
    gradeName: '고등학교 1학년 (공통수학1 / 공통수학2)',
    subjects: [
      {
        subjectId: 'math',
        subjectName: '수학',
        units: [
          {
            id: 'h1_polynomial_operations',
            name: '다항식의 연산과 곱셈공식의 변형',
            category: '다항식',
            coreConcepts: ['곱셈공식 10대 기본형', '대칭식과 교대식의 값', '다항식의 조립제법'],
            recommendedPreparation: '복잡한 식의 치환 및 3차식 곱셈공식 변형 연습'
          },
          {
            id: 'h1_remainder_factor',
            name: '항등식과 나머지정리 & 인수정리',
            category: '다항식',
            coreConcepts: ['미정계수법 (계수비교법, 수치대입법)', '나머지정리 f(α)=R', '인수정리와 고차식의 인수분해'],
            recommendedPreparation: '검산식 A = BQ + R 작성 습관화'
          },
          {
            id: 'h1_complex_numbers',
            name: '복소수와 이차방정식',
            category: '방정식과 부등식',
            coreConcepts: ['허수단위 i의 주기성', '켤레복소수의 성질', '근과 계수의 관계'],
            recommendedPreparation: '음수의 제곱근 성질 (√a√b = -√ab 조건) 재확인'
          },
          {
            id: 'h1_quadratic_function_relation',
            name: '이차방정식과 이차함수의 관계 (판별식 & 위치)',
            category: '방정식과 부등식',
            coreConcepts: ['이차함수와 x축의 교점 = 방정식의 실근', '이차함수와 직선의 위치 관계', '근의 분리(함수값, 축, 판별식)'],
            recommendedPreparation: '함수의 그래프와 방정식의 실근 개수 매핑 훈련'
          },
          {
            id: 'h1_higher_equations_inequalities',
            name: '여러 가지 방정식과 부등식 (절댓값/연립/연립부등식)',
            category: '방정식과 부등식',
            coreConcepts: ['삼차·사차방정식의 풀이', '오메가(ω)의 성질', '절댓값을 포함한 부등식'],
            recommendedPreparation: '구간 나누기와 특수 근의 주기성 암기'
          },
          {
            id: 'h1_line_equation',
            name: '평면좌표와 직선의 방정식',
            category: '도형의 방정식',
            coreConcepts: ['선분의 내분점과 외분점', '점과 직선 사이의 거리 공식', '두 직선의 평행과 수직 조건(m₁m₂ = -1)'],
            recommendedPreparation: '기하적 대칭성과 거리 공식 정밀 대입'
          },
          {
            id: 'h1_circle_equation',
            name: '원의 방정식과 위치 관계 (접선의 방정식)',
            category: '도형의 방정식',
            coreConcepts: ['원의 표준형과 일반형', '원과 직선의 거리 d와 반지름 r 비교', '기울기가 주어지거나 원 위의 점에서의 접선'],
            recommendedPreparation: '점과 직선 사이 거리 공식으로 판별식 대체하기'
          },
          {
            id: 'h1_transformation',
            name: '도형의 이동 (평행이동 & 대칭이동)',
            category: '도형의 방정식',
            coreConcepts: ['점의 이동 vs 도형의 방정식의 이동 부호 차이', 'x축/y축/원점/직선 y=x 대칭', '최단거리 문제의 대칭 활용'],
            recommendedPreparation: '대칭이동 후 직선거리(삼각형 변의 합 최소) 선 긋기'
          },
          {
            id: 'h1_sets_propositions',
            name: '집합의 연산과 명제 (필요충분조건 & 증명)',
            category: '집합과 명제',
            coreConcepts: ['드모르간 법칙', '대우명제와 귀류법', '산술-기하 평균 부등식'],
            recommendedPreparation: '벤다이어그램 표현 및 산술기하 등호 성립 조건 체크'
          },
          {
            id: 'h1_functions_rational_irrational',
            name: '함수의 정의, 역함수 & 유리함수·무리함수',
            category: '함수',
            coreConcepts: ['일대일 대응과 역함수 존재 조건', '유리함수의 점근선', '무리함수의 시작점과 방향'],
            recommendedPreparation: '점근선의 교점 및 치역/정의역 제약 조건 시각화'
          },
          {
            id: 'h1_permutations_combinations',
            name: '순열과 조합 (기초 경우의 수)',
            category: '경우의 수',
            coreConcepts: ['합과 곱의 법칙', '순열 nPr vs 조합 nCr', '이웃하는 경우와 이웃하지 않는 경우'],
            recommendedPreparation: '순서가 있는지(순열) 없는지(조합) 명확한 기준 확립'
          }
        ]
      },
      {
        subjectId: 'korean',
        subjectName: '국어',
        units: [
          { id: 'h1_kor_grammar_standard', name: '국어 문법 (음운 변동, 맞춤법, 문법 요소)', coreConcepts: ['교체/탈락/첨가/축약', '높임표현과 피동·사동', '중세국어 기초'], recommendedPreparation: '음운 환경 분석' },
          { id: 'h1_kor_literature_modern', name: '현대문학 (현대시/현대소설 심층 독해)', coreConcepts: ['서정 갈래의 정서와 태도', '서사 갈래의 시점과 복선', '주제의식 파악'], recommendedPreparation: '시어의 긍정/부정 시각화' },
          { id: 'h1_kor_literature_classic', name: '고전문학 (고전시가/고전산문 필수 어휘)', coreConcepts: ['향가/고려가요/시조/가사 갈래', '자연친화와 충의 이념', '고어 어휘 풀이'], recommendedPreparation: '필수 고어 어휘 50선 숙지' },
          { id: 'h1_kor_reading_academic', name: '학술 독서 (인문/사회/과학/예술)', coreConcepts: ['주제 전개 방식', '논리적 오류와 비판', '정보 간의 상관관계'], recommendedPreparation: '문단 간 접속어와 연결 고리 추적' }
        ]
      },
      {
        subjectId: 'english',
        subjectName: '영어',
        units: [
          { id: 'h1_eng_syntax', name: '고1 구문 독해 (분사구문, 가정법, 도치)', coreConcepts: ['분사구문의 주어 일치', '가정법 과거와 과거완료', '부정어 도치'], recommendedPreparation: '문장 구조의 주어-동사 축 식별' },
          { id: 'h1_eng_mock_reading', name: '전국연합학력평가 유형별 독해 (빈칸/순서/삽입)', coreConcepts: ['Signal Words(However, Therefore)', '대명사와 지시어 흐름', '문맥 속 어휘 추론'], recommendedPreparation: '글의 전개 패턴(문제-해결, 비교-대조) 분석' },
          { id: 'h1_eng_grammar_points', name: '어법 어휘 빈출 5대 포인트', coreConcepts: ['수일치', '능동 vs 수동', '관계사 vs 접속사 what/that', '형용사 vs 부사', '병렬 구조'], recommendedPreparation: '어법 선택 문항 밑줄 전후 구조 분석' }
        ]
      }
    ]
  },
  {
    gradeCategory: 'high_2_3',
    gradeName: '고등학교 2~3학년 / N수 (수능 및 일반선택/진로선택)',
    subjects: [
      {
        subjectId: 'math',
        subjectName: '수학 (수I·수II·미적분·기하·확통)',
        units: [
          {
            id: 'h23_math1_exponents_logs',
            name: '[수학I] 지수함수와 로그함수의 그래프 & 방정식·부등식',
            category: '수학I',
            coreConcepts: ['지수/로그의 밑 조건과 진수 조건', '지수함수와 로그함수의 역함수 관계', '점근선과 대소 비교'],
            recommendedPreparation: '로그 밑 조건(a>0, a≠1)과 진수 양수 조건 우선 체크'
          },
          {
            id: 'h23_math1_trig_functions',
            name: '[수학I] 삼각함수의 그래프와 주기성 & 대칭성',
            category: '수학I',
            coreConcepts: ['호도법과 부채꼴 호의 길이/넓이', 'sin, cos, tan의 주기와 대칭축', '삼각방정식과 부등식의 실근'],
            recommendedPreparation: '단위원 및 삼각함수 그래프의 점대칭/선대칭성 활용'
          },
          {
            id: 'h23_math1_sine_cosine_laws',
            name: '[수학I] 사인법칙과 코사인법칙 (도형의 활용)',
            category: '수학I',
            coreConcepts: ['외접원의 반지름 R과 사인법칙', '두 변과 끼인각 코사인법칙', '삼각형의 넓이와 사각형의 성질'],
            recommendedPreparation: '원주각 성질 및 보조선 그어 직각/외접원 찾기'
          },
          {
            id: 'h23_math1_sequences_arith_geo',
            name: '[수학I] 등차수열과 등비수열의 일반항 & 합',
            category: '수학I',
            coreConcepts: ['등차중항과 등비중항', '등차수열 합의 이차식 형태(상수항 0)', 'Sn과 An의 관계(n≥2 조건)'],
            recommendedPreparation: '등차수열의 공차 d를 일차함수의 기울기로 해석하기'
          },
          {
            id: 'h23_math1_sum_induction',
            name: '[수학I] 수열의 합(∑)과 수학적 귀납법 (귀납적 정의)',
            category: '수학I',
            coreConcepts: ['시그마 자연수 거듭제곱 합 공식', '부분분수와 분수수열 소거', '수열의 귀납적 정의와 역추적 추론(수능 15번/21번 유형)'],
            recommendedPreparation: '역방향 나열(n=k부터 거꾸로 대입) 및 케이스 분류 훈련'
          },
          {
            id: 'h23_math2_limits_continuity',
            name: '[수학II] 함수의 극한과 연속성',
            category: '수학II',
            coreConcepts: ['0/0 꼴과 ∞/∞ 꼴의 극한값 계산', '좌극한과 우극한의 일치 조건', '사잇값 정리와 최대·최소 정리'],
            recommendedPreparation: '인수분해 및 유리화로 부정형 해소, 불연속점 추론'
          },
          {
            id: 'h23_math2_differentiation_rules',
            name: '[수학II] 미분계수와 도함수의 정의',
            category: '수학II',
            coreConcepts: ['평균변화율과 미분계수의 기하학적 의미', '미분가능성과 연속성의 관계', '곱의 미분법과 다항함수 도함수'],
            recommendedPreparation: '미분계수 정의식 형태 맞추기 훈련'
          },
          {
            id: 'h23_math2_diff_applications',
            name: '[수학II] 도함수의 활용 (접선, 삼차·사차함수의 그래프 개형 & 극대·극소)',
            category: '수학II',
            coreConcepts: ['접선의 방정식 (곡선 밖의 한 점)', '삼차함수의 비율 관계(2:1, 1:√3)', '사차함수의 개형과 극값 조건', '방정식과 부등식에의 활용'],
            recommendedPreparation: '삼차함수 비율 관계 도식화 및 접선 위치 분류'
          },
          {
            id: 'h23_math2_integration_definite',
            name: '[수학II] 부정적분과 정적분의 계산 & 성질',
            category: '수학II',
            coreConcepts: ['부정적분과 정적분의 미적분학 기본정리', '우함수·기함수의 정적분 대칭성', '정적분으로 정의된 함수 (대입과 미분)'],
            recommendedPreparation: '아래끝/위끝 맞추기(x=a 대입) 및 양변 미분 루틴'
          },
          {
            id: 'h23_math2_integ_applications',
            name: '[수학II] 정적분의 활용 (곡선 사이의 넓이, 속도와 거리)',
            category: '수학II',
            coreConcepts: ['이차함수와 직선이 이루는 넓이 공식(1/6|a|(β-α)³)', '속도 그래프와 위치의 변화량 vs 이동거리', '역함수의 정적분 넓이'],
            recommendedPreparation: '넓이 적분 시 함수 크기 비교 및 적분 구간 분할'
          },
          {
            id: 'h23_calc_sequences_series',
            name: '[미적분] 수열의 극한과 급수의 수렴·발산',
            category: '선택 미적분',
            coreConcepts: ['급수와 수열의 극한 관계(∑an 수렴 ⇒ lim an = 0)', '등비급수의 수렴 조건과 합(1-r분의 a)', '등비급수 도형 활용(프랙탈)'],
            recommendedPreparation: '첫째항과 공비 r(닮음비²) 정확한 도형 추출'
          },
          {
            id: 'h23_calc_transcendental_diff',
            name: '[미적분] 초월함수의 미분법 (지수/로그/삼각/역함수/음함수/합성함수)',
            category: '선택 미적분',
            coreConcepts: ['합성함수 미분법 (체인 룰)', '몫의 미분법과 매개변수 미분법', '역함수 미분법과 이계도함수 변곡점'],
            recommendedPreparation: '겉미분·속미분 순차 계산 및 역함수 미분 공식'
          },
          {
            id: 'h23_calc_transcendental_integ',
            name: '[미적분] 초월함수의 적분법 (치환적분 & 부분적분) 및 정적분의 활용',
            category: '선택 미적분',
            coreConcepts: ['치환적분법 (미분한 식이 곱해져 있는 형태)', '부분적분법 (로다삼지 순서)', '정적분과 급수의 합(구분구적법)', '입체도형의 부피'],
            recommendedPreparation: '로다삼지(로그-다항-삼각-지수) 우선순위 표기'
          },
          {
            id: 'h23_prob_stat_counting',
            name: '[확률과 통계] 순열·조합, 중복조합(nHr) & 이항정리',
            category: '선택 확통',
            coreConcepts: ['원순열과 같은 것이 있는 순열', '중복조합 nHr = n+r-1Cr (음이 아닌 정수해)', '이항정리의 일반항과 파스칼의 삼각형'],
            recommendedPreparation: '중복조합 바구니 모델(구분되는 상자 vs 같은 공) 매핑'
          },
          {
            id: 'h23_prob_stat_probability',
            name: '[확률과 통계] 확률의 덧셈정리, 조건부확률 & 독립시행',
            category: '선택 확통',
            coreConcepts: ['조건부확률 P(B|A) = P(A∩B)/P(A)', '사건의 독립과 종속 판정', '독립시행의 확률 공식(nCr p^r q^(n-r))'],
            recommendedPreparation: '표(분할표) 작성 또는 수형도로 표본공간 축소'
          },
          {
            id: 'h23_prob_stat_distributions',
            name: '[확률과 통계] 이산확률분포, 정규분포 & 통계적 추정',
            category: '선택 확통',
            coreConcepts: ['이항분포 B(n, p)의 평균과 분산', '정규분포 N(m, σ²)와 표준정규분포 표준화(Z=(X-m)/σ)', '표본평균의 분포와 모평균의 신뢰구간(95%, 99%)'],
            recommendedPreparation: '표준화 공식 Z=(X-m)/σ 직관화 및 대칭성 이용'
          },
          {
            id: 'h23_geom_conics',
            name: '[기하] 이차곡선 (포물선, 타원, 쌍곡선) & 접선',
            category: '선택 기하',
            coreConcepts: ['포물선의 정의(초점과 준선)', '타원의 정의(두 초점으로부터 거리의 합)', '쌍곡선의 정의(두 초점으로부터 거리의 차)', '이차곡선의 접선의 방정식'],
            recommendedPreparation: '이차곡선 정의 선 긋기 및 초점 좌표 도출'
          },
          {
            id: 'h23_geom_vectors_space',
            name: '[기하] 평면벡터의 연산과 내적 & 공간도형·공간좌표',
            category: '선택 기하',
            coreConcepts: ['벡터의 내적과 두 벡터가 이루는 각', '삼수선의 정리', '정사영의 넓이(S\' = S cosθ)', '구의 방정식'],
            recommendedPreparation: '삼수선의 정리 직각 표시 및 법선벡터 활용'
          }
        ]
      },
      {
        subjectId: 'korean',
        subjectName: '국어 (공통 독서·문학 + 화작/언매)',
        units: [
          { id: 'h23_kor_read_philosophy', name: '[독서] 인문·철학 고난도 지문', coreConcepts: ['상반된 두 사상의 비교·대조', '전제와 결론의 타당성', '논리적 인과관계'], recommendedPreparation: '학자별 입장 대비표 작성' },
          { id: 'h23_kor_read_economy', name: '[독서] 사회·경제·법률 복합 지문', coreConcepts: ['경제 변수 간의 비례/반비례', '법률 조항의 요건과 효과', '수식적 추론'], recommendedPreparation: '변수 관계 화살표(↑↓) 메모' },
          { id: 'h23_kor_read_science_tech', name: '[독서] 과학·기술 고난도 메커니즘 지문', coreConcepts: ['원리와 작동 과정 단계별 인과', '도표/그래프 적용 추론', '기술적 한계 극복 원리'], recommendedPreparation: '작동 단계 번호 매기기(1단계➔2단계)' },
          { id: 'h23_kor_lit_classic_poetry', name: '[문학] 고전시가·고전산문 융합', coreConcepts: ['상투적 표현과 관습적 상징', '서술자의 개입(편집자적 논평)', '환상성과 전기적 요소'], recommendedPreparation: '인물 관계도 및 갈등 구조도 그리기' },
          { id: 'h23_kor_lit_modern', name: '[문학] 현대시·현대소설 심층 감상', coreConcepts: ['외적 준거(보기) 기반 작품 해석', '공간과 시간의 이동', '상징적 소재의 복합적 의미'], recommendedPreparation: '보기의 핵심 기준 먼저 체크' },
          { id: 'h23_kor_select_media', name: '[언어와 매체] 수능 실전 문법 5문항', coreConcepts: ['형태소와 단어 형성법', '안긴문장과 안은문장의 문장 성분', '중세국어 문법 정밀 판별'], recommendedPreparation: '문장 성분 괄호 치기' },
          { id: 'h23_kor_select_speech', name: '[화법과 작문] 담화 구조 및 작문 전략', coreConcepts: ['말하기 방식과 전략', '고쳐 쓰기(퇴고)의 원칙', '자료 활용의 적절성'], recommendedPreparation: '선지 조건 1:1 매칭' }
        ]
      },
      {
        subjectId: 'english',
        subjectName: '영어 (수능 절대평가 1등급)',
        units: [
          { id: 'h23_eng_blank_inference', name: '[수능 킬러] 빈칸추론 31~34번', coreConcepts: ['글의 대주제와 패러프레이징(Paraphrasing)', '역접 뒤 주제문 집약', '빈칸 문장의 부정어 유의'], recommendedPreparation: '핵심 주제어의 유사 표현 치환 공식' },
          { id: 'h23_eng_sequence_insertion', name: '[수능 킬러] 글의 순서 배열(36~37번) & 문장 삽입(38~39번)', coreConcepts: ['지시어(This, These, Such)', '연결사(However, In addition)', '논리적 단절(Gap) 탐색'], recommendedPreparation: '앞뒤 문맥 지시사 연결선 긋기' },
          { id: 'h23_eng_main_idea', name: '[대의 파악] 주제, 제목, 요지, 필자의 주장 (20~24번)', coreConcepts: ['첫 문장 화제 세팅', '필자의 당위 표현(must, should, need to)', '너무 좁거나 넓은 오답 선지 제거'], recommendedPreparation: '첫 2문장에서 토픽과 필자의 태도 추출' },
          { id: 'h23_eng_vocabulary_grammar', name: '[어법·어휘] 29번 어법 & 30번 밑줄 어휘', coreConcepts: ['주어-동사 원거리 수일치', '관계대명사 what vs 접속사 that', '반의어 관계 문맥 어휘'], recommendedPreparation: '동사 자리인지 준동사 자리인지 판별' },
          { id: 'h23_eng_long_passage', name: '[장문 독해] 41~42번 복합 장문 & 43~45번 순서', coreConcepts: ['제목과 어휘 문맥적 추론', '대명사 지칭 대상 확인', '단락 간 사건 시간순 전개'], recommendedPreparation: '스피드와 정확도 배분(7분 내 완수)' }
        ]
      }
    ]
  }
];

/**
 * 학년 문자열(예: '중학교 2학년', '고등학교 1학년', '고3', '중1')을 기반으로
 * 해당 커리큘럼 카테고리('middle' | 'high_1' | 'high_2_3')를 반환
 */
export function getCurriculumCategoryByGrade(gradeStr?: string): 'middle' | 'high_1' | 'high_2_3' {
  if (!gradeStr) return 'high_2_3'; // 기본값
  const clean = gradeStr.trim().toLowerCase();

  if (clean.includes('중') || clean.includes('middle') || clean.includes('중학교')) {
    return 'middle';
  }
  if (clean.includes('고1') || clean.includes('고등 1') || clean.includes('고등학교 1') || clean.includes('1학년')) {
    return 'high_1';
  }
  return 'high_2_3';
}

/**
 * 특정 학년과 과목에 대한 단원 목록 반환
 */
export function getUnitsByGradeAndSubject(gradeStr?: string, subjectId: string = 'math'): CurriculumUnitItem[] {
  const category = getCurriculumCategoryByGrade(gradeStr);
  const group = CURRICULUM_DATA.find(g => g.gradeCategory === category) || CURRICULUM_DATA[2];
  const subjectGroup = group.subjects.find(s => s.subjectId === subjectId || (subjectId === 'math' && s.subjectId === 'math'));
  if (subjectGroup) return subjectGroup.units;
  // 국·수·영 전용 항목이 없는 탐구/한국사/제2외국어는 카테고리 대표 단원으로 폴백 (빈칸 방지)
  return getUnitsByCategoryFallback(subjectId);
}

// 수능 과목 카테고리별 대표 단원 (탐구/한국사/제2외국어 취약단원 등록용)
const CATEGORY_FALLBACK_DEFS: { category: string; units: { id: string; name: string; coreConcepts: string[]; prep: string }[] }[] = [
  {
    category: 'social',
    units: [
      { id: 'soc_ethics_life', name: '생활과윤리 (윤리 문제와 탐구)', coreConcepts: ['윤리학의 성격', '시민윤리와 직업윤리', '생명·정보윤리 쟁점'], prep: '사례-윤리 이론 매칭 훈련' },
      { id: 'soc_ethics_thought', name: '윤리와사상 (동·서양 사상 비교)', coreConcepts: ['유교·불교·도가 핵심', '서양 근대 시민사상', '사회사상 흐름'], prep: '사상가별 공통점·차이점 비교표' },
      { id: 'soc_kor_geo', name: '한국지리 (국토와 지역 특성)', coreConcepts: ['지형 형성 작용', '기후와 식생 분포', '도시 체계와 지역 개발'], prep: '지도 위 위치·분포 패턴 암기' },
      { id: 'soc_world_geo', name: '세계지리 (세계 지역 구분)', coreConcepts: ['기후대별 경관', '주요 국가별 산업 구조', '지형도·통계지도 판독'], prep: '대륙별 대표 경관 이미지 연상' },
      { id: 'soc_east_history', name: '동아시아사 (교류와 갈등)', coreConcepts: ['전근대 조공·책봉 체제', '근대 개항과 개혁 운동', '전쟁과 전후 처리'], prep: '시대별 교류 사건 연표 정리' },
      { id: 'soc_world_history', name: '세계사 (문명과 근현대)', coreConcepts: ['4대 문명 비교', '산업혁명과 제국주의', '냉전과 탈냉전'], prep: '문명별 종교·제도 비교축 암기' },
      { id: 'soc_economics', name: '경제 (시장과 정부)', coreConcepts: ['수요·공급과 탄력성', '시장 실패와 정부 실패', '물가·실업·국제무역 지표'], prep: '그래프 이동 방향(좌·우) 원리 체화' },
      { id: 'soc_politics_law', name: '정치와법 (민주정치와 법)', coreConcepts: ['선거제도와 정당', '기본권 보장과 제한', '민사·형사 절차'], prep: '사례의 위헌·위법 쟁점 구분' },
      { id: 'soc_culture', name: '사회·문화 (사회 변동과 문화)', coreConcepts: ['사회화와 일탈', '계층과 불평등 지표', '문화 이해 관점'], prep: '도표(지니계수 등) 수치 해석 연습' }
    ]
  },
  {
    category: 'science',
    units: [
      { id: 'sci_physics_mech', name: '물리학 (역학·에너지)', coreConcepts: ['등가속도 운동', '뉴턴 운동 법칙', '일·에너지와 역학적 보존'], prep: '힘-가속도-운동 연결 고리 훈련' },
      { id: 'sci_physics_wave', name: '물리학 (파동·전기)', coreConcepts: ['파동의 간섭과 정상파', '전기장과 전류·자기장', '파동 광학 기초'], prep: '공식 문자 대입 전 단위 확인' },
      { id: 'sci_chem_quant', name: '화학 (양적 관계·평형)', coreConcepts: ['몰과 화학 반응식', '산·염기와 중화 적정', '화학 평형 이동'], prep: '미지수 설정 도표화 풀이법' },
      { id: 'sci_chem_structure', name: '화학 (물질 구조·유기)', coreConcepts: ['원자 구조와 주기율', '화학 결합과 분자 구조', '유기 화합물 계열'], prep: '작용기별 반응 패턴 암기' },
      { id: 'sci_life_gene', name: '생명과학 (유전·항상성)', coreConcepts: ['멘델 유전과 가계도', '염색체 비분리와 돌연변이', '신경·호르몬 조절'], prep: '가계도 경우의 수 분기 훈련' },
      { id: 'sci_life_eco', name: '생명과학 (세포·생태)', coreConcepts: ['세포 호흡과 광합성', '개체군·군집 상호작용', '물질 순환'], prep: '실험 변인(조작·통제) 구분' },
      { id: 'sci_earth_atmo', name: '지구과학 (대기·해양)', coreConcepts: ['단열 변화와 날씨', '해수의 성질과 순환', '기후 변화 요인'], prep: '위도·계절별 일사량 그래프 해석' },
      { id: 'sci_earth_geo', name: '지구과학 (지질·천문)', coreConcepts: ['판 구조론과 지진·화산', '지질 시대와화석', '별의 진화와 우주론'], prep: '지질 단면도 순서 판독 연습' },
      { id: 'sci_lab_design', name: '탐구 실험 설계·변인 통제', coreConcepts: ['조작·종속·통제 변인', '대조군 설정 원리', '자료 해석 함정 회피'], prep: '발문 조건 [가]·[나] 밑줄 긋기' }
    ]
  },
  {
    category: 'required',
    units: [
      { id: 'req_kor_ancient', name: '한국사 (선사~통일신라)', coreConcepts: ['고조선과 여러 나라', '삼국 통치 체제', '남북국 시대 문화'], prep: '왕조별 제도 비교 연표' },
      { id: 'req_kor_goryeo', name: '한국사 (고려)', coreConcepts: ['문벌귀족과 무신정권', '몽골 간섭과 자주 개혁', '불교 문화와 팔만대장경'], prep: '사건 인과 사슬 암기' },
      { id: 'req_kor_joseon_early', name: '한국사 (조선 전기)', coreConcepts: ['유교 정치와 사림', '임진왜란과 병자호란', '실학과 북학'], prep: '전란 전후 제도 변화 정리' },
      { id: 'req_kor_modern', name: '한국사 (개항~일제)', coreConcepts: ['갑신·갑오·독립협회', '3·1 운동과 임시정부', '무장·의열 투쟁'], prep: '운동별 주체·강령 비교' },
      { id: 'req_kor_contemp', name: '한국사 (현대)', coreConcepts: ['광복과 분단·전쟁', '민주화 운동 계보', '경제 성장과 외교'], prep: '연도-사건 직결 암기' }
    ]
  },
  {
    category: 'foreign',
    units: [
      { id: 'for_vocab', name: '제2외국어 필수 어휘', coreConcepts: ['테마별 핵심 단어', '인사·숫자·시간 표현', '반의어·유의어 쌍'], prep: '하루 20개 누적 복습' },
      { id: 'for_grammar', name: '제2외국어 기초 문법', coreConcepts: ['동사 변화(시제·인칭)', '문장 성분과 어순', '부정·의문문'], prep: '예문 통째 암기 후 변형' },
      { id: 'for_reading', name: '제2외국어 짧은 독해', coreConcepts: ['안내문·광고문 유형', '대화체 함정 선지', '문화 상식 지문'], prep: '기출 대화체 3개년 분석' },
      { id: 'for_hanja', name: '한문 (기초 한자·독해)', coreConcepts: ['부수별 대표 한자', '어법(재·피동·사역)', '고사성어와 출전'], prep: '음·훈 병기 카드 암기' }
    ]
  }
];

function getUnitsByCategoryFallback(subjectId: string): CurriculumUnitItem[] {
  const info = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);
  if (!info) return [];
  const def = CATEGORY_FALLBACK_DEFS.find(d => d.category === info.category);
  if (!def) return [];
  return def.units.map(u => ({
    id: u.id,
    name: u.name,
    coreConcepts: u.coreConcepts,
    recommendedPreparation: u.prep
  }));
}

/**
 * 단원 이름 또는 ID로 단원 상세 메타데이터 검색
 */
export function findUnitByName(unitNameOrId: string): CurriculumUnitItem | undefined {
  for (const group of CURRICULUM_DATA) {
    for (const subj of group.subjects) {
      for (const unit of subj.units) {
        if (unit.id === unitNameOrId || unit.name === unitNameOrId || unit.name.includes(unitNameOrId) || unitNameOrId.includes(unit.name)) {
          return unit;
        }
      }
    }
  }
  return undefined;
}
