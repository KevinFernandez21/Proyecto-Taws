document.getElementById("file-upload").addEventListener("change", function(e) {
    const fileInput = e.target;
    const uploadedImage = document.getElementById("uploaded-image");
    const texto = document.getElementById("texto")

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const objectURL = URL.createObjectURL(file);
        uploadedImage.src = objectURL;

        uploadedImage.style.display = "block";
        uploadedImage.alt = "Imagen cargada";
        uploadedImage.nextElementSibling.style.display = "none";

        const resultadoContainer = document.getElementById("resultado-container");
        resultadoContainer.innerHTML = "";
        resultadoContainer.style.display = "none"

        const diccionarioContainer = document.getElementById("diccionario-container");
        diccionarioContainer.innerHTML = "";
        diccionarioContainer.style.display = "none"
    } else {
        uploadedImage.src = "";
        uploadedImage.style.display = "none";
        uploadedImage.alt = "";
        uploadedImage.nextElementSibling.style.display = "block";
    }
});

document.getElementById("classify-button").addEventListener("click", function() {
    var uploadedImage = document.getElementById("file-upload").files[0];
    var btn_container = document.getElementById("btn_container");
    btn_container.style.display = "block"
    if (uploadedImage) {
        var formData = new FormData();
        formData.append("file", uploadedImage);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);

                if (response.resultado) {
                    var resultadoContainer = document.getElementById("resultado-container");
                    resultadoContainer.style.display = "block";
                    resultadoContainer.textContent = response.resultado;

                }

                var diccionarioOrdenado = Object.fromEntries(
                    Object.entries(response.diccionario_ordenado).sort(([, a], [, b]) => b - a)
                );

                if (diccionarioOrdenado) {
                    var diccionarioContainer = document.getElementById("diccionario-container");
                    diccionarioContainer.style.display = "block"
                    diccionarioContainer.innerHTML = "";

                    var listaContainer = document.createElement("ul");
                    diccionarioContainer.appendChild(listaContainer);

                    var longitudGuiones = 50;

                    for (var key in diccionarioOrdenado) {
                        var categoria = key;
                        var porcentaje = (diccionarioOrdenado[key] * 100).toFixed(0) + "%";

                        var guiones = "_".repeat(longitudGuiones - categoria.length - porcentaje.length);

                        var listItem = document.createElement("li");

                        var barraHorizontal = document.createElement("div");
                        barraHorizontal.classList.add("barra-horizontal", "part" + porcentaje);
                        barraHorizontal.style.width = porcentaje;

                        listItem.appendChild(barraHorizontal);

                        listItem.innerHTML += categoria + " " + guiones + porcentaje;

                        listaContainer.appendChild(listItem);
                    }
                }
            }
        };
        xhr.send(formData);
    } else {
        alert("Por favor, seleccione una imagen antes de hacer clic en 'Clasificar'.");
    }
});


document.getElementById("clear-button").addEventListener("click", function() {
    const uploadedImage = document.getElementById("uploaded-image");
    const texto = document.getElementById("texto");

    uploadedImage.src = "";
    uploadedImage.style.display = "none";
    uploadedImage.alt = "";
    texto.style.display = "block";

    const fileInput = document.getElementById("file-upload");
    fileInput.value = "";

    const resultadoContainer = document.getElementById("resultado-container");
    resultadoContainer.innerHTML = "";
    resultadoContainer.style.display = "none"

    const diccionarioContainer = document.getElementById("diccionario-container");
    diccionarioContainer.innerHTML = "";
    diccionarioContainer.style.display = "none"
});

document.getElementById("btn_yes").addEventListener("click", function() {
    var resultado = document.getElementById("resultado-container").textContent;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/guardar_resultado", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {}
    };

    xhr.send(JSON.stringify({ resultado: resultado }));
});

document.getElementById("btn_no").addEventListener("click", function() {
    var formData = new FormData();
    formData.append("file", document.getElementById("file-upload").files[0]);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/no_aciertos", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {}
    };

    xhr.send(formData);
});


