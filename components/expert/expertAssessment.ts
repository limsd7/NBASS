// Score-band helper (moved verbatim; no UI change)
import type { ExpertAssessment } from './expertTypes';

// 점수 구간별 평가 로직

const getExpertAssessment = (score: number = 0): ExpertAssessment => {

    if (score >= 81) return {

        grade: '심각 (Severe)',

        keyword: '즉각 조치',

        description: '증상이 고착화되어 학습 효율이 현저히 저하된 상태입니다. 자력 회복이 어려우므로 전문가의 개입과 즉각적인 생활 습관 교정이 필수적입니다.',

        parentScript: '현재 학생의 상태는 단순히 쉬면 나아지는 단계를 지났습니다. 지금 개입하지 않으면 장기적인 번아웃으로 이어질 수 있으니, 오늘 당장 전문가 상담을 권해드립니다.',

        color: 'bg-red-500'

    };

    if (score >= 61) return {

        grade: '주의 (Warning)',

        keyword: '적극 개입',

        description: '자력 회복이 더딘 상태로, 방치 시 심각 단계로 진행될 위험이 높습니다. 적극적인 휴식과 영양 섭취, 수면 패턴 교정이 시급합니다.',

        parentScript: '학생이 스스로 힘들어하고 있습니다. 의지력 문제로 보시면 안 됩니다. 이번 주말에는 공부보다는 무조건적인 휴식과 영양 보충을 우선해주세요.',

        color: 'bg-orange-500'

    };

    if (score >= 41) return {

        grade: '중등도 (Moderate)',

        keyword: '집중 관리',

        description: '학습 효율 저하가 시작되는 단계입니다. 2주 이상의 꾸준한 패턴 교정과 스트레스 관리가 필요합니다.',

        parentScript: '최근 아이가 예민해지거나 집중을 힘들어했을 겁니다. 지금부터 2주 정도는 학습량을 조금 줄이더라도 컨디션 관리에 집중해야 성적이 오릅니다.',

        color: 'bg-yellow-500'

    };

    if (score >= 26) return {

        grade: '경미 (Mild)',

        keyword: '초기 관심',

        description: '증상이 간헐적으로 나타나는 초기 단계입니다. 환경적 요인을 점검하고 예방적 차원의 가벼운 휴식을 권장합니다.',

        parentScript: '큰 문제는 없지만, 가끔 피로해 보일 때가 있네요. 집에서 조금만 더 편안한 환경을 만들어주시면 금방 좋아질 겁니다.',

        color: 'bg-emerald-500'

    };

    return {

        grade: '정상 (Normal)',

        keyword: '안정/양호',

        description: '현재 해당 증상과 관련된 리스크가 거의 없는 안정적인 상태입니다. 현재의 좋은 루틴을 유지하도록 격려해주세요.',

        parentScript: '아주 건강하고 좋은 상태입니다. 지금처럼만 꾸준히 할 수 있도록 칭찬 많이 해주세요.',

        color: 'bg-blue-500'

    };

};
