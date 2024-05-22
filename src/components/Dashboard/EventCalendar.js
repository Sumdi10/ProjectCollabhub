import moment from "moment";
import React from "react";
import AppButton from "../AppButton";

const EventCalendar = (props) => {
  return (
    <div className="dataContainerBox">
      <p className="contentTitle">Event Calendar</p>
      {props.events.length > 0
        ? props.events.map((item, idx) => {
            return (
              <div
                key={idx}
                className="d-flex align-items-center"
                style={{ marginBottom: "0.75rem " }}
              >
                <div className="eventDateBox">
                  <p className="eventDateMonth">
                    {moment(item.date).format("MMM")}
                  </p>
                  <p className="eventDate">{moment(item.date).format("D")}</p>
                </div>
                <div>
                  <p className="progressTitle">{item.title}</p>
                  <p className="eventTime">
                    {moment(item.date).format("ddd h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        : null}
      <div className="d-flex justify-content-end">
        <AppButton name="View All" customStyle="btnColorSecondary" />
      </div>
    </div>
  );
};

export default EventCalendar;
