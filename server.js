const express = require("express");
const multer = require("multer");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require("path"); // Añade esta línea arriba
const fs = require('fs');
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());

app.use(express.static(__dirname)); 

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const SECRET = "clave_super_segura";
let usuarios = [
    { nombre: "1031811335", pin: "1234" }
];
    

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Solo imágenes"), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter
});

app.post("/register", async (req, res) => {
    const { user, pass } = req.body;
    const hash = await bcrypt.hash(pass, 10);
    usuarios.push({ user, pass: hash });
    res.json({ msg: "Usuario creado" });
});

app.post("/login", (req, res) => {
    const { user, pass } = req.body;
    console.log("Intento de login con:", user);

    // Si el usuario no existe en el array, lo agregamos (sin encriptar para probar)
    let usuario = usuarios.find(u => u.user === user);
    
    if (!usuario) {
        usuario = { user, pass: pass }; // Guardamos la pass tal cual
        usuarios.push(usuario);
    }

    // Comparamos directamente
    if (usuario.pass === pass) {
        const token = jwt.sign({ user }, SECRET);
        return res.json({ token });
    } else {
        return res.status(401).send("Error");
    }
});

function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(403).send("Sin token");

    try {
        const data = jwt.verify(token, SECRET);
        req.user = data.user;
        next();
    } catch {
        res.status(403).send("Token inválido");
    }
}

app.post("/upload", auth, upload.single("imagen"), (req, res) => {
    console.log("Usuario:", req.user);
    res.json({ ruta: req.file.filename });
});

app.use("/uploads", express.static("uploads"));

app.use(express.static(__dirname));

app.listen(3000, () => console.log("Servidor en puerto 3000"));
