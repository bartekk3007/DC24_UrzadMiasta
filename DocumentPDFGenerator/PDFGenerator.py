import pymupdf
import json
from jsonschema import validate


if __name__ == "__main__":

    schema = None

    with open("./DocumentPDFGenerator/WniosekJsonSchema.json", encoding="utf-8") as f:
        schema = json.load(f)

    testJson = {
        "daneOsobowe":{
            "imie": "Janusz Marcin",
            "nazwisko": "Kowalski",
            "dataUrodzenia": "20-09-1983",
            "plec": "mężczyzna",
            "nazwiskoRodowe": "Kowalski",
            "miejsceUrodzenia": "Warszawa",
            "obywatelstwo": "polskie"
        },
        "daneKontaktowe":{
            "ulica": "Kwiatkowska",
            "numerDomuLokalu": "14",
            "kodPocztowy": "12-134",
            "miejscowosc": "Warszawa",
            "email": "janusz@gmail.com"
        },
        "powodZlozeniaWniosku": "pierwszy dowód",
        "fotografia": "TG9yZW0gaXBzdW0gZG9sciBzaXI=",
        "podpisy":{
            "podpisUrzędnika": "Tak",
            "podpisWnioskodawcy": "Tak"
        }
    }

    print(validate(testJson, schema))