// UI comp
var startBtn = document.getElementById("startBtn");
var micIcon = document.getElementById("micIcon");
var headLabel = document.getElementById("msg-header-label");
// startBtn.innerHTML = "Start listening";
const msgerChat = document.querySelector(".msgerChat");
const msgerContainer = document.querySelector(".msgerContainer");

// var botStateImage = document.getElementById("bot-state-image");
// var userStateImage = document.getElementById("user-state-image");

var spokenList = [];
const queries = {
    1: [
        "What are the requirements of Freshmen to enroll in DHVSU Porac Campus?",
        "What courses are available at DHVSU Porac Campus?",
        "What are the requirements of Transferees to enroll in DHVSU Porac Campus?",
    ],
    2: [
        "How much is the tuition fee per semester?",
        "Where is DHVSU Porac Campus Located?",
        "Is DHVSU public or private?",
        "Who is the Director at DHVSU Porac Campus",
        "Who is the Academic Chairperson at DHVSU Porac Campus",
        "What is the DHVSU Mission?",
        "What is the DHVSU Vision?",
    ],
    3: [
        "Schedule of BS Social Work - 2A",
        "Schedule of BS Information Technology - 1C",
        "Schedule of BS Business Administration - 2A",
        "Open DHVSU Portal",
    ],
    4: ["What is Category 4?"],
};

const category1Div = document.getElementById("Category1");
const category2Div = document.getElementById("Category2");
const category3Div = document.getElementById("Category3");
const category4Div = document.getElementById("Category4");

addQueriesButton(1, category1Div);
addQueriesButton(2, category2Div);
addQueriesButton(3, category3Div);
addQueriesButton(4, category4Div);

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
if (typeof SpeechRecognition === "undefined") {
    startBtn.remove();
    headLabel.textContent =
        "Browser does not support Speech API. Please download latest chrome.";
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const res = event.results[last];
        const text = res[0].transcript;
        var processMsg = `
            <div id="processing" class="msg-container">
                <p class="username">User</p>
                <p>${text}</p>
                <span class="time-left">${formatDate(new Date())}</span>
            </div>
            `;
        var element = document.getElementById("processing");
        if (res.isFinal) {
            try {
                element.remove();
            } catch (err) {
                console.log("Cannot read 'remove'");
            }
            // userStateImage.src = "static/images/vaicon-idle.png";
            getBotResponse(text);
        } else {
            // userStateImage.src = "static/images/vaicon-speaking.png";
            // msgerChat.insertAdjacentHTML("beforeend", processMsg);
            msgerContainer.scrollTop += 500;
            try {
                element.remove();
            } catch (err) {
                console.log("Cannot read 'remove'");
            }
        }
    };
    let listening = false;
    toggleBtn = () => {
        if (listening) {
            recognition.stop();
            document.getElementById("labelBelowMic").textContent =
                "Mic is now disabled.";
            micIcon.classList.remove("fa-microphone");
            micIcon.classList.add("fa-microphone-slash");
        } else {
            recognition.start();
            document.getElementById("labelBelowMic").textContent =
                "Mic is now enabled.";
            micIcon.classList.remove("fa-microphone-slash");
            micIcon.classList.add("fa-microphone");
        }
        listening = !listening;
    };
    startBtn.addEventListener("click", toggleBtn);
}

function getBotResponse(text) {
    appendUserMessageBubble(text);
    $.get("/get", {
        msg: text,
    }).done(function(data) {
        console.log(data);
        const msgText = data;
        appendBotMessageBubble(msgText);
        spokenList.push(msgText);
        let say = new SpeechSynthesisUtterance(msgText);
        speechSynthesis.speak(say);
        say.onend = (event) => {
            console.log(
                `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
            );
            // botStateImage.src = "static/images/vaicon-idle.png";
        };
    });
    // text to speech
    // botStateImage.src = "static/images/vaicon-speaking.png";
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

function appendBotMessageBubble(message) {
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
document.getElementsByClassName("tablink")[0].click();

function openCategory(evt, cityName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("city");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].classList.remove("w3-light-grey");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.classList.add("w3-light-grey");
}

function getAnswerById(id) {
    var elem = document.getElementById(id);
    console.log("Selected question: " + elem.textContent);
    document.getElementById("id01").style.display = "none";
    getBotResponse(elem.textContent);
}