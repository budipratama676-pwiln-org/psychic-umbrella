const backendUrl = "https://ai-chat-backend.up.railway.app/chat"; // ganti dengan URL backend kamu

async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";

  const chatBox = document.getElementById("chat-box");
  const botMsg = document.createElement("div");
  botMsg.className = "message bot";
  botMsg.textContent = "AI sedang mengetik...";
  chatBox.appendChild(botMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.body) {
    botMsg.textContent = "Error: Tidak ada respon dari server";
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });

    chunk.split("\n").forEach(line => {
      if (line.startsWith("data: ")) {
        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          fullText += content;
          botMsg.textContent = fullText;
          chatBox.scrollTop = chatBox.scrollHeight;
        } catch {
          // abaikan kalau bukan JSON valid
        }
      }
    });
  }
}

function appendMessage(text, sender) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
