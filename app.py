import os
from flask import Flask, render_template, flash, redirect, url_for, abort
from markupsafe import escape
from flask_bootstrap import Bootstrap
from forms import SignupForm
from funciones import *

app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
app.config['SISTEMAS']=[{"sistema":"msx","image":"msx.png"},
{"sistema":"msx2","image":"msx2.jpg"},
{"sistema":"mame","image":"mame.png"},
{"sistema":"amiga","image":"amiga.png"},
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


@app.route('/webmsx/<sistema>/<id>')
def webmsx(sistema,id):
    filtro={'sistema': sistema}
    datos=allDatos(sistema.upper(),filtro)
    
    game=getGame(datos,id,"id")
    if len(game)==0:
        abort(404)
    if game[0]["files"][0].lower().endswith(".dsk"):
        tipo="dsk"
    if game[0]["files"][0].lower().endswith(".rom"):
        tipo="rom"
    if game[0]["files"][0].lower().endswith(".cas"):
        tipo="cas"
    return render_template('webmsx.html',game=game[0],tipo=tipo)

@app.route('/juego/<sistema>/<id>/<path:ruta>')
def mame(id,sistema,ruta):
    filtro={'sistema': sistema.upper()}
    datos=allDatos(sistema.upper(),filtro)
    game=getGame(datos,id,"id")
    if len(game)==0:
        abort(404)
    if sistema=="mame":
        os.system('mame "'+game[0]["rom"]+'"')
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
    


#def msx(): 
#    form = SignupForm()
#
#    if form.validate_on_submit():
#        # We don't have anything fancy in our application, so we are just
#        # flashing a message when a user completes the form successfully.
#        #
#        # Note that the default flashed messages rendering allows HTML, so
#        # we need to escape things if we input user values:
#        flash('Hello, {}. You have successfully signed up'
#              .format(escape(form.name.data)))
#
#        # In a real application, you may wish to avoid this tedious redirect.
#        return redirect(url_for('.index'))
#
#    return render_template('signup.html', form=form)
