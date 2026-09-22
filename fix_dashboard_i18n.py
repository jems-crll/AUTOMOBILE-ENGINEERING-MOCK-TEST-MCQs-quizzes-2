import re

with open('src/components/Dashboard.tsx', 'r', encoding='utf-8') as f:
    dashboard = f.read()

dashboard = dashboard.replace('isMarathi ?', 'selectedLanguage.code === "mr" ?')

with open('src/components/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(dashboard)

print("Replaced isMarathi with selectedLanguage.code")
