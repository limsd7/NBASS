const fs = require('fs');
const lines = fs.readFileSync('components/modals/ConfigModal.tsx', 'utf8').split(/\r?\n/);

// Remove the orphan line 805 `<div className="p-4 border rounded-xl bg-white shadow-sm">`
// Index 804 in 0-based indexing
if (lines[804].includes('p-4 border rounded-xl bg-white shadow-sm')) {
    lines.splice(804, 1);
    fs.writeFileSync('components/modals/ConfigModal.tsx', lines.join('\n'), 'utf8');
    console.log('REMOVED_EXTRA_DIV');
} else {
    console.log('EXTRA_DIV_NOT_FOUND', lines[804]);
}
