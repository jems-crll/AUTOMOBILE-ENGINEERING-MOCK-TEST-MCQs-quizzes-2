import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''          questions: selected,
          languageName: selectedLanguage.name,
          languageState: selectedLanguage.state
        })''',
'''          questions: selected,
          languageName: selectedLanguage.name,
          languageState: selectedLanguage.state,
          languageCode: selectedLanguage.code
        })'''
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Done")
