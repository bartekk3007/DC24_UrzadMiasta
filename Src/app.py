from io import BytesIO
from flask import Flask, request, render_template, abort, make_response
from DocumentPDFGenerator.PDFGenerator import PDFGenerator
import json as JSON

app = Flask(__name__)

@app.route('/generatePdf', methods=['POST'])
def generate_pdf():
    if request.method == 'POST':
        
        generator = PDFGenerator()
        pdf = generator.render(request.json)

        response = make_response(BytesIO(pdf.getbuffer()))
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'inline; filename=wniosek.pdf'
        return response
    abort(404)

if __name__ == "__main__":
    app.run(debug=True)