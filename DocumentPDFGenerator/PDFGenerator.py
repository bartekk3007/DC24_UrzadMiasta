import pymupdf
import json as JSON
import jsonschema
import io


class PDFGenerator:

    def __init__(self):
        pass

    def __isValid(self, json):

        schema = None

        with open("./DocumentPDFGenerator/WniosekJsonSchema.json", encoding="utf-8") as f:
            schema = JSON.load(f)

        try:
            jsonschema.validate(json, schema)
        except jsonschema.exceptions.ValidationError as e:
            print(f"Validation error: {e}")
            return False
        except jsonschema.exceptions.SchemaError as e:
            print(f"Schema error: {e}")
            return False
        finally:
            return True

    def render(self, json):

        if(not self.__isValid(json)):
            return

        pdf = io.BytesIO()
        writer = pymupdf.DocumentWriter(pdf)
        story = pymupdf.Story()
        body = story.body

        for n, (k, v) in enumerate(json.items(), 1):
            
            paragraph = body.add_paragraph()
            paragraph.add_text(f"{n}: {k}")
            body.add_horizontal_line()

            pass

        mediaBox = pymupdf.paper_rect("A4")
        where = mediaBox + (36, 36, -36, -36)
        more = 1
        while more:
            device = writer.begin_page(mediaBox)  # make new page
            more, _ = story.place(where)
            story.draw(device)
            writer.end_page()

        writer.close()

        return pdf

    pass


if __name__ == "__main__":

    generator = PDFGenerator()

    testJson = """
    {
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
    """

    pdf = generator.render(JSON.loads(testJson))

    with open("test.pdf", "wb") as f:
        f.write(pdf.getbuffer())