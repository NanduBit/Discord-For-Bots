"use client";

import Image from "next/image";
import { memo } from "react";

const members = {
  roles: [
    {
      id: 3,
      name: "Work In Progress",
      color: "#7289da",
      members: [
        { id: 5, name: "ActiveUser", status: "online", avatar: "/file.svg" },
        { id: 6, name: "BotDev", status: "dnd", avatar: "/next.svg" },
        { id: 7, name: "Newbie", status: "offline", avatar: "/vercel.svg" }
      ]
    }
  ]
};

export default memo(function MemberList() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "#43b581";
      case "idle": return "#faa61a";
      case "dnd": return "#f04747";
      case "offline": return "#747f8d";
      default: return "#747f8d";
    }
  };

  return (
    <div id="memberList" className="member-list-container thin-scrollbar">
      <div className="role-header">
        Members — {members.roles.reduce((total, role) => total + role.members.length, 0)}
      </div>
      
      {members.roles.map((role) => (
        <div key={role.id}>
          <div className="role-header">
            <span style={{ color: role.color }}>{role.name}</span> — {role.members.length}
          </div>
          {role.members.map((member) => (
            <div key={member.id} className="member-item">
              <div className="member-avatar">
                <div className="avatar-container">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={24}
                    height={24}
                  />
                </div>
                <div
                  className={`status-indicator status-${member.status}`}
                />
              </div>
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});