d3.csv("static/registro.csv").then(function(data) {
    // Procesar los datos
    var resultados = {};

    data.forEach(function(d) {
        var resultadosUsuario = d["Usuario;Resultado"].split(";");
        var resultado = resultadosUsuario[1];
        if (resultados[resultado]) {
            resultados[resultado]++;
        } else {
            resultados[resultado] = 1;
        }
    });
    console.log(resultados)
        // Preparar datos para el gráfico
    var etiquetas = Object.keys(resultados);
    var valores = Object.values(resultados);
    console.log(etiquetas)
    console.log(valores)
        // Crear un gráfico de barras con Chart.js
    var ctx = document.getElementById("grafica_registro").getContext("2d");
    var miGrafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Cantidad",
                data: valores,
                backgroundColor: "rgba(16, 44, 87, 1)",
                borderColor: "rgba(16, 44, 87, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
d3.csv("static/aciertos.csv").then(function(data) {
    // Procesar los datos
    var resultados = {};

    data.forEach(function(d) {
        var resultadosUsuario = d["Usuario;acierto"].split(";");
        var resultado = resultadosUsuario[1];
        if (resultados[resultado]) {
            resultados[resultado]++;
        } else {
            resultados[resultado] = 1;
        }
    });
    console.log(resultados)
        // Preparar datos para el gráfico
    var etiquetas = Object.keys(resultados);
    var valores = Object.values(resultados);
    console.log(etiquetas)
    console.log(valores)
        // Crear un gráfico de barras con Chart.js
    var ctx = document.getElementById("grafica_aciertos").getContext("2d");
    var miGrafico = new Chart(ctx, {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Cantidad",
                data: valores,
                backgroundColor: "rgba(16, 44, 87, 1)",
                borderColor: "rgba(16, 44, 87, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

document.getElementById("btn_img").addEventListener("click", function() {
    const seleccion1 = document.getElementById("seleccion1");
    const seleccion2 = document.getElementById("seleccion2");
    seleccion1.style.display = "block";
    seleccion2.style.display = "none";
});
document.getElementById("btn_video").addEventListener("click", function() {
    const seleccion1 = document.getElementById("seleccion1");
    const seleccion2 = document.getElementById("seleccion2");
    seleccion1.style.display = "none";
    seleccion2.style.display = "block";
});
// video
document.addEventListener("DOMContentLoaded", function() {
    const seleccion2 = document.getElementById("seleccion2");
    const videoElement = document.createElement("video");
    const captureButton = document.getElementById("capture_button");
    const captureImage = document.getElementById("capture_image");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    seleccion2.appendChild(videoElement);

    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function(stream) {
            videoElement.srcObject = stream;
            videoElement.play();
        })
        .catch(function(error) {
            console.error("Error al acceder a la cámara web: " + error);
        });

    captureButton.addEventListener("click", function() {
        // Capturar la imagen en el canvas
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function(blob) {
            var formData = new FormData();
            formData.append("file", blob);
            var btn_container = document.getElementById("btn_container");
            btn_container.style.display = "block"
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/", true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);

                    if (response.resultado) {
                        var resultadoContainer = document.getElementById("resultado-container");
                        resultadoContainer.style.display = "block";
                        resultadoContainer.textContent = response.resultado;
                    }

                    var diccionarioOrdenado = Object.fromEntries(
                        Object.entries(response.diccionario_ordenado).sort(([, a], [, b]) => b - a)
                    );

                    if (diccionarioOrdenado) {
                        var diccionarioContainer = document.getElementById("diccionario-container");
                        diccionarioContainer.style.display = "block"
                        diccionarioContainer.innerHTML = "";

                        var listaContainer = document.createElement("ul");
                        diccionarioContainer.appendChild(listaContainer);

                        var longitudGuiones = 50;

                        for (var key in diccionarioOrdenado) {
                            var categoria = key;
                            var porcentaje = (diccionarioOrdenado[key] * 100).toFixed(0) + "%";

                            var guiones = "_".repeat(longitudGuiones - categoria.length - porcentaje.length);

                            var listItem = document.createElement("li");

                            var barraHorizontal = document.createElement("div");
                            barraHorizontal.classList.add("barra-horizontal", "part" + porcentaje);
                            barraHorizontal.style.width = porcentaje;

                            listItem.appendChild(barraHorizontal);

                            listItem.innerHTML += categoria + " " + guiones + porcentaje;

                            listaContainer.appendChild(listItem);
                        }
                    }
                }
            };
            xhr.send(formData);
        }, "image/jpeg");
    });
});