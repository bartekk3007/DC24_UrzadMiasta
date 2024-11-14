import pymupdf
import json


def generate_schema():
   doc = pymupdf.open('NowyWniosekUM.pdf')
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
      if len(line) > 1 and line[0].isdigit() and line[1] == "." and line[3:] != "Podpis":
         section = line[3:]
         if section != "Dane poprzedniego dowodu osobistego" and section != "Dane dotyczące zgłoszenia kradzieży dowodu":
            schema["required"].append(section)
         schema["properties"][section] = {
            "type": "object",
            "properties": {},
            "required": []
         }
      elif len(key_value) == 2 and not key_value[0].startswith("("):
         key = key_value[0]
         value = key_value[1].replace('…','').replace('.','').replace(':','').replace('-','').strip()
         if key_value[0] != "inny" and key_value[0] != "Fotografia załączona razem z wnioskiem":
            if value:
               schema["properties"][section]["properties"][key] = {
                  "type": "string",
                  "description": value
               }
            else:
               schema["properties"][section]["properties"][key] = {
                  "type": "string",
               }
            if "opcjonalny" not in key:
               schema["properties"][section]["required"].append(key)

   lines = text.split('\n')
   optionsList = []
   lastDot = 0
   for index, line in enumerate(lines):
      if line == "●" and len(optionsList) == 0 and index != 0:
         optionsList.append(lines[index - 1][3:])
         lastDot = index
      if line == "●":
         optionsList.append(lines[index + 1].replace('…','').replace('.','').replace(':','').replace('-','').strip())
         lastDot = index
      if index == lastDot + 2 and len(optionsList) > 0:
         print(optionsList)
         schema["properties"][optionsList[0]] = {
            "type": "string",
            "description": " / ".join(optionsList[1:])
         }
         optionsList.clear()

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