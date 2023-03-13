const intentsjsonOutput = document.getElementById("intents-json-output");
const outputIntentsDiv = document.createElement("div");
outputIntentsDiv.classList.add("json-output-container");
intentsjsonOutput.appendChild(outputIntentsDiv);

const categoryjsonOutput = document.getElementById("category-json-output");
const outputcategoryDiv = document.createElement("div");
outputcategoryDiv.classList.add("json-output-container");
categoryjsonOutput.appendChild(outputcategoryDiv);

let queries;

var request_categories = new XMLHttpRequest();

request_categories.open("GET", "static/scripts/categorical_queries.json", true);

request_categories.onload = function () {
  if (request_categories.status >= 200 && request_categories.status < 400) {
    var data = JSON.parse(request_categories.responseText);
    queries = data;
    displayCategoryRawFile();
    addCategoryButton();
  } else {
    console.error(
      "Failed to load data from server. Status code: " +
        request_categories.status
    );
  }
};
request_categories.send();

var categoriesTextArea = document.getElementById("category-json-editor");

function displayCategoryRawFile() {
  var jsonData = JSON.stringify(queries, null, 4);
  categoriesTextArea.value = jsonData;

  var lines = jsonData.split("\n").length;
  var cols = categoriesTextArea.cols;
  categoriesTextArea.rows = lines;
  categoriesTextArea.cols = Math.max(cols, jsonData.length / lines);
}

let intents;

var request_intents = new XMLHttpRequest();
request_intents.open("GET", "static/scripts/intents.json", true);

request_intents.onload = function () {
  if (request_intents.status >= 200 && request_intents.status < 400) {
    var data = JSON.parse(request_intents.responseText);
    intents = data;
    displayIntentsRawFile();
    addIntentTagButton();
  } else {
    console.error(
      "Failed to load data from server. Status code: " + request_intents.status
    );
  }
};
request_intents.send();

var intentsTextArea = document.getElementById("intents-json-editor");
var allTagButton = document.getElementById("all-tag");

let active_tag_button = false;
allTagButton.onclick = function () {
  active_tag_button = !active_tag_button;
  if (active_tag_button) {
    outputIntentsDiv.innerHTML = "";
    removeActiveIntentButton();
    for (let i in intents["intents"]) {
      displayIntentTagContent(
        intents["intents"][i],
        parseInt(i),
        outputIntentsDiv,
        true
      );
    }
  } else {
    outputIntentsDiv.innerHTML = "";
  }
};

const intentTagButtonsDiv = document.getElementsByClassName(
  "json-button-container"
)[0];
const intentTagMethodsButtonsDiv = document.getElementsByClassName(
  "intent-methods-container"
)[0];
const categoryButtonsDiv = document.getElementsByClassName(
  "category-button-container"
)[0];

function intentIsMethod(intentResponse) {
  if (intentResponse.length === 1 && intentResponse[0] === "") {
    return true;
  } else {
    return false;
  }
}

function addIntentTagButton() {
  const methodButtons = [];
  intents["intents"].forEach((intent) => {
    // INTENT TAG BUTTONS
    if (intentIsMethod(intent["responses"])) {
      // IF INTENT RESPONSE IS METHOD
      let methodButton = document.createElement("button");
      methodButton.textContent = intent["tag"];
      methodButton.classList.add("json-button");
      methodButton.onclick = function () {
        active_tag_button = false;
        let index = intents["intents"].indexOf(intent);
        outputIntentsDiv.innerHTML = "";

        if (methodButton.classList.contains("active-green-button")) {
          removeActiveIntentButton();
        } else {
          removeActiveIntentButton();
          displayIntentTagContent(
            intents["intents"][index],
            index,
            outputIntentsDiv,
            true
          );
          methodButton.classList.add("active-green-button");
        }
      };
      methodButtons.push(methodButton);
    } else {
      // IF INTENT RESPONSE IS NOT METHOD
      let button = document.createElement("button");
      button.textContent = intent["tag"];
      button.classList.add("json-button");
      button.onclick = function () {
        active_tag_button = false;
        let index = intents["intents"].indexOf(intent);
        outputIntentsDiv.innerHTML = "";

        if (button.classList.contains("active-green-button")) {
          removeActiveIntentButton();
        } else {
          removeActiveIntentButton();
          displayIntentTagContent(
            intents["intents"][index],
            index,
            outputIntentsDiv,
            true
          );
          button.classList.add("active-green-button");
        }
      };
      intentTagButtonsDiv.appendChild(button);
    }
  });

  // ADD NEW INTENT TAG BUTTON
  const addIntentButton = createButton("+ Add new intent", "blue");
  addIntentButton.onclick = function () {
    outputIntentsDiv.innerHTML = "";
    newIntentForm();
    removeActiveIntentButton();
  };
  intentTagButtonsDiv.appendChild(addIntentButton);

  // Add method buttons to intentTagButtonsDiv
  for (let b = 0; b < methodButtons.length; b++) {
    intentTagMethodsButtonsDiv.appendChild(methodButtons[b]);
  }
}

