import React, { useEffect, useState, useRef } from "react";
import style from "./Chat.module.css";

import SideBar from "../../Components/Sidebar/SideBar";

import { fetchMessages, sendMessageApi } from "../../api/message.api.js";
import { getCurrentUser } from "../../api/auth.api.js";
import { markSeen } from "../../api/chat.api.js";

import  socket  from "../../socket.js";

function Chat() {

  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [typingUser, setTypingUser] = useState(null);

  const chatEndRef = useRef(null);

  /* =========================
     LOAD LOGGED USER
  ========================== */

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

      // Join socket room for this chat
      socket.emit("join chat", activeChat);

      // Mark messages as seen
      markSeen(activeChat);
    };

    loadMessages();
  }, [activeChat]);

  useEffect(() => {
    socket.on("message received", msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.off("message received");
  }, []);

  useEffect(() => {
    socket.on("typing", userId => {
      setTypingUser(userId);
    });

    socket.on("stop typing", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          <div className={style.chat}>

            {messages.map(msg => (
              <div
                key={msg._id}
                className={
                  msg.sendBy._id === currentUserId
                    ? style.senderMessage   
                    : style.recieverMessage  
                }
              >
                <p>{msg.message}</p>

               
                {msg.sendBy._id === currentUserId && (
                  <span style={{ fontSize: "10px", marginLeft: "5px" }}>
                    {msg.messageStatus === "seen" ? "✔✔" : "✔"}
                  </span>
                )}
              </div>
            ))}

            {typingUser && (
              <p style={{ fontSize: "12px", color: "gray" }}>
                Typing...
              </p>
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
                onChange={e => {
                  setNewMessage(e.target.value);
                  socket.emit("typing", activeChat);
                }}
                onBlur={() => socket.emit("stop typing", activeChat)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
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