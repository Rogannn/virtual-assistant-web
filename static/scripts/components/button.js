/*
 *
 * createButton function use case example:
 * parentDiv.appendChild(createButton("Edit", "blue",
 * { flexRight: true,
 *   addIcon: true,
 *   icon = "fa-pencil"));
 */
function createButton(text = "", color, options = {}) {
  const { flexRight = false, icon = undefined } = options;
  let baseBtn = document.createElement("button");
  baseBtn.classList.add("btn-style");
  if (flexRight) {
    baseBtn.classList.add("flex-right");
  }
  baseBtn.classList.add(color);
  baseBtn.textContent = text;

  if (icon !== undefined) {
    let iconBtn = document.createElement("i");
    iconBtn.classList.add("fa");
    iconBtn.classList.add(icon);
    baseBtn.appendChild(iconBtn);
  }
  return baseBtn;
}

function removeActiveCategoryButton() {
  let buttons = document.querySelectorAll(".category-button");
  buttons.forEach((btn) => {
    btn.classList.remove("active-green-button");
  });
}

function removeActiveIntentButton() {
  let buttons = document.querySelectorAll(".json-button");
  buttons.forEach((btn) => {
    btn.classList.remove("active-green-button");
  });
}
