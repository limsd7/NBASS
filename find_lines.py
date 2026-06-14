
with open('c:/SN1/App.tsx', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if "activeMenu === 'dashboard'" in line:
            print(f"Found dashboard at line {i+1}")
        if "const AdminPasswordModal = () => (" in line:
            print(f"Found AdminPasswordModal Def at line {i+1}")
