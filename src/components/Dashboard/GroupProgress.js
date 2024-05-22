import React from "react";
import AppButton from "../AppButton";

const GroupProgress = (props) => {
  return (
    <div className="dataContainerBox">
      <p className="contentTitle">Group Progress</p>
      {props.groupProgress.length > 0 ? (
        props.groupProgress.map((item, idx) => {
          return (
            <div key={idx}>
              <div className="d-flex justify-content-between">
                <p className="progressTitle">{item.groupName}</p>
                <p className={`progressCount countColor${idx}`}>
                  {item.progress}
                </p>
              </div>
              <div class={`progress progressBgColor${idx}`}>
                <div
                  class={`progress-bar progressColor${idx}`}
                  role="progressbar"
                  style={{ width: item.progress }}
                  aria-valuenow={item.progress}
                ></div>
              </div>
            </div>
          );
        })
      ) : (
        <p>No group progress recorded yet.</p>
      )}
      <div className="d-flex justify-content-end">
        <AppButton name="View All" customStyle="btnColorSecondary" />
      </div>
    </div>
  );
};

export default GroupProgress;
