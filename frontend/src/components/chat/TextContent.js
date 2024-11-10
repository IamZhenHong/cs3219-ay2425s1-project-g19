import React from "react";
import "../../css/textContent.css";

const TextContent = ({ message, name }) => {
  console.log("Message is:", message);
  console.log("Name is:", message.userId);
  console.log("Message is:", message.message);
  let isSentByCurrentUser = false;

  const trimmedName = name.trim().toLowerCase();

  if (message.userId === trimmedName) {
    console.log("Message is sent by current user");
    isSentByCurrentUser = true;
  } else {
    console.log("Message is sent by other user");
  }

  return isSentByCurrentUser ? (
    <div className="messageContainer justifyEnd">
      <p className="sentText pr-10">{trimmedName}</p>
      <div className="messageBox backgroundBlue">
        <p className="messageText colorWhite">{message.message}</p>
      </div>
    </div>
  ) : (
    <div className="messageContainer justifyStart">
      <div className="messageBox backgroundLight">
        <p className="messageText colorDark">{message.message}</p>
      </div>
      <p className="sentText pl-10 ">{message.userId}</p>
    </div>
  );
};

export default TextContent;
