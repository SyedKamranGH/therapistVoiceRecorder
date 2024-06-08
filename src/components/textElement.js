import React from "react";

function TextElement({ className, label, value }) {
  return (
    <div className={className}>
      <span className="label">{label}:</span>{" "}
      <span className="value">{value}</span>
    </div>
  );
}

export default TextElement;
