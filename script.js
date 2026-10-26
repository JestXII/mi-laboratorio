
const SUPABASE_URL = "https://ifsmymgczyhgcjnayplu.supabase.co";
const SUPABASE_KEY = "sb_publishable_NTZZ29N0kWZvJZS18PVQYw_5RsMliCC";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("auth-email");
const passwordInput = document.getElementById("auth-password");
const registerBtn = document.getElementById("register-btn");
const resendEmailBtn = document.getElementById("resend-email-btn");
const logoutBtn = document.getElementById("logout-btn");
const authMessage = document.getElementById("auth-message");

const form = document.getElementById("item-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const counter = document.getElementById("counter");

let currentUser = null;
let items = [];

function updateAuthUI() {
  const loggedIn = Boolean(currentUser);

  form.hidden = !loggedIn;
  list.hidden = !loggedIn;
  logoutBtn.hidden = !loggedIn;

  if (loggedIn) {
    authMessage.textContent =
      "Sesión iniciada: " + currentUser.email;
  } else {
    authMessage.textContent =
      "Inicia sesión para ver tus tareas.";
    items = [];
    renderItems();
    counter.textContent = "Inicia sesión para continuar.";
  }
}

async function loadItems() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("tareas")
    .select("*")
    .eq("usuario_id", currentUser.id)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    counter.textContent = "Error al cargar tareas.";
    return;
  }

  items = data;
  renderItems();
}

function renderItems() {
  list.innerHTML = "";

  items.forEach(function (item) {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.completada;

    checkbox.addEventListener("change", async function () {
      checkbox.disabled = true;

      const { error } = await supabaseClient
        .from("tareas")
        .update({ completada: checkbox.checked })
        .eq("id", item.id);

      if (error) {
        alert("Error al actualizar: " + error.message);
      }

      await loadItems();
    });

    const texto = document.createElement("span");
    texto.textContent = " " + item.nombre;

    if (item.completada) {
      texto.style.textDecoration = "line-through";
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Eliminar";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", async function () {
      if (!confirm(`¿Eliminar "${item.nombre}"?`)) return;

      deleteBtn.disabled = true;

      const { error } = await supabaseClient
        .from("tareas")
        .delete()
        .eq("id", item.id);

      if (error) {
        alert("Error al eliminar: " + error.message);
        deleteBtn.disabled = false;
        return;
      }

      await loadItems();
    });

    li.appendChild(checkbox);
    li.appendChild(texto);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  counter.textContent = `Elementos: ${items.length}`;
}

registerBtn.addEventListener("click", async function () {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    authMessage.textContent = "Completa correo y contraseña.";
    return;
  }

  registerBtn.disabled = true;
  authMessage.textContent = "Creando cuenta...";

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  registerBtn.disabled = false;

  if (error) {
    authMessage.textContent = "Error: " + error.message;
    return;
  }

  if (data.session) {
    authMessage.textContent = "Cuenta creada correctamente.";
  } else {
    authMessage.textContent =
      "Cuenta creada. Revisa tu correo para confirmarla y después inicia sesión.";
  }
});

authForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailInput.value.trim(),
    password: passwordInput.value
  });

  if (error) {
    authMessage.textContent = "Error: " + error.message;
  }
});

logoutBtn.addEventListener("click", async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    authMessage.textContent = "Error al cerrar sesión: " + error.message;
  }
});

supabaseClient.auth.onAuthStateChange(function (_event, session) {
  currentUser = session ? session.user : null;
  updateAuthUI();

  if (currentUser) {
    loadItems();
  }
});

async function initializeApp() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    authMessage.textContent = "Error al recuperar la sesión.";
    return;
  }

  currentUser = data.session ? data.session.user : null;
  updateAuthUI();

  if (currentUser) {
    await loadItems();
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!currentUser) return;

  const nombre = input.value.trim();
  if (!nombre) return;

  const { error } = await supabaseClient
    .from("tareas")
    .insert({
      nombre: nombre,
      usuario_id: currentUser.id
    });

  if (error) {
    alert("Error al guardar: " + error.message);
    return;
  }

  input.value = "";
  await loadItems();
});

initializeApp();

resendEmailBtn.addEventListener("click", async function () {
  const email = emailInput.value.trim();

  if (!email) {
    authMessage.textContent = "Escribe tu correo primero.";
    return;
  }

  resendEmailBtn.disabled = true;
  authMessage.textContent = "Solicitando nuevo correo...";

  const { error } = await supabaseClient.auth.resend({
    type: "signup",
    email: email
  });

  resendEmailBtn.disabled = false;

  if (error) {
    authMessage.textContent =
      "No se pudo reenviar: " + error.message;
    return;
  }

  authMessage.textContent =
    "Solicitud enviada. Revisa tu bandeja y correo no deseado.";
});
async function probarMiUsuario() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {
    authMessage.textContent =
      "Primero inicia sesión.";
    return;
  }

  authMessage.textContent = "Probando conexión...";

  try {
    const respuesta = await fetch(
      "https://mi-laboratorio-api.onrender.com/api/mi-usuario",
      {
        headers: {
          Authorization:
            `Bearer ${data.session.access_token}`
        }
      }
    );

    const resultado = await respuesta.json();

    authMessage.textContent = respuesta.ok
      ? `¡Funciona! Usuario verificado: ${resultado.email}`
      : `Error ${respuesta.status}: ${resultado.error || "No se pudo verificar"}`;
  } catch (error) {
    authMessage.textContent =
      "No se pudo conectar con el backend.";
  }
}
document
  .getElementById("test-backend-btn")
  .addEventListener("click", probarMiUsuario);
