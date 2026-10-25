
const form = document.getElementById("item-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const counter = document.getElementById("counter");

const STORAGE_KEY = "mi-laboratorio-items";

let items = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

function renderItems() {
  list.innerHTML = "";

  items.forEach(function (text) {
    const item = document.createElement("li");
    item.textContent = text;
    list.appendChild(item);
  });

  counter.textContent = `Elementos: ${items.length}`;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  items.push(text);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  );

  renderItems();

  input.value = "";
  input.focus();
});

renderItems();
