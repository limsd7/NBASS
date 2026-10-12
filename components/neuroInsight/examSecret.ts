// Exam-strategy text extraction (moved verbatim; no logic change)
export const parseExamStrategy = (analysisText: string) => {
    // Check for exam strategy section (새로운 형식: ## 📈 수험생 실전 전략)
    const hasExamStrategy = analysisText.includes('## 📈 수험생 실전 전략');
    let examDayContent = '';
    let vulnerableTimeContent = '';

    if (hasExamStrategy) {
        // Extract the entire exam strategy section
        // 정규식 수정: 다음 섹션 헤더(##) 또는 구분선(---) 또는 끝($)까지 캡처
        const examMatch = analysisText.match(/##\s*📈\s*수험생\s*실전\s*전략[^\n]*\n([\s\S]*?)(?=##|---| \n\n\n|$)/);
        if (examMatch) {
            const fullContent = examMatch[1];

            // D-Day 전략 추출
            const dayMatch = fullContent.match(/🎯 \*\*시험 당일 전략[^\n]*\*\*\n([\s\S]*?)(?=⏰ |$)/);
            if (dayMatch) {
                examDayContent = dayMatch[0].trim();
            }

            // 취약 시간대 전략 추출
            const timeMatch = fullContent.match(/⏰ \*\*취약 시간대[^\n]*\*\*\n([\s\S]*)/);
            if (timeMatch) {
                vulnerableTimeContent = timeMatch[0].trim();
            }
        }
    }
    return { hasExamStrategy, examDayContent, vulnerableTimeContent };
};