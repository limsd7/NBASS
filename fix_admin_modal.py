
import re

file_path = 'c:/SN1/App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Inline Definition
# Pattern: const AdminPasswordModal = () => \(.*?^\s*\);
# Dotall mode
pattern_def = re.compile(r'^\s*const AdminPasswordModal = \(\) => \(.*?\n\s*\);', re.MULTILINE | re.DOTALL)
content = pattern_def.sub('', content)

# 2. Replace Usage in Dashboard Return
# Pattern: <AdminPasswordModal />
# We need to inject the props.
props = " isOpen={showAdminPassword} password={adminPasswordInput} onPasswordChange={setAdminPasswordInput} onConfirm={handleAdminUnlock} onCancel={() => { setShowAdminPassword(false); setAdminPasswordInput(''); }} "
content = content.replace('<AdminPasswordModal />', f'<AdminPasswordModal{props}/>')

# 3. Replace Markup Usage at the bottom
# Pattern: {showAdminPassword && \(.*?^\s*\)}
# This is tricky because of nested braces maybe?
# But looking at the code:
# {showAdminPassword && (
#   <div ...
#     ...
#   </div>
# )}
pattern_markup = re.compile(r'\{showAdminPassword && \(\s*<div.*?className="fixed inset-0.*?<\/div>\s*<\/div>\s*\)\}', re.MULTILINE | re.DOTALL)

# We want to replace this with the component usage.
# But wait, logic suggests we should just use the same component call.
# <AdminPasswordModal ... />
# However, the markup was conditional: {showAdminPassword && ...}
# The component itself has `if (!isOpen) return null;` inside it.
# So we can just put `<AdminPasswordModal ... />` directly, WITHOUT the {showAdminPassword && ...} wrapper if the component handles it.
# Check AdminPasswordModal.tsx:
# if (!isOpen) return null;
# Yes it does!
# So we can replace the whole `{showAdminPassword && ( ... )}` block with just `<AdminPasswordModal ... />`.

replacement = f'<AdminPasswordModal{props}/>'
content = pattern_markup.sub(replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminPasswordModal fixed.")
