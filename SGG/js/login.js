const usuariosDePrueba = [
    { usuario: "alumno", clave: "Alumno123!", nombre: "Juan", apellido: "Perez", email: "alumno@escuela.com.ar", fechaNac: "2000-01-01" },
    { usuario: "profesor", clave: "Profe5678#", nombre: "Maria", apellido: "Gomez", email: "profe@escuela.com.ar", fechaNac: "1990-05-10" }
];

function obtenerUsuarios() {
    const listaGuardada = localStorage.getItem("usuariosSGG");
    if (!listaGuardada) {
        localStorage.setItem("usuariosSGG", JSON.stringify(usuariosDePrueba));
        return usuariosDePrueba;
    }
    return JSON.parse(listaGuardada);
}

function guardarUsuarios(lista) {
    localStorage.setItem("usuariosSGG", JSON.stringify(lista));
}

function cambiarTema() {
    const temaActual = document.body.getAttribute("data-tema");
    if (temaActual === "oscuro") {
        document.body.removeAttribute("data-tema");
        localStorage.setItem("temaGuardado", "claro");
    } else {
        document.body.setAttribute("data-tema", "oscuro");
        localStorage.setItem("temaGuardado", "oscuro");
    }
}

function toggleVisibilidad(idCampo, boton) {
    const campo = document.getElementById(idCampo);
    if (campo.type === "password") {
        campo.type = "text";
        boton.innerText = "🔒";
    } else {
        campo.type = "password";
        boton.innerText = "👁️";
    }
}

let intentosFallidos = 0;

function login() {
    const userIngresado = document.getElementById("usuario").value.trim();
    const passIngresada = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");
    const btnIngresar = document.getElementById("btn-ingresar");

    const usuarios = obtenerUsuarios();
    const usuarioValido = usuarios.find(u => u.usuario === userIngresado && u.clave === passIngresada);

    if (usuarioValido) {
        intentosFallidos = 0;
        mensaje.style.color = "green";
        mensaje.innerText = "Login correcto";
        localStorage.setItem("usuarioLogueado", userIngresado);
    } else {
        intentosFallidos++;
        mensaje.style.color = "red";

        if (intentosFallidos >= 3) {
            btnIngresar.disabled = true;
            let tiempoRestante = 30;
            mensaje.innerText = `Bloqueado por seguridad. Reintente en ${tiempoRestante}s`;

            const contador = setInterval(() => {
                tiempoRestante--;
                mensaje.innerText = `Bloqueado por seguridad. Reintente en ${tiempoRestante}s`;
                if (tiempoRestante <= 0) {
                    clearInterval(contador);
                    btnIngresar.disabled = false;
                    intentosFallidos = 0;
                    mensaje.innerText = "";
                }
            }, 1000);
        } else {
            mensaje.innerText = `Datos incorrectos (Intento ${intentosFallidos} de 3)`;
        }
    }
}

