const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { G4F } = require('g4f');
const g4f = new G4F();

const app = express();
app.use(bodyParser.json());

const conversationsDir = path.join(__dirname, 'conversations');
if (!fs.existsSync(conversationsDir)) {
  fs.mkdirSync(conversationsDir);
}

app.get('/ai', async (req, res) => {
  const prompt = req.query.prompt || '';
  const id = req.query.id || '';

  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  let messages = [];
  const filePath = path.join(conversationsDir, `${id}.json`);
  if (fs.existsSync(filePath)) {
    messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    messages.push({ role: "system", content: "You're a math teacher." });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const response = await g4f.chatCompletion(messages);
    messages.push({ role: "assistant", content: response });

    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
