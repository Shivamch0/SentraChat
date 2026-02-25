import React, { useEffect, useState, useRef } from "react";
import style from "./Chat.module.css";
import SideBar from "../../Components/Sidebar/SideBar";
import { fetchMessages, sendMessageApi } from "../../api/message.api.js";
import { getCurrentUser } from "../../api/auth.api.js";
import { markSeen } from "../../api/chat.api.js";
import { reactToMessageApi } from "../../api/message.api.js";

import socket from "../../socket.js";

function Chat() {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      const res = await getCurrentUser();
      setCurrentUserId(res.data.user._id);
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    const loadMessages = async () => {
      const res = await fetchMessages(activeChat);
      setMessages(res.data.messages);

      socket.emit("join chat", activeChat);
      markSeen(activeChat);
    };

    loadMessages();

    return () => {
      socket.emit("leave chat", activeChat);
    };
  }, [activeChat]);

  useEffect(() => {
    socket.on("message received", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("message received");
  }, []);

  useEffect(() => {
    socket.on("typing", () => {
      console.log("Typing Event Received");
      setIsTyping(true);
    });

    socket.on("stop typing", () => {
      console.log("Stop Typing");
      setIsTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    const nearBottom =
      chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 150;

    if (nearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("reaction updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    return () => socket.off("reaction updated");
  }, []);

  const handleTyping = (value) => {
    setNewMessage(value);
    socket.emit("typing", activeChat);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", activeChat);
    }, 800);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      await sendMessageApi(activeChat, newMessage);
      setNewMessage("");
      socket.emit("stop typing", activeChat);
    } catch (err) {
      console.log("Send failed", err);
    }
  };

  return (
    <div className={style.chatContainer}>
      <SideBar setActiveChat={setActiveChat} />

      <div className={style.chatPannel}>
        <section className={style.topSection}>
          <h4>Chat</h4>
        </section>

        <section className={style.middleSection}>
          <div className={style.chat} ref={chatBoxRef}>
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={
                  msg.sendBy._id === currentUserId
                    ? style.senderMessage
                    : style.recieverMessage
                }
              >
                <p>{msg.message}</p>

                <div className={style.reactionPicker}>
                  <span onClick={() => reactToMessageApi(msg._id, "❤️")}>
                    ❤️
                  </span>
                  <span onClick={() => reactToMessageApi(msg._id, "😂")}>
                    😂
                  </span>
                  <span onClick={() => reactToMessageApi(msg._id, "👍")}>
                    👍
                  </span>
                </div>

                {msg.reactions?.length > 0 && (
                  <div className={style.reactionBubble}>
                    {msg.reactions.map((r) => (
                      <span key={r.emoji}>
                        {r.emoji} {r.users.length}
                      </span>
                    ))}
                  </div>
                )}
                
                {msg.sendBy._id === currentUserId && (
                  <span style={{ fontSize: "10px", marginLeft: "5px" }}>
                    {msg.messageStatus === "seen" ? "✔✔" : "✔"}
                  </span>
                )}
              </div>
            ))}

            {isTyping && (
              <p style={{ fontSize: "12px", color: "gray" }}>Typing...</p>
            )}
            <div ref={chatEndRef} />
          </div>
        </section>

        <section className={style.bottomSection}>
          <div className={style.messageContainer}>
            <div className={style.messageBar}>
              <input
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => {
                  handleTyping(e.target.value);
                  socket.emit("typing", activeChat);
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
            </div>

            <button onClick={sendMessage}>Send</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Chat;
