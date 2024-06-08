import React from "react";

function Button({ onClick, text, className }) {
  return (
    <button className={className} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
