
const SUPABASE_URL = "https://ifsmymgczyhgcjnayplu.supabase.co";
const SUPABASE_KEY = "sb_publishable_NTZZ29N0kWZvJZS18PVQYw_5RsMliCC";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.getElementById("item-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const counter = document.getElementById("counter");

let items = [];

async function loadItems() {
  const { data, error } = await supabaseClient
    .from("tareas")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error al cargar tareas:", error);
    counter.textContent = "Error: " + error.message;
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
    checkbox.disabled = false;

    checkbox.addEventListener("change", async function () {
      checkbox.disabled = true;

      const { error } = await supabaseClient
        .from("tareas")
        .update({ completada: checkbox.checked })
        .eq("id", item.id);

      if (error) {
        alert("No se pudo actualizar: " + error.message);
        checkbox.checked = item.completada;
        checkbox.disabled = false;
        return;
      }

      await loadItems();
    });

    const texto = document.createElement("span");
    texto.textContent = " " + item.nombre;

    if (item.completada) {
      texto.style.textDecoration = "line-through";
    }

    li.appendChild(checkbox);
    li.appendChild(texto);
    list.appendChild(li);
  });

  counter.textContent = `Elementos: ${items.length}`;
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nombre = input.value.trim();
  if (!nombre) return;

  const { error } = await supabaseClient
    .from("tareas")
    .insert({ nombre: nombre });

  if (error) {
    console.error("Error al guardar:", error.message);
    alert("No se pudo guardar la tarea: " + error.message);
    return;
  }

  input.value = "";
  await loadItems();
});

loadItems();
