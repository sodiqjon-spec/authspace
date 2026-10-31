require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
  console.error("XATO: .env faylida ADMIN_PASSWORD va SESSION_SECRET qiymatlarini kiriting.");
  process.exit(1);
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");

function readUsers() {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "authspace.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: false, maxAge: 2 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: "Username 3–20 belgi bo‘lsin (harf, raqam yoki _)." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: "Parol 8–72 belgi oralig‘ida bo‘lishi kerak." });
    }
    const users = readUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ error: "Bu username band." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    users.push({ username, passwordHash, createdAt: new Date().toISOString() });
    writeUsers(users);
    req.session.username = username;
    res.json({ message: "Hisob yaratildi.", username });
  } catch {
    res.status(500).json({ error: "Server xatosi. Qayta urinib ko‘ring." });
  }
});

app.post("/api/login", async (req, res) => {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");
  const user = readUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Username yoki parol noto‘g‘ri." });
  }
  req.session.username = user.username;
  res.json({ message: "Kirish muvaffaqiyatli.", username: user.username });
});

app.get("/api/me", (req, res) => {
  res.json({ loggedIn: Boolean(req.session.username), username: req.session.username || null });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ message: "Hisobdan chiqildi." }));
});

app.post("/api/admin/login", (req, res) => {
  const password = String(req.body.password || "");
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Admin paroli noto‘g‘ri." });
  }
  req.session.isAdmin = true;
  res.json({ message: "Admin panelga xush kelibsiz." });
});

app.get("/api/admin/users", (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ error: "Avval admin sifatida kiring." });
  // Intentionally return only usernames and registration dates; never expose password hashes.
  const users = readUsers().map(({ username, createdAt }) => ({ username, createdAt }));
  res.json({ users });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.isAdmin = false;
  res.json({ message: "Admin sessiyasi yakunlandi." });
});

app.listen(PORT, () => {
  console.log(`AuthSpace ishga tushdi: http://localhost:${PORT}`);
});
