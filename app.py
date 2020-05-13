import os
from flask import Flask, render_template, flash, redirect, url_for, abort
from markupsafe import escape
from flask_bootstrap import Bootstrap
from forms import SignupForm
from funciones import *

app = Flask(__name__)
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY
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

@app.route('/juego/mame/<id>/<path:ruta>')
def mame(id,ruta):
    filtro={'sistema': "MAME"}
    datos=allDatos("MAME",filtro)
    game=getGame(datos,id,"id")
    if len(game)==0:
        abort(404)
    os.system('mame "'+game[0]["file"]+'"')
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