function newIntentForm() {
  let intentForm = document.createElement("form");
  intentForm.setAttribute("method", "POST");
  intentForm.setAttribute("action", "/add_intent");
  outputIntentsDiv.appendChild(intentForm);

  addKeyElement("Tag: ", intentForm);
  addInputBox("input-tag", "hello_world", intentForm);

  addKeyElement("Patterns: ", intentForm);
  addInputBox("input-patterns", "hello world, hello universe", intentForm);

  addKeyElement("Responses: ", intentForm);
  addInputBox("input-responses", "Hello world to you too!", intentForm);

  let submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.classList.add("add-intent-button");
  submitBtn.onclick = function (e) {
    e.preventDefault();
    let tag = document.getElementById("input-tag").value;
    let patterns = document.getElementById("input-patterns").value;
    let responses = document.getElementById("input-responses").value;
    fetch("/add_intent", {
      method: "POST",
      body: JSON.stringify({
        tag: tag,
        patterns: patterns,
        responses: responses,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log(data);
          openSuccessModal();
        } else {
          console.error("Error: ", data.error);
          openErrorModal();
        }
      })
      .catch((error) => console.error("Error: ", error));
  };
  intentForm.appendChild(document.createElement("br"));
  intentForm.appendChild(submitBtn);
}

function addInputBox(
  id,
  placeholder = "",
  parentDiv,
  value = "",
  isDisabled = false,
  setWidth = 100
) {
  let i = document.createElement("input");
  i.value = value;
  i.classList.add("edit-inputs");
  i.placeholder = placeholder;
  i.disabled = isDisabled;
  i.id = id;
  parentDiv.appendChild(i);

  const text = document.createElement("span");
  text.innerText = value;
  text.style.fontSize = window.getComputedStyle(i).fontSize;
  text.style.fontFamily = window.getComputedStyle(i).fontFamily;
  text.style.fontWeight = window.getComputedStyle(i).fontWeight;
  text.style.display = "inline-block";
  text.style.visibility = "hidden";
  document.body.appendChild(text);

  const input_width = i.scrollWidth + 5;
  i.style.width = input_width + "px";

  // Update width while typing
  i.addEventListener("input", () => {
    const new_width = i.scrollWidth + 5;
    i.style.width = new_width + "px";
  });

  text.remove();

  if (input_width < setWidth) {
    i.style.width = setWidth + "px";
    i.style.maxWidth = "100%";
  } else if (input_width > parentDiv.offsetWidth) {
    i.style.width = "100%";
    i.style.maxWidth = parentDiv.offsetWidth + "px";
  } else if (input_width > setWidth) {
    i.style.width = input_width + "px";
    i.style.maxWidth = "100%";
  }
}

function addKeyElement(text, parentDiv, element = "p") {
  let s = document.createElement(element);
  s.textContent = text;
  s.classList.add("key");
  parentDiv.appendChild(s);
}

function addCategoryButton() {
  Object.keys(queries).forEach((key) => {
    let button = document.createElement("button");
    button.textContent = "Category " + key;
    button.classList.add("category-button");
    button.onclick = function () {
      outputcategoryDiv.innerHTML = "";
      let buttons = document.querySelectorAll(".category-button");

      if (button.classList.contains("active-green-button")) {
        removeActiveCategoryButton();
      } else {
        removeActiveCategoryButton();
        displayQuestionsByCategory(queries[key], key, outputcategoryDiv);
        button.classList.add("active-green-button");
      }
    };
    categoryButtonsDiv.appendChild(button);
  });
}

function displayIntentsRawFile() {
  var jsonData = JSON.stringify(intents, null, 4);
  intentsTextArea.value = jsonData;

  var lines = jsonData.split("\n").length;
  var cols = intentsTextArea.cols;
  intentsTextArea.rows = lines;
  intentsTextArea.cols = Math.max(cols, jsonData.length / lines);
}

function saveJson(jsonFile) {
  let updatedData;
  if (jsonFile == "categories") {
    updatedData = JSON.parse(categoriesTextArea.value);
  } else if (jsonFile == "intents") {
    updatedData = JSON.parse(intentsTextArea.value);
  }
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/update-" + jsonFile + "-json", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(updatedData));
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        openSuccessModal();
        console.log(xhr.responseText);
      } else {
        openErrorModal();
        console.error("Failed to save data. Status code: " + xhr.status);
      }
    }
  };
}

