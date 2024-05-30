import os
from flask import Flask, render_template, request, session, redirect, url_for
from funciones import *
import subprocess


app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SISTEMAS']=["todos","msx","msx2","spectrum","amstrad","c64","amiga","mame","nes","neogeo"]
app.config['DIR']={"msx":"Microsoft - MSX","msx2":"Microsoft - MSX2","spectrum":"Sinclair - ZX Spectrum","amstrad":"Amstrad - CPC","amiga":"Commodore - Amiga","mame":"MAME","nes":"Nintendo - Nintendo Entertainment System","neogeo":"FBNeo - Arcade Games","c64":"Commodore - 64"}
NUM_ELEM=24

with open("enlaces.json") as fichero:
    app.config["ENLACES"]=json.load(fichero)



@app.context_processor
def handle_context():
    return dict(os=os)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sistema/<sistema>', methods=('GET', 'POST'))
@app.route('/sistema/<sistema>/<pag>', methods=('GET', 'POST'))
@app.route('/sistema/<sistema>/<filtro>/<pag>', methods=('GET', 'POST'))
def juegos(sistema,filtro="",pag="1"):
    if request.method=="POST":
        session['filtro'] = request.form
    else:
        if 'filtro' in session:
            if filtro:
                request.form=session['filtro']
            else:
                session.pop('filtro')
    juegos=LeerDatos(sistema,app.config["SISTEMAS"],request.form,"busqueda")
    inicio=(int(pag)-1)*NUM_ELEM
    final=inicio+NUM_ELEM
    cantidad_juegos=len(juegos["lista"])
    juegos["lista"]=juegos["lista"][inicio:final]
    total=int((cantidad_juegos-1)/NUM_ELEM)+1
    pag=int(pag)

    NUM_PAG=26
    inicio=pag-NUM_PAG//2
    final=pag+NUM_PAG//2
    if inicio<1:
        final=final-inicio
        inicio=1 

    if final>total+1:
        inicio=inicio-(final-total+1)
        if inicio<1:
            inicio=1
        final=total+1 
    
    
    return render_template('juegos.html',sistema=sistema,juegos=juegos,filtro=request.form,dir=app.config["DIR"],inicio=inicio,final=final,pag=pag,total=total,cantidad_juegos=cantidad_juegos)

@app.route('/juego/<sistema>/<sistema_juego>/<nombre>/<pag>', methods=('GET', 'POST'))
def juego(sistema,sistema_juego,nombre,pag):
    juego=LeerDatos(sistema_juego,app.config["SISTEMAS"],{"título":nombre},"cuerpo")
    juegos=LeerDatos("todos",app.config["SISTEMAS"],{"título":nombre},"exacto")
    plataformas = [info["plataforma"] for info in juegos["lista"]]
    plataformas.remove(sistema_juego)
    print(plataformas)
    return render_template('juego.html',sistema_juego=sistema_juego,sistema=sistema,game=juego["lista"][0],dir=app.config["DIR"],pag=pag,plataformas=plataformas)

@app.route('/jugar/<sistema>/<sistema_juego>/<nombre>/<pag>', methods=('GET', 'POST'))
def jugar(sistema,sistema_juego,nombre,pag):
    juego=""
    instruccion=""
    playlist="/media/jose/copia/Juegos/playlists/"+app.config['DIR'][sistema_juego]+".lpl"
    with open(playlist) as fichero:
        datos=json.load(fichero)
    core=datos["default_core_path"]
    juego=LeerDatos(sistema_juego,app.config["SISTEMAS"],{"título":nombre},"cuerpo")
    j=[item for item in datos["items"] if item['label'] == juego["lista"][0]["fichero"]][0]
    if j["core_path"]!="DETECT":
        core=j["core_path"]
    instruccion="flatpak run --filesystem=host org.libretro.RetroArch  -L "+core+ ' "'+j["path"]+'"'

    print(instruccion)
    try:
        subprocess.call(instruccion,shell=True)
    except:
        pass

        
    return redirect(url_for('juego',sistema=sistema,sistema_juego=sistema_juego,nombre=nombre,pag=pag))    


app.run("0.0.0.0",debug=True)
    

