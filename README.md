# retrogame

Aplicación flask para gestionar juegos retro.

dentro de `static` deben existir ficheros json con la información de los juegos, con el nombre del sistema en mayúsculas, po ejemplo, `MSX.json`, con la siguiente estructura:

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

En `static` debe haber un enlace simbólico llamado `Games` a puntando al directorio donde están los juegos. Este directorio tendrá la siguiente estructura:

    MSX
        A
            <Nombre del juego>
                Fichero del juego (rom,dsk, ...)
                Fichero de imagen (jpg,png,...)
            ...
        B
        ...
    ...