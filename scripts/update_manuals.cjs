const fs = require('fs');
const path = require('path');

const dir = path.join('c:/SN1', 'public', 'resources');

// 1. Create the 5 new HTML manuals
const template = (title, content) => `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
        .section { background: #eef2ff; padding: 20px; margin: 20px 0; border-radius: 12px; border-left: 5px solid #4f46e5; }
        @media print { .no-print { display: none; } }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${content}
    <div class="no-print" style="position:fixed;bottom:20px;right:20px;background:#4f46e5;color:white;padding:15px 20px;border-radius:10px;cursor:pointer;" onclick="window.print()">
        인쇄 / PDF 저장
    </div>
</body>
</html>`;

const newFiles = {
    'mind_map_guide.html': [
        '마인드맵 작성 가이드',
        '<div class="section"><h2>1. 중심 주제 설정</h2><p>종이 한가운데에 핵심 주제나 키워드를 적습니다.</p></div><div class="section"><h2>2. 가지 뻗기</h2><p>중심 주제에서 방사형으로 관련된 아이디어(가지)를 뻗어나갑니다.</p></div><div class="section"><h2>3. 키워드 사용</h2><p>긴 문장보다 짧고 핵심적인 단어를 사용하세요.</p></div>'
    ],
    'self_care_guide.html': [
        '12가지 셀프 케어 방법',
        '<div class="section"><h2>신체적 케어</h2><p>1. 충분한 수면<br>2. 영양가 있는 식사<br>3. 규칙적인 운동</p></div><div class="section"><h2>정서적 케어</h2><p>4. 감사 일기 쓰기<br>5. 거절하는 법 배우기<br>6. 취미 생활 즐기기</p></div><div class="section"><h2>정신적 케어</h2><p>7. 독서하기<br>8. 디지털 디톡스<br>9. 명상하기</p></div><div class="section"><h2>사회적 케어</h2><p>10. 좋은 사람들과 시간 보내기<br>11. 도움 요청하기<br>12. 경계선 설정하기</p></div>'
    ],
    'vitamin_d_guide.html': [
        '비타민 D 결핍 증상 가이드',
        '<div class="section"><h2>주요 증상</h2><p>- 잦은 피로감과 무기력증<br>- 뼈와 등 아랫부분의 통증<br>- 우울감 및 감정 기복<br>- 상처 회복 지연<br>- 잦은 감기 및 면역력 저하</p></div><div class="section"><h2>관리 방법</h2><p>- 하루 15~20분 햇볕 쬐기<br>- 연어, 계란 노른자 등 비타민 D 풍부한 음식 섭취<br>- 필요시 영양제 보충</p></div>'
    ],
    'spending_time_alone_guide.html': [
        '혼자만의 시간을 가지는 것의 장단점',
        '<div class="section"><h2>장점 (Pros)</h2><p>- 자기 성찰과 자아 발견의 시간<br>- 창의성 향상<br>- 타인의 시선에서 벗어난 진정한 휴식<br>- 독립심과 자존감 강화</p></div><div class="section"><h2>단점 (Cons)</h2><p>- 고립감이나 외로움 유발 가능성<br>- 사회적 기술 저하 우려<br>- 과도한 자기비판에 빠질 위험</p></div><div class="section"><h2>결론</h2><p>사회적 상호작용과 혼자만의 시간 사이의 건강한 균형을 찾는 것이 가장 중요합니다.</p></div>'
    ],
    'blood_flow_foods.html': [
        '혈액순환 촉진 음식 가이드',
        '<div class="section"><h2>1. 마늘과 양파</h2><p>혈관을 확장시키고 혈액 흐름을 개선하는데 탁월합니다.</p></div><div class="section"><h2>2. 비트와 석류</h2><p>산화질소가 풍부하여 혈관을 이완시키고 혈압을 낮춰줍니다.</p></div><div class="section"><h2>3. 등푸른 생선</h2><p>오메가-3 지방산이 풍부하여 혈전 생성을 막고 혈관 건강을 보호합니다.</p></div><div class="section"><h2>4. 녹황색 채소</h2><p>시금치, 케일 등은 혈액 순환을 돕는 필수 비타민과 미네랄이 풍부합니다.</p></div><div class="section"><h2>5. 감귤류와 베리류</h2><p>항산화 성분이 풍부하여 혈관 내 염증을 줄여줍니다.</p></div>'
    ]
};

