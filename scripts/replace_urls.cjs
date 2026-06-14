const fs = require('fs');

let c = fs.readFileSync('c:/SN1/components/ExpertOverlay.tsx', 'utf8');

const replacements = [
    {
        url: 'https://www.healthline.com/nutrition/foods-that-increase-blood-flow',
        newUrl: '/resources/blood_flow_foods.html'
    },
    {
        url: 'https://www.psychologytoday.com/us/blog/click-here-happiness/201812/self-care-12-ways-take-better-care-yourself',
        newUrl: '/resources/self_care_guide.html'
    },
    {
        url: 'https://www.mindmeister.com/blog/how-to-mind-map/',
        newUrl: '/resources/mind_map_guide.html'
    },
    {
        url: 'https://www.healthline.com/nutrition/vitamin-d-deficiency-symptoms',
        newUrl: '/resources/vitamin_d_guide.html'
    },
    {
        url: 'https://www.psychologytoday.com/us/blog/fulfillment-any-age/201209/the-pros-and-cons-spending-time-alone',
        newUrl: '/resources/spending_time_alone_guide.html'
    }
];

replacements.forEach(r => {
    // We are looking for something like:
    // type: 'link',
    // icon: '🔗',
    // description: '...',
    // url: 'https://...'
    
    // We use a regex to match the block up to the url
    const regex = new RegExp(`type:\\s*'link',(\\s*)icon:\\s*'🔗',(\\s*)description:\\s*'([^']+)',(\\s*)url:\\s*'${r.url.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')}'`, 'g');
    
    c = c.replace(regex, `type: 'pdf',$1icon: '📄',$2description: '$3 (오프라인 지원)',$4url: '${r.newUrl}'`);
});

fs.writeFileSync('c:/SN1/components/ExpertOverlay.tsx', c, 'utf8');
console.log('Replaced URLs in ExpertOverlay.tsx');
