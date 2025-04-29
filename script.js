async function sendMessage() {
  const inputField = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const userMessage = inputField.value.trim();

  if (!userMessage) return;

  chatBox.innerHTML += `<div><b>You:</b> ${userMessage}</div>`;
  inputField.value = '';

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt: userMessage
    })
  });

  const data = await response.json();
  chatBox.innerHTML += `<div><b>Gizmo:</b> ${data.response}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}