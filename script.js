const SUPABASE_URL = "https://ifsmymgczyhgcjnayplu.supabase.co/rest/v1/";
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
    console.error("Error al cargar tareas:", error.message);
    counter.textContent = "Error al cargar las tareas";
    return;
  }

  items = data;
  renderItems();
}

function renderItems() {
  list.innerHTML = "";

  items.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item.nombre;
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
