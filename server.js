const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistral',
                messages: [{ role: 'user', content: userMessage }]
            }),
        });

        const data = await response.json();
        const aiMessage = data.message.content;

        res.json({ reply: aiMessage });
    } catch (error) {
        console.error('Error contacting Mistral:', error);
        res.status(500).json({ error: 'Failed to reach Mistral' });
    }
});

app.listen(port, () => {
    console.log(`EchoMind AI server running at http://localhost:${port}`);
});
