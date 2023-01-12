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
        for root, dirs, files in os.walk(GAME_ROOT+"roms/"+nombre):
            if nombre=="amiga500":
                files=dirs
    
            for file in files:
                juego={}
                juego["imagen"]="/thumbnails/"+nombre+"/Named_Boxarts/"+file.split(".")[0]+".png"
                juego["sistema"]=nombre
                juego["nombre"]=file.split("(")[0][:-1]
                tmp=file.split("(")[1].split(")")[0]
                juego["compañia"]=tmp.split(",")[0]                
                juego["año"]=tmp.split(",")[1][1:]
                juegos["lista"].append(juego)
    
    
    juegos["lista"] = sorted(juegos["lista"], key=lambda d: d['nombre']) 
    
    if len(filtro)>0:
        for clave,valor in filtro.items():
            if valor!="":
                juegos["lista"]=FiltrarDatos(juegos["lista"],clave,valor)
    
    juegos["compañias"]=set()
    juegos["años"]=set()
    for juego in juegos["lista"]:
        juegos["compañias"].add(juego["compañia"])
        juegos["años"].add(juego["año"])
    juegos["compañias"]=sorted(list(juegos["compañias"]))
    juegos["años"]=sorted(list(juegos["años"]))
    return(juegos)


def FiltrarDatos(juegos,clave,valor):
    newlist=[]
    print(clave,valor)
    for juego in juegos:
        
        if (clave=="nombre" and juego[clave].startswith(valor)) or (juego[clave]==valor):
            newlist.append(juego)
    return newlist
