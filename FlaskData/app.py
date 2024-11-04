import time

import requests
from flask import Flask, request, render_template, jsonify, json

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def form_page():
    if request.method == 'POST':
        user_name = request.form['name']
        user_surname = request.form['surname']
        user_age = request.form['age']
        return f'Witam {user_name} {user_surname}, masz {user_age} lat!'
    return render_template('form.html')

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


        # Uruchomienie procesu
        webhook = 'UrzadWebhook'
        url = 'https://bru-2.connectors.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/inbound/{0}'.format(webhook)
        headers = {
            'Content-Type': 'text/plain'
        }
        data = {

        }
        data = json.dumps(data)
        response = requests.post(url, headers=headers, data=data)
        time.sleep(5)

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
        print(process_definition_key)


        # Uzyskanie formularza z danego procesu

        form="dane_osobowe"
        url = "https://bru-2.tasklist.camunda.io/eea87386-0393-4bbc-ad2e-a10a85bb2646/v1/forms/{0}?processDefinitionKey={1}".format(form, process_definition_key)
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer {0}'.format(tasklist_token),
            'Accept': 'application/json'
        }
        data = {
        }
        # Wysylanie żadania POST z powyzszych zmiennych
        response = requests.get(url, headers=headers, data=data)


        return jsonify(response.json()), response.status_code

    # Wyswietlanie domyslnej strony
    return render_template('camunda_page.html')