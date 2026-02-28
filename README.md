# 💬 SentraChat

A modern **real-time chat application backend** built using the **MERN stack + Socket.IO**, designed to support scalable private and group messaging with rich communication features.

---

## 🚀 Features

### 🔹 Real-Time Messaging

* Private 1-to-1 chat
* Group chat support
* Typing indicators
* Online / Offline status

### 🔹 Media Messaging

* Image & file sharing
* Cloudinary integration for media storage
* Real-time media rendering

### 🔹 Message Interactions

* Replies to messages
* Emoji reactions
* Emotion analysis (AI-ready support)

### 🔹 Smart UX Features

* Sidebar chat preview
* Message search
* Notifications system
* Dropdown message actions

---

## 🛠️ Tech Stack

| Layer        | Technology          |
| ------------ | ------------------- |
| Backend      | Node.js, Express.js |
| Database     | MongoDB             |
| Real-Time    | Socket.IO           |
| Media Store  | Cloudinary          |
| Architecture | REST + WebSockets   |

---

## 📂 Project Modules

* Authentication
* Chat Engine
* Message System
* Media Upload Service
* Reactions & Replies
* Notifications
* Online Presence

---

## ⚡ Real-Time Capabilities

SentraChat uses **Socket.IO** to handle:

* Instant message delivery
* Live typing indicators
* Real-time media updates
* Status sync
* Reaction updates

---

## 🧠 Advanced Functionalities

* Emotion analysis ready message pipeline
* Scalable message schema
* Cloud-based media delivery
* Efficient sidebar previews

---

## 📦 Installation

```bash
# Clone repository
 git clone https://github.com/your-username/sentrachat.git

# Navigate to project
 cd sentrachat

# Install dependencies
 npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```
PORT=
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## ▶️ Run Project

```bash
npm run dev
```

---

## 📡 Socket Events

| Event            | Description         |
| ---------------- | ------------------- |
| send_message     | Send message        |
| receive_message  | Receive message     |
| typing           | Typing indicator    |
| stop_typing      | Stop typing         |
| message_reaction | Add reaction        |
| message_reply    | Reply to message    |
| online_status    | Track user presence |

---

## 🧩 Future Scope

* Voice messages
* Video calling
* End-to-end encryption
* AI smart replies

---

## 👨‍💻 Author

Built by **You** as part of your real-time MERN learning journey 🚀

---

## 📜 License

MIT License
