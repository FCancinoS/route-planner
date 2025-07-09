import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCL22uIwUi9yerNEFNotmBt4Be-VV43Fbk",
    authDomain: "route-planner-a897e.firebaseapp.com",
    databaseURL: "https://route-planner-a897e-default-rtdb.firebaseio.com",
    projectId: "route-planner-a897e",
    storageBucket: "route-planner-a897e.firebasestorage.app",
    messagingSenderId: "126722834985",
    appId: "1:126722834985:web:c379f57d7afde0ce0f5238"
  };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentSession = null;
let controlsUnlocked = false;

$(document).ready(() => {
  $("#crear").on("click", crearSesion);
  $("#entrar").on("click", entrarSesion);
  $("#button").on("click", addItem);
  $("#desbloquear").on("click", desbloquear);
  $(document).on("click", ".revisado", toggleCheck);
  $(document).on("click", ".borrar", deleteItem);
});

function crearSesion(e) {
  e.preventDefault();
  currentSession = generarCodigo();
  window.location.hash = currentSession;
  insertarEtiquetaSesion(currentSession);
  cargarSesion();
}

function entrarSesion(e) {
  e.preventDefault();
  const codigo = $("#codigo").val().trim();
  if (!codigo) return;
  currentSession = codigo;
  window.location.hash = codigo;
  insertarEtiquetaSesion(codigo);
  cargarSesion();
}

function cargarSesion() {
  $(".session-bar").hide();
  $(".container").fadeIn();
  $("ul").empty();

  const sesionRef = ref(db, `listas/${currentSession}`);
  onValue(sesionRef, (snapshot) => {
    $("ul").empty();
    snapshot.forEach((child) => {
      const key = child.key;
      const { lugar_traslado, paciente, fecha_hora, estado } = child.val();

      const fechaFormateada = fecha_hora.replace('T', ' ');

      const li = $(`
        <li data-id="${key}" class="${estado ? 'ready' : ''}">
          <p><strong>${lugar_traslado}</strong> - ${paciente} - ${fechaFormateada}</p>
          <div>
            <button class="revisado"><i class="fas fa-check"></i></button>
            ${controlsUnlocked ? `<button class="borrar"><i class="fas fa-trash-alt"></i></button>` : ''}
          </div>
        </li>
      `);

      $("ul").append(li);
    });
  });
}


function desbloquear(e) {
  e.preventDefault();
  const clave = $("#clave").val().trim();
  if (clave === "estetoscopio200") {
    controlsUnlocked = true;
    $("#theform").show();
    $("#temporal-control").hide();

    cargarSesion(); // recargar para mostrar botones
  } else {
    alert("Clave incorrecta");
  }
}

function addItem(e) {
  e.preventDefault();
  if (!currentSession) return;

  const lugar = $("#lugar").val().trim();
  const paciente = $("#paciente").val().trim();
  const fecha_hora = $("#fecha_hora").val();

  if (!lugar || !paciente || !fecha_hora) return alert("Llena todos los campos");

  const sesionRef = ref(db, `listas/${currentSession}`);
  push(sesionRef, { lugar_traslado: lugar, paciente, fecha_hora, estado: false });


  $("#lugar").val("");
  $("#paciente").val("");
  $("#fecha_hora").val("");
}

function toggleCheck(e) {
  e.preventDefault();
  const li = $(this).closest("li");
  const key = li.data("id");
  const checked = li.hasClass("ready");

  update(ref(db, `listas/${currentSession}/${key}`), {
    estado: !checked
  });
}

function deleteItem(e) {
  e.preventDefault();
  const key = $(this).closest("li").data("id");
  remove(ref(db, `listas/${currentSession}/${key}`));
}

function insertarEtiquetaSesion(codigo) {
  $("#session-id").remove();
  $(".container h2").after(`
    <div class="copy-button">
      <p id="session-id">ID de sesión: ${codigo}</p>
      <button id="copiar-link" title="Copiar enlace de acceso"><i class="fas fa-copy"></i></button>
    </div>
  `);
  $("#copiar-link").on("click", () => {
    const enlace = `${location.origin}${location.pathname}#${codigo}`;
    navigator.clipboard.writeText(`Enlace: ${enlace} Código: ${codigo}`);
    alert("Enlace copiado");
  });
}

function generarCodigo() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789'; // Quitamos O, I, l, 0
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres[randomIndex];
  }
  return codigo;
}
