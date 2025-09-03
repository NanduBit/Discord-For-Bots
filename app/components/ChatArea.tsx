import Image from "next/image";

const messages = [
  {
    id: 1,
    user: {
      name: "CopilotBot",
      avatar: "/next.svg",
      role: { name: "Admin", color: "#e91e63" }
    },
    content: "Welcome to the Bot Development server! 🚀",
    timestamp: "Today at 9:00 AM"
  },
  {
    id: 2,
    user: {
      name: "BotDev",
      avatar: "/vercel.svg",
      role: { name: "Members", color: "#7289da" }
    },
    content: "Hey everyone! I'm working on a new bot feature. Any suggestions?",
    timestamp: "Today at 9:05 AM"
  },
  {
    id: 3,
    user: {
      name: "ChatMod",
      avatar: "/globe.svg",
      role: { name: "Moderator", color: "#42a5f5" }
    },
    content: "Make sure to check out our documentation in the #resources channel!",
    timestamp: "Today at 9:10 AM"
  }
];

export default function ChatArea() {
  return (
    <div
      id="chatArea"
      style={{
        position: "fixed",
        top: 0,
        left: "312px", /* 72px (server list) + 240px (channel list) */
        right: "240px", /* Member list width */
        height: "100vh",
        background: "#313338",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          height: "48px",
          borderBottom: "1px solid #232428",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          color: "white",
          fontWeight: "bold",
        }}
      >
        # development
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: "16px",
              display: "flex",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#36393f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src={message.user.avatar}
                alt={message.user.name}
                width={32}
                height={32}
              />
            </div>
            <div>
              <div style={{ marginBottom: "4px" }}>
                <span
                  style={{
                    color: message.user.role.color,
                    fontWeight: "500",
                    marginRight: "8px",
                  }}
                >
                  {message.user.name}
                </span>
                <span style={{ color: "#a3a6aa", fontSize: "0.75rem" }}>
                  {message.timestamp}
                </span>
              </div>
              <div style={{ color: "#dcddde" }}>{message.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div
        style={{
          margin: "0 16px 24px 16px",
        }}
      >
        <div 
          style={{
            borderRadius: "8px",
            background: "#383a40",
            padding: "12px",
            color: "#96989d",
          }}
        >
          Message #development
        </div>
      </div>
    </div>
  );
}