/*
 *
 * displayNestedJson is for display of all intents in intents.json
 *
 */
const displayNestedJson = (jsonObj, parentDiv) => {
  const keys = Object.keys(jsonObj);
  keys.forEach((key) => {
    const value = jsonObj[key];
    let div = document.createElement("div");
    let keySpan = document.createElement("span");
    let valueSpan = document.createElement("span");

    keySpan.textContent = key + ": ";
    keySpan.classList.add("key");

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        valueSpan.classList.add("array");
        value.forEach((item) => {
          const nestedDiv = createNestedDiv(item);
          valueSpan.appendChild(nestedDiv);
        });
      } else {
        const nestedDiv = createNestedDiv(value);
        valueSpan.appendChild(nestedDiv);
      }
    } else {
      valueSpan.textContent = value;
    }

    valueSpan.classList.add("value");

    div.appendChild(keySpan);
    div.appendChild(valueSpan);

    parentDiv.appendChild(div);
  });
};

const createNestedDiv = (value) => {
  let nestedDiv = document.createElement("div");

  if (Array.isArray(value)) {
    value.forEach((elem) => {
      let div = document.createElement("div");
      let span = document.createElement("span");
      span.textContent = elem;
      div.appendChild(span);
      nestedDiv.appendChild(div);
    });
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([key, val]) => {
      let div = document.createElement("div");
      let spanKey = document.createElement("span");
      spanKey.textContent = key + ": ";
      div.appendChild(spanKey);
      nestedDiv.appendChild(div);
      let spanVal = document.createElement("span");
      spanVal.textContent = val;
      div.appendChild(spanVal);
    });
  } else {
    let span = document.createElement("span");
    span.textContent = value;
    nestedDiv.appendChild(span);
  }

  return nestedDiv;
};

function editCategory(categoryJson, categoryNum) {
  let categoryForm = document.createElement("form");
  categoryForm.setAttribute("method", "POST");
  categoryForm.setAttribute("action", "/edit_category");
  outputcategoryDiv.innerHTML = "";

  let categoryHeader = document.createElement("h4");
  categoryHeader.textContent = "Category " + categoryNum;

  const submitBtn = createButton("Submit", "blue", {
    flexRight: true,
  });
  submitBtn.onclick = function (e) {
    e.preventDefault();
    openConfirmationModal(
      "You are about to edit " +
        '"Category ' +
        categoryNum +
        '"' +
        ". Continue?",
      function () {
        submitEditCategory(categoryNum);
      }
    );
  };

  const cancelEditBtn = createButton("Cancel", "red", {
    flexRight: true,
  });
  cancelEditBtn.onclick = function (e) {
    e.preventDefault();
    outputcategoryDiv.innerHTML = "";

    displayQuestionsByCategory(
      queries[categoryNum],
      categoryNum,
      outputcategoryDiv
    );
  };
  outputcategoryDiv.appendChild(categoryHeader);
  outputcategoryDiv.appendChild(categoryForm);
  outputcategoryDiv.appendChild(submitBtn);
  outputcategoryDiv.appendChild(cancelEditBtn);

  for (let key in categoryJson) {
    const deleteButton = createButton("", "red", {
      icon: "fa-trash",
    });
    deleteButton.onclick = function (e) {
      e.preventDefault();
      const intKey = parseInt(key) + 1;
      openConfirmationModal(
        "You are about to delete " +
          "Question " +
          intKey +
          " in Category " +
          categoryNum +
          ". Continue?",
        function () {
          deleteQueryInCategory(key, categoryNum);
        }
      );
    };
    categoryForm.appendChild(deleteButton);
    addKeyElement(parseInt(key) + 1 + ": ", categoryForm, "span");
    addInputBox("edit-category", undefined, categoryForm, categoryJson[key]);
    categoryForm.appendChild(document.createElement("br"));
  }
}

