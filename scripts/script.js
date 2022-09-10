// UI comp
var startBtn = document.getElementById("startBtn");
var micIcon = document.getElementById("micIcon");
var headLabel = document.getElementById("msg-header-label");
// startBtn.innerHTML = "Start listening";
const msgerChat = document.querySelector(".msgerChat");
const msgerContainer = document.querySelector(".msgerContainer");

var botStateImage = document.getElementById("bot-state-image");
var userStateImage = document.getElementById("user-state-image");

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
    ],
    3: [
        "Who is the Director at DHVSU Porac Campus?",
        "Who is the Academic Chairperson at DHVSU Porac Campus?",
        "What is the DHVSU Mission?",
        "What is the DHVSU Vision?",
    ],
};

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
            element.remove();
            userStateImage.src = "static/images/vaicon-idle.png";
            getBotResponse(text);
        } else {
            userStateImage.src = "static/images/vaicon-speaking.png";
            msgerChat.insertAdjacentHTML("beforeend", processMsg);
            msgerContainer.scrollTop += 500;
            try {
                element.remove();
            } catch (err) {
                console.log(err);
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
    const response = process(text);
    appendUserMessageBubble(text);
    appendBotMessageBubble(response);
    spokenList.push(response);

    // text to speech
    botStateImage.src = "static/images/vaicon-speaking.png";

    let say = new SpeechSynthesisUtterance(response);
    speechSynthesis.speak(say);
    say.onend = (event) => {
        console.log(
            `Utterance has finished being spoken after ${event.elapsedTime} seconds.`
        );
        botStateImage.src = "static/images/vaicon-idle.png";
    };
}

// processor
function process(rawText) {
    let text = rawText.replace(/[^a-zA-Z ]/g, "");
    text = text.toLowerCase();

    let greetings = "hello hi greetings good morning good afteroon good evening";
    let askForName = "whats your name what is your name who are you what are you";
    let howAreYou = "how are you";
    let timeCheck = "what time is it what is the current time what time it is";
    let gratitude = "thanks thank you";
    let farewell = "bye goodbye farewell";
    let campusLocation =
        "where is dhvsu porac campus located at where is dabsu porac campus located at location of dabsu porac campus location of dhvsu porac campus";
    let publicOrPrivate = "is dhvsu public or private is dabsu public or private";
    let transfereesReqToEnroll =
        "what are the requirements of transferees to enroll in dhvsu porac campus what are the requirements of transferees to enroll in dabsu porac campus";
    let freshmenReqToEnroll =
        "what are the requirements of freshmen to enroll in dhvsu porac campus what are the requirements of freshmen to enroll in dabsu porac campus";
    let campusChairPerson =
        "who is the academic chairperson at dhvsu porac campus who is the academic chairperson at dabsu porac campus";
    let campusDirector =
        "who is the director at dhvsu porac campus who is the director at dabsu porac campus";
    let uniMission =
        "what is universitys mission what is the universitys mission what is the schools mission what is the school mission what is mission what is the mission what is dhvsu mission what is the dhvsu mission what is the mission of dhvsu what is dabsu mission what is the dabsu mission what is the mission of dabsu";
    let uniVision =
        "what is universitys vision what is the universitys vision what is the schools vision what is the school vision what is vision what is the vision what is dhvsu vision what is the dhvsu vision what is the vision of dhvsu what is dabsu vision what is the dabsu vision what is the vision of dabsu";
    let tuitionFee =
        "how much is the tuition fee in porac campus how much is tuition fee in porac campus how much is the tuition fee in dhvsu porac campus how much is tuition fee in dhvsu porac campus how much is tuition fee per semester how much is the tuition fee per semester how much is the tuition fee per sem";
    let campusCourses =
        "what are the available courses in dhvsu porac campus what are the available courses in dabsu porac campus what are the available courses in porac campus what courses are available at dhvsu porac campus";
    let replaySpeech =
        "again what did you say what did you just say say that again say it again what is it again";

    let response = null;
    if (greetings.includes(text) == true) {
        var choices = [
            "Hello, what would you like to ask?",
            "Greetings, what would you like to ask?",
            "Hi, what would you like to ask?",
        ];
        var randomChoice = Math.floor(Math.random() * choices.length);
        response = choices[randomChoice];
    } else if (gratitude.includes(text) == true) {
        response = "Your welcome.";
    } else if (askForName.includes(text) == true) {
        response = "I am a Virtual Assistant Support for DHVSU Porac Campus";
    } else if (howAreYou.includes(text) == true) {
        response = "I'm good.";
    } else if (timeCheck.includes(text) == true) {
        response = new Date().toLocaleTimeString();
    } else if (farewell.includes(text) == true) {
        response = response = "Bye!!";
    } else if (replaySpeech.includes(text) == true) {
        response = spokenList.slice(-1)[0];
    } else if (campusLocation.includes(text) == true) {
        response =
            "The DHVSU Porac Campus is located in Porac, Pampanga, and is 15.06 kilometers away, west of the main campus of DHVSU in Bacolor, Pampanga.";
    } else if (publicOrPrivate.includes(text) == true) {
        response = "Don Honorio Ventura State University is a PUBLIC university.";
    } else if (transfereesReqToEnroll.includes(text) == true) {
        response =
            "Requirements for Transferees to enroll in DHVSU Porac Campus: \n \
            A Duly accomplished Application Form Photocopy of Grades Copy of Honorable Dismissal Certificate of Good Moral, \n \
            2 pieces passport size picture with name tag (white background)";
    } else if (freshmenReqToEnroll.includes(text) == true) {
        response =
            "Requirements for freshmen to enroll in DHVSU Porac Campus: \n \
            A Duly accomplished Application Form Photocopy of Form138 \n \
            2 pieces passport size picture with name tag (white background), \n \
            and a PSA Birth Certificate ";
    } else if (campusChairPerson.includes(text) == true) {
        response =
            "Aileen L. Koh, M.A.Ed. is the Academic Chairperson of DHVSU Porac Campus.";
    } else if (campusDirector.includes(text) == true) {
        response =
            "DENNIS V. DIZON, M.A.Ed. is the Campus Director of DHVSU Porac Campus.";
    } else if (uniMission.includes(text) == true) {
        response =
            "DHVSU MISSION: \n DHVSU commits itself to provide an environment conducive to continuous creation of knowledge and technology towards the transformation of students into globally competitive professionals through the synergy of appropriate teaching, research, service and productivity functions.";
    } else if (uniVision.includes(text) == true) {
        response =
            "DHVSU VISION: \n A lead university in producing quality individuals with competent capacities to generate knowledge and technology and enhance professional practices for sustainable national and global competitiveness through continuous innovation.";
    } else if (tuitionFee.includes(text) == true) {
        response =
            "Under the Law students in accredited State and Local universities/colleges will not pay any tuition fees or misc fee.";
    } else if (campusCourses.includes(text) == true) {
        response =
            "There are currently 4 courses available in Porac Campus \n \
            Bachelor of Elementary Education Major in General Education, \n \
            Bachelor of Science in Business Administration Major in Marketing, \n \
            Bachelor of Science in Information Technology, \n \
            Bachelor of Science in Social Work";
    } else if (!response) {
        // window.open(
        //     `http://google.com/search?q=${rawText.replace("search", "")}`,
        //     "_blank"
        // );
        response = `I'm sorry, it seems that your question is not on my database yet. You can look at our available questions below to see what we currently have.`;
        return response;
    }
    return response.replace(/(\n)+/g, "$1<br>");
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