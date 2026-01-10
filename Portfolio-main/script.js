var typed = new Typed('#element', {
    strings: ['Web Developer', 'Graphic Designer', 'Web Designer', 'Video Editor'],
    typeSpeed: 50,
});

document.addEventListener('DOMContentLoaded', function () {
    // Get the current page URL (excluding query parameters)
    const currentPage = window.location.pathname.split('/').pop();

    // Select all nav links
    const navLinks = document.querySelectorAll('nav .nav-link');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    // Loop through nav links and sidebar links to add 'active' class to the current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    sidebarLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage || 
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Add click event to hamburger menu
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function () {
            document.getElementById('sidebar').classList.add('active');
        });
    }

    // Add click event to close button
    const closeSidebar = document.getElementById('closeSidebar');
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function () {
            document.getElementById('sidebar').classList.remove('active');
        });
    }
});

// Chatbot Logic
const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatCloseBtn = document.querySelector(".chat-close-btn");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let userMessage = null;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = (chatElement) => {
    const API_URL = "http://127.0.0.1:8000/ask";
    const messageElement = chatElement.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
        },
        body: JSON.stringify({
            question: userMessage,
            k: 3
        })
    }

    fetch(API_URL, requestOptions)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            messageElement.textContent = data.answer || data.response || JSON.stringify(data);
        })
        .catch((error) => {
            console.error("Chatbot Error:", error);
            if (error.message === "Failed to fetch") {
                messageElement.textContent = "Error: Cannot connect to server. Ensure Python backend is running & CORS is enabled.";
            } else {
                messageElement.textContent = "Oops! Something went wrong. Check console (F12) for error.";
            }
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if(!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = "auto";

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

if (chatInput) {
    chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });
}

if (sendChatBtn) sendChatBtn.addEventListener("click", handleChat);
if (chatbotToggler) chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
if (chatCloseBtn) chatCloseBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));