function deleteQueryInCategory(key, categoryNum) {
  console.log("Deleting id: ", key);
  fetch("/delete_query_category", {
    method: "POST",
    body: JSON.stringify({
      category: categoryNum,
      key: parseInt(key),
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data);
        openSuccessModal();
      } else {
        console.error("Error: ", data.error);
        openErrorModal();
      }
    })
    .catch((error) => console.error("Error: ", error));
}

function submitEditCategory(categoryNum) {
  const categoryInputs = document.querySelectorAll("#edit-category");
  const box = [];
  categoryInputs.forEach((q) => {
    box.push(q.value);
  });
  fetch("/edit_category", {
    method: "POST",
    body: JSON.stringify({
      category: categoryNum,
      queries: box,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data);
        openSuccessModal();
      } else {
        console.error("Error: ", data.error);
        openErrorModal();
      }
    })
    .catch((error) => console.error("Error: ", error));
}

/*
 *
 * displayQuestionsByCategory is for simple display of jsons
 * use only if displaying categories
 */
const displayQuestionsByCategory = (
  jsonObj,
  category,
  parentDiv,
  enableTagClass
) => {
  const editCategoryButton = createButton("Edit", "blue", {
    flexRight: true,
    icon: "fa-pencil",
  });
  editCategoryButton.onclick = function () {
    outputIntentsDiv.innerHTML = "";
    editCategory(jsonObj, category);
  };
  parentDiv.appendChild(editCategoryButton);
  const addQueryButton = createButton("Add", "blue", {
    flexRight: true,
    icon: "fa-plus-square-o",
  });
  addQueryButton.onclick = function () {
    outputIntentsDiv.innerHTML = "";
    addQueryInCategory(jsonObj, category);
  };
  parentDiv.appendChild(addQueryButton);

  const keys = Object.keys(jsonObj);
  let categoryHeader = document.createElement("h4");
  categoryHeader.textContent = "Category " + category;
  parentDiv.appendChild(categoryHeader);

  keys.forEach((key) => {
    const value = jsonObj[key];
    let div = document.createElement("div");
    let keySpan = document.createElement("span");
    let valueSpan = document.createElement("span");
    div.classList.add("json-output-div");

    keySpan.textContent = parseInt(key) + 1 + ": ";
    keySpan.classList.add("key");

    if (Array.isArray(value)) {
      value.forEach((element) => {
        let elementSpan = document.createElement("span");
        elementSpan.classList.add("json-value");
        elementSpan.textContent = element;
        valueSpan.appendChild(elementSpan);
      });
    } else if (typeof value === "object") {
      valueSpan.appendChild(createArrayNestedDiv(value));
    } else {
      valueSpan.textContent = value;
      if (enableTagClass) {
        valueSpan.classList.add("json-output-tag");
      }
    }

    valueSpan.classList.add("value");

    div.appendChild(keySpan);
    div.appendChild(valueSpan);

    parentDiv.appendChild(div);
  });
};

function createArrayNestedDiv(data) {
  const nestedDiv = document.createElement("div");
  nestedDiv.classList.add("nested");

  for (let key in data) {
    const value = data[key];
    const propertyDiv = document.createElement("div");
    propertyDiv.classList.add("property");

    if (Array.isArray(data)) {
      propertyDiv.textContent = createArrayNestedDiv(value).textContent;
    } else {
      if (!isNaN(key)) continue;
      const keyDiv = document.createElement("div");
      keyDiv.classList.add("key");
      keyDiv.textContent = key + ":";
      propertyDiv.appendChild(keyDiv);
      propertyDiv.appendChild(createArrayNestedDiv(value));
    }

    nestedDiv.appendChild(propertyDiv);
  }

  return nestedDiv;
}

