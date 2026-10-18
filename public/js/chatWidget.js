// Floating chat widget. Talks ONLY to the FastAPI /chat endpoint. The Gemini
// key and the Express service token live on that server and are never sent or
// stored in the browser.
(function () {
    "use strict";

    var CHAT_API_URL = (window.YELPCAMP_CHAT_API || "http://localhost:8000").replace(/\/$/, "");
    var ENDPOINT = CHAT_API_URL + "/chat";
    var MAX_LEN = 2000;

    var launcher = document.getElementById("chatLauncher");
    var panel = document.getElementById("chatPanel");
    var messages = document.getElementById("chatMessages");
    var input = document.getElementById("chatInput");
    var sendBtn = document.getElementById("chatSend");
    var closeBtn = document.getElementById("chatClose");
    if (!launcher || !panel) return;

    function setSending(isSending) {
        sendBtn.disabled = isSending;
        input.disabled = isSending;
    }

    function addMessage(text, kind) {
        var el = document.createElement("div");
        el.className = "chat-msg " + kind;
        el.textContent = text; // textContent avoids any HTML injection
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
        return el;
    }

    function addTyping() {
        var el = document.createElement("div");
        el.className = "chat-msg assistant typing";
        el.setAttribute("aria-label", "Assistants is typing");
        el.innerHTML = "<span></span><span></span><span></span>";
        messages.appendChild(el);
        messages.scrollTop = messages.scrollHeight;
        return el;
    }

    function friendlyError(status, detail) {
        if (status === 0) return "Could not reach the chat service. Please try again.";
        if (status === 400) return "That message looks too long or empty. Keep it under 2000 characters.";
        if (status === 429) return "Too many requests. Please wait a moment and try again.";
        if (status === 503) return "The chat service is temporarily unavailable.";
        if (status >= 500) return "Something went wrong on our side. Please try again shortly.";
        return detail || "Something went wrong. Please try again.";
    }

    async function sendMessage() {
        var text = input.value.trim();
        if (!text || setSending(true) === true) return; // already sending
        if (text.length > MAX_LEN) {
            addMessage(friendlyError(400), "error");
            return;
        }

        setSending(true);
        addMessage(text, "user");
        input.value = "";
        input.style.height = "auto";

        var typing = addTyping();
        try {
            var res = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            var data = null;
            try { data = await res.json(); } catch (e) { data = null; }

            typing.remove();
            if (!res.ok) {
                var detail = data && data.detail ? (typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail)) : null;
                addMessage(friendlyError(res.status, detail), "error");
            } else if (data && data.response) {
                addMessage(data.response, "assistant");
            } else {
                addMessage("No response received. Please try again.", "error");
            }
        } catch (err) {
            typing.remove();
            addMessage(friendlyError(0), "error");
        } finally {
            setSending(false);
            input.focus();
        }
    }

    // Toggle open/close
    function toggle() {
        var isOpen = panel.classList.toggle("open");
        panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
        if (isOpen) {
            input.focus();
        }
    }

    launcher.addEventListener("click", toggle);
    if (closeBtn) closeBtn.addEventListener("click", toggle);
    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    // Auto-grow the textarea up to its max height
    input.addEventListener("input", function () {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 80) + "px";
    });
})();
