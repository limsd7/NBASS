import { GradeRecord, GradeGoal, AssessmentResult, SubjectGrade, StudentInfo, CareType } from '../types';
import { SUNEUNG_SUBJECTS } from '../data/suneungSubjects';

export interface SimulationResult {
    months: string[]; // ["1개월 후", "2개월 후", "3개월 후", "6개월 후", "수능"]
    projections: {
        subjectId: string;
        subjectName: string;
        currentGrade: number;
        targetGrade: number;
        trajectory: number[]; // [current, month1, month2, month3, month6, final]
        probability: number; // 0-100 달성 확률
        bottlenecks: string[];
        recommendations: string[];
    }[];
    overallAdvice: string;
    globalStrategies: string[];
}

export class GradeSimulationEngine {
    static simulate(
        records: GradeRecord[],
        goals: GradeGoal[],
        assessment: AssessmentResult | undefined,
        focusSubjects: string[],
        selectedSubjects: string[],
        student: StudentInfo
    ): SimulationResult | null {
        if (!records || records.length === 0) return null;

        // Get latest record
        const sortedRecords = [...records].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        const latestRecord = sortedRecords[0];

        // Base factors from assessment
        let learningEfficiency = 1.0; // 0.5 to 1.5
        let focusCapacity = 1.0;
        let memoryCapacity = 1.0;

        if (assessment) {
            // study efficiency
            const effScore = assessment.studyEfficiencyResults?.totalScore || 50;
            learningEfficiency = 0.5 + (effScore / 100);

            // cognitive performance (focus)
            const cogScore = assessment.cognitiveResults?.totalScore || 50;
            focusCapacity = 0.5 + (cogScore / 100);

            // working memory
            const memScore = assessment.workingMemoryResults?.totalScore || 50;
            memoryCapacity = 0.5 + (memScore / 100);
        }

        const overallMultiplier = (learningEfficiency * 0.4) + (focusCapacity * 0.3) + (memoryCapacity * 0.3);

        const projections: SimulationResult['projections'] = [];
        const months = ["현재", "1개월 후", "2개월 후", "3개월 후", "6개월 후", "수능(목표)"];

        for (const subjectId of selectedSubjects) {
            // Find the most recent record that contains this subject
            const subjectData = sortedRecords
                .flatMap(r => r.subjects)
                .find(s => s.subjectId === subjectId && s.grade !== undefined);
            const goalData = goals.find(g => g.subjectId === subjectId);
            const subjectInfo = SUNEUNG_SUBJECTS.find(s => s.id === subjectId);

            if (!subjectData || !subjectData.grade || !subjectInfo) continue;

            const currentGrade = subjectData.grade;
            // Default target is 1 grade higher if no goal set
            const targetGrade = goalData?.tier3Target || Math.max(1, currentGrade - 1);
            
            let subjectStrategy = "";
            if (subjectInfo.id === 'korean') {
                subjectStrategy = `비문학 지문의 구조적 독해 훈련을 늘리고, 문학은 갈래별 개념어를 완벽히 숙지하세요.`;
            } else if (subjectInfo.id === 'math') {
                subjectStrategy = `오답 노트를 통해 취약한 단원의 개념을 다시 확인하고, 조건 분석 훈련을 강화하세요.`;
            } else if (subjectInfo.id === 'english') {
                subjectStrategy = `매일 꾸준한 단어 암기와 함께, 길고 복잡한 문장의 끊어 읽기 및 구문 분석 훈련에 집중하세요.`;
            } else if (subjectInfo.category === 'social') {
                subjectStrategy = `단원별 핵심 개념을 흐름에 따라 정리하고, 도표 및 그래프 등 자료 해석 기출문제를 반복하세요.`;
            } else if (subjectInfo.category === 'science') {
                subjectStrategy = `개념과 원리를 정확히 이해하고, 고난도 계산 문제와 실험 자료 해석 문제 풀이에 집중하세요.`;
            } else if (subjectInfo.category === 'required') {
                 subjectStrategy = `핵심 사건의 인과관계를 파악하고 시대별 흐름을 정리하여 필수 개념을 숙지하세요.`;
            } else {
                subjectStrategy = `기본 어휘와 문법을 꾸준히 암기하고, 기출문제 풀이를 통해 문제 유형에 익숙해지세요.`;
            }

            if (currentGrade <= targetGrade) {
                // Already achieved or no improvement needed
                projections.push({
                    subjectId,
                    subjectName: subjectInfo.name,
                    currentGrade,
                    targetGrade,
                    trajectory: [currentGrade, currentGrade, currentGrade, currentGrade, currentGrade, currentGrade],
                    probability: 95,
                    bottlenecks: [],
                    recommendations: [`[1등급 달성/유지] ${subjectStrategy}`, "실수 방지 및 고난도 문항 대비에 집중하세요."]
                });
                continue;
            }

            const gradeGap = currentGrade - targetGrade;
            
            // Focus subjects get a 20% boost in improvement speed
            const isFocused = focusSubjects.includes(subjectId);
            const focusMultiplier = isFocused ? 1.2 : 1.0;

            // Difficulty multiplier (e.g. math is harder to improve)
            let difficultyMultiplier = 1.0;
            if (subjectInfo.category === 'common' && subjectId === 'math') difficultyMultiplier = 0.7;
            if (subjectInfo.category === 'common' && subjectId === 'korean') difficultyMultiplier = 0.8;
            if (subjectInfo.category === 'social' || subjectInfo.category === 'science') difficultyMultiplier = 1.1;

            const improvementRate = overallMultiplier * focusMultiplier * difficultyMultiplier;

            // Calculate trajectory
            // We want to simulate a curve where grade drops (improves) over time
            const trajectory = [currentGrade];
            let currentTempGrade = currentGrade;

            // Simple decay model towards target
            const timeSteps = [1, 1, 1, 3, 4]; // months per step
            
            for (const step of timeSteps) {
                const improvement = (currentTempGrade - targetGrade) * 0.15 * improvementRate * step;
                currentTempGrade = Math.max(targetGrade, currentTempGrade - improvement);
                // Round to 1 decimal place for visual smoothness in chart, though grades are discrete
                trajectory.push(Number(currentTempGrade.toFixed(1)));
            }

            // Calculate trend from last 3 records
            const pastGrades = sortedRecords
                .map(r => r.subjects.find(s => s.subjectId === subjectId)?.grade)
                .filter(g => g !== undefined) as number[];
            
            const recentGrades = pastGrades.slice(0, 5);
            let trendSlope = 0;
            if (recentGrades.length >= 2) {
                let totalSlope = 0;
                // Weighted average: more recent slopes have higher weight
                let weightSum = 0;
                for (let i = 0; i < recentGrades.length - 1; i++) {
                    const weight = recentGrades.length - 1 - i;
                    totalSlope += (recentGrades[i] - recentGrades[i + 1]) * weight;
                    weightSum += weight;
                }
                trendSlope = totalSlope / weightSum;
            }

            // Calculate probability based on gap, time, and efficiency
            let probability = 50;
            if (improvementRate > 1.2) probability += 20;
            if (improvementRate < 0.8) probability -= 20;
            if (gradeGap >= 4) probability -= 30; // Too big of a gap
            if (gradeGap <= 1) probability += 20;
            
            // Adjust probability based on trend
            if (trendSlope < -0.5) probability += 15; // Improving
            else if (trendSlope > 0.5) probability -= 15; // Declining
            
            probability = Math.max(10, Math.min(95, Math.round(probability)));

            const bottlenecks = [];
            
            if (gradeGap >= 3) bottlenecks.push("현재 등급과 목표 등급 간의 격차가 커서 학습량 부담이 높습니다.");
            if (improvementRate < 0.9) bottlenecks.push("학습 효율성 저하로 성적 향상 속도가 더딜 수 있습니다.");
            if (student.weakSubject === subjectInfo.id) bottlenecks.push("취약 과목으로 지정되어 있어 개념 보완에 더 많은 시간이 필요합니다.");
            
            if (trendSlope > 0.5) bottlenecks.push("최근 성적 하락 추세가 감지되었습니다. 학습 방법 점검이 필요합니다.");
            else if (trendSlope < -0.5) bottlenecks.push("최근 성적이 상승 추세입니다! 현재 학습 페이스를 유지하세요.");
            
            if (subjectData.subunits) {
                const weakUnits = Object.entries(subjectData.subunits)
                    .filter(([_, data]) => data.score / (data.maxScore || 100) < 0.6)
                    .map(([name]) => name);
                if (weakUnits.length > 0) {
                    bottlenecks.push(`세부 단원 분석: [${weakUnits.join(', ')}] 파트의 오답률이 높아 이 부분만 보완해도 점수 향상 확률이 크게 올라갑니다.`);
                    probability += 10; // 알고 있는 약점이 있으므로 보완시 확률 상승
                }
            }

            if (bottlenecks.length === 0) bottlenecks.push("특별한 병목 요인 없이 안정적인 성적 향상이 기대됩니다.");

            // 통합: 신체/자율신경계 기반 CareType 추출
            const careType = assessment?.careType;
            let careTypePrefix = "";

            if (careType === CareType.BURNOUT) {
                careTypePrefix = "현재 번아웃(Burnout) 상태이므로 과도한 목표보다는 기존 목표량의 50% 수준으로 조정하고, ";
            } else if (careType === CareType.BRAIN_FATIGUE) {
                careTypePrefix = "뇌 피로(Brain Fatigue)가 높은 상태이므로 태블릿, 스마트폰 등 디지털 기기 사용을 최소화하고 종이 교재 위주로 ";
            } else if (careType === CareType.ADRENAL) {
                careTypePrefix = "부신 피로로 인해 에너지 변동이 심하므로 무리한 계획보다는 컨디션이 좋은 시간에 집중하여, ";
            } else if (careType === CareType.SLEEP) {
                careTypePrefix = "수면 부족으로 장기 기억 전환에 불리합니다. 무조건 학습 시간을 늘리기보다 충분한 수면을 우선 확보하면서 ";
            } else if (careType === CareType.ANXIETY_TENSION) {
                careTypePrefix = "긴장과 불안도가 높으므로 결과에 대한 압박감을 내려놓고, '5분만 해보자'는 전략으로 부담 없이 시작하여, ";
            }

            const recommendations = [];
            recommendations.push(`[과목별 전략] ${careTypePrefix}${subjectStrategy}`);

            projections.push({
                subjectId,
                subjectName: subjectInfo.name,
                currentGrade,
                targetGrade,
                trajectory,
                probability,
                bottlenecks,
                recommendations
            });
        }

        let overallAdvice = "";
        if (overallMultiplier >= 1.2) {
            overallAdvice = "인지 성능과 학습 효율성이 매우 우수합니다. 현재의 학습 패턴을 유지하면서 고난도 문항에 도전하여 상위권 도약을 노려볼 수 있습니다.";
        } else if (overallMultiplier >= 0.9) {
            overallAdvice = "전반적인 학습 기반이 안정적입니다. 가장 부담되는 과목(Focus Subject)에 시간 투자를 15~20% 늘리면 목표 달성 확률이 크게 상승합니다.";
        } else {
            overallAdvice = "단순한 학습 시간 늘리기보다는 '학습 효율성' 개선이 우선되어야 합니다. 수면 관리, 스트레스 조절 및 뇌 피로도 관리를 병행하세요.";
        }

        const globalStrategiesSet = new Set<string>();

        // Add grade strategies to global
        projections.forEach(p => {
            if (p.currentGrade >= 7) {
                globalStrategiesSet.add("[7~9등급 공통] 기초가 부족한 상태이므로 기출문제 풀이보다는 교과서와 기본서 위주의 기초 개념 확립에 집중하세요.");
            } else if (p.currentGrade >= 4) {
                globalStrategiesSet.add("[4~6등급 공통] 자주 틀리는 취약 유형과 빈출 유형을 파악하여 집중적으로 보완하는 학습이 필요합니다.");
            } else {
                globalStrategiesSet.add("[1~3등급 공통] 실수를 줄이고 고난도(킬러) 문항 대비 및 실전 모의고사를 통한 시간 안배 연습에 집중하세요.");
            }
        });

        // Add cognitive strategies to global
        if (focusCapacity < 0.8) {
            globalStrategiesSet.add("[집중력 보완] 뽀모도로 테크닉(25분 집중, 5분 휴식) 등 짧은 주기의 집중 훈련이 필요합니다.");
        }
        if (memoryCapacity < 0.8) {
            globalStrategiesSet.add("[작업기억 보완] 개념을 청크(Chunk) 단위로 묶어서 암기하고, 마인드맵을 활용하세요.");
        }
        if (learningEfficiency < 0.8) {
            globalStrategiesSet.add("[메타인지 보완] 오답노트를 반드시 작성하고, '왜 틀렸는지' 원인을 분석하는 훈련이 필요합니다.");
        }

        const globalStrategies = Array.from(globalStrategiesSet);

        return {
            months,
            projections,
            overallAdvice,
            globalStrategies
        };
    }
}