function verificarRequisitosClave(clave) {
    const min8 = clave.length >= 8;
    const mayus = /[A-Z]/.test(clave);
    const minus = /[a-z]/.test(clave);
    const num = /[0-9]/.test(clave);
    const especial = /[!@#$%^&*(),.?":{}|<>]/.test(clave);

    actualizarReqHTML("req-min", min8, "Mínimo 8 caracteres");
    actualizarReqHTML("req-mayus", mayus, "Al menos 1 letra Mayúscula");
    actualizarReqHTML("req-minus", minus, "Al menos 1 letra Minúscula");
    actualizarReqHTML("req-num", num, "Al menos 1 número (Dígito)");
    actualizarReqHTML("req-esp", especial, "Al menos 1 carácter especial");

    return min8 && mayus && minus && num && especial;
}

function actualizarReqHTML(id, esValido, texto) {
    const item = document.getElementById(id);
    if (item) {
        item.className = esValido ? "valido" : "invalido";
        item.innerText = (esValido ? "✔️ " : "❌ ") + texto;
    }
}

function calcularEdad(fecha) {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

function validarFormRegistro() {
    const nombre = document.getElementById("reg-nombre").value.trim();
    const apellido = document.getElementById("reg-apellido").value.trim();
    const usuario = document.getElementById("reg-usuario").value.trim();
    const fechaNac = document.getElementById("reg-fecha").value;
    const email = document.getElementById("reg-email").value.trim();
    const pass1 = document.getElementById("reg-pass").value;
    const pass2 = document.getElementById("reg-pass2").value;
    const btnSubmit = document.getElementById("btn-submit-reg");

    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const nombreOK = nombre !== "" && soloLetras.test(nombre);
    const apellidoOK = apellido !== "" && soloLetras.test(apellido);

    const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailOK = emailRegEx.test(email);

    const edad = fechaNac ? calcularEdad(fechaNac) : 0;
    const edadOK = edad >= 14;

    const claveValida = verificarRequisitosClave(pass1);
    const coinciden = pass1 === pass2 && pass1 !== "";

    if (btnSubmit) {
        btnSubmit.disabled = !(nombreOK && apellidoOK && usuario !== "" && edadOK && emailOK && claveValida && coinciden);
    }
}

function registrarUsuario() {
    const nombre = document.getElementById("reg-nombre").value.trim();
    const apellido = document.getElementById("reg-apellido").value.trim();
    const usuario = document.getElementById("reg-usuario").value.trim();
    const fechaNac = document.getElementById("reg-fecha").value;
    const email = document.getElementById("reg-email").value.trim();
    const clave = document.getElementById("reg-pass").value;
    const mensaje = document.getElementById("msg-registro");

    const lista = obtenerUsuarios();
    if (lista.some(u => u.usuario === usuario)) {
        mensaje.style.color = "red";
        mensaje.innerText = "El nombre de usuario ya está registrado.";
        return;
    }

    lista.push({ usuario, clave, nombre, apellido, email, fechaNac });
    guardarUsuarios(lista);

    mensaje.style.color = "green";
    mensaje.innerText = "¡Registro exitoso! Redirigiendo...";
    setTimeout(() => window.location.href = "index.html", 2000);
}

function validarFormRecuperar() {
    const usuario = document.getElementById("rec-usuario").value.trim();
    const pass1 = document.getElementById("rec-pass").value;
    const pass2 = document.getElementById("rec-pass2").value;
    const btnSubmit = document.getElementById("btn-submit-rec");

    const claveValida = verificarRequisitosClave(pass1);
    const coinciden = pass1 === pass2 && pass1 !== "";

    if (btnSubmit) {
        btnSubmit.disabled = !(usuario !== "" && claveValida && coinciden);
    }
}

function cambiarClave() {
    const usuarioInput = document.getElementById("rec-usuario").value.trim();
    const passNueva = document.getElementById("rec-pass").value;
    const mensaje = document.getElementById("msg-recuperar");

    const lista = obtenerUsuarios();
    const index = lista.findIndex(u => u.usuario === usuarioInput);

    if (index === -1) {
        mensaje.style.color = "red";
        mensaje.innerText = "El usuario no existe.";
        return;
    }

    if (lista[index].clave === passNueva) {
        mensaje.style.color = "red";
        mensaje.innerText = "La nueva contraseña no puede ser igual a la actual.";
        return;
    }

    lista[index].clave = passNueva;
    guardarUsuarios(lista);

    mensaje.style.color = "green";
    mensaje.innerText = "¡Contraseña actualizada con éxito! Redirigiendo...";
    setTimeout(() => window.location.href = "index.html", 2000);
}

window.onload = function() {
    obtenerUsuarios();
    const temaGuardado = localStorage.getItem("temaGuardado");
    if (temaGuardado === "oscuro") {
        document.body.setAttribute("data-tema", "oscuro");
    }
};