function addQueryInCategory(jsonObj, category) {
  let categoryQueryForm = document.createElement("form");
  categoryQueryForm.setAttribute("method", "POST");
  categoryQueryForm.setAttribute("action", "/add_query_category");
  outputcategoryDiv.innerHTML = "";
  outputcategoryDiv.appendChild(categoryQueryForm);

  addKeyElement(parseInt(jsonObj.length) + 1 + ": ", categoryQueryForm, "span");
  addInputBox("input-query", "", categoryQueryForm);

  let submitBtn = createButton("Submit", "blue", {
    flexRight: true,
  });
  submitBtn.onclick = function (e) {
    e.preventDefault();
    submitQueryInCategory(category);
  };
  const cancelEditBtn = createButton("Cancel", "red", {
    flexRight: true,
  });
  cancelEditBtn.onclick = function (e) {
    e.preventDefault();
    outputcategoryDiv.innerHTML = "";
    displayQuestionsByCategory(queries[category], category, outputcategoryDiv);
  };
  outputcategoryDiv.appendChild(submitBtn);
  outputcategoryDiv.appendChild(cancelEditBtn);
}

function submitQueryInCategory(categoryNum) {
  const newQuery = document.getElementById("input-query").value;
  fetch("/add_query_category", {
    method: "POST",
    body: JSON.stringify({
      category: categoryNum,
      queries: newQuery,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data);
        openSuccessModal();
      } else {
        console.error("Error: ", data.error);
        openErrorModal();
      }
    })
    .catch((error) => console.error("Error: ", error));
}

const displayIntentTagContent = (jsonObj, index, parentDiv, enableTagClass) => {
  const keys = Object.keys(jsonObj);

  const editButton = createButton("Edit", "blue", {
    flexRight: true,
    icon: "fa-pencil",
  });
  editButton.onclick = function () {
    outputIntentsDiv.innerHTML = "";
    editIntentById(jsonObj, index);
  };

  parentDiv.appendChild(editButton);

  const deleteButton = createButton("Delete", "red", {
    flexRight: true,
    icon: "fa-trash",
  });
  deleteButton.onclick = function () {
    openConfirmationModal(
      "You are about to delete " + '"' + jsonObj["tag"] + '"' + ". Continue?",
      function () {
        deleteIntentById(index);
      }
    );
  };

  parentDiv.appendChild(deleteButton);

  keys.forEach((key) => {
    const value = jsonObj[key];
    let div = document.createElement("div");
    let keySpan = document.createElement("span");
    let valueSpan = document.createElement("span");
    div.classList.add("json-output-div");

    keySpan.textContent = key + ": ";
    keySpan.classList.add("key");
    if (Array.isArray(value)) {
      value.forEach((element) => {
        let elementSpan = document.createElement("span");
        elementSpan.classList.add("json-value");
        if (intentIsMethod(value)) {
          elementSpan.textContent = "[Method]";
        } else {
          elementSpan.textContent = element;
        }
        valueSpan.appendChild(elementSpan);
      });
    } else if (typeof value === "object") {
      valueSpan.appendChild(createNestedIntentTagContent(value));
    } else {
      valueSpan.textContent = value;
      if (enableTagClass) {
        valueSpan.classList.add("json-output-tag");
      }
    }

    valueSpan.classList.add("value");
    div.appendChild(keySpan);
    div.appendChild(valueSpan);

    parentDiv.appendChild(div);
  });
};

function createNestedIntentTagContent(data) {
  const nestedDiv = document.createElement("div");
  nestedDiv.classList.add("nested");

  for (let key in data) {
    const value = data[key];
    const propertyDiv = document.createElement("div");
    propertyDiv.classList.add("property");

    if (Array.isArray(data)) {
      propertyDiv.textContent = createNestedIntentTagContent(value).textContent;
    } else {
      if (!isNaN(key)) continue;
      const keyDiv = document.createElement("div");
      keyDiv.classList.add("key");
      keyDiv.textContent = key + ":";
      propertyDiv.appendChild(keyDiv);
      propertyDiv.appendChild(createNestedIntentTagContent(value));
    }

    nestedDiv.appendChild(propertyDiv);
  }

  return nestedDiv;
}

