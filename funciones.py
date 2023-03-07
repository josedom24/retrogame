import os,json
from operator import itemgetter
SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
GAME_ROOT = SITE_ROOT+"/games/"

def LeerDatos(nombre,sistemas,filtro):
    if nombre=="todos":
        sistemas=sistemas[1:]
    else:
        sistemas=[nombre]
    juegos={}
    juegos["lista"]=[]
    for nombre in sistemas:
        with open(GAME_ROOT+"src/"+nombre+".json") as fichero:
            j=json.load(fichero)
        juegos["lista"]=juegos["lista"]+j
            
            
    
    juegos["lista"] = sorted(juegos["lista"], key=lambda d: d['título']) 
    
    if len(filtro)>0:
        for clave,valor in filtro.items():
            if valor!="":
                juegos["lista"]=FiltrarDatos(juegos["lista"],clave,valor)
    
    lista=["desarrollador","distribuidor","genero","año"]
    for elemento in lista:
        juegos[elemento]=ConjuntoDatos(juegos["lista"],elemento)

    print(juegos)
    return(juegos)


def ConjuntoDatos(lista,elemento):
    elementos=set()
    for juego in lista:
        if isinstance(juego[elemento], list):
            for elem in juego[elemento]:
                if elem!=None:
                    elementos.add(elem)
        else:
            if elemento!=None:
                elementos.add(juego[elemento])
    print(elemento,elementos)
    elementos=sorted(list(elementos))
    return elementos

def FiltrarDatos(juegos,clave,valor):
    newlist=[]
    print(clave,valor)
    for juego in juegos:
        
        if (clave=="nombre" and juego[clave].startswith(valor)) or (juego[clave]==valor):
            newlist.append(juego)
    return newlist
