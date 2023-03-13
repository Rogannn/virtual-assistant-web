// UI comp
var startBtn = document.getElementById("startBtn");
var micIcon = document.getElementById("micIcon");
var headLabel = document.getElementById("msg-header-label");
var soundDetectorText = document.getElementById("sound-detection-text");
// startBtn.innerHTML = "Start listening";
const msgerChat = document.querySelector(".msgerChat");
const msgerContainer = document.querySelector(".msgerContainer");
// const socket = io();
// const socket = io.connect("http://" + location.hostname + ":" + location.port);
// var botStateImage = document.getElementById("bot-state-image");
// var userStateImage = document.getElementById("user-state-image");

// socket.on("connect", function(socket) {
//     console.log("Connected to http://" + location.hostname + ":" + location.port);
// });

let queries;

var request = new XMLHttpRequest();
request.open("GET", "static/scripts/categorical_queries.json", true);

request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    var data = JSON.parse(request.responseText);
    queries = data;

    addQueriesButton("1", category1Div);
    addQueriesButton("2", category2Div);
    addQueriesButton("3", category3Div);
    addQueriesButton("4", category4Div);
  } else {
    console.error(
      "Failed to load data from server. Status code: " + request.status
    );
  }
};

request.onerror = function () {
  console.error("Connection error. Unable to retrieve data.");
};

request.send();

const category1Div = document.getElementById("Category1");
const category2Div = document.getElementById("Category2");
const category3Div = document.getElementById("Category3");
const category4Div = document.getElementById("Category4");

addBotSpeechLoader();
getBotResponse("Hello");

function addQueriesButton(category, categoryDiv) {
  for (let i = 0; i < queries[category].length; i++) {
    const question = queries[category][i];

    // create a new button element
    const button = document.createElement("button");
    button.textContent = question;
    button.className = "button-7";
    button.setAttribute("role", "button");
    button.setAttribute("id", `question${i + category}`);
    button.addEventListener("click", () => {
      appendUserMessageBubble(question);
      addBotSpeechLoader();
      getBotResponse(question);
      document.getElementById("id01").style.display = "none";
    });

    // append the new button element to the Category1 container
    categoryDiv.appendChild(button);
  }
}

// speech to text
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let toggleBtn = null;
let userSpeechDivAdded = false;
let userSpeechDiv;
let listening = false;
if (typeof SpeechRecognition === "undefined") {
  startBtn.remove();
  headLabel.textContent =
    "Browser does not support Speech API. Please download latest chrome.";
} else {
  var recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    console.log("Recognition started");
  };
  recognition.onerror = (event) => {
    if (listening) {
      try {
        recognition.start();
      } catch (err) {
        console.log(
          "recognition.onerror: Tried to restart the speech recognition."
        );
      }
    }
    console.error(event.error);
  };
  recognition.onresult = (event) => {
    const last = event.results.length - 1;
    const res = event.results[last];
    const text = res[0].transcript;
    console.log(text);
    if (!userSpeechDivAdded) {
      soundDetectorText.style.display = "none";
      userSpeechDiv = document.createElement("div");
      userSpeechDiv.setAttribute("id", "user-speech-placeholder");
      userSpeechDiv.setAttribute("class", "msg-container");
      userSpeechDiv.innerHTML = `
        <p class="username">User</p>
        <p id="user-speech-process-text">${text}</p>
        <span class="time-right">${formatDate(new Date())}</span>
      `;
      msgerContainer.scrollTop += 500;
      msgerChat.appendChild(userSpeechDiv);
      userSpeechDivAdded = true;
    } else {
      document.getElementById("user-speech-process-text").textContent = text;
    }
    if (res.isFinal) {
      removeUserProcessSpeechBubble();
      appendUserMessageBubble(text);
      getBotResponse(text);
      addBotSpeechLoader();
    }
  };
  toggleBtn = () => {
    if (listening) {
      recognition.stop();
      // $.post("/speech-to-text", {
      //     listen: false,
      // });
      document.getElementById("labelBelowMic").textContent = "Mic is disabled.";
      micIcon.classList.remove("fa-microphone");
      micIcon.classList.add("fa-microphone-slash");
    } else {
      recognition.start();
      document.getElementById("labelBelowMic").textContent = "Mic is enabled.";
      micIcon.classList.remove("fa-microphone-slash");
      micIcon.classList.add("fa-microphone");
      // $.post("/speech-to-text", {
      //     listen: true,
      // });
      // startSpeechRecognition();
    }
    listening = !listening;
  };
  startBtn.addEventListener("click", toggleBtn);
}
// toggleBtn = () => {
//   recognition.start();
//   document.getElementById("labelBelowMic").textContent = "Mic is enabled.";
//   micIcon.classList.remove("fa-microphone-slash");
//   micIcon.classList.add("fa-microphone");
//   startSpeechRecognition();
//   listening = true;
//   startBtn.removeEventListener("click", toggleBtn);
// };

// socket.on("recognition started", function(data) {
//     console.log(data);
//     recognition.start();
// });

// const startSpeechRecognition = () => {
//   fetch("/start-stt", {
//     method: "POST",
//     body: JSON.stringify({ listen: true }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("listening: ", data.listen);
//       receiveSpeechRecognition();
//     })
//     .catch((error) => console.error(error));
// };

