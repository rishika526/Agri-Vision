/**
 * static/js/chatbot.js
 * Frontend controller for Agri-Vision AI Chatbot widget.
 */

document.addEventListener("DOMContentLoaded", () => {
    const launcher = document.getElementById("chatbot-launcher");
    const widget = document.getElementById("chatbot-widget");
    const closeBtn = document.getElementById("chatbot-close-btn");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send-btn");
    const chatMessages = document.querySelector(".chat-messages");

    if (!launcher || !widget || !closeBtn || !chatInput || !sendBtn || !chatMessages) {
        console.warn("Agri-Vision Chatbot elements not fully found in the DOM.");
        return;
    }

    // Toggle panel visibility
    launcher.addEventListener("click", () => {
        widget.classList.add("active");
        launcher.style.display = "none";
        // Auto-focus on input when chat panel is opened
        setTimeout(() => chatInput.focus(), 100);
    });

    closeBtn.addEventListener("click", () => {
        widget.classList.remove("active");
        launcher.style.display = "flex";
    });

    // Helper to append messages securely (XSS prevention)
    function appendMessage(sender, text) {
        const messageEl = document.createElement("div");
        messageEl.classList.add("chat-message");
        messageEl.classList.add(sender === "user" ? "user-message" : "ai-message");
        messageEl.textContent = text;
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send message to the backend API
    async function handleSendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Prevent duplicate sends by disabling input controls
        chatInput.disabled = true;
        sendBtn.disabled = true;

        appendMessage("user", text);
        chatInput.value = "";

        // Append typing indicator
        const typingIndicator = document.createElement("div");
        typingIndicator.classList.add("chat-message", "ai-message");
        typingIndicator.textContent = "...";
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            typingIndicator.remove();
            appendMessage("ai", data.reply || "I'm sorry, I didn't get a proper response.");
        } catch (error) {
            console.error("Chatbot transmission failed:", error);
            typingIndicator.remove();
            appendMessage("ai", "Connection error. Please try again later.");
        } finally {
            // Re-enable input controls after request resolves/fails
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    // Event listeners for message submission
    sendBtn.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    });
});
