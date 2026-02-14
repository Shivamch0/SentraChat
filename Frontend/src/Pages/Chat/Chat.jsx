import React from "react";
import style from "./Chat.module.css";
import SideBar from "../../Components/Sidebar/SideBar";
import sarah from "../../assets/sarah.png";

function Chat() {
  return (
    <>
      <div className={style.chatContainer}>
        <SideBar />
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
              <i class="fa-brands fa-sistrix"></i>
              <i class="fa-solid fa-user"></i>
            </div>
          </section>

          <section className={style.middleSection}>
            <section className={style.chatSection}>
              <input type="text" placeholder="Search" />

            <div className={style.chat}>
              
              <div className={style.day}>
                <p>Today 1:23</p>
              </div>

              <div className={style.senderMessage}>
                <p>Hey John! How are you?</p>
              </div>

              <div className={style.recieverMessage}>
                <p>Hi! I'm doing great, thanks for asking. How about you?</p>
              </div>

              <div className={style.senderMessage}>
                <p>Not too bad, just been busy with work. Managed to finish that big project</p>
              </div>

              <div className={style.recieverMessage}>
                <p>Thats great to hear! Lets catch up soon.</p>
              </div>

              <div className={style.senderMessage}>
                <p>John is typing...</p>
              </div>

            </div>
            </section>
          </section>

          <section className={style.bottomSection}>
            <input type="text" placeholder="Type a message..." />
            <button>Send</button>
          </section>
        </div>
      </div>
    </>
  );
}

export default Chat;
