import time

import requests
from flask import Flask, request, jsonify, json, abort, make_response, send_from_directory
from io import BytesIO
from DocumentPDFGenerator.PDFGenerator import PDFGenerator
import json as JSON
from flask_cors import CORS
import os
from utils.generate_schema.generate_schema import generate_schema

import smtplib

from email.message import EmailMessage
from validate_email_address import validate_email

app = Flask(__name__)
CORS(app)

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
EMAIL_ADDRESS = '' #te pola nie wrzucam na githuba, uzupelnie przy pokazywaniu
EMAIL_PASSWORD = ''

def send_email_with_attachment(recipient_email, subject, body, pdf_file):
    """Send an email with the given FileStorage object as an attachment."""
    msg = EmailMessage()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.set_content(body)

    file_data = pdf_file.read()
    file_name = pdf_file.filename
    msg.add_attachment(file_data, maintype='application', subtype='pdf', filename=file_name)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)

@app.route('/form', methods=['GET', 'POST'])
def get_form_schema():
    if request.method == 'GET':
        try:
            generate_schema()
            schema_dir = app.root_path
            return send_from_directory(schema_dir, 'schemaFile.json', as_attachment=True)
        except Exception as e:
            print(f"Error sending file: {e}")
            return jsonify({"error": f"Error sending the schema file: {e}"}), 500

@app.route('/sendEmail', methods=['POST'])
def send_email():
    pdf_file = request.files.get('uploadFile')
    recipient_email = request.args.get('email')

    if not recipient_email:
        return jsonify({"error": "Recipient email is required!"}), 400

    if not validate_email(recipient_email):
        return jsonify({"error": "Invalid email address!"}), 400

    if not pdf_file or not pdf_file.filename:
        return jsonify({"error": "No file uploaded!"}), 400

    try:
        send_email_with_attachment(
            recipient_email=recipient_email,
            subject="Your Requested PDF File",
            body="Please find the requested PDF file attached.",
            pdf_file=pdf_file
        )
        return jsonify({"message": "Email sent successfully!"})
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

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

@app.route('/Camunda', methods=['GET', 'POST'])
def camunda_page():
    # Dzialanie dostepu do Camundy dopiero po kliknieciu przycisku
    if request.method == 'POST':

        # Uzyskanie tokenu do Operate

        url = 'https://login.cloud.camunda.io/oauth/token'
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        data = {
            'grant_type': 'client_credentials',
            'audience': 'operate.camunda.io',
            'client_id': '7sQ5pYudjXx~odFyBu-fRpGg61JBvmwG',
            'client_secret': 'iO2rjvGJRW8NX.FEav147b7Q8IHMSQd.HdGO41w-3YWR3ltQnzp.QrRLvgYsV9K.'
        }

        # Wysylanie żadania POST z powyzszych zmiennych
        response = requests.post(url, headers=headers, data=data)
        operate_token = response.json()['access_token']


        # Uzyskanie tokenu do Tasklist.
        # W tym celu wystarczy zmienic sekcje data, gdzie zmienia sie jedynie audience

        data = {
            'grant_type': 'client_credentials',
            'audience': 'tasklist.camunda.io',
            'client_id': '7sQ5pYudjXx~odFyBu-fRpGg61JBvmwG',
            'client_secret': 'iO2rjvGJRW8NX.FEav147b7Q8IHMSQd.HdGO41w-3YWR3ltQnzp.QrRLvgYsV9K.'
        }

        # Wysylanie żadania POST z powyzszych zmiennych
        response = requests.post(url, headers=headers, data=data)
        tasklist_token = response.json()['access_token']


        # # Uruchomienie procesu
        # webhook = 'UrzadWebhook'
        # url = 'https://bru-2.connectors.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/inbound/{0}'.format(webhook)
        # headers = {
        #     'Content-Type': 'text/plain'
        # }
        # data = {
        #
        # }
        # data = json.dumps(data)
        # response = requests.post(url, headers=headers, data=data)
        # time.sleep(5)

        # Uzyskanie klucza umozliwiajacego znalezienie procesu

        url = "https://bru-2.operate.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/v1/process-definitions/search"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {0}'.format(operate_token),
            'Accept': 'application/json'
        }
        data = {
            'filter': {
                'bpmnProcessId': 'UM-BPMN'
            },
            'size': 1,
            'sort': [
                {
                    'field': 'version',
                    'order': 'DESC'
                }
            ]
        }
        data = json.dumps(data)
        # Wysylanie żadania POST z powyzszych zmiennych
        response = requests.post(url, headers=headers, data=data)
        json_data = response.json()
        process_definition_key = json_data['items'][0]['key']
        print("Process definition key is: {0}".format(process_definition_key))

        #
        # # Uzyskanie formularza z danego procesu
        #
        # form="dane_osobowe"
        # url = "https://bru-2.tasklist.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/v1/forms/{0}?processDefinitionKey={1}".format(form, process_definition_key)
        # headers = {
        #     'Content-Type': 'application/json',
        #     'Authorization': 'Bearer {0}'.format(tasklist_token),
        #     'Accept': 'application/json'
        # }
        # data = {
        # }
        # # Wysylanie żadania POST z powyzszych zmiennych
        # response = requests.get(url, headers=headers, data=data)


        # Uzyskanie aktualnego zadania
        url = "https://bru-2.tasklist.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/v1/tasks/search"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {0}'.format(tasklist_token),
            'Accept': 'application/json'
        }
        data = {
            'processDefinitionKey': process_definition_key,
            'pageSize': 1,
            'sort': [
                {
                'field': 'creationTime',
                'order': 'DESC'
                }
            ]
        }
        data = json.dumps(data)
        response = requests.post(url, headers=headers, data=data)
        print(response.json())
        task_id = response.json()[0]['id']
        assignee = response.json()[0]['assignee']

        # Zadeklarowanie zadania do użytkownika

        url = "https://bru-2.tasklist.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/v1/tasks/{0}/assign".format(task_id)
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {0}'.format(tasklist_token),
            'Accept': 'application/json'
        }
        data = {
          'assignee': '{0}'.format(assignee),
          'allowOverrideAssignment': 'true'
        }
        response = requests.patch(url, headers=headers, data=data)


        # Uzyskanie zmiennych dostępnych w danym zadaniu

        url = "https://bru-2.tasklist.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/v1/tasks/{0}/variables/search".format(task_id)
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {0}'.format(tasklist_token),
            'Accept': 'application/json'
        }
        data = {}
        response = requests.post(url, headers=headers, data=data)
        variables = response.json()
        print(variables)

        return jsonify(response.json()), response.status_code

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    