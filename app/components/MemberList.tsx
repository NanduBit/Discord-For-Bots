"use client";

import Image from "next/image";

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

export default function MemberList() {
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
    <div
      id="memberList"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "240px",
        height: "100vh",
        background: "#2b2d31",
        borderLeft: "1px solid #232428",
        display: "flex",
        flexDirection: "column",
        padding: "16px 0",
        overflowY: "auto",
      }}
    >
      {members.roles.map((role) => (
        <div key={role.id}>
          <div
            style={{
              padding: "16px 16px 4px 16px",
              color: "#96989d",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            <span style={{ color: role.color }}>{role.name}</span> — {role.members.length}
          </div>
          {role.members.map((member) => (
            <div
              key={member.id}
              style={{
                padding: "4px 16px",
                color: "white",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#36393f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={24}
                    height={24}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: getStatusColor(member.status),
                    border: "2px solid #2b2d31",
                  }}
                />
              </div>
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
