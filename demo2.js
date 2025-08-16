// Sidebar toggle functionality
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

// Chat functionality
const chatOutput = document.getElementById("chat-output");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const userText = chatInput.value.trim();
  if (!userText) return;

  appendMessage(userText, "user");
  chatInput.value = "";

  appendMessage("Đang nghĩ...", "bot", true);

  const loadingMsg = document.querySelector(".bot.loading");
  const aiReply = await callAI(userText);

  if (loadingMsg) {
    loadingMsg.textContent = aiReply;
    loadingMsg.classList.remove("loading");
  }
}

function appendMessage(text, type, loading = false) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${type}` + (loading ? " loading" : "");
  msg.textContent = text;
  chatOutput.appendChild(msg);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// === API CONFIG ===
const apiKey = "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"; // 🔹 Thay bằng key thật từ https://openrouter.ai/
const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

async function callAI(userMessage, retryCount = 0) {
  if (!apiKey || apiKey.includes("YOUR_OPENROUTER_KEY")) {
    return "❌ Bạn chưa cấu hình API key. Vào demo.js để thay key OpenRouter.";
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://yourwebsite.com", // tùy chọn
        "X-Title": "VietDz A.I" // tùy chọn
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Hoặc model free khác
        messages: [
          { role: "system", content: "Bạn là VietDz A.I, trả lời vui vẻ, dễ hiểu, nói đúng sự thật không nói những điều không đúng sự thật, đầy đủ để không gây hiểu lầm, có thể trả lời những câu hỏi public." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 800
      })
    });

    if (response.status === 429) {
      if (retryCount < 3) {
        console.warn(`Bị rate limit, thử lại sau 2 giây (lần ${retryCount + 1})...`);
        await new Promise(r => setTimeout(r, 2000));
        return callAI(userMessage, retryCount + 1);
      }
      throw new Error("Bạn gọi API quá nhanh hoặc đã hết lượt dùng.");
    }

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("API Error Details:", errorDetails);
      throw new Error(errorDetails.error?.message || "Lỗi API không xác định");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Không nhận được phản hồi từ AI.");
    return reply;

  } catch (error) {
    console.error("Error:", error);
    return `❌ Lỗi: ${error.message}`;
  }
}

// New chat functionality
function newChat() {
  chatOutput.innerHTML = "";
}
document.getElementById("new-chat-btn").addEventListener("click", newChat);
