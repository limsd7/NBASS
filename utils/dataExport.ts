import { AssessmentResult } from '../types';

export const exportToJSON = (data: (AssessmentResult & { date: string })[], filename?: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `mind-body-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const exportToCSV = (data: (AssessmentResult & { date: string })[], filename?: string) => {
    if (data.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }

    // CSV 헤더
    const headers = [
        '날짜',
        '이름',
        '나이',
        '성별',
        '진단 유형',
        '점수',
        'BAI',
        'ISI',
        '집중력',
        'Brain Score',
        'SNS',
        'PNS',
        '피로도',
        '활력도'
    ];

    // CSV 행 데이터
    const rows = data.map(record => [
        new Date(record.date).toLocaleString('ko-KR'),
        record.student.name,
        record.student.age,
        record.student.gender === 'Male' ? '남성' : '여성',
        record.careType,
        record.score,
        record.survey.bai,
        record.survey.isi,
        record.survey.concentrationScore,
        record.hrv.brainScore,
        record.hrv.sns,
        record.hrv.pns,
        record.hrv.fatigue,
        record.hrv.vitality
    ]);

    // CSV 문자열 생성
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // BOM 추가 (Excel에서 한글 깨짐 방지)
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `mind-body-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<(AssessmentResult & { date: string })[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);

                // 데이터 검증
                if (!Array.isArray(data)) {
                    throw new Error('올바른 형식이 아닙니다. 배열 형태의 데이터가 필요합니다.');
                }

                // 각 항목이 필수 필드를 가지고 있는지 확인
                const isValid = data.every(item =>
                    item &&
                    typeof item === 'object' &&
                    'student' in item &&
                    'careType' in item &&
                    'date' in item
                );

                if (!isValid) {
                    throw new Error('데이터 형식이 올바르지 않습니다.');
                }

                resolve(data);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
        reader.readAsText(file);
    });
};
