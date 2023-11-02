import os
import random as rd
from ipykernel import connect
from keras.models import Sequential
import keras.applications.mobilenet_v2 as mobilenetv2
import tensorflow as tf
import sys
import gradio as gr
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QPushButton, QWidget
from gradio.networking import Server
from flask import Flask, request, render_template,jsonify
import gradio as gr
from PIL import Image
import numpy as np

model = tf.keras.models.load_model('modelo.h5')
categories_traduccion = {0: 'Bateria', 1: 'Biologico', 2: 'carton', 3: 'vidrio', 4: 'metal', 5: 'papel', 6: 'plastico',7: 'domestico'}

app = Flask(__name__)

def clasificar(img):
    img_reshape = img.reshape(-1, 224, 224, 3)
    pred = model.predict(img_reshape)[0]
    predictions = {categories_traduccion[i]: float(pred[i]) for i in range(8)}
    pclave_maximo_valor = max(predictions, key=predictions.get)

    diccionario_ordenado = dict(sorted(predictions.items(), key=lambda item: item[1], reverse=True))
    print(pclave_maximo_valor)
    print(diccionario_ordenado)
    return pclave_maximo_valor,diccionario_ordenado 

@app.route("/", methods=["GET","POST"])
def home():
    if request.method == "POST":
        uploaded_image = request.files["file"]
        
        img = Image.open(uploaded_image)
        img = img.resize((224, 224))  
        img_array = np.array(img)
        
        resultado,diccionario_ordenado  = clasificar(img_array)
        
        return jsonify({"resultado": resultado, "diccionario_ordenado": diccionario_ordenado})
    return render_template("index.html", resultado=None)

@app.route("/guardar_resultado", methods=["POST"])
def guardar_resultado():
    data = request.get_json()
    resultado = data.get("resultado")

    def generar_numero_aleatorio():
        numero_aleatorio = rd.randint(10000, 99999)
        return numero_aleatorio
    
    if not os.path.exists("static/registro.csv"):
        with open("static/registro.csv", "w") as file:
            file.write("Usuario;Resultado\r")

    username = "usuario"
    numero_aleatorio = generar_numero_aleatorio() 

    usuario_completo="{}-{}".format(username,numero_aleatorio)

    with open("static/registro.csv", "a") as file:
        file.write(f"{usuario_completo};{resultado}\r")

    if not os.path.exists("static/aciertos.csv"):
        with open("static/aciertos.csv", "w") as file:
            file.write("Usuario;acierto\r")
    acierto = "si"
    
    with open("static/aciertos.csv", "a") as file:
        file.write(f"{usuario_completo};{acierto}\r")
    
    return jsonify({"mensaje": "Resultado guardado con éxito"})

@app.route("/no_aciertos", methods=["POST"])
def guardar_no_acierto():
    if request.method == "POST":
        uploaded_image = request.files["file"]

        if uploaded_image:
            
            if not os.path.exists("no_aciertos"):
                os.makedirs("no_aciertos")

            def generar_numero_aleatorio():
                numero_aleatorio = rd.randint(10000, 99999)
                return numero_aleatorio

            if not os.path.exists("static/aciertos.csv"):
                with open("static/aciertos.csv", "w") as file:
                    file.write("Usuario;acierto\r")
            acierto = "no"
            username = "usuario"
            numero_aleatorio = generar_numero_aleatorio() 

            usuario_completo="{}-{}".format(username,numero_aleatorio)
            with open("static/aciertos.csv", "a") as file:
                file.write(f"{usuario_completo};{acierto}\r")

            imagen_guardada_path = os.path.join("no_aciertos", uploaded_image.filename)
            uploaded_image.save(imagen_guardada_path)

            return jsonify({"mensaje": "Imagen guardada en la carpeta 'no_aciertos'."})

    return jsonify({"mensaje": "Error al guardar la imagen en 'no_aciertos'."})
if __name__ == "__main__":
    app.run(debug=True)