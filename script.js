
const form = document.getElementById("item-form");
const input = document.getElementById("item-input");
const list = document.getElementById("item-list");
const counter = document.getElementById("counter");

let total = 0;

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  const item = document.createElement("li");
  item.textContent = text;

  list.appendChild(item);

  total++;
  counter.textContent = `Elementos: ${total}`;

  input.value = "";
  input.focus();
});
