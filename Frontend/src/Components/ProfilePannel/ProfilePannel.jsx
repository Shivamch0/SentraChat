import React, { useState } from "react";
import style from "./ProfilePannel.module.css";
import { logOutUser } from "../../api/auth.api";

function ProfilePannel({ user, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.fullName || "");
  const [about, setAbout] = useState(user?.about || "");
  const [showMenu, setShowMenu] = useState(false);


  const handleLogout = async () => {
    await logOutUser();
    window.location.href = "/login";
  };

  const saveChanges = () => {};

  return (
    <div className={style.panel}>
      {/* Header */}
      <div className={style.header}>
        <span onClick={onClose}>✕</span>
        <h3>Profile</h3>

        <div className={style.settingsWrapper}>
          <button
            className={style.settingsBtn}
            onClick={() => setShowMenu(!showMenu)}
          >
            ⚙
          </button>

          {showMenu && (
            <div className={style.dropdown}>
              <p
                onClick={() => {
                  setEditMode(true);
                  setShowMenu(false);
                }}
              >
                Edit Details
              </p>

              <p className={style.logout} onClick={handleLogout}>
                Logout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className={style.avatarSection}>
        <div className={style.avatarWrapper}>
          <img src={user?.avatar || "/default.png"} />

          {editMode && (
            <label className={style.uploadBtn}>
              📷
              <input type="file" hidden />
            </label>
          )}
        </div>

        {editMode ? (
          <input
            className={style.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        ) : (
          <h2>{user?.fullName}</h2>
        )}
      </div>

      {/* About */}
      <div className={style.section}>
        <h4>Bio</h4>
        {editMode ? (
          <textarea
            className={style.input}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        ) : (
          <p>{user?.about || "Available"}</p>
        )}
      </div>

      {editMode && (
        <button className={style.saveBtn} onClick={() => saveChanges()}>
          Save Changes
        </button>
      )}
    </div>
  );
}

export { ProfilePannel };
