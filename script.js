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
const chatbotContainer = document.querySelector(".chatbot-container");
const CHAT_HISTORY_KEY = "chat_history";
const API_BASE_URL = "http://127.0.0.1:8000";

// Function to save chat history to localStorage
const saveChatHistory = () => {
    const messages = [];
    chatbox.querySelectorAll(".chat").forEach(chat => {
        const p = chat.querySelector("p");
        // Do not save the "Thinking..." animation bubble
        if (p && p.querySelector(".typing-animation")) return;

        const message = p ? p.textContent : "";
        const className = chat.classList.contains("outgoing") ? "outgoing" : "incoming";
        const chatId = chat.getAttribute("data-chat-id") || null;
        messages.push({ message, className, chatId });
    });
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
};

// Function to load chat history from localStorage
const loadChatHistory = () => {
    const history = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY));
    if (history && history.length > 0) {
        chatbox.innerHTML = ""; // Clear the initial welcome message
        history.forEach(chat => {
            const chatLi = createChatLi(chat.message, chat.className);
            if (chat.chatId) {
                chatLi.setAttribute("data-chat-id", chat.chatId);
            }
            // Show feedback buttons for loaded incoming messages
            if (chat.className === 'incoming') {
                const feedbackDiv = chatLi.querySelector(".chat-feedback");
                if (feedbackDiv) feedbackDiv.classList.add("active");
            }
            chatbox.appendChild(chatLi);
        });
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
}

if (chatCloseBtn) {
    chatCloseBtn.setAttribute("data-tooltip", "Close");

    const clearChatBtn = document.createElement("span");
    clearChatBtn.textContent = "Clear Chat";
    clearChatBtn.classList.add("clear-chat-btn");
    chatCloseBtn.parentNode.insertBefore(clearChatBtn, chatCloseBtn);

    const fullscreenBtn = document.createElement("span");
    fullscreenBtn.classList.add("fullscreen-btn");
    fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
    fullscreenBtn.setAttribute("data-tooltip", "Fullscreen");
    chatCloseBtn.parentNode.insertBefore(fullscreenBtn, chatCloseBtn);

    fullscreenBtn.addEventListener("click", () => {
        chatbotContainer.classList.toggle("fullscreen");
        if (chatbotContainer.classList.contains("fullscreen")) {
            fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
            fullscreenBtn.setAttribute("data-tooltip", "Exit Fullscreen");
        } else {
            fullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`;
            fullscreenBtn.setAttribute("data-tooltip", "Fullscreen");
        }
    });

    // Draggable Logic
    const chatbotHeader = document.querySelector(".chatbot-header");
    let isDragging = false, startX, startY, startLeft, startTop;

    const onDrag = (e) => {
        if (!isDragging) return;
        chatbotContainer.style.left = `${startLeft + (e.clientX - startX)}px`;
        chatbotContainer.style.top = `${startTop + (e.clientY - startY)}px`;
    }

    const stopDrag = () => {
        isDragging = false;
        chatbotContainer.style.transition = "";
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
    }

    chatbotHeader.addEventListener("mousedown", (e) => {
        if(e.target.closest("span") || e.target.closest("button")) return;
        isDragging = true;
        chatbotContainer.style.transition = "none";
        
        const rect = chatbotContainer.getBoundingClientRect();
        chatbotContainer.style.right = "auto";
        chatbotContainer.style.bottom = "auto";
        chatbotContainer.style.left = `${rect.left}px`;
        chatbotContainer.style.top = `${rect.top}px`;

        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
    });

    const initialChatContent = chatbox.innerHTML;
    clearChatBtn.addEventListener("click", () => {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        chatbox.innerHTML = initialChatContent;
    });
}

let userMessage = null;

const sendFeedback = (chatId, feedback) => {
    fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: chatId,
            feedback: feedback
        })
    }).catch(err => console.error("Error sending feedback:", err));
}

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span>🤖</span><div class="message-content"><p></p><div class="chat-feedback"><button class="feedback-btn like" data-tooltip="Good response"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button><button class="feedback-btn dislike" data-tooltip="Bad response"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></button><button class="feedback-btn copy" data-tooltip="Copy response"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><span class="feedback-text"></span></div></div>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;

    if (className === "incoming") {
        const feedbackText = chatLi.querySelector(".feedback-text");
        const likeBtn = chatLi.querySelector(".like");
        const dislikeBtn = chatLi.querySelector(".dislike");
        const copyBtn = chatLi.querySelector(".copy");

        likeBtn.addEventListener("click", () => {
            const chatId = chatLi.getAttribute("data-chat-id");
            if (likeBtn.classList.contains("active")) {
                likeBtn.classList.remove("active");
                feedbackText.textContent = "";
            } else {
                likeBtn.classList.add("active");
                dislikeBtn.classList.remove("active");
                feedbackText.textContent = "Feedback submitted";
                setTimeout(() => feedbackText.textContent = "", 2000);
                if (chatId) {
                    sendFeedback(chatId, "like");
                }
            }
        });
        dislikeBtn.addEventListener("click", () => {
            const chatId = chatLi.getAttribute("data-chat-id");
            if (dislikeBtn.classList.contains("active")) {
                dislikeBtn.classList.remove("active");
                feedbackText.textContent = "";
            } else {
                dislikeBtn.classList.add("active");
                likeBtn.classList.remove("active");
                feedbackText.textContent = "Feedback submitted";
                setTimeout(() => feedbackText.textContent = "", 2000);
                if (chatId) {
                    sendFeedback(chatId, "dislike");
                }
            }
        });
        copyBtn.addEventListener("click", () => {
            if (copyBtn.classList.contains("active")) {
                copyBtn.classList.remove("active");
                feedbackText.textContent = "";
            } else {
                const text = chatLi.querySelector("p").textContent;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.classList.add("active");
                    feedbackText.textContent = "Response copied";
                    setTimeout(() => feedbackText.textContent = "", 2000);
                });
            }
        });
    }
    return chatLi;
}

const generateResponse = (chatElement) => {
    const API_URL = `${API_BASE_URL}/ask`;
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
            if (data.chat_id) {
                chatElement.setAttribute("data-chat-id", data.chat_id);
            }
            const feedbackDiv = chatElement.querySelector(".chat-feedback");
            if (feedbackDiv) feedbackDiv.classList.add("active");
            saveChatHistory();
        })
        .catch((error) => {
            console.error("Chatbot Error:", error);
            if (error.message === "Failed to fetch") {
                messageElement.textContent = "Error: Cannot connect to server. Ensure Python backend is running & CORS is enabled.";
            } else {
                messageElement.textContent = "Oops! Something went wrong. Check console (F12) for error.";
            }
            const feedbackDiv = chatElement.querySelector(".chat-feedback");
            if (feedbackDiv) feedbackDiv.classList.add("active");
            saveChatHistory();
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
    saveChatHistory();

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        const messageElement = incomingChatLi.querySelector("p");
        messageElement.innerHTML = `<div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>`;
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

if (chatbox) {
    loadChatHistory();
}