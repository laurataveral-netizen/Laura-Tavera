console.log("JS FUNCIONANDO");
let carpetas = JSON.parse(localStorage.getItem("carpetas")) || [];

function guardar() {
    localStorage.setItem("carpetas", JSON.stringify(carpetas));
}

/* LOGIN */
async function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass })
        });

        if (!res.ok) {
            alert("Error en login");
            return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        alert("Login exitoso");
    document.getElementById("loginbox").style.display = "none";
    document.getElementById("galeria-seccion").style.display = "block";
    mostrarGaleria();
        
    } catch (err) {
        alert("No se pudo conectar con el servidor");
    }
}

/* CREAR CARPETA */
function crearCarpeta() {
    let nombre = document.getElementById("nombreCarpeta").value;
    if(nombre === "") {
        alert("Escribe un nombre");
        return;
    }

    let privada = confirm("¿Quieres que la carpeta sea privada?");
    carpetas.push({
        nombre: nombre,
        imagenes: [],
        privada: privada,
        mostrar: false
    });

    guardar();
    mostrarCarpetas();
    mostrarGaleria();
    document.getElementById("nombreCarpeta").value = ""; // Limpiar input
}

/* MOSTRAR CARPETAS EN EL SELECT */
function mostrarCarpetas() {
    let select = document.getElementById("carpetas");
    if(!select) return; 
    select.innerHTML = "";
    carpetas.forEach((c, i) => {
        select.innerHTML += `<option value="${i}">${c.nombre}</option>`;
    });
}

/* SUBIR IMAGEN */
async function subirImagen() {
    let fileInput = document.getElementById("imagen");
    let file = fileInput.files[0];
    let carpetaIndex = document.getElementById("carpetas").value;
    let token = localStorage.getItem("token");

    if (!file || carpetaIndex === "") {
        alert("Selecciona una imagen y una carpeta");
        return;
    }
    if (!token) {
        alert("Debes iniciar sesión primero");
        return;
    }

    let formData = new FormData();
    formData.append("imagen", file);

   try {
        const res = await fetch("/upload", {
            method: "POST",
            headers: { "Authorization": token }, 
            body: formData
        });

        if (!res.ok) throw new Error("Error en el servidor");

        const data = await res.json();
    
        const url = "/uploads/" + data.archivo; 

        alert("Imagen subida con éxito");
        mostrarGaleria(); 
    } catch (err) {
        console.error(err);
        alert("Error subiendo imagen");
    }

/* MOSTRAR GALERÍA */
function mostrarGaleria() {
    let div = document.getElementById("galeria");
    if(!div) return;
    div.innerHTML = "";

    carpetas.forEach((c, i) => {
        let icono = c.privada ? "🔒" : "🌍";
        div.innerHTML += `
            <div style="border:2px solid #000000; margin:5px; padding:5px; border-radius:5px;">
                <h3>${c.nombre} ${icono}</h3>
                <button onclick="toggleCarpeta(${i})">
                    ${c.mostrar ? "Ocultar" : "Ver contenido"}
                </button>
                <div id="carpeta-${i}" style="margin-top:10px;"></div>
            </div>
        `;

        if(c.mostrar) {
            let contenedor = document.getElementById(`carpeta-${i}`);
            c.imagenes.forEach((img, j) => {
                contenedor.innerHTML += `
                    <div style="display:inline-block; text-align:center; margin:5px;">
                        <img src="${img}" style="width:100px; height:100px; object-fit:cover; border-radius:5px;">
                        <br>
                        <button onclick="eliminarImagen(${i}, ${j})">❌</button>
                    </div>
                `;
            });
        }
    });
}

function toggleCarpeta(index) {
    carpetas[index].mostrar = !carpetas[index].mostrar;
    guardar();
    mostrarGaleria();
}

function eliminarImagen(carpetaIndex, imagenIndex) {
    if(confirm("¿Eliminar esta imagen?")) {
        carpetas[carpetaIndex].imagenes.splice(imagenIndex, 1);
        guardar();
        mostrarGaleria();
    }
}

/* INICIO */
mostrarCarpetas();
mostrarGaleria();
