export interface DepartmentTarget {
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

export const UNIVERSITIES: University[] = [
    {
        "id": "univ_0",
        "name": "서울대학교",
        "departments": [
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 95.4,
                    "math": 96.4,
                    "english": 95.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 91.6,
                    "math": 92.6,
                    "english": 91.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 97.7,
                    "math": 98.7,
                    "english": 97.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 96.2,
                    "math": 97.2,
                    "english": 96.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 98.8,
                    "math": 99.5,
                    "english": 98.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 97.9,
                    "math": 98.9,
                    "english": 97.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 88.4,
                    "math": 89.4,
                    "english": 88.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 98.9,
                    "math": 99.5,
                    "english": 98.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 93.8,
                    "math": 94.8,
                    "english": 93.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 92.3,
                    "math": 93.3,
                    "english": 92.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 91.3,
                    "math": 92.3,
                    "english": 91.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 94.9,
                    "math": 95.9,
                    "english": 94.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_1",
        "name": "연세대학교",
        "departments": [
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 94,
                    "math": 95,
                    "english": 94
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 98.2,
                    "math": 99.2,
                    "english": 98.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 97.3,
                    "math": 98.3,
                    "english": 97.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 93.7,
                    "math": 94.7,
                    "english": 93.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 96,
                    "math": 97,
                    "english": 96
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 93.1,
                    "math": 94.1,
                    "english": 93.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 99,
                    "math": 99.5,
                    "english": 99
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 94.6,
                    "math": 95.6,
                    "english": 94.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 98.8,
                    "math": 99.5,
                    "english": 98.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 93.5,
                    "math": 94.5,
                    "english": 93.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_2",
        "name": "고려대학교",
        "departments": [
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 91.1,
                    "math": 92.1,
                    "english": 91.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 95.5,
                    "math": 96.5,
                    "english": 95.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 94.2,
                    "math": 95.2,
                    "english": 94.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 92.5,
                    "math": 93.5,
                    "english": 92.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 93.8,
                    "math": 94.8,
                    "english": 93.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 97.9,
                    "math": 98.9,
                    "english": 97.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 92.5,
                    "math": 93.5,
                    "english": 92.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 95,
                    "math": 96,
                    "english": 95
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 94.2,
                    "math": 95.2,
                    "english": 94.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 90.1,
                    "math": 91.1,
                    "english": 90.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_3",
        "name": "서강대학교",
        "departments": [
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 93,
                    "math": 94,
                    "english": 93
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 95,
                    "math": 96,
                    "english": 95
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 97,
                    "math": 98,
                    "english": 97
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 93.5,
                    "math": 94.5,
                    "english": 93.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 94.4,
                    "math": 95.4,
                    "english": 94.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 90.5,
                    "math": 91.5,
                    "english": 90.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 96,
                    "math": 97,
                    "english": 96
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 98.6,
                    "math": 99.5,
                    "english": 98.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 97.2,
                    "math": 98.2,
                    "english": 97.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 98.8,
                    "math": 99.5,
                    "english": 98.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 94.6,
                    "math": 95.6,
                    "english": 94.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_4",
        "name": "성균관대학교",
        "departments": [
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 93.9,
                    "math": 94.9,
                    "english": 93.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 90.1,
                    "math": 91.1,
                    "english": 90.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 96.3,
                    "math": 97.3,
                    "english": 96.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 91.1,
                    "math": 92.1,
                    "english": 91.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 90.3,
                    "math": 91.3,
                    "english": 90.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 98.3,
                    "math": 99.3,
                    "english": 98.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 97.5,
                    "math": 98.5,
                    "english": 97.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99,
                    "math": 99.5,
                    "english": 99
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_5",
        "name": "한양대학교",
        "departments": [
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 93.8,
                    "math": 94.8,
                    "english": 93.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 98.5,
                    "math": 99.5,
                    "english": 98.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 95.1,
                    "math": 96.1,
                    "english": 95.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 89.7,
                    "math": 90.7,
                    "english": 89.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 97.6,
                    "math": 98.6,
                    "english": 97.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 91.1,
                    "math": 92.1,
                    "english": 91.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 95.1,
                    "math": 96.1,
                    "english": 95.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 93.9,
                    "math": 94.9,
                    "english": 93.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 90.3,
                    "math": 91.3,
                    "english": 90.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_6",
        "name": "중앙대학교",
        "departments": [
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 94,
                    "math": 95,
                    "english": 94
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 90.5,
                    "math": 91.5,
                    "english": 90.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 95.1,
                    "math": 96.1,
                    "english": 95.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 89.3,
                    "math": 90.3,
                    "english": 89.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 86.6,
                    "math": 87.6,
                    "english": 86.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 96.1,
                    "math": 97.1,
                    "english": 96.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 95.4,
                    "math": 96.4,
                    "english": 95.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 97,
                    "math": 98,
                    "english": 97
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 96.6,
                    "math": 97.6,
                    "english": 96.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 92.5,
                    "math": 93.5,
                    "english": 92.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_7",
        "name": "경희대학교",
        "departments": [
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 97.3,
                    "math": 98.3,
                    "english": 97.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 97.9,
                    "math": 98.9,
                    "english": 97.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 95.2,
                    "math": 96.2,
                    "english": 95.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 96.2,
                    "math": 97.2,
                    "english": 96.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 88.4,
                    "math": 89.4,
                    "english": 88.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 94.9,
                    "math": 95.9,
                    "english": 94.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 91.9,
                    "math": 92.9,
                    "english": 91.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 90.3,
                    "math": 91.3,
                    "english": 90.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 97.8,
                    "math": 98.8,
                    "english": 97.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_8",
        "name": "한국외국어대학교",
        "departments": [
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 92.8,
                    "math": 93.8,
                    "english": 92.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 92.5,
                    "math": 93.5,
                    "english": 92.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 94.8,
                    "math": 95.8,
                    "english": 94.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 97,
                    "math": 98,
                    "english": 97
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 93.1,
                    "math": 94.1,
                    "english": 93.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 92.8,
                    "math": 93.8,
                    "english": 92.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 94.8,
                    "math": 95.8,
                    "english": 94.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 90.8,
                    "math": 91.8,
                    "english": 90.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 94.9,
                    "math": 95.9,
                    "english": 94.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 93.8,
                    "math": 94.8,
                    "english": 93.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 97.5,
                    "math": 98.5,
                    "english": 97.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 98.3,
                    "math": 99.3,
                    "english": 98.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 87,
                    "math": 88,
                    "english": 87
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 98.6,
                    "math": 99.5,
                    "english": 98.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_9",
        "name": "서울시립대학교",
        "departments": [
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 92.8,
                    "math": 93.8,
                    "english": 92.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 97.2,
                    "math": 98.2,
                    "english": 97.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 96.1,
                    "math": 97.1,
                    "english": 96.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 98.4,
                    "math": 99.4,
                    "english": 98.4
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 95.8,
                    "math": 96.8,
                    "english": 95.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 93.1,
                    "math": 94.1,
                    "english": 93.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.3,
                    "math": 99.5,
                    "english": 99.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 95.2,
                    "math": 96.2,
                    "english": 95.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 95.6,
                    "math": 96.6,
                    "english": 95.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_10",
        "name": "이화여자대학교",
        "departments": [
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 88.4,
                    "math": 89.4,
                    "english": 88.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 95.6,
                    "math": 96.6,
                    "english": 95.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 88.5,
                    "math": 89.5,
                    "english": 88.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 89.9,
                    "math": 90.9,
                    "english": 89.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 98.6,
                    "math": 99.5,
                    "english": 98.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 91.9,
                    "math": 92.9,
                    "english": 91.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_11",
        "name": "건국대학교",
        "departments": [
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 86.5,
                    "math": 87.5,
                    "english": 86.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 84.9,
                    "math": 85.9,
                    "english": 84.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 91.6,
                    "math": 92.6,
                    "english": 91.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 91.7,
                    "math": 92.7,
                    "english": 91.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 92.4,
                    "math": 93.4,
                    "english": 92.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 94.1,
                    "math": 95.1,
                    "english": 94.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 91.9,
                    "math": 92.9,
                    "english": 91.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 97.7,
                    "math": 98.7,
                    "english": 97.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 98.3,
                    "math": 99.3,
                    "english": 98.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 84.4,
                    "math": 85.4,
                    "english": 84.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_12",
        "name": "동국대학교",
        "departments": [
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 88.6,
                    "math": 89.6,
                    "english": 88.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 89.1,
                    "math": 90.1,
                    "english": 89.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 86.7,
                    "math": 87.7,
                    "english": 86.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 90.8,
                    "math": 91.8,
                    "english": 90.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 95.8,
                    "math": 96.8,
                    "english": 95.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 92.7,
                    "math": 93.7,
                    "english": 92.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 94.8,
                    "math": 95.8,
                    "english": 94.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 96.3,
                    "math": 97.3,
                    "english": 96.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 87.3,
                    "math": 88.3,
                    "english": 87.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 89.9,
                    "math": 90.9,
                    "english": 89.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 84,
                    "math": 85,
                    "english": 84
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 88.1,
                    "math": 89.1,
                    "english": 88.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 88.5,
                    "math": 89.5,
                    "english": 88.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_13",
        "name": "홍익대학교",
        "departments": [
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 84.6,
                    "math": 85.6,
                    "english": 84.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 92.3,
                    "math": 93.3,
                    "english": 92.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_14",
        "name": "숙명여자대학교",
        "departments": [
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 92.7,
                    "math": 93.7,
                    "english": 92.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 88.8,
                    "math": 89.8,
                    "english": 88.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 98.3,
                    "math": 99.3,
                    "english": 98.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 97.9,
                    "math": 98.9,
                    "english": 97.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 85.7,
                    "math": 86.7,
                    "english": 85.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 84.9,
                    "math": 85.9,
                    "english": 84.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 94.1,
                    "math": 95.1,
                    "english": 94.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_15",
        "name": "국민대학교",
        "departments": [
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 95.8,
                    "math": 96.8,
                    "english": 95.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 89.1,
                    "math": 90.1,
                    "english": 89.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 88.1,
                    "math": 89.1,
                    "english": 88.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 98.8,
                    "math": 99.5,
                    "english": 98.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 92.7,
                    "math": 93.7,
                    "english": 92.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 90.1,
                    "math": 91.1,
                    "english": 90.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 91.3,
                    "math": 92.3,
                    "english": 91.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 93,
                    "math": 94,
                    "english": 93
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 91.9,
                    "math": 92.9,
                    "english": 91.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_16",
        "name": "숭실대학교",
        "departments": [
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 92.8,
                    "math": 93.8,
                    "english": 92.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 95.1,
                    "math": 96.1,
                    "english": 95.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 95.4,
                    "math": 96.4,
                    "english": 95.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 90.1,
                    "math": 91.1,
                    "english": 90.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 89.1,
                    "math": 90.1,
                    "english": 89.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 91.5,
                    "math": 92.5,
                    "english": 91.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_17",
        "name": "세종대학교",
        "departments": [
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 93.8,
                    "math": 94.8,
                    "english": 93.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 95.2,
                    "math": 96.2,
                    "english": 95.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 96,
                    "math": 97,
                    "english": 96
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 89.7,
                    "math": 90.7,
                    "english": 89.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 85.3,
                    "math": 86.3,
                    "english": 85.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 91.1,
                    "math": 92.1,
                    "english": 91.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 90.8,
                    "math": 91.8,
                    "english": 90.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 89.3,
                    "math": 90.3,
                    "english": 89.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 98.8,
                    "math": 99.5,
                    "english": 98.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 87.2,
                    "math": 88.2,
                    "english": 87.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 94.6,
                    "math": 95.6,
                    "english": 94.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 97.1,
                    "math": 98.1,
                    "english": 97.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 87.2,
                    "math": 88.2,
                    "english": 87.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 89.3,
                    "math": 90.3,
                    "english": 89.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_18",
        "name": "단국대학교",
        "departments": [
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 89.1,
                    "math": 90.1,
                    "english": 89.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 92.8,
                    "math": 93.8,
                    "english": 92.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 85.8,
                    "math": 86.8,
                    "english": 85.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 96.1,
                    "math": 97.1,
                    "english": 96.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 97.8,
                    "math": 98.8,
                    "english": 97.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 88.5,
                    "math": 89.5,
                    "english": 88.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_19",
        "name": "광운대학교",
        "departments": [
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 88.6,
                    "math": 89.6,
                    "english": 88.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 94.1,
                    "math": 95.1,
                    "english": 94.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 89.4,
                    "math": 90.4,
                    "english": 89.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 91.1,
                    "math": 92.1,
                    "english": 91.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 97.4,
                    "math": 98.4,
                    "english": 97.4
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 93.1,
                    "math": 94.1,
                    "english": 93.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 89.1,
                    "math": 90.1,
                    "english": 89.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 90.5,
                    "math": 91.5,
                    "english": 90.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 87.4,
                    "math": 88.4,
                    "english": 87.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 92.2,
                    "math": 93.2,
                    "english": 92.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 91.5,
                    "math": 92.5,
                    "english": 91.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 98,
                    "math": 99,
                    "english": 98
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 96.2,
                    "math": 97.2,
                    "english": 96.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_20",
        "name": "명지대학교",
        "departments": [
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 95.5,
                    "math": 96.5,
                    "english": 95.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 86.7,
                    "math": 87.7,
                    "english": 86.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.2,
                    "math": 82.2,
                    "english": 81.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.3,
                    "math": 89.3,
                    "english": 88.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 88.8,
                    "math": 89.8,
                    "english": 88.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87,
                    "math": 88,
                    "english": 87
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 89.9,
                    "math": 90.9,
                    "english": 89.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.9,
                    "math": 90.9,
                    "english": 89.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 81.5,
                    "math": 82.5,
                    "english": 81.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_21",
        "name": "상명대학교",
        "departments": [
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.1,
                    "math": 86.1,
                    "english": 85.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.3,
                    "math": 82.3,
                    "english": 81.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87.4,
                    "math": 88.4,
                    "english": 87.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 86.1,
                    "math": 87.1,
                    "english": 86.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 81.8,
                    "math": 82.8,
                    "english": 81.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_22",
        "name": "가톨릭대학교",
        "departments": [
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 88.8,
                    "math": 89.8,
                    "english": 88.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.4,
                    "math": 89.4,
                    "english": 88.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84.9,
                    "math": 85.9,
                    "english": 84.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93.3,
                    "math": 94.3,
                    "english": 93.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85.5,
                    "math": 86.5,
                    "english": 85.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 93.7,
                    "math": 94.7,
                    "english": 93.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 85.3,
                    "math": 86.3,
                    "english": 85.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_23",
        "name": "가천대학교",
        "departments": [
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.3,
                    "math": 88.3,
                    "english": 87.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.7,
                    "math": 86.7,
                    "english": 85.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87.2,
                    "math": 88.2,
                    "english": 87.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 96.2,
                    "math": 97.2,
                    "english": 96.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 88.1,
                    "math": 89.1,
                    "english": 88.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 93.8,
                    "math": 94.8,
                    "english": 93.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_24",
        "name": "인하대학교",
        "departments": [
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.9,
                    "math": 85.9,
                    "english": 84.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.7,
                    "math": 90.7,
                    "english": 89.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.1,
                    "math": 91.1,
                    "english": 90.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 87.5,
                    "math": 88.5,
                    "english": 87.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.3,
                    "math": 89.3,
                    "english": 88.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 86.6,
                    "math": 87.6,
                    "english": 86.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.5,
                    "math": 82.5,
                    "english": 81.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 89.3,
                    "math": 90.3,
                    "english": 89.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 86.6,
                    "math": 87.6,
                    "english": 86.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 83,
                    "math": 84,
                    "english": 83
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_25",
        "name": "아주대학교",
        "departments": [
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 88.5,
                    "math": 89.5,
                    "english": 88.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 92.3,
                    "math": 93.3,
                    "english": 92.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.5,
                    "math": 87.5,
                    "english": 86.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 86.1,
                    "math": 87.1,
                    "english": 86.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.5,
                    "math": 82.5,
                    "english": 81.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 89.1,
                    "math": 90.1,
                    "english": 89.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.8,
                    "math": 91.8,
                    "english": 90.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84.4,
                    "math": 85.4,
                    "english": 84.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 89.3,
                    "math": 90.3,
                    "english": 89.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85.7,
                    "math": 86.7,
                    "english": 85.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.1,
                    "math": 91.1,
                    "english": 90.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 85.1,
                    "math": 86.1,
                    "english": 85.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 87.2,
                    "math": 88.2,
                    "english": 87.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.9,
                    "math": 92.9,
                    "english": 91.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.7,
                    "math": 88.7,
                    "english": 87.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.8,
                    "math": 85.8,
                    "english": 84.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_26",
        "name": "경기대학교",
        "departments": [
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.6,
                    "math": 92.6,
                    "english": 91.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 86.4,
                    "math": 87.4,
                    "english": 86.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 95.6,
                    "math": 96.6,
                    "english": 95.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93.3,
                    "math": 94.3,
                    "english": 93.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 82.7,
                    "math": 83.7,
                    "english": 82.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.7,
                    "math": 88.7,
                    "english": 87.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.6,
                    "math": 85.6,
                    "english": 84.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 93,
                    "math": 94,
                    "english": 93
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87.5,
                    "math": 88.5,
                    "english": 87.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.3,
                    "math": 89.3,
                    "english": 88.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 87.7,
                    "math": 88.7,
                    "english": 87.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.2,
                    "math": 82.2,
                    "english": 81.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 89.7,
                    "math": 90.7,
                    "english": 89.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 83.7,
                    "math": 84.7,
                    "english": 83.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 94.6,
                    "math": 95.6,
                    "english": 94.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87.4,
                    "math": 88.4,
                    "english": 87.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_27",
        "name": "항공대학교",
        "departments": [
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.4,
                    "math": 82.4,
                    "english": 81.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87,
                    "math": 88,
                    "english": 87
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 86.5,
                    "math": 87.5,
                    "english": 86.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 95.5,
                    "math": 96.5,
                    "english": 95.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.7,
                    "math": 94.7,
                    "english": 93.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 94.8,
                    "math": 95.8,
                    "english": 94.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84,
                    "math": 85,
                    "english": 84
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 85,
                    "math": 86,
                    "english": 85
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_28",
        "name": "경북대학교",
        "departments": [
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 87.3,
                    "math": 88.3,
                    "english": 87.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 86.2,
                    "math": 87.2,
                    "english": 86.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85,
                    "math": 86,
                    "english": 85
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 84.9,
                    "math": 85.9,
                    "english": 84.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 82.4,
                    "math": 83.4,
                    "english": 82.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.6,
                    "math": 91.6,
                    "english": 90.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 89.4,
                    "math": 90.4,
                    "english": 89.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87,
                    "math": 88,
                    "english": 87
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 87.5,
                    "math": 88.5,
                    "english": 87.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 89.7,
                    "math": 90.7,
                    "english": 89.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 86.1,
                    "math": 87.1,
                    "english": 86.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85.5,
                    "math": 86.5,
                    "english": 85.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 92.8,
                    "math": 93.8,
                    "english": 92.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84.6,
                    "math": 85.6,
                    "english": 84.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_29",
        "name": "부산대학교",
        "departments": [
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.5,
                    "math": 92.5,
                    "english": 91.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85.8,
                    "math": 86.8,
                    "english": 85.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.1,
                    "math": 86.1,
                    "english": 85.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.6,
                    "math": 85.6,
                    "english": 84.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 89.5,
                    "math": 90.5,
                    "english": 89.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.2,
                    "math": 88.2,
                    "english": 87.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_30",
        "name": "전남대학교",
        "departments": [
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.3,
                    "math": 87.3,
                    "english": 86.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.3,
                    "math": 92.3,
                    "english": 91.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 81.2,
                    "math": 82.2,
                    "english": 81.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 94.4,
                    "math": 95.4,
                    "english": 94.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 89.2,
                    "math": 90.2,
                    "english": 89.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 82.1,
                    "math": 83.1,
                    "english": 82.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 89.9,
                    "math": 90.9,
                    "english": 89.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.1,
                    "math": 89.1,
                    "english": 88.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_31",
        "name": "충남대학교",
        "departments": [
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.6,
                    "math": 89.6,
                    "english": 88.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84.5,
                    "math": 85.5,
                    "english": 84.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 90.3,
                    "math": 91.3,
                    "english": 90.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93.5,
                    "math": 94.5,
                    "english": 93.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 94.1,
                    "math": 95.1,
                    "english": 94.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 86,
                    "math": 87,
                    "english": 86
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 82,
                    "math": 83,
                    "english": 82
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 87,
                    "math": 88,
                    "english": 87
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.1,
                    "math": 86.1,
                    "english": 85.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_32",
        "name": "충북대학교",
        "departments": [
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 87.3,
                    "math": 88.3,
                    "english": 87.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 88.6,
                    "math": 89.6,
                    "english": 88.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.3,
                    "math": 85.3,
                    "english": 84.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.8,
                    "math": 86.8,
                    "english": 85.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 83.2,
                    "math": 84.2,
                    "english": 83.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 84.2,
                    "math": 85.2,
                    "english": 84.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.9,
                    "math": 88.9,
                    "english": 87.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.9,
                    "math": 89.9,
                    "english": 88.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 91.7,
                    "math": 92.7,
                    "english": 91.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.9,
                    "math": 94.9,
                    "english": 93.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.8,
                    "math": 88.8,
                    "english": 87.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 86.4,
                    "math": 87.4,
                    "english": 86.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_33",
        "name": "전북대학교",
        "departments": [
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 94.9,
                    "math": 95.9,
                    "english": 94.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 83.2,
                    "math": 84.2,
                    "english": 83.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 91.8,
                    "math": 92.8,
                    "english": 91.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 92.7,
                    "math": 93.7,
                    "english": 92.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 86.7,
                    "math": 87.7,
                    "english": 86.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.2,
                    "math": 87.2,
                    "english": 86.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 81.6,
                    "math": 82.6,
                    "english": 81.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 86.2,
                    "math": 87.2,
                    "english": 86.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 92.5,
                    "math": 93.5,
                    "english": 92.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_34",
        "name": "강원대학교",
        "departments": [
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86,
                    "math": 87,
                    "english": 86
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.1,
                    "math": 86.1,
                    "english": 85.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.3,
                    "math": 85.3,
                    "english": 84.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 97,
                    "math": 98,
                    "english": 97
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 92.7,
                    "math": 93.7,
                    "english": 92.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.2,
                    "math": 89.2,
                    "english": 88.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.7,
                    "math": 92.7,
                    "english": 91.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 88.6,
                    "math": 89.6,
                    "english": 88.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.1,
                    "math": 94.1,
                    "english": 93.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 89.4,
                    "math": 90.4,
                    "english": 89.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 86.1,
                    "math": 87.1,
                    "english": 86.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_35",
        "name": "제주대학교",
        "departments": [
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 82.2,
                    "math": 83.2,
                    "english": 82.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 91,
                    "math": 92,
                    "english": 91
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 86.2,
                    "math": 87.2,
                    "english": 86.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.2,
                    "math": 86.2,
                    "english": 85.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87.2,
                    "math": 88.2,
                    "english": 87.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.5,
                    "math": 87.5,
                    "english": 86.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.4,
                    "math": 89.4,
                    "english": 88.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_36",
        "name": "경상국립대학교",
        "departments": [
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.6,
                    "math": 82.6,
                    "english": 81.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.3,
                    "math": 88.3,
                    "english": 87.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 81.6,
                    "math": 82.6,
                    "english": 81.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 92,
                    "math": 93,
                    "english": 92
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 88.1,
                    "math": 89.1,
                    "english": 88.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 88.7,
                    "math": 89.7,
                    "english": 88.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.5,
                    "math": 91.5,
                    "english": 90.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 87.3,
                    "math": 88.3,
                    "english": 87.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 90.3,
                    "math": 91.3,
                    "english": 90.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85,
                    "math": 86,
                    "english": 85
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_37",
        "name": "부경대학교",
        "departments": [
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 89.6,
                    "math": 90.6,
                    "english": 89.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 81.1,
                    "math": 82.1,
                    "english": 81.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.2,
                    "math": 87.2,
                    "english": 86.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 85.7,
                    "math": 86.7,
                    "english": 85.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 88.3,
                    "math": 89.3,
                    "english": 88.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 87.7,
                    "math": 88.7,
                    "english": 87.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.1,
                    "math": 89.1,
                    "english": 88.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.7,
                    "math": 85.7,
                    "english": 84.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93.3,
                    "math": 94.3,
                    "english": 93.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 82.5,
                    "math": 83.5,
                    "english": 82.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84.9,
                    "math": 85.9,
                    "english": 84.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 92.1,
                    "math": 93.1,
                    "english": 92.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.6,
                    "math": 88.6,
                    "english": 87.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.5,
                    "math": 91.5,
                    "english": 90.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 85.6,
                    "math": 86.6,
                    "english": 85.6
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_38",
        "name": "한국해양대학교",
        "departments": [
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 84.7,
                    "math": 85.7,
                    "english": 84.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 87.7,
                    "math": 88.7,
                    "english": 87.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 84,
                    "math": 85,
                    "english": 84
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.2,
                    "math": 82.2,
                    "english": 81.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 87.9,
                    "math": 88.9,
                    "english": 87.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 95.2,
                    "math": 96.2,
                    "english": 95.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 95,
                    "math": 96,
                    "english": 95
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 93,
                    "math": 94,
                    "english": 93
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 93.3,
                    "math": 94.3,
                    "english": 93.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 88.3,
                    "math": 89.3,
                    "english": 88.3
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 90.3,
                    "math": 91.3,
                    "english": 90.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 86,
                    "math": 87,
                    "english": 86
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 89.8,
                    "math": 90.8,
                    "english": 89.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 87.1,
                    "math": 88.1,
                    "english": 87.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.2,
                    "math": 91.2,
                    "english": 90.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 87.7,
                    "math": 88.7,
                    "english": 87.7
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 84.2,
                    "math": 85.2,
                    "english": 84.2
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_39",
        "name": "한동대학교",
        "departments": [
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 88,
                    "math": 89,
                    "english": 88
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 85.9,
                    "math": 86.9,
                    "english": 85.9
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 81.4,
                    "math": 82.4,
                    "english": 81.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 85.4,
                    "math": 86.4,
                    "english": 85.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 90.9,
                    "math": 91.9,
                    "english": 90.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 93.9,
                    "math": 94.9,
                    "english": 93.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 86.4,
                    "math": 87.4,
                    "english": 86.4
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 91.4,
                    "math": 92.4,
                    "english": 91.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 88.8,
                    "math": 89.8,
                    "english": 88.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 2,
                    "english": 3
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 85.1,
                    "math": 86.1,
                    "english": 85.1
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 86.5,
                    "math": 87.5,
                    "english": 86.5
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 86.8,
                    "math": 87.8,
                    "english": 86.8
                },
                "targetGrades": {
                    "korean": 3,
                    "math": 3,
                    "english": 3
                }
            }
        ]
    },
    {
        "id": "univ_40",
        "name": "포항공과대학교",
        "departments": [
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 96.4,
                    "math": 97.4,
                    "english": 96.4
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 95.8,
                    "math": 96.8,
                    "english": 95.8
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 93,
                    "math": 94,
                    "english": 93
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 98.7,
                    "math": 99.5,
                    "english": 98.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 93.1,
                    "math": 94.1,
                    "english": 93.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 98.5,
                    "math": 99.5,
                    "english": 98.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 98.4,
                    "math": 99.4,
                    "english": 98.4
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 96.8,
                    "math": 97.8,
                    "english": 96.8
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 89,
                    "math": 90,
                    "english": 89
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 99.1,
                    "math": 99.5,
                    "english": 99.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 92.2,
                    "math": 93.2,
                    "english": 92.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 94.9,
                    "math": 95.9,
                    "english": 94.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 97.1,
                    "math": 98.1,
                    "english": 97.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 97.4,
                    "math": 98.4,
                    "english": 97.4
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 96.3,
                    "math": 97.3,
                    "english": 96.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_41",
        "name": "한국과학기술원(KAIST)",
        "departments": [
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 96.5,
                    "math": 97.5,
                    "english": 96.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 94.2,
                    "math": 95.2,
                    "english": 94.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 97.3,
                    "math": 98.3,
                    "english": 97.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 97.3,
                    "math": 98.3,
                    "english": 97.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 95,
                    "math": 96,
                    "english": 95
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 92.9,
                    "math": 93.9,
                    "english": 92.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 94.5,
                    "math": 95.5,
                    "english": 94.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 96.1,
                    "math": 97.1,
                    "english": 96.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 94.6,
                    "math": 95.6,
                    "english": 94.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 93.7,
                    "math": 94.7,
                    "english": 93.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_42",
        "name": "광주과학기술원(GIST)",
        "departments": [
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 97,
                    "math": 98,
                    "english": 97
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 95.6,
                    "math": 96.6,
                    "english": 95.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 96.6,
                    "math": 97.6,
                    "english": 96.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 93.6,
                    "math": 94.6,
                    "english": 93.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 98.3,
                    "math": 99.3,
                    "english": 98.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 97.3,
                    "math": 98.3,
                    "english": 97.3
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 89.4,
                    "math": 90.4,
                    "english": 89.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 96.6,
                    "math": 97.6,
                    "english": 96.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 91.2,
                    "math": 92.2,
                    "english": 91.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 96.7,
                    "math": 97.7,
                    "english": 96.7
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            }
        ]
    },
    {
        "id": "univ_43",
        "name": "대구경북과학기술원(DGIST)",
        "departments": [
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 98.9,
                    "math": 99.5,
                    "english": 98.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 94.3,
                    "math": 95.3,
                    "english": 94.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 97.6,
                    "math": 98.6,
                    "english": 97.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 95.1,
                    "math": 96.1,
                    "english": 95.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 94.4,
                    "math": 95.4,
                    "english": 94.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "체육교육과",
                "targetPercentile": {
                    "korean": 90,
                    "math": 91,
                    "english": 90
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 95,
                    "math": 96,
                    "english": 95
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 93.7,
                    "math": 94.7,
                    "english": 93.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 97.2,
                    "math": 98.2,
                    "english": 97.2
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 89.7,
                    "math": 90.7,
                    "english": 89.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 97.9,
                    "math": 98.9,
                    "english": 97.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 95.6,
                    "math": 96.6,
                    "english": 95.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 93.9,
                    "math": 94.9,
                    "english": 93.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 92.5,
                    "math": 93.5,
                    "english": 92.5
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            }
        ]
    },
    {
        "id": "univ_44",
        "name": "울산과학기술원(UNIST)",
        "departments": [
            {
                "name": "산업공학과",
                "targetPercentile": {
                    "korean": 94.2,
                    "math": 95.2,
                    "english": 94.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "컴퓨터공학부",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "신소재공학과",
                "targetPercentile": {
                    "korean": 94.7,
                    "math": 95.7,
                    "english": 94.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "영어영문학과",
                "targetPercentile": {
                    "korean": 95.3,
                    "math": 96.3,
                    "english": 95.3
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "한의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "기계공학과",
                "targetPercentile": {
                    "korean": 96.9,
                    "math": 97.9,
                    "english": 96.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "수의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "철학과",
                "targetPercentile": {
                    "korean": 92.6,
                    "math": 93.6,
                    "english": 92.6
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "경영학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "행정학과",
                "targetPercentile": {
                    "korean": 97.1,
                    "math": 98.1,
                    "english": 97.1
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "치의예과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "수학교육과",
                "targetPercentile": {
                    "korean": 95.7,
                    "math": 96.7,
                    "english": 95.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "국어교육과",
                "targetPercentile": {
                    "korean": 93.9,
                    "math": 94.9,
                    "english": 93.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "정치외교학과",
                "targetPercentile": {
                    "korean": 98.9,
                    "math": 99.5,
                    "english": 98.9
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "약학과",
                "targetPercentile": {
                    "korean": 99.5,
                    "math": 99.5,
                    "english": 99.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "간호학과",
                "targetPercentile": {
                    "korean": 90.7,
                    "math": 91.7,
                    "english": 90.7
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "교육학과",
                "targetPercentile": {
                    "korean": 95.2,
                    "math": 96.2,
                    "english": 95.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "심리학과",
                "targetPercentile": {
                    "korean": 96.6,
                    "math": 97.6,
                    "english": 96.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "경제학과",
                "targetPercentile": {
                    "korean": 98.5,
                    "math": 99.5,
                    "english": 98.5
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "사회학과",
                "targetPercentile": {
                    "korean": 95.9,
                    "math": 96.9,
                    "english": 95.9
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            },
            {
                "name": "건축학과",
                "targetPercentile": {
                    "korean": 93.4,
                    "math": 94.4,
                    "english": 93.4
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "전자공학과",
                "targetPercentile": {
                    "korean": 97.6,
                    "math": 98.6,
                    "english": 97.6
                },
                "targetGrades": {
                    "korean": 1,
                    "math": 1,
                    "english": 1
                }
            },
            {
                "name": "국어국문학과",
                "targetPercentile": {
                    "korean": 93.2,
                    "math": 94.2,
                    "english": 93.2
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 2,
                    "english": 2
                }
            },
            {
                "name": "화학공학과",
                "targetPercentile": {
                    "korean": 95.1,
                    "math": 96.1,
                    "english": 95.1
                },
                "targetGrades": {
                    "korean": 2,
                    "math": 1,
                    "english": 2
                }
            }
        ]
    }
];
