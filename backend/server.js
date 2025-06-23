const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const storage = new Map();

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

app.post("/paste", (req, res) => {
  const id = generateId();
  const expiry = Math.min(req.body.expiry || 300, 86400);
  const expiresAt = Date.now() + expiry * 1000;
  storage.set(id, { data: req.body.data, expiresAt });
  setTimeout(() => storage.delete(id), expiry * 1000);
  res.json({ id });
});

app.get("/paste/:id", (req, res) => {
  const paste = storage.get(req.params.id);
  if (!paste || Date.now() > paste.expiresAt) {
    return res.status(404).json({ error: "Expired or not found." });
  }
  const { data } = paste;
  storage.delete(req.params.id);
  res.json({ data });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log(`SecurePaste running at http://localhost:${PORT}`);
});