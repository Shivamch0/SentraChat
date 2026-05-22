import React, { useState, useEffect } from "react";
import Logo from "../../assets/white logo.png";
import style from "./SideBar.module.css";
import { createPrivateChat, createGroupChat, fetchChats } from "../../api/chat.api.js";
import socket from "../../socket.js";
import { getCurrentUser, searchUsers } from "../../api/auth.api.js";

function SideBar({ setActiveChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineMap, setOnlineMap] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  // Phase 2 Modals and search states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalUsers, setModalUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [modalError, setModalError] = useState("");

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

  const handleStartChat = async (userId) => {
    try {
      await createPrivateChat(userId);
      const updated = await fetchChats();
      setChats(updated.data);
      setShowNewChatModal(false);
      setModalSearch("");
      setModalUsers([]);
      setModalError("");
    } catch (err) {
      setModalError("Failed to start conversation or chat already exists.");
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setModalError("Group name is required.");
      return;
    }
    if (selectedGroupUsers.length < 2) {
      setModalError("Please select at least 2 other members.");
      return;
    }

    try {
      const userIds = selectedGroupUsers.map(u => u._id);
      await createGroupChat(groupName, userIds);
      const updated = await fetchChats();
      setChats(updated.data);
      
      // Close & reset
      setShowGroupModal(false);
      setGroupName("");
      setSelectedGroupUsers([]);
      setModalSearch("");
      setModalUsers([]);
      setModalError("");
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to create group.");
    }
  };

  if (loading) return <p className={style.loadingChats}>Loading Chats...</p>;
  return (
    <>
      <aside className={style.sideBar}>
        <div className={style.sideBarLogo}>
          <img src={Logo} />
        </div>

        <div className={style.actionButtons}>
          <button className={style.newChatBtn} onClick={() => setShowNewChatModal(true)}>
            + Chat
          </button>
          <button className={style.newGroupBtn} onClick={() => setShowGroupModal(true)}>
            + Group
          </button>
        </div>

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

      {/* Sleek Glassmorphic Modal for New Chat */}
      {showNewChatModal && (
        <div className={style.modalOverlay} onClick={() => { setShowNewChatModal(false); setModalSearch(""); setModalUsers([]); setModalError(""); }}>
          <div className={style.glassModal} onClick={(e) => e.stopPropagation()}>
            <div className={style.modalHeader}>
              <h3>New Conversation</h3>
              <button className={style.closeBtn} onClick={() => { setShowNewChatModal(false); setModalSearch(""); setModalUsers([]); setModalError(""); }}>✕</button>
            </div>
            <div className={style.modalBody}>
              <p className={style.modalDesc}>Search for a user by username or name to start a private chat.</p>
              <input
                type="text"
                placeholder="Type username or name..."
                value={modalSearch}
                className={style.modalInput}
                onChange={async (e) => {
                  const val = e.target.value;
                  setModalSearch(val);
                  if (val.trim()) {
                    try {
                      const res = await searchUsers(val);
                      setModalUsers(res.data.users || []);
                      setModalError("");
                    } catch (err) {
                      setModalUsers([]);
                    }
                  } else {
                    setModalUsers([]);
                  }
                }}
              />
              {modalError && <p className={style.errorMsg}>{modalError}</p>}
              <div className={style.usersList}>
                {modalUsers.length > 0 ? (
                  modalUsers.map((user) => (
                    <div key={user._id} className={style.userSelectItem} onClick={() => handleStartChat(user._id)}>
                      <img src={user.avatar || "/default.png"} className={style.userItemAvatar} alt="" />
                      <div className={style.userItemInfo}>
                        <h5>{user.fullName}</h5>
                        <span>@{user.userName}</span>
                      </div>
                      <button className={style.startChatBtn}>Chat</button>
                    </div>
                  ))
                ) : (
                  modalSearch.trim() && <p className={style.noUsers}>No users found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Glassmorphic Modal for Create Group Chat */}
      {showGroupModal && (
        <div className={style.modalOverlay} onClick={() => { setShowGroupModal(false); setModalSearch(""); setModalUsers([]); setGroupName(""); setSelectedGroupUsers([]); setModalError(""); }}>
          <div className={style.glassModal} onClick={(e) => e.stopPropagation()}>
            <div className={style.modalHeader}>
              <h3>Create Group Chat</h3>
              <button className={style.closeBtn} onClick={() => { setShowGroupModal(false); setModalSearch(""); setModalUsers([]); setGroupName(""); setSelectedGroupUsers([]); setModalError(""); }}>✕</button>
            </div>
            <div className={style.modalBody}>
              <input
                type="text"
                placeholder="Enter Group Name..."
                value={groupName}
                className={style.modalInput}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <p className={style.modalDesc}>Search and select members (min 2) to invite to the group.</p>
              <input
                type="text"
                placeholder="Search users to invite..."
                value={modalSearch}
                className={style.modalInput}
                onChange={async (e) => {
                  const val = e.target.value;
                  setModalSearch(val);
                  if (val.trim()) {
                    try {
                      const res = await searchUsers(val);
                      setModalUsers(res.data.users || []);
                    } catch (err) {
                      setModalUsers([]);
                    }
                  } else {
                    setModalUsers([]);
                  }
                }}
              />
              {modalError && <p className={style.errorMsg}>{modalError}</p>}
              
              {/* Selected Users Pill list */}
              {selectedGroupUsers.length > 0 && (
                <div className={style.pillsContainer}>
                  {selectedGroupUsers.map((u) => (
                    <div key={u._id} className={style.pill}>
                      <span>{u.fullName}</span>
                      <button className={style.pillRemove} onClick={() => setSelectedGroupUsers(prev => prev.filter(item => item._id !== u._id))}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className={style.usersList}>
                {modalUsers.length > 0 ? (
                  modalUsers.map((user) => {
                    const isSelected = selectedGroupUsers.some(u => u._id === user._id);
                    return (
                      <div
                        key={user._id}
                        className={`${style.userSelectItem} ${isSelected ? style.selectedItem : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGroupUsers(prev => prev.filter(u => u._id !== user._id));
                          } else {
                            setSelectedGroupUsers(prev => [...prev, user]);
                          }
                        }}
                      >
                        <img src={user.avatar || "/default.png"} className={style.userItemAvatar} alt="" />
                        <div className={style.userItemInfo}>
                          <h5>{user.fullName}</h5>
                          <span>@{user.userName}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className={style.checkbox}
                        />
                      </div>
                    );
                  })
                ) : (
                  modalSearch.trim() && <p className={style.noUsers}>No users found.</p>
                )}
              </div>
              
              <button className={style.submitGroupBtn} onClick={handleCreateGroup}>
                Create Group ({selectedGroupUsers.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export  { SideBar };
