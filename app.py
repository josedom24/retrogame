import os
from flask import Flask, render_template, request, session, redirect, url_for
from funciones import *
import subprocess


app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SISTEMAS']=["todos","msx","msx2","amiga","mame"]
app.config['DIR']={"msx":"Microsoft - MSX","msx2":"Microsoft - MSX2","amiga":"Commodore - Amiga","mame":"MAME"}
NUM_ELEM=18

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
    juegos=LeerDatos(sistema,app.config["SISTEMAS"],request.form)
    inicio=(int(pag)-1)*NUM_ELEM
    final=inicio+NUM_ELEM
    cantidad_juegos=len(juegos["lista"])
    juegos["lista"]=juegos["lista"][inicio:final]
    return render_template('juegos.html',sistema=sistema,juegos=juegos,filtro=request.form,dir=app.config["DIR"],pag=int(pag),total=int(cantidad_juegos/NUM_ELEM)+1,cantidad_juegos=cantidad_juegos)

@app.route('/juego/<sistema>/<sistema_juego>/<nombre>/<pag>', methods=('GET', 'POST'))
def juego(sistema,sistema_juego,nombre,pag):
    juego=LeerDatos(sistema_juego,app.config["SISTEMAS"],{"título":nombre})
    return render_template('juego.html',sistema_juego=sistema_juego,sistema=sistema,game=juego["lista"][0],dir=app.config["DIR"],pag=pag)

@app.route('/jugar/<sistema>/<sistema_juego>/<nombre>/<pag>', methods=('GET', 'POST'))
def jugar(sistema,sistema_juego,nombre,pag):
    juego=""
    instruccion=""
    dir_cores="~/.var/app/org.libretro.RetroArch/config/retroarch/cores/"
    dir_files="/media/jose/copia/Juegos/roms/"
    if sistema_juego=="msx" or sistema_juego=="msx2":
        core="bluemsx_libretro.so"
        extension=".zip"
        dir=sistema_juego
    elif sistema_juego=="amiga":
        core="puae_libretro.so"
        extension=".zip"
        dir=sistema_juego+"500"
    elif sistema_juego=="mame":
        core="mame_libretro.so"
        extension=".zip"
        dir=sistema_juego
        playlist="/media/jose/copia/Juegos/playlists/MAME.lpl"
        with open(playlist) as fichero:
            datos=json.load(fichero)
        juego=LeerDatos(sistema_juego,app.config["SISTEMAS"],{"título":nombre})
        j=[item for item in datos["items"] if item['label'] == juego["lista"][0]["fichero"]][0]
        if j["core_name"]=="Arcade (FinalBurn Neo)":
            core="fbneo_libretro.so"
        if j["core_name"]=="Arcade (MAME 2003)":
            core="mame2003_libretro.so"
        instruccion="flatpak run --filesystem=host org.libretro.RetroArch  -L "+dir_cores+core+ ' "'+j["path"]+'"'

    if juego == "":
        juego=LeerDatos(sistema_juego,app.config["SISTEMAS"],{"título":nombre})
    if instruccion=="":
        instruccion="flatpak run --filesystem=host org.libretro.RetroArch  -L "+dir_cores+core+ ' "'+dir_files+dir+"/"+juego["lista"][0]["fichero"]+extension+'"'
    print(instruccion)
    try:
        subprocess.call(instruccion,shell=True)
    except:
        pass

        
    return redirect(url_for('juego',sistema=sistema,sistema_juego=sistema_juego,nombre=nombre,pag=pag))    


app.run("0.0.0.0",debug=True)
    

