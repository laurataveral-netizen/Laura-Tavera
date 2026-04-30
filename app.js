console.log("JS FUNCIONANDO");
let carpetas = JSON.parse(localStorage.getItem("carpetas")) || [];

function guardar() {
    localStorage.setItem("carpetas", JSON.stringify(carpetas));
}

async function login() {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;
    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass })
        });
        if (!res.ok) return alert("Error en login");
        const data = await res.json();
        localStorage.setItem("token", data.token);
        alert("Login exitoso");
        document.getElementById("loginbox").style.display = "none";
        document.getElementById("galeria-seccion").style.display = "block";
        mostrarGaleria();
    } catch (err) {
        alert("Error de conexión");
    }
}

function crearCarpeta() {
    let nombre = document.getElementById("nombreCarpeta").value;
    if(!nombre) return alert("Escribe un nombre");
    carpetas.push({ nombre, imagenes: [], privada: confirm("¿Privada?"), mostrar: false });
    guardar();
    mostrarCarpetas();
    mostrarGaleria();
}

function mostrarCarpetas() {
    let select = document.getElementById("carpetas");
    if(!select) return;
    select.innerHTML = "";
    carpetas.forEach((c, i) => { select.innerHTML += `<option value="${i}">${c.nombre}</option>`; });
}

async function subirImagen() {
    let file = document.getElementById("imagen").files[0];
    let carpetaIndex = document.getElementById("carpetas").value;
    let token = localStorage.getItem("token");
    if (!file || carpetaIndex === "") return alert("Faltan datos");

    let formData = new FormData();
    formData.append("imagen", file);

    try {
        const res = await fetch("/upload", {
            method: "POST",
            headers: { "Authorization": token },
            body: formData
        });
        const data = await res.json();
        if (data.ruta) {
             const url = "/uploads/" + data.ruta;
            carpetas[carpetaIndex].imagenes.push(data.ruta);
            guardar();
            alert("Subida con éxito");
            mostrarGaleria();
        }
    } catch (err) {
        alert("Error al subir");
    }
}

function mostrarGaleria() {
    let div = document.getElementById("galeria");
    if(!div) return;
    div.innerHTML = "";
    carpetas.forEach((c, i) => {
        div.innerHTML += `
            <div style="border:3px solid #000000; margin:10px; padding:10px;">
                <h3>${c.nombre}</h3>
                <button onclick="toggleCarpeta(${i})">${c.mostrar ? 'Ocultar' : 'Ver'}</button>
                <div id="folder-${i}"></div>
            </div>`;
        if(c.mostrar) {
            let cont = document.getElementById(`folder-${i}`);
            c.imagenes.forEach((img, j) => {
                // USAMOS RUTA RELATIVA PARA EVITAR EL ERROR DE "MIXED CONTENT"
                cont.innerHTML += `
                    <div style="display:inline-block; margin:5px;">
                        <img src="/uploads/${img}" style="width:100px; height:100px; object-fit:cover;">
                        <br><button onclick="eliminarImg(${i},${j})">❌</button>
                    </div>`;
            });
        }
    });
}

function toggleCarpeta(i) { carpetas[i].mostrar = !carpetas[i].mostrar; mostrarGaleria(); }
function eliminarImg(i, j) { carpetas[i].imagenes.splice(j, 1); guardar(); mostrarGaleria(); }
mostrarCarpetas();
mostrarGaleria();
