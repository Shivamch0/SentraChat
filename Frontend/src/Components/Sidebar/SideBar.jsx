import React, { useState, useEffect } from "react";
import Logo from "../../assets/white logo.png";
import style from "./SideBar.module.css";
import { createPrivateChat, fetchChats } from "../../api/chat.api.js";
import socket from "../../socket.js";

function SideBar({ setActiveChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineMap, setOnlineMap] = useState({});

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await fetchChats();

        const status = {};

        res.data.forEach((chat) => {
          if (!chat.isGroupChat && Array.isArray(chat.users)) {
            chat.users.forEach((user) => {
              status[user._id] = user.isOnline;
            });
          }
        });

        console.log(res.data);
        setOnlineMap(status);
        setChats(res.data);
      } catch (error) {
        console.log(" Failed to load chats ", error);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  useEffect(() => {
    socket.on("User Status Changed", ({ userId, isOnline }) => {
      setOnlineMap((prev) => ({
        ...prev,
        [userId]: isOnline,
      }));
    });
    return () => socket.off("user status changed...");
  }, []);

  const handleNewChat = async () => {
    const userId = prompt("Enter user ID to start chat:");

    if (!userId) return;

    try {
      await createPrivateChat(userId);

      const updated = await fetchChats();
      setChats(updated.data);
    } catch (err) {
      alert("User not found or chat already exists", err);
    }
  };

  if (loading) return <p>Loading Chats...</p>;
  return (
    <>
      <aside className={style.sideBar}>
        <div className={style.sideBarLogo}>
          <img src={Logo} />
        </div>

        <button className={style.newChatBtn} onClick={handleNewChat}>
          + New Chat
        </button>

        <div className={style.chatSection}>
          <input type="text" placeholder="Search" />
          {Array.isArray(chats) &&
            chats.map((chat) => {
              const otherUser =
                !chat.isGroupChat && Array.isArray(chat.users)
                  ? chat.users.find((u) => !u.isOnline) || chat.users[0]
                  : null;

              return (
                <div
                  key={chat._id}
                  className={style.chatPersons}
                  onClick={() => setActiveChat(chat._id)}
                >
                  <img
                    src={
                      chat.isGroupChat
                        ? "/group.png"
                        : otherUser?.avatar || "/default.png"
                    }
                  />

                  {!chat.isGroupChat && (
                    <span
                      className={`${style.statusDot} ${
                        onlineMap[otherUser?._id] ? style.online : style.offline
                      }`}
                    />
                  )}

                  <div className={style.details}>
                    <h4>
                      {chat.isGroupChat
                        ? chat.chatName
                        : otherUser?.fullName || "User"}
                    </h4>

                    <p>{chat.latestMessage?.message || "No messages yet"}</p>

                    {chat.unreadCount > 0 && (
                      <span className={style.unread}>{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </aside>
    </>
  );
}

export default SideBar;
