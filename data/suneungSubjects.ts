export type SubjectCategory = 
  | 'common'        // 국영수
  | 'social'        // 사회탐구
  | 'science'       // 과학탐구
  | 'foreign'       // 제2외국어/한문
  | 'required';     // 한국사

export interface SubjectInfo {
  id: string;
  name: string;
  category: SubjectCategory;
  gradingType: 'relative' | 'absolute'; // 상대/절대평가
  maxScore: number;     // 원점수 만점
}

export const SUNEUNG_SUBJECTS: SubjectInfo[] = [
  // 공통
  { id: 'korean', name: '국어', category: 'common', gradingType: 'relative', maxScore: 100 },
  { id: 'math', name: '수학', category: 'common', gradingType: 'relative', maxScore: 100 },
  { id: 'english', name: '영어', category: 'common', gradingType: 'absolute', maxScore: 100 },
  
  // 한국사
  { id: 'korean_history', name: '한국사', category: 'required', gradingType: 'absolute', maxScore: 50 },
  
  // 사회탐구
  { id: 'life_ethics', name: '생활과윤리', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'ethics_thought', name: '윤리와사상', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'korean_geography', name: '한국지리', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'world_geography', name: '세계지리', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'east_asian_history', name: '동아시아사', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'world_history', name: '세계사', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'economics', name: '경제', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'politics_law', name: '정치와법', category: 'social', gradingType: 'relative', maxScore: 50 },
  { id: 'social_culture', name: '사회문화', category: 'social', gradingType: 'relative', maxScore: 50 },
  
  // 과학탐구
  { id: 'physics_1', name: '물리학Ⅰ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'chemistry_1', name: '화학Ⅰ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'life_science_1', name: '생명과학Ⅰ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'earth_science_1', name: '지구과학Ⅰ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'physics_2', name: '물리학Ⅱ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'chemistry_2', name: '화학Ⅱ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'life_science_2', name: '생명과학Ⅱ', category: 'science', gradingType: 'relative', maxScore: 50 },
  { id: 'earth_science_2', name: '지구과학Ⅱ', category: 'science', gradingType: 'relative', maxScore: 50 },
  
  // 제2외국어/한문
  { id: 'german', name: '독일어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'french', name: '프랑스어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'spanish', name: '스페인어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'chinese', name: '중국어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'japanese', name: '일본어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'russian', name: '러시아어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'arabic', name: '아랍어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'vietnamese', name: '베트남어Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
  { id: 'hanja', name: '한문Ⅰ', category: 'foreign', gradingType: 'absolute', maxScore: 50 },
];
