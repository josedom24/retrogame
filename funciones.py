import os,json
from operator import itemgetter
SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
GAME_ROOT = SITE_ROOT+"/games/"

def LeerDatos(nombre,sistemas,filtro,donde):
    
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
    juegos["lista"]=CrearImagen(juegos["lista"])
    if len(filtro)>0:
        for clave,valor in filtro.items():
            if valor!="":
                juegos["lista"]=FiltrarDatos(juegos["lista"],clave,valor,donde)
    
    lista=["desarrollador","genero","año","rating"]
    for elemento in lista:
        juegos[elemento]=ConjuntoDatos(juegos["lista"],elemento,donde)

    
    return(juegos)


def ConjuntoDatos(lista,elemento,donde):
    elementos=set()
    for juego in lista:
        if elemento in juego:
            if isinstance(juego[elemento], list):
                for elem in juego[elemento]:
                    if elem!=None:
                        elementos.add(elem)
            else:
                if elemento!=None:
                    elementos.add(juego[elemento])
    elementos=sorted(list(elementos))
    cont=0
    for ele in elementos:
        elementos[cont]=elementos[cont]+ " ("+str(len(FiltrarDatos(lista,elemento,ele,donde)))+")"
        cont=cont+1
    return elementos

def FiltrarDatos(juegos,clave,valor,donde="cuerpo"):
    newlist=[]
    
    for juego in juegos:
        if clave in juego:
            if donde=="cuerpo":
                if (clave=="título" and valor == juego[clave] or clave=="título" and juego[clave].startswith(valor)) or (juego[clave]==valor) or (isinstance(juego[clave],list) and valor in juego[clave]):
                    newlist.append(juego)
            if donde=="busqueda":
                
                if clave=="título":
                    if "," in valor:
                        valores=valor.split(",")
                    else: 
                        valores=[valor]
                    for v in valores:
                        print(v,juego[clave])
                        if v in juego[clave]:
                            newlist.append(juego)
                            
                else:
                    if juego[clave]==valor or (isinstance(juego[clave],list) and valor in juego[clave]):
                        newlist.append(juego)
            
    return newlist

def CrearImagen(lista):
    newlist=[]
    for juego in lista:
        juego["imagen"]=juego["fichero"]
        for car in ["/",":","*","&","?"]:
            juego["imagen"]=juego["imagen"].replace(car,"_")
        
        newlist.append(juego)
    return newlist