// const receiveSpeechRecognition = () => {
//   // socket.emit("start recognition", { data: "start" });
//   fetch("/speech-to-text", {
//     method: "POST",
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//       if (!data.error) {
//         soundDetectorText.style.display = "none";
//         removeUserProcessSpeechBubble();
//         const bot_response = data.bot_response;
//         appendUserMessageBubble(data.text);
//         appendBotMessageBubble(bot_response);
//         speakBot(bot_response);
//         receiveSpeechRecognition();
//       } else {
//         console.log(
//           "[SERVER]: Speech is not clear or Recognition has stopped."
//         );
//         removeBotSpeechLoader();
//         soundDetectorText.style.display = "block";
//         soundDetectorText.textContent = data.error_text;
//         receiveSpeechRecognition();
//       }
//     })
//     .catch((error) => console.error(error));
// };

// const stopSpeechRecognition = () => {
//   // socket.emit("stop recognition", { data: "stop" });
//   fetch("/start-stt", {
//     method: "POST",
//     body: JSON.stringify({ listen: false }),
//   });
// };

// socket.on("recognized speech", function(data) {
//     try {
//         userSpeechDiv.remove();
//     } catch (err) {
//         console.log("Error: Tried to remove the user speech div. ");
//     }
//     userSpeechDivAdded = false;
//     // var userSpeechPlaceholder = document.getElementById(
//     //   "user-speech-placeholder"
//     // );
//     // try {
//     //   userSpeechPlaceholder.remove();
//     // } catch (err) {
//     //   console.log("Error: Tried to remove the user speech div.");
//     // }
//     try {
//         recognition.start();
//     } catch (err) {
//         console.log("Error: Tried to restart the speech recognition.");
//     }
//     console.log(data);
//     appendUserMessageBubble(data.text);
// });

// socket.on("bot response", function(data) {
//     var botSpeechPlaceholder = document.getElementById("process-msg");
//     try {
//         botSpeechPlaceholder.remove();
//     } catch (err) {
//         console.log("Error: Tried to remove bot speech div.");
//     }
//     console.log(data);
//     const bot_response = data.text;
//     appendBotMessageBubble(bot_response);
//     speakBot(bot_response);
// });

function getBotResponse(text) {
  //   appendUserMessageBubble(text);
  $.get("/get", {
    msg: text,
  }).done(function (data) {
    removeBotSpeechLoader();
    console.log(data);
    const msgText = data;
    appendBotMessageBubble(msgText);
    speakBot(msgText);
  });
  // text to speech
  // botStateImage.src = "static/images/vaicon-speaking.png";
}

function speakBot(msgText) {
  let say = new SpeechSynthesisUtterance(msgText);
  speechSynthesis.speak(say);
  // say.onend = (event) => {
  //     console.log(
  //         `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
  //     );
  //     // botStateImage.src = "static/images/vaicon-idle.png";
  // };
}

function appendUserMessageBubble(message) {
  var msgHTML = `
            <div class="msg-container">
                <p class="username">User</p>
                <p>${message}</p>
                <span class="time-right">${formatDate(new Date())}</span>
            </div>
          `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerContainer.scrollTop += 500;
}

function removeUserProcessSpeechBubble() {
  try {
    userSpeechDiv.remove();
    userSpeechDivAdded = false;
  } catch (err) {
    console.log("Error: Tried to remove the user speech div. ");
  }
  try {
    recognition.start();
  } catch (err) {
    console.log("Error: Tried to restart the speech recognition.");
  }
}

function addBotSpeechLoader() {
  var msgHTML = `
            <div id="process-msg" class="msg-container msg-container-right">
                <p class="username">Virtual Assistant Support</p>
                <div class="speaking-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="time-left">${formatDate(new Date())}</span>
            </div>
          `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerContainer.scrollTop += 500;
}

function removeBotSpeechLoader() {
  var botSpeechPlaceholder = document.getElementById("process-msg");
  try {
    botSpeechPlaceholder.remove();
  } catch (err) {
    console.log("Error: Tried to remove bot speech div.");
  }
}

function appendBotMessageBubble(message) {
  removeBotSpeechLoader();
  var msgHTML = `
            <div class="msg-container msg-container-right">
                <p class="username">Virtual Assistant Support</p>
                <p>${message}</p>
                <span class="time-left">${formatDate(new Date())}</span>
            </div>
          `;
  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerContainer.scrollTop += 500;
}

function formatDate(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // const year = date.getFullYear();
  var month = months[date.getMonth()];
  var day = date.getDate();
  var hr = date.getHours();
  var min = date.getMinutes();
  hr = hr % 12;
  hr = hr ? hr : 12;
  min = min < 10 ? "0" + min : min;
  var ampm = date.getHours() >= 12 ? "pm" : "am";
  var strTime = hr + ":" + min + " " + ampm;
  return `${month} ${day}, ${strTime}`;
}

// Tabbed Modal for Available Questions with Categories
function openCategory(evt, categoryName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("tabcontent");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(categoryName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.getElementsByClassName("tablink")[0].click();

function closeModal() {
  var modal = document.getElementById("id01");
  modal.style.display = "none";
}

function getAnswerById(id) {
  var elem = document.getElementById(id);
  console.log("Selected question: " + elem.textContent);
  document.getElementById("id01").style.display = "none";
  getBotResponse(elem.textContent);
}
