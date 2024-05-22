import React from "react"
import GroupList from "../components/Group/GroupList"
import GroupMemberList from "../components/Group/GroupMemberList"
import GroupMessage from "../components/Group/GroupMessage"

const GroupPage = () => {
    return (
        <div className="container-fluid customMargin">
            <div style={{ marginBottom: "1.5rem" }}>
                <GroupList />
            </div>

            <div className="row" style={{ marginBottom: "1.5rem" }}>
                <div className="col-md-6">
                    <GroupMemberList />
                </div>
                <div className="col-md-6">
                    <GroupMessage />
                </div>
            </div>
        </div>
    )
}

export default GroupPage
