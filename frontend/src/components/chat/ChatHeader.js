import React from "react";
import "../../css/chatHeader.css";

const ChatHeader = ({ roomName }) => {
  return (
    <div className="chatHeader">
      <div className="roomName">Chat</div>
    </div>
  );
};

export default ChatHeader;
