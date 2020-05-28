from flask_wtf import FlaskForm
from wtforms.fields import *
from wtforms.validators import Required


class GamesForm(FlaskForm):
    id=TextField('Id:')
    nombre = TextField('Nombre:', validators=[Required()])
    sistema = TextField('Sistema:',validators=[Required()])
    distribuidor = TextField('Distribuidor:')
    desarrollador = TextField('Desarrollador:')
    categoria = TextField('Categoria:')
    año = TextField('Año:')
    rom = TextField('Rom:')

    submit = SubmitField('Aceptar')