function editIntentById(intentJson, id) {
  console.log("Editing id: ", id);
  let intentForm = document.createElement("form");
  intentForm.setAttribute("method", "POST");
  intentForm.setAttribute("action", "/edit_intent");
  outputIntentsDiv.appendChild(intentForm);

  addKeyElement("Tag: ", intentForm);
  addInputBox("edit-tag", undefined, intentForm, intentJson["tag"]);

  addKeyElement("Pattern: ", intentForm);
  for (let item in intentJson["patterns"]) {
    addInputBox(
      "edit-patterns",
      undefined,
      intentForm,
      intentJson["patterns"][item]
    );
  }

  addKeyElement("Responses: ", intentForm);
  if (intentIsMethod(intentJson["responses"])) {
    addInputBox("edit-responses", "Method not editable", intentForm, "", true);
  } else {
    for (let item in intentJson["responses"]) {
      addInputBox(
        "edit-responses",
        undefined,
        intentForm,
        intentJson["responses"][item]
      );
    }
  }

  const submitBtn = createButton("Submit", "blue", {
    flexRight: true,
  });
  submitBtn.onclick = function (e) {
    e.preventDefault();
    openConfirmationModal(
      "You are about to edit " + '"' + intentJson["tag"] + '"' + ". Continue?",
      function () {
        submitEditIntent(id);
      }
    );
  };

  const cancelEditBtn = createButton("Cancel", "red", {
    flexRight: true,
  });
  cancelEditBtn.onclick = function (e) {
    e.preventDefault();
    outputIntentsDiv.innerHTML = "";
    displayIntentTagContent(intents["intents"][id], id, outputIntentsDiv, true);
  };
  outputIntentsDiv.appendChild(submitBtn);
  outputIntentsDiv.appendChild(cancelEditBtn);
}

function submitEditIntent(id) {
  let tag = document.getElementById("edit-tag").value;
  const patternInputs = document.querySelectorAll("#edit-patterns");
  const responseInputs = document.querySelectorAll("#edit-responses");
  const patterns = [];
  const responses = [];
  patternInputs.forEach((data) => {
    patterns.push(data.value);
  });
  responseInputs.forEach((data) => {
    responses.push(data.value);
  });
  fetch("/edit_intent", {
    method: "POST",
    body: JSON.stringify({
      id: id,
      tag: tag,
      patterns: patterns,
      responses: responses,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data);
        openSuccessModal();
      } else {
        console.error("Error: ", data.error);
        openErrorModal();
      }
    })
    .catch((error) => console.error("Error: ", error));
}

function deleteIntentById(id) {
  console.log("Deleting id: ", id);
  fetch("/delete_intent", {
    method: "POST",
    body: JSON.stringify({
      index: id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log(data);
        openSuccessModal();
      } else {
        console.error("Error: ", data.error);
        openErrorModal();
      }
    })
    .catch((error) => console.error("Error: ", error));
}

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

var modal = document.querySelector(".modal");
var modalContent = document.querySelector(".modal-content");
var closeBtn = document.querySelector(".close-modal");

function openSuccessModal() {
  modal.style.display = "block";
  modalContent.classList.add("success");
  modalContent.innerHTML =
    "<p>Saved successfully. Reload to take effect.</p><span class='close-modal'>&times;</span>";
  var closeBtn = document.querySelector(".close-modal");
  closeBtn.addEventListener("click", closeModal);
}

function openErrorModal() {
  modal.style.display = "block";
  modalContent.classList.add("error");
  modalContent.innerHTML =
    "<p>There was a problem saving the file. Try again later</p><span class='close-modal'>&times;</span>";
  var closeBtn = document.querySelector(".close-modal");
  closeBtn.addEventListener("click", closeModal);
}

function closeModal() {
  location.reload();
  modal.style.display = "none";
  modalContent.classList.remove("success");
  modalContent.classList.remove("error");
}

closeBtn.addEventListener("click", closeModal);

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    closeModal();
  }
});

