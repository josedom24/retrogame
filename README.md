# retrogame

Aplicación flask para gestionar juegos retro.

Dentro de `static` deben existir ficheros json con la información de los juegos, con el nombre del sistema en mayúsculas, po ejemplo, `MSX.json`, con la siguiente estructura:

    [
        {
            "id": 1,
            "nombre": "Nombre del juego",
            "sistema": "MSX",
            "distribuidor": "Empresa",
            "desarrollador":"Empresa",
            "categoria": "Adventure",
            "año": 2020
        },
        ...
    ]
El fichero `MAME.json` tiene un campo "rom" con el nombre del fichero zip.

En `static` debe haber un enlace simbólico llamado `Games` apuntando al directorio donde están los juegos. Este directorio tendrá la siguiente estructura:

    MSX
        A
            <Nombre del juego>
                Fichero del juego (rom,dsk, ...)
                Fichero de imagen (jpg,png,...)
            ...
        B
        ...
    ...

Para MAME:

    MAME
        A
            <Nombre del juego>
                Fichero de imagen (jpg,png,...)
            ...
        B
        ...
    ...

    MAMEROMS: Con todos los ficheros zip de las ROMS de MAME.

Hace falta configurar MAME para indicar otro direcorio de ROMS, que será `.../Games/MAMEROMS`.  