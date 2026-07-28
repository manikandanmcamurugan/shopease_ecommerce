import re
import sys

path = r'c:\Users\mk848\OneDrive\Desktop\jrm\e-commerce\demo2\src\pages\Products\Products.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

main_match = re.search(r'(\s*<main className=\"products-content\">.*?</main>)', content, re.DOTALL)
aside_match = re.search(r'(\s*<aside className=\{`filters-sidebar.*?</aside>)', content, re.DOTALL)

if main_match and aside_match:
    main_text = main_match.group(1)
    aside_text = aside_match.group(1)
    
    # Remove main, then insert it after aside
    content = content.replace(main_text, '')
    content = content.replace(aside_text, aside_text + '\n' + main_text)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Swapped main and aside successfully.")
else:
    print("Failed to find main or aside.")
