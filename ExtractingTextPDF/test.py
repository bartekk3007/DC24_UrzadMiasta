import pymupdf
import json
doc = pymupdf.open('wniosekUMPusty.pdf')
text = ""
for page in doc:
   text+=page.get_text()
# print(text)

file = open('content.txt', 'w', encoding="utf-8")
file.write(text)
file.close()

schema = {
   "$schema" : "https://json-schema.org/draft/2020-12/schema",
   "title" : "Wniosek o dowód osobisty",
   "type" : "object",
   "properties" : {},
   "required" : []
}

schema["properties"]["Miejscowość i data"] = {
   "type": "string"
}
schema["required"].append("Miejscowość i data")

lines = text.split('\n')
for line in lines:
   key_value = line.split(':', 1)
   if len(key_value) == 2:
      key = key_value[0]
      value = key_value[1].replace('…','').replace('.','').replace(':','').replace('-','').strip()
      if key_value[0] != "inny" and key_value[0] != "Fotografia załączona razem z wnioskiem":
         if value:
            schema["properties"][key] = {
               "type": "string",
               "description": value
            }
         else:
            schema["properties"][key] = {
               "type": "string",
            }
         if "opcjonalny" not in key:
            schema["required"].append(key)

schema["properties"]["Powód złożenia wniosku"] = {
   "type": "string",
   "description" : "Pierwszy dowód / Zmiana danych osobowych / Upływ terminu ważności dowodu / "
                   "Zagubienie/utrata dowodu / Uszkodzenie dowodu / Kradzież tożsamości / inne"
}
schema["required"].append("Powód złożenia wniosku")

schema["properties"]["Fotografia"] = {
   "type": "string",
   "description" : "Fotografia dostarczona przez email / Fotografia załączona razem z wnioskiem"
}
schema["required"].append("Fotografia")

schema["properties"]["Czytelny podpis urzędnika"] = {
   "type": "string"
}
schema["required"].append("Czytelny podpis urzędnika")

schema["properties"]["Czytelny podpis wnioskodawcy"] = {
   "type": "string"
}
schema["required"].append("Czytelny podpis wnioskodawcy")

print(schema)
print(json.dumps(schema, indent=2, ensure_ascii=False))  # Wyświetlenie struktury JSON
with open('schemaFile.json', 'w', encoding='utf-8') as json_file:
   json.dump(schema, json_file, indent=2, ensure_ascii=False)


'''
# Przykład: podziel tekst na linie i utwórz strukturę JSON
lines = text.split('\n')
json_schema = {
   "typeąę": "object",
   "properties": {}
}

for line in lines:
   key_value = line.split(':', 1)  # Zakładając, że dane są w formacie "klucz: wartość"
   if len(key_value) == 2:
      key = key_value[0].strip()
      value = key_value[1].strip()
      json_schema["properties"][key] = {
         "type": "string",
         "description": value
      }

print(json.dumps(json_schema, indent=2, ensure_ascii=False))  # Wyświetlenie struktury JSON
with open('output_schema.json', 'w', encoding='utf-8') as json_file:
   json.dump(json_schema, json_file, indent=2, ensure_ascii=False)
'''