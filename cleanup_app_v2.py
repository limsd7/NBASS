import os

file_path = 'c:/SN1/App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_mode = False
skip_age = False

for i, line in enumerate(lines):
    # Detect start of Legacy ConfigModal garbage
    if 'showConfig ? (' in line and 'ConfigModal_Legacy' not in lines[i-1] and i > 500 and i < 700:
       # We found the floating block start around line 569
       # Double check context
       if '<div className="fixed inset-0' in lines[i+1]:
           print(f"Skipping Legacy Modal Block starting at line {i+1}")
           skip_mode = True

    # Detect end of Legacy ConfigModal garbage
    if skip_mode and line.strip() == ');':
        # Check next line is useEffect
        if i+2 < len(lines) and 'useEffect(()' in lines[i+2]:
             print(f"Ended Legacy Modal Block at line {i+1}")
             skip_mode = False
             continue # Skip the closing );

    # Detect local calculateAge
    if 'const calculateAge = (birthDate: string) => {' in line:
        print(f"Skipping duplicate calculateAge at line {i+1}")
        skip_age = True
    
    if skip_age and line.strip() == '}' and i+1 < len(lines) and 'const handleBirthDateChange' in lines[i+2]: # Assuming handleBirthDateChange follows
         print(f"Ended duplicate calculateAge at line {i+1}")
         skip_age = False
         continue

    if not skip_mode and not skip_age:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Cleanup complete.")
