import React, { useState } from "react";
import style from "./ProfilePannel.module.css";
import { logOutUser } from "../../api/auth.api.js";
import { uploadAvatar , updateProfile } from "../../api/profile.js";


function ProfilePannel({ user, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.fullName || "");
  const [about, setAbout] = useState(user?.about || "");
  const [showMenu, setShowMenu] = useState(false);
  const [preview , setPreview] = useState(null);
  const [tempAvatar, setTempAvatar] = useState(null);


  const handleLogout = async () => {
    await logOutUser();
    window.location.href = "/login";
  };

  const handleSave = async () => {
     const res = await updateProfile({
    fullName: name,
    about,
    avatar: tempAvatar
  });

  setEditMode(false);
  setTempAvatar(null);

  setPreview(res.user.avatar);

  window.dispatchEvent(
    new CustomEvent("profileUpdated", { detail: res.user })
  );
  };

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
          <img src={preview || user?.avatar || "/default.png"} key={preview || user?.avatar} />

          {editMode && (
            <label className={style.uploadBtn}>
              📷
              <input type="file" hidden 
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if(!file) return;

                  const res = await uploadAvatar(file);
                  setPreview(res.user.avatar);
                  setTempAvatar(res.user.avatar);
                }}
              />
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
        <button className={style.saveBtn} onClick={handleSave}>
          Save Changes
        </button>
      )}
    </div>
  );
}

export { ProfilePannel };