for (const [fn, [title, content]] of Object.entries(newFiles)) {
    fs.writeFileSync(path.join(dir, fn), template(title, content), 'utf8');
}
console.log('Created 5 manual files.');

// 2. Update the Print CSS for all HTML files
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const printStyle = `
    <style id="medical-print-style">
        @media print {
            @page {
                margin: 1.5cm;
                size: A4 portrait;
            }
            body {
                background: white !important;
                color: black !important;
                font-family: 'Malgun Gothic', 'Noto Sans KR', sans-serif !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print { display: none !important; }
            .medical-header {
                display: block !important;
                border-bottom: 3px solid #1e3a8a;
                padding-bottom: 15px;
                margin-bottom: 30px;
            }
            .medical-header .clinic-name {
                font-size: 24px;
                font-weight: 900;
                color: #1e3a8a;
                letter-spacing: -0.5px;
            }
            .medical-header .doc-type {
                font-size: 14px;
                color: #64748b;
                margin-top: 5px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .patient-info {
                display: flex !important;
                border: 2px solid #cbd5e1;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 30px;
                gap: 20px;
            }
            .patient-info div {
                flex: 1;
                font-size: 13px;
                border-right: 1px solid #e2e8f0;
            }
            .patient-info div:last-child {
                border-right: none;
            }
            .patient-info strong {
                display: inline-block;
                width: 60px;
                color: #475569;
            }
            .patient-info span {
                display: inline-block;
                width: 120px;
                border-bottom: 1px solid #94a3b8;
            }
            .checkbox-item {
                border: 1px solid #cbd5e1 !important;
                break-inside: avoid;
                margin-bottom: 5px !important;
                padding: 10px !important;
            }
            h1 { font-size: 22px !important; color: #0f172a !important; border-bottom: none !important; margin-top:0; }
            h2 { font-size: 18px !important; color: #1e293b !important; margin-top: 25px !important; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .medical-footer {
                display: block !important;
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 11px;
                color: #94a3b8;
                border-top: 1px solid #e2e8f0;
                padding-top: 10px;
            }
        }
        @media screen {
            .medical-header, .patient-info, .medical-footer { display: none !important; }
        }
    </style>
`;

const headerHtml = `
    <div class="medical-header">
        <div class="clinic-name">마음-몸 연결 전문가 가이드</div>
        <div class="doc-type">Expert Clinical Guidelines & Assessment</div>
    </div>
    <div class="patient-info">
        <div><strong>Name</strong> <span></span></div>
        <div><strong>Chart No</strong> <span></span></div>
        <div><strong>Date</strong> <span></span></div>
    </div>
`;

const footerHtml = `
    <div class="medical-footer">
        CONFIDENTIAL & PRIVILEGED CLINICAL DOCUMENT<br>
        이 문서는 마음-몸 연결 전문가 시스템에서 생성된 공식 임상 가이드입니다.
    </div>
`;

let updatedCount = 0;
files.forEach(file => {
    const filePath = path.join(dir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Remove old @media print and medical blocks
    html = html.replace(/<style id="medical-print-style">[\s\S]*?<\/style>/, '');
    html = html.replace(/<div class="medical-header">[\s\S]*?<\/div>\s*<div class="patient-info">[\s\S]*?<\/div>/, '');
    html = html.replace(/<div class="medical-footer">[\s\S]*?<\/div>/, '');
    
    // Inject CSS before </head>
    html = html.replace('</head>', printStyle + '\n</head>');
    
    // Inject Header after <body>
    html = html.replace(/<body[^>]*>/i, match => match + '\n' + headerHtml);
    
    // Inject Footer before </body>
    html = html.replace('</body>', footerHtml + '\n</body>');
    
    fs.writeFileSync(filePath, html, 'utf8');
    updatedCount++;
});

console.log('Successfully updated ' + updatedCount + ' HTML files with medical print template.');
