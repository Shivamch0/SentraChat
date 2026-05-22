import React, { useState, useEffect } from "react";
import Logo from "../../assets/white logo.png";
import style from "./SideBar.module.css";
import { createPrivateChat, fetchChats } from "../../api/chat.api.js";
import socket from "../../socket.js";
import { getCurrentUser } from "../../api/auth.api.js";

function SideBar({ setActiveChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineMap, setOnlineMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

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
    const loadUser = async () => {
      const res = await getCurrentUser();
      setCurrentUserId(res.data.user._id);
    };
    loadUser();
  }, []);

  useEffect(() => {
    socket.on("user status changed", ({ userId, isOnline }) => {
      setOnlineMap((prev) => ({
        ...prev,
        [userId]: isOnline,
      }));
    });
    return () => socket.off("user status changed");
  }, []);

  useEffect(() => {
    socket.on("message received", (newMsg) => {
      setChats((prev) => {
        const updated = prev.map((chat) =>
          chat._id === newMsg.chat._id
            ? { ...chat, latestMessage: newMsg }
            : chat,
        );

        const activeChat = updated.find((c) => c._id === newMsg.chat._id);

        return [
          activeChat,
          ...updated.filter((c) => c._id !== newMsg.chat._id),
        ];
      });
    });

    return () => socket.off("message received");
  }, []);

  useEffect(() => {
    socket.on("chat updated", (updatedChat) => {
      setChats((prev) => {
        const exists = prev.find((c) => c._id === updatedChat._id);

        let newChats;

        if (exists) {
          newChats = prev.map((c) =>
            c._id === updatedChat._id ? updatedChat : c,
          );
        } else {
          newChats = [updatedChat, ...prev];
        }

        const active = newChats.find((c) => c._id === updatedChat._id);

        return [active, ...newChats.filter((c) => c._id !== updatedChat._id)];
      });
    });

    return () => socket.off("chat updated");
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const updatedUser = e.detail;

      setChats((prev) =>
        prev.map(chat => ({
          ...chat,
          users: chat.users.map(u =>
            u._id === updatedUser._id ? updatedUser : u,
          ),
        })),
      );
    };

    window.addEventListener("profileUpdated", handler);

    return () => window.removeEventListener("profileUpdated", handler);
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
            chats?.filter(Boolean).map((chat) => {
              const otherUser =
                !chat?.isGroupChat && Array.isArray(chat.users)
                  ? chat.users.find((u) => u._id !== currentUserId)
                  : null;

              return (
                <div
                  key={chat._id}
                  className={style.chatPersons}
                  onClick={() => setActiveChat(chat._id)}
                >
                  <div className={style.avatarWrapper}>
                    <img
                      src={
                        chat?.isGroupChat
                          ? "/group.png"
                          : otherUser?.avatar || "/default.png"
                      }
                    />

                    {!chat?.isGroupChat && (
                      <span
                        className={`${style.statusDot} ${
                          onlineMap[otherUser?._id] ? style.online : style.offline
                        }`}
                      />
                    )}
                  </div>

                  <div className={style.details}>
                    <h4>
                      {chat?.isGroupChat
                        ? chat.chatName
                        : otherUser?.fullName || "User"}
                    </h4>

                    <p>{chat.latestMessage?.message === "image"  ? "📷 Photo" : chat?.latestMessage?.message}</p>

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

export  { SideBar };
