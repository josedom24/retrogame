import os,json
from operator import itemgetter
SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
GAME_ROOT = SITE_ROOT+"/games/"
def LeerDatos(nombre):
    for root, dirs, files in os.walk(GAME_ROOT+"roms/"+nombre):
        if nombre=="msx" or nombre=="msx2":
            juegos={}
            juegos["sistema"]=nombre
            juegos["compañias"]=set()
            juegos["años"]=set()
            juegos["lista"]=[]
            for file in files:
                juego={}
                juego["nombre"]=file.split("(")[0][:-1]
                tmp=file.split("(")[1].split(")")[0]
                juego["compañia"]=tmp.split(",")[0]
                juegos["compañias"].add(tmp.split(",")[0])
                juego["año"]=tmp.split(",")[1][1:]
                juegos["años"].add(tmp.split(",")[1][1:])
                juegos["lista"].append(juego)
            return(juegos)


def GuardarDatos(nombre,datos):
    json_url = os.path.join(SITE_ROOT, 'static', nombre+".json")
    with open(json_url, 'w', encoding='utf8') as file:
        json.dump(datos, file,indent=4,ensure_ascii=False)

def getGame(datos,valor,campo="nombre"):
    try:
        if campo=="id":
            return [game for game in datos if game[campo] == int(valor)]
        else:
            return [game for game in datos if game[campo] == valor]
    except:
        return []

def isGame(datos,valor,campo="nombre"):
    return len(getGame(datos,valor))>0

def getDatos(datos):
    info={}
    keys=["distribuidor","desarrollador","categoria","año"]
    for campo in keys:
        info[campo]=getDato(datos,campo)
    info["letras"]=getLetra(datos)
    return info

def getDato(datos,devcampo):
    try:
        return sorted(list(set([str(game[devcampo]).strip() for game in datos])))
    except:
        return []

def getLetra(datos):
    try:
        return sorted(list(set([game["nombre"][0].upper() for game in datos])))
    except:
        return []

def LeerFich(nombre):
    lista=[]
    lista2=[]
    for root, dirs, files in os.walk(GAME_ROOT+nombre):
        for name in dirs:
            if len(name)>1:
                lista.append(os.path.join(root, name))
        for name in files:
            lista2.append(os.path.join(root, name))
    return lista,lista2


def allDatos(nombre,filtro):
    datos=LeerDatos(nombre)
    dirs,ficheros=LeerFich(nombre)
    games=[]
    for game in dirs:
        try:
            g=getGame(datos,game.split("/")[-1])[0]
        except:
            continue
        g["files"]=sorted(["/".join(z[-5:]) for z in  [y for y in [x.split("/") for x in ficheros] if game.split("/")[-1] in y]])
    
        try:
            g["image"]=[x for x in g["files"] if ".jpg" in x or ".png" in x][0]
            g["files"].remove(g["image"])
        except:
            g["image"]=""
        cont=0
        for campo,valor in filtro.items():
            if campo=="letras" and g["nombre"].startswith(valor):
                cont=cont+1
            else:
                try:
                    if g.get(campo).lower()==valor.lower():
                        cont=cont+1
                except:
                    if str(g.get(campo))==str(valor):
                        cont=cont+1
                if campo=="sistema" and valor=="todos":
                    cont=cont+1
        if cont==len(filtro):
            games.append(g)

    games=sorted(games, key=itemgetter('nombre'))
    return games
## recibe un sistema y una ruta y crea un diccionario con los campos y valores
def getFiltro(sistema,ruta):
    redirect=False
    filtro={"sistema":sistema}
    try:
        ruta=ruta.split("/")
    except: 
        return filtro
    for campo,valor in zip(ruta[::2],ruta[1::2]):
        if campo in filtro:
            redirect=True
        if filtro.get(campo)==valor:
            del filtro[campo]
            redirect=True
        else:
            filtro[campo]=valor
    return filtro,redirect

def getRuta(filtro):
    copia=filtro.copy()
    ruta="/sistema/"+copia["sistema"]+"/"
    del copia["sistema"]
    for campo,valor in copia.items():
        ruta=ruta+campo+"/"+valor+"/"
    return ruta