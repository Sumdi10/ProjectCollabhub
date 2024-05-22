import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Component } from "react";

class AppButton extends Component {
  state = {};
  render() {
    let props = this.props;

    return (
      <div
        className={"cusBtn " + (props.customStyle ? props.customStyle : "")}
        onClick={props.onClick}
      >
        {props.icon !== "" ? (
          <FontAwesomeIcon icon={props.icon} size="2x" className="btnIcon" />
        ) : null}
        {props.name}
      </div>
    );
  }
}

export default AppButton;
