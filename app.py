import os
from flask import Flask, render_template, flash, redirect, url_for, abort
from markupsafe import escape
from flask_bootstrap import Bootstrap
from forms import SignupForm
from funciones import *

app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SISTEMAS']=[{"sistema":"todos"},
{"sistema":"msx"},
{"sistema":"msx2"},
{"sistema":"mame"},
{"sistema":"amiga"},
{"sistema":"nes"},
]
Bootstrap(app)

# Our index-page just shows a quick explanation. Check out the template
# "templates/index.html" documentation for more details.
@app.route('/')
def index():
    return render_template('index.html')


# Shows a long signup form, demonstrating form rendering.
@app.route('/sistema/<sistema>/', methods=('GET', 'POST'))
@app.route('/sistema/<sistema>/<path:ruta>', methods=('GET', 'POST'))
def juegos(sistema,ruta=""):
    filtro,redireccionar=getFiltro(sistema,ruta)    
    if redireccionar:
        return redirect(getRuta(filtro))
    if sistema=="todos":
        datos=[]
        for sist in app.config["SISTEMAS"][1:]:
            datos.extend(allDatos(sist["sistema"].upper(),filtro))
        datos=sorted(datos, key=itemgetter('nombre'))
    else:
        datos=allDatos(sistema.upper(),filtro)
    
    busqueda=getDatos(datos)
    #print(getDatos(getGame(datos,"Racing","categoria"),"desarrollador"))
    return render_template('juegos.html',sistema=sistema,datos=datos,busqueda=busqueda,filtro=filtro,url=getRuta(filtro))

@app.route('/descargar/<sistema>/<id>/<path:ruta>')
def descarga(sistema,id,ruta):
    filtro={'sistema': sistema}
    datos=allDatos(sistema.upper(),filtro)
    
    game=getGame(datos,id,"id")
    if len(game)==0:
        abort(404)
    return render_template('descargar.html',game=game[0],ruta=ruta)


@app.route('/jugar/<sistema>/<id>/<path:ruta>')
def juega(id,sistema,ruta):
    filtro={'sistema': sistema.upper()}
    datos=allDatos(sistema.upper(),filtro)
    game=getGame(datos,id,"id")
    if len(game)==0:
        abort(404)

    if sistema=="msx" or sistema=="msx2":
        if len(game)==0:
            abort(404)
        if game[0]["files"][0].lower().endswith(".dsk"):
            tipo="dsk"
        if game[0]["files"][0].lower().endswith(".rom"):
            tipo="rom"
        if game[0]["files"][0].lower().endswith(".cas"):
            tipo="cas"
        return render_template('webmsx.html',game=game[0],tipo=tipo)
    if sistema=="mame":
        os.system('mame "'+game[0]["rom"]+'"')
        return redirect("/"+ruta)
    if sistema=="nes":
        fich=os.path.join(os.path.abspath(os.path.dirname(__file__)),"static/"+game[0]["files"][0])
        os.system('higan "'+fich+'"')
        return redirect("/"+ruta)
    if sistema=="amiga":
        floppy=""
        image=""
        cont_floppy=0
        cont_image=0
        for fich in game[0]["files"]:
            fich=os.path.join(os.path.abspath(os.path.dirname(__file__)),"static/"+fich)
            if fich.endswith(".zip"):
                if cont_floppy<4:
                    floppy=floppy+" --floppy_drive_"+str(cont_floppy)+"='"+fich+"'"
                image=image+" --floppy_image_"+str(cont_image)+"='"+fich+"'"
                cont_floppy=cont_floppy+1
                cont_image=cont_image+1
        os.system('fs-uae --fullscreen '+floppy+' '+image)
        return redirect("/"+ruta)

app.run("0.0.0.0",debug=True)
    

