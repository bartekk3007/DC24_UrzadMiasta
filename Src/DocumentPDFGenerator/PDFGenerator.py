import base64
import pymupdf
import json as JSON
import jsonschema
import io
import os


class PDFGenerator:

    __Paragraphs = {
        "daneOsobowe": {
            "mężczyzna": "Dane osobowe wnioskodawcy",
            "kobieta": "Dane osobowe wnioskodawczyni"
        },
        "daneKontaktowe": {
            "mężczyzna": "Dane kontaktowe wnioskodawcy",
            "kobieta": "Dane kontaktowe wnioskodawczyni"
        },
        "powodZlozeniaWniosku": {
            "mężczyzna": "Powód złożenia wniosku",
            "kobieta": "Powód złożenia wniosku"
        },
        "fotografia": {
            "mężczyzna": "Fotografia",
            "kobieta": "Fotografia"
        },
        "podpisy": {
            "mężczyzna": "Podpis",
            "kobieta": "Podpis"
        },
    }

    __Items = {
        "imie": "Imię/Imiona",
        "nazwisko": "Nazwisko",
        "dataUrodzenia": "Data urodzenia",
        "plec": "Płeć",
        "nazwiskoRodowe": "Nazwisko rodowe",
        "miejsceUrodzenia": "Miejsce urodzenia",
        "obywatelstwo": "Obywatelstwo",
        "ulica": "Ulica",
        "numerDomuLokalu": "Numer domu/lokalu",
        "kodPocztowy": "Kod pocztowy",
        "miejscowosc": "Miejscowość",
        "nrTelefonu": "Nr. telefonu",
        "email": "Adres e-mail",
        "podpisUrzędnika": "Czytelny podpis urzędnika",
        "podpisWnioskodawcy": "Czytelny podpis wnioskodawcy"
    }

    def __init__(self):
        pass

    def __isValid(self, json):

        schema = None

        with open("./Src/DocumentPDFGenerator/WniosekJsonSchema.json", encoding="utf-8") as f:
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
        story = pymupdf.Story(archive=".")
        body = story.body

        body.set_font("Arial")

        body.add_division().add_style("width: 80%; text-align: center; margin-left: 90%; margin-right: 0;").add_paragraph().add_text(f"{json["Miejscowość i data"]} (Miejscowość i data)")
        
        body.add_division().add_style("margin-bottom: 50px;").add_paragraph().add_text("Urząd miasta Gdańsk")

        del json["Miejscowość i data"]

        self.__addTitle(body)

        for n, (k, v) in enumerate(json.items(), 1):

            self.__addParagraph(body, f"{n}. {self.__genderParagraph(k, json["Dane osobowe wnioskodawcy/wnioskodawczyni"]["Płeć"] == "kobieta")}")

            self.__addContent(body, k, v)

            pass

        mediaBox = pymupdf.paper_rect("A4")
        where = mediaBox + (48, 48, -48, -48)
        more = 1
        while more:
            device = writer.begin_page(mediaBox)  # make new page
            more, _ = story.place(where)
            story.draw(device)
            writer.end_page()

        writer.close()

        if os.path.isfile("temp.jpg"):
            os.remove("temp.jpg")
        
        return pdf

    def __genderParagraph(self, txt: str, gender: int):

        if '/' in txt:
            tokens = txt.split(" ")
            subtxt = ''
            for t in tokens:
                if '/' in t:
                    subtxt += t.split('/')[gender]
                else:
                    subtxt += t + ' '
            txt = subtxt

        return txt

    def __addContent(self, body: pymupdf.Xml, key, val):

        if type(val) is str:
            match key:
                case "Fotografia":
                    if val == "Fotografia dostarczona przez email" or val == "Fotografia załączona razem z wnioskiem":
                        self.__addItem(body, f"{val}")
                    else:
                        with open("temp.jpg", "wb") as img:
                            img.write(base64.b64decode(val))
                        image = body.add_image("./temp.jpg")
                case _:
                    self.__addItem(body, f"{val}")
        else:

            if key == "podpisy":
                item = body.add_paragraph()
                item.set_fontsize(13)
                item.add_text("Wnioskodawca/wnioskodawczyni oświadcza że podane dane są zgodne z prawdą i jest świadomy/świadoma odpowiedzialności karnej za składanie wniosku z fałszywymi danymi.")
                item.add_style("margin-bottom: 25px;")

            for k, v in val.items():
                self.__addItem(body, f"{k}: {v}")
        pass

    def __addItem(self, body, str):
        item = body.add_paragraph()
        item.set_fontsize(13)
        item.set_text_indent(50)
        item.add_text(str)
        item.add_style("margin: 3px;")

    def __addParagraph(self, body, str):
        paragraph = body.add_paragraph()
        paragraph.set_bold(True)
        paragraph.set_fontsize(15)
        paragraph.add_text(str)
        paragraph.add_style("border-bottom: 1px solid;")
        paragraph.add_style("margin-bottom: 25px;")

    def __addTitle(self, body):
        title = body.add_paragraph()
        title.set_bold(True)
        title.set_fontsize(19)
        title.add_style("margin-bottom: 25px;")
        title.add_text("Wniosek o dowód osobisty")
        title.set_align("center")

    pass


if __name__ == "__main__":

    generator = PDFGenerator()

    testJson = """
    {
        "Miejscowość i data": "Gdańsk 11-11-2024",
        "Dane osobowe wnioskodawcy/wnioskodawczyni":{
            "Imię/Imiona": "Janusz Marcin",
            "Nazwisko": "Kowalski",
            "Data urodzenia": "20-09-1983",
            "Płeć": "mężczyzna",
            "Nazwisko rodowe": "Kowalski",
            "Miejsce urodzenia": "Warszawa",
            "Obywatelstwo": "polskie"
        },
        "Dane kontaktowe wnioskodawcy/wnioskodawczyni":{
            "Ulica": "Kwiatkowska",
            "Numer domu/lokalu": "14",
            "Kod pocztowy": "12-134",
            "Miejscowość": "Warszawa",
            "Adres e-mail (opcjonalny)": "janusz@gmail.com"
        },
        "Powód złożenia wniosku": "Kradzież dowodu",
        "Dane poprzedniego dowodu osobistego":{
            "Numer dowodu osobistego": "ABC1234",
            "Numer CAN": "1234",
            "Data wydania dowodu": "11-11-2024",
            "Organ wydający dowód": "Urząd Miast Gdańsk"
        },
        "Dane dotyczące zgłoszenia kradzieży dowodu":{
            "Nazwa i adres jednostki policji": "KOMISARIAT POLICJI I W GDAŃSKU",
            "Data zgłoszenia": "11-11-2024"
        },
        "Fotografia": "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"
    }
    """

    pdf = generator.render(JSON.loads(testJson))

    with open("test.pdf", "wb") as f:
        f.write(pdf.getbuffer())