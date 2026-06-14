import sys

# Try different encodings
encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']

content = None
for enc in encodings:
    try:
        with open('c:/SN1/App.tsx', 'r', encoding=enc, errors='ignore') as f:
            content = f.read()
        print(f"Successfully read with {enc}")
        break
    except:
        continue

if content:
    # Fix broken Korean strings - use simple replacements
    import re
    
    # Fix preferredLocation line
    content = re.sub(r"preferredLocation:\s*'[^']*'", "preferredLocation: '독서실'", content)
    
    # Fix GRADE_OPTIONS
    content = re.sub(r'"[^"]*\s*1[^"]*년"', '"중등 1학년"', content, count=1)
    content = re.sub(r'"[^"]*\s*2[^"]*년"', '"중등 2학년"', content, count=1)
    content = re.sub(r'"[^"]*\s*3[^"]*년"', '"중등 3학년"', content, count=1)
    
    # Write back as UTF-8
    with open('c:/SN1/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Fixed Korean strings in App.tsx")
else:
    print("Could not read file with any encoding")
