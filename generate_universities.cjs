const fs = require("fs");

const univNames = [
    "서울대학교", "연세대학교", "고려대학교", "서강대학교", "성균관대학교", "한양대학교",
    "중앙대학교", "경희대학교", "한국외국어대학교", "서울시립대학교", "이화여자대학교",
    "건국대학교", "동국대학교", "홍익대학교", "숙명여자대학교", "국민대학교", "숭실대학교",
    "세종대학교", "단국대학교", "광운대학교", "명지대학교", "상명대학교", "가톨릭대학교",
    "가천대학교", "인하대학교", "아주대학교", "경기대학교", "항공대학교", "경북대학교",
    "부산대학교", "전남대학교", "충남대학교", "충북대학교", "전북대학교", "강원대학교",
    "제주대학교", "경상국립대학교", "부경대학교", "한국해양대학교", "한동대학교", "포항공과대학교",
    "한국과학기술원(KAIST)", "광주과학기술원(GIST)", "대구경북과학기술원(DGIST)", "울산과학기술원(UNIST)"
];

const depts = [
    { name: "컴퓨터공학부", p: 94 },
    { name: "기계공학과", p: 92 },
    { name: "전자공학과", p: 93 },
    { name: "화학공학과", p: 91 },
    { name: "신소재공학과", p: 90 },
    { name: "건축학과", p: 88 },
    { name: "산업공학과", p: 89 },
    { name: "경영학과", p: 95 },
    { name: "경제학과", p: 94 },
    { name: "정치외교학과", p: 93 },
    { name: "행정학과", p: 92 },
    { name: "사회학과", p: 91 },
    { name: "심리학과", p: 92 },
    { name: "국어국문학과", p: 89 },
    { name: "영어영문학과", p: 90 },
    { name: "사학과", p: 88 },
    { name: "철학과", p: 87 },
    { name: "의예과", p: 99 },
    { name: "치의예과", p: 98 },
    { name: "한의예과", p: 97 },
    { name: "약학과", p: 96 },
    { name: "수의예과", p: 96 },
    { name: "간호학과", p: 85 },
    { name: "교육학과", p: 90 },
    { name: "국어교육과", p: 89 },
    { name: "수학교육과", p: 91 },
    { name: "체육교육과", p: 85 }
];

function getGrade(percentile) {
    if (percentile >= 96) return 1;
    if (percentile >= 89) return 2;
    if (percentile >= 77) return 3;
    if (percentile >= 60) return 4;
    if (percentile >= 40) return 5;
    return 6;
}

const universities = [];

univNames.forEach((name, i) => {
    let tierModifier = 0;
    if (i < 3) tierModifier = 4;
    else if (i < 10) tierModifier = 2;
    else if (i < 20) tierModifier = 0;
    else if (i > 39) tierModifier = 5;
    else tierModifier = -3;

    const numDepts = Math.floor(Math.random() * 17) + 10;
    const shuffledDepts = [...depts].sort(() => 0.5 - Math.random());
    const selectedDepts = shuffledDepts.slice(0, numDepts);

    const departments = selectedDepts.map(d => {
        let baseP = Math.min(99.5, d.p + tierModifier + (Math.random() * 2 - 1));
        let g = getGrade(baseP);
        return {
            name: d.name,
            targetPercentile: {
                korean: parseFloat(baseP.toFixed(1)),
                math: parseFloat(Math.min(99.5, baseP + 1).toFixed(1)),
                english: parseFloat(baseP.toFixed(1)),
            },
            targetGrades: {
                korean: g,
                math: getGrade(baseP + 1),
                english: g
            }
        };
    });

    universities.push({
        id: "univ_" + i,
        name: name,
        departments: departments
    });
});

const fileContent = `export interface DepartmentTarget {
    name: string;
    targetPercentile: {
        korean: number;
        math: number;
        english: number;
        [subjectId: string]: number;
    };
    targetGrades: {
        korean: number;
        math: number;
        english: number;
        [subjectId: string]: number;
    };
}

export interface University {
    id: string;
    name: string;
    departments: DepartmentTarget[];
}

export const UNIVERSITIES: University[] = ${JSON.stringify(universities, null, 4)};
`;

fs.writeFileSync("c:/SN1/data/universities.ts", fileContent, "utf8");
console.log("universities.ts generated.");
