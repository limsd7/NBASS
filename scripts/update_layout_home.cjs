const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

// Replace all occurrences of `<Layout ` to include onHomeClick
code = code.replace(/<Layout\b(?![^>]*\bonHomeClick\b)/g, '<Layout onHomeClick={() => setStep("role_selection")}');

fs.writeFileSync('App.tsx', code, 'utf8');
console.log('LAYOUT_UPDATED_SUCCESS');
