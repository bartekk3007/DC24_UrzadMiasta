from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def form_page():
    if request.method == 'POST':
        user_name = request.form['name']
        user_surname = request.form['surname']
        user_age = request.form['age']
        return f'Witam {user_name} {user_surname}, masz {user_age} lat!'
    return render_template('form.html')

