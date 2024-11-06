import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import TextContent from "./TextContent.js";
import "../../css/text.css";

const Text = ({ messages, name }) => {
  return (
    <ScrollToBottom className="scrollMessage">
      {messages.map((message, index) => (
        <div key={index}>
          <TextContent message={message} name={name} />
        </div>
      ))}
    </ScrollToBottom>
  );
};

export default Text;