const logsContainer = document.getElementById("logs-container");
fetch("static/scripts/logs.txt")
  .then((response) => response.text())
  .then((data) => {
    const lines = data.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const text = document.createElement("p");
      text.innerHTML =
        line
          .replace(/\[(.*?)\]: /g, "<strong>$&</strong>")
          .replace(
            /<strong>\[Bot\]:<\/strong>/g,
            '<span class="bot-logs">$&</span>'
          )
          .replace(
            /<strong>\[User\]:<\/strong>/g,
            '<span class="user-logs">$&</span>'
          ) + "<br>";
      logsContainer.appendChild(text);
    }
  })
  .catch((error) => {
    console.error(error);
    errorText = document.createElement("p");
    errorText.textContent = error;
    logsContainer.appendChild(errorText);
  });

let statusElem = document.getElementById("status");
var trainingBtn = document.getElementById("start-training-btn");
var loading = document.getElementById("loading");

function startTraining() {
  trainingBtn.disabled = true;
  trainingBtn.classList.add("disabled");
  loading.classList.add("active");
  fetch("/start_training")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        console.log("Script ran successfully!");
        openSuccessModal();
        trainingBtn.disabled = false;
        trainingBtn.classList.remove("disabled");
        loading.classList.remove("active");
      } else {
        console.error("Error running script:", data.error);
        trainingBtn.disabled = false;
        openErrorModal();
        loading.classList.remove("active");
      }
    })
    .catch((error) => console.error("Error running script:", error));
}

// Get the button and the div element
const toggleIntentsFileBtn = document.getElementById("intents-raw-file-toggle");
const intentsRawEditorContainer = document.getElementById(
  "intents-editor-container"
);

const toggleCategoryFileBtn = document.getElementById(
  "category-raw-file-toggle"
);
const categoryRawEditorContainer = document.getElementById(
  "category-editor-container"
);

toggleIntentsFileBtn.addEventListener("click", function () {
  if (intentsRawEditorContainer.style.display === "none") {
    intentsRawEditorContainer.style.display = "flex";
    toggleIntentsFileBtn.textContent = "Hide raw file";
  } else {
    intentsRawEditorContainer.style.display = "none";
    toggleIntentsFileBtn.textContent = "Edit raw file";
  }
});

toggleCategoryFileBtn.addEventListener("click", function () {
  if (categoryRawEditorContainer.style.display === "none") {
    categoryRawEditorContainer.style.display = "flex";
    toggleCategoryFileBtn.textContent = "Hide raw file";
  } else {
    categoryRawEditorContainer.style.display = "none";
    toggleCategoryFileBtn.textContent = "Edit raw file";
  }
});

let confirmationModalId = document.getElementById("confirm-modal");
let confirmationText = document.getElementById("confirmation-text");
let confirmationCallback;

function openConfirmationModal(text, callback) {
  confirmationText.textContent = text;
  confirmationCallback = callback;
  confirmationModalId.style.display = "block";
}

function closeModalAction() {
  confirmationModalId.style.display = "none";
}

function confirmModalAction() {
  confirmationCallback();
  closeModalAction();
}

// const WIT_API_KEY = "Z4PK2X7LGLRNUNNQFXUVQYXZB7QNZ3FG";

// const messages = document.getElementById("messages");

// function displayMessage(message, sender) {
//   const div = document.createElement("div");
//   div.classList.add("message");
//   div.classList.add(sender);
//   div.textContent = message;
//   messages.appendChild(div);
// }

// function sendMessage() {
//   const input = document.getElementById("input").value;

//   if (!input) {
//     return;
//   }

//   displayMessage(input, "user");
//   const url =
//     "https://api.wit.ai/message?v=20230312&q=" + encodeURIComponent(input);

//   fetch(url, {
//     headers: {
//       Authorization: "Bearer " + WIT_API_KEY,
//     },
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       const message = data.intents[0].name;
//       console.log(data.intents);

//       displayMessage(message, "bot");
//     })
//     .catch((error) => console.log(error));

//   document.getElementById("input").value = "";
// }
