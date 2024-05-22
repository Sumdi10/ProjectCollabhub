import React from "react";
import { Spinner } from "reactstrap";

function CustomFullSpinner({
  spinnerColor = "white",
  spinnerContainerClass,
  text,
  textClass,
}) {
  return (
    <div
      className={
        "fullWindow-Spinner " +
        (spinnerContainerClass ? spinnerContainerClass : "")
      }
    >
      <div>
        <Spinner color={spinnerColor}></Spinner>
      </div>
      <div
        className={textClass}
        style={{ fontSize: "16px", marginTop: "15px" }}
      >
        {text}
      </div>
    </div>
  );
}

export default CustomFullSpinner;
