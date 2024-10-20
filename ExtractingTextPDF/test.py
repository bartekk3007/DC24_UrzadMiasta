import pymupdf
doc = pymupdf.open('wniosekUMPtaszek.pdf')
text = ""
for page in doc:
   text+=page.get_text()
print(text)

file = open('content.txt', 'w', encoding="utf-8")
file.write(text)
file.close()