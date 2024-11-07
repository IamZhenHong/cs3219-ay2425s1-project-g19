import React from "react";
import "../../css/textInput.css";

const TextInput = ({ message, setMessage, sendMessage }) => {
  return (
    <form className="form">
      <input
        className="input"
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          event.key === "Enter" && sendMessage(event);
        }}
      ></input>
      <button className="sendButton" onClick={(event) => sendMessage(event)}>
        Send
      </button>
    </form>
  );
};

export default TextInput;
