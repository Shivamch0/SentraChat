import React, { useEffect, useState, useRef, useCallback } from "react";
import style from "./Chat.module.css";

import {
  fetchMessages,
  sendMessageApi,
  sendMediaApi,
  deleteMessage,
  searchMessages,
} from "../../api/message.api.js";
import { ProfilePannel } from "../../Components/ProfilePannel/ProfilePannel.jsx";
import { SideBar } from "../../Components/SideBar/SideBar.jsx";
import { getCurrentUser } from "../../api/auth.api.js";
import { markSeen, fetchChats } from "../../api/chat.api.js";
import socket from "../../socket.js";
import { playSentSound, playReceivedSound } from "../../utils/soundHelper.js";


function Chat() {
  //States //
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [replyMsg, setReplyMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const chatEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const loadingRef = useRef(false);
  const previousHeightRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const res = await getCurrentUser();
      const userId = res.data.user._id;
      setCurrentUserId(userId);
      socket.emit("setup", userId);
    };
    loadUser();
  }, []);

  // Reset chat state safely
  const resetChatState = useCallback(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
  }, []);

  // Stable loader
  const loadMessages = useCallback(
    async (pageToLoad = 1) => {
      if (!activeChat || loadingRef.current) return;

      loadingRef.current = true;
      setLoadingMore(true);

      const res = await fetchMessages(activeChat, pageToLoad);
      const newMessages = res.data.messages;

      setMessages((prev) => {
        const map = new Map();

        newMessages.forEach((m) => map.set(m._id, m));
        prev.forEach((m) => map.set(m._id, m));

        return Array.from(map.values()).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });

      setHasMore(pageToLoad < res.data.totalPages);

      loadingRef.current = false;
      setLoadingMore(false);
    },
    [activeChat],
  );

  useEffect(() => {
    if (!activeChat) return;

    resetChatState();
    loadMessages(1);

    socket.emit("join chat", activeChat);
    markSeen(activeChat);

    return () => {
      socket.emit("leave chat", activeChat);
    };
  }, [activeChat, loadMessages, resetChatState]);

  // Infinite scroll
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    const handleScroll = async () => {
      if (chatBox.scrollTop === 0 && hasMore && !loadingRef.current) {
        previousHeightRef.current = chatBox.scrollHeight;
        shouldRestoreScrollRef.current = true;

        const nextPage = page + 1;
        setPage(nextPage);

        await loadMessages(nextPage);
      }
    };

    chatBox.addEventListener("scroll", handleScroll);
    return () => chatBox.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, activeChat, loadMessages]);

  useEffect(() => {
    if (!shouldRestoreScrollRef.current) return;

    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    const newHeight = chatBox.scrollHeight;
    chatBox.scrollTop = newHeight - previousHeightRef.current;

    shouldRestoreScrollRef.current = false;
  }, [messages]);

  // Realtime messages
  useEffect(() => {
    const handler = (msg) => {
      // Play chime if we did NOT send the message
      if (msg.sendBy?._id !== currentUserId) {
        playReceivedSound();
      }

      if (msg.chat._id === activeChat) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;

          // If we sent the message and there is an optimistic "sending" message with same content, replace it
          if (msg.sendBy?._id === currentUserId) {
            const tempIdx = prev.findIndex((m) => m.isOptimistic && m.message === msg.message);
            if (tempIdx > -1) {
              const copy = [...prev];
              copy[tempIdx] = msg;
              return copy;
            }
          }

          return [...prev, msg];
        });
      }
    };

    socket.on("message received", handler);
    return () => socket.off("message received", handler);
  }, [activeChat, currentUserId]);

  // Typing indicators
  useEffect(() => {
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  // Auto-scroll bottom
  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    const nearBottom =
      chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 150 &&
      page === 1;

    if (nearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, page]);

  useEffect(() => {
    if (!chatBoxRef.current) return;
    if (page !== 1) return;

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, activeChat]);

  // Reactions
  useEffect(() => {
    socket.on("reaction updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    return () => socket.off("reaction updated");
  }, []);

  useEffect(() => {
    socket.on("message updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)),
      );
    });

    return () => socket.off("message updated");
  }, []);

  useEffect(() => {
    if (!activeChat) return;

    const findUser = async () => {
      const chats = await fetchChats();
      const chat = chats.data.find((c) => c._id === activeChat);

      if (!chat?.isGroupChat) {
        const other = chat.users.find((u) => u._id !== currentUserId);
        setChatUser(other);
      }
    };

    findUser();
  }, [activeChat, currentUserId]);

  useEffect(() => {
    socket.on("user status changed", ({ userId, isOnline, lastSeen }) => {
      if (chatUser && chatUser._id === userId) {
        setChatUser((prev) => ({
          ...prev,
          isOnline,
          lastSeen,
        }));
      }
    });

    return () => socket.off("user status changed");
  }, [chatUser]);

  useEffect(() => {
    const handler = (e) => {
      const updateUser = e.detail;
      if (chatUser?._id === updateUser._id) {
        setChatUser(updateUser);
      }
    };

    window.addEventListener("profileUpdated", handler);

    return () => window.removeEventListener("profileUpdated", handler);
  }, [chatUser]);

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

    const tempId = `temp-${Date.now()}`;
    const messageText = newMessage;
    const tempMsg = {
      _id: tempId,
      message: messageText,
      sendBy: { _id: currentUserId, fullName: "You" },
      messageType: "text",
      replyTo: replyMsg ? { ...replyMsg } : null,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      messageStatus: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage("");
    setReplyMsg(null);
    socket.emit("stop typing", activeChat);
    playSentSound();

    try {
      const res = await sendMessageApi(activeChat, messageText, tempMsg.replyTo?._id);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempId);
        if (filtered.some((m) => m._id === res.data._id)) {
          return filtered;
        }
        return [...filtered, res.data];
      });
    } catch (err) {
      console.log("Send failed", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId
            ? { ...msg, messageStatus: "failed", isOptimistic: false }
            : msg
        )
      );
    }
  };

  const handleMediaSend = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const tempId = `temp-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    const tempMsg = {
      _id: tempId,
      message: localUrl,
      sendBy: { _id: currentUserId, fullName: "You" },
      messageType: "image",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      messageStatus: "sending",
    };

    setMessages((prev) => [...prev, tempMsg]);
    playSentSound();

    try {
      const res = await sendMediaApi(activeChat, file);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== tempId);
        if (filtered.some((m) => m._id === res.data._id)) {
          return filtered;
        }
        return [...filtered, res.data];
      });
    } catch (err) {
      console.log("Media send failed", err.message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId
            ? { ...msg, messageStatus: "failed", isOptimistic: false }
            : msg
        )
      );
    }
  };

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const displayMessages = searchQuery ? searchResults : messages;

  const getEmotionEmoji = (emotion) => {
    switch (emotion) {
      case "positive":
        return "🙂";
      case "negative":
        return "🙁";
      case "neutral":
      default:
        return "😐";
    }
  };

  return (
    <div className={style.chatContainer}>
      <SideBar setActiveChat={setActiveChat} />

      {showProfile && (
        <ProfilePannel user={chatUser} onClose={() => setShowProfile(false)} />
      )}

      <div className={style.chatPannel}>
        <section className={style.topSection}>
          {chatUser && (
            <div
              className={style.userInfo}
              onClick={() => setShowProfile(true)}
            >
              <img
                src={chatUser?.avatar || "/default.png"}
                key={chatUser?.avatar}
              />
              <div>
                <h4>{chatUser.fullName}</h4>
                <p style={{ fontSize: "12px", color: "gray" }}>
                  {chatUser.isOnline
                    ? "Online"
                    : `Last seen ${new Date(chatUser.lastSeen).toLocaleTimeString()}`}
                </p>
              </div>
            </div>
          )}

          <input
            className={style.searchInput}
            placeholder="🔍 Search messages..."
            value={searchQuery}
            onChange={async (e) => {
              const q = e.target.value;
              setSearchQuery(q);

              if (q.trim()) {
                const res = await searchMessages(activeChat, q);
                setSearchResults(res.data);
              } else {
                setSearchResults([]);
              }
            }}
          />
        </section>

        <section className={style.middleSection}>
          <div className={style.chat} ref={chatBoxRef}>
            {loadingMore && <p>Loading older messages...</p>}

            {displayMessages.map((msg) => (
              <div
                key={msg._id}
                className={`${
                  msg.sendBy?._id === currentUserId
                    ? style.senderMessage
                    : style.recieverMessage
                } ${msg.isOptimistic ? style.optimistic : ""}`}
              >
                <div className={style.messageWrapper}>
                  {/* Reply Preview */}
                  {msg.replyTo && (
                    <div className={style.replyPreview}>
                      <span>{msg.replyTo.sendBy?.fullName}</span>
                      <p>{msg.replyTo.message}</p>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`${style.bubble} ${
                      msg.emotionType === "positive"
                        ? style.positive
                        : msg.emotionType === "negative"
                          ? style.negative
                          : style.neutral
                    }`}
                  >
                    <div className={style.messageContent}>
                      {msg?.messageType === "image" ? (
                        <img src={msg.message} className={style.imageMsg} />
                      ) : (
                        <p>{msg.message}</p>
                      )}

                      {msg.emotionType && (
                        <span className={style.emotion}>
                          {getEmotionEmoji(msg.emotionType)}
                        </span>
                      )}
                    </div>

                    <div className={style.bubbleFooter}>
                      {/* Reactions */}
                      {msg.reactions?.length > 0 && (
                        <div className={style.reactionBubble}>
                          {msg.reactions.map((r) => (
                            <span key={r.emoji}>
                              {r.emoji} {r.users.length}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Status + Menu */}
                      <div className={style.messageFooter}>
                        {msg.sendBy?._id === currentUserId && (
                          <span className={style.status}>
                            {msg.messageStatus === "sending" ? "⏳" : msg.messageStatus === "failed" ? "❌" : msg.messageStatus === "seen" ? "✔✔" : "✔"}
                          </span>
                        )}

                        {!msg.isOptimistic && (
                          <span
                            className={style.menuIcon}
                            onClick={() => toggleMenu(msg._id)}
                          >
                            ⋮
                          </span>
                        )}

                        {openMenu === msg._id && !msg.isOptimistic && (
                          <div className={style.dropdown}>
                            <button onClick={() => setReplyMsg(msg)}>
                              Reply
                            </button>
                            {msg.sendBy?._id === currentUserId && (
                              <button onClick={() => deleteMessage(msg._id)}>
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <p style={{ fontSize: "12px", color: "gray" }}>Typing...</p>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        {replyMsg && (
          <div className={style.replyBox}>
            <div>
              <span>Replying to</span>
              <p>{replyMsg.message}</p>
            </div>
            <button onClick={() => setReplyMsg(null)}>✕</button>
          </div>
        )}

        <section className={style.bottomSection}>
          <div className={style.messageContainer}>
            <div className={style.messageBar}>
              <label className={style.attachBtn}>
                📎
                <input type="file" hidden onChange={handleMediaSend} />
              </label>
              <input
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
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
