import os
from flask import Flask, render_template, request, session
from funciones import *



app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SISTEMAS']=["todos","msx","msx2","amiga","mame"]
app.config['DIR']={"msx":"Microsoft - MSX","msx2":"Microsoft - MSX2","amiga":"Commodore - Amiga","mame":"MAME"}


@app.context_processor
def handle_context():
    return dict(os=os)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sistema/<sistema>/', methods=('GET', 'POST'))
@app.route('/sistema/<sistema>/<filtro>', methods=('GET', 'POST'))
def juegos(sistema,filtro=""):
    if request.method=="POST":
        session['filtro'] = request.form
    else:
        if 'filtro' in session:
            if filtro:
                request.form=session['filtro']
            else:
                session.pop('filtro')
    juegos=LeerDatos(sistema,app.config["SISTEMAS"],request.form)
    return render_template('juegos.html',sistema=sistema,juegos=juegos,filtro=request.form,dir=app.config["DIR"])

@app.route('/juego/<sistema>/<sistema_juego>/<nombre>', methods=('GET', 'POST'))
def juego(sistema,sistema_juego,nombre):
    juego=LeerDatos(sistema_juego,app.config["SISTEMAS"],{"título":nombre})
    return render_template('juego.html',sistema=sistema,game=juego["lista"][0],dir=app.config["DIR"])

app.run("0.0.0.0",debug=True)
    

