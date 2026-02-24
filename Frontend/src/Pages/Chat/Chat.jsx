import React, { useEffect, useState } from "react";
import style from "./Chat.module.css";
import SideBar from "../../Components/Sidebar/SideBar";
import sarah from "../../assets/sarah.png";
import { fetchMessages, sendMessageApi } from "../../api/message.api.js";
import socket from "../../socket.js";
import { getCurrentUser } from "../../api/auth.api.js";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId , setCurrentUserId] = useState([]);

  useEffect(() => {
    if (!activeChat) return;

    const loadMessages = async () => {
      const res = await fetchMessages(activeChat);
      setMessages(res.data.messages);

      socket.emit("join chat", activeChat);
    };

    loadMessages();
  }, [activeChat]);

  useEffect(() => {
    socket.on("message received", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("message received");
  }, []);

  useEffect(() => {
    const chatBox = document.querySelector(`.${style.chat}`);
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  useEffect(() =>{
    const loadUser = async () =>{
      const res = await getCurrentUser();
      setCurrentUserId(res.data.user._id)
    };
    loadUser();
  } , []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      await sendMessageApi(activeChat, newMessage);
      setNewMessage("");
    } catch (error) {
      console.log("Failed to send messages..." , error)
    }
  };

  return (
    <>
      <div className={style.chatContainer}>
        <SideBar setActiveChat={setActiveChat} />
        <div className={style.chatPannel}>
          <section className={style.topSection}>
            <div className={style.userInfo}>
              <img src={sarah} alt="" />

              <div className={style.userDetails}>
                <h4>Sarah</h4>
                <p>online</p>
              </div>
            </div>

            <div className={style.icons}>
              <i className="fa-brands fa-sistrix"></i>
              <i className="fa-solid fa-user"></i>
            </div>
          </section>

          <section className={style.middleSection}>
            <section className={style.chatSection}>
              <input type="text" placeholder="Search" />

              <div className={style.chat}>
                {[...messages].map((msg) => (
                  <div
                    key={msg._id}
                    className={
                      msg.sendBy._id === currentUserId
                        ? style.senderMessage
                        : style.recieverMessage
                    }
                  >
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>

          <section className={style.bottomSection}>
            <div className={style.messageContainer}>
              <div className={style.messageBar}>
                <i className="fa-solid fa-plus"></i>

                <input
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />

                <i className="fa-regular fa-face-smile"></i>
              </div>
              <button onClick={sendMessage}>Send</button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default Chat;
