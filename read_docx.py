import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from docx import Document
doc = Document(r'C:\Users\user\Desktop\electronic-journal\курсовой.docx')
for p in doc.paragraphs:
    if p.text.strip():
        print(p.text)
