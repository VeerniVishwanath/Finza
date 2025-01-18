import React from "react";

function layout({ children }) {
  return (
    <div className="flex justify-center items-center h-[80dvh]">{children}</div>
  );
}

export default layout;
