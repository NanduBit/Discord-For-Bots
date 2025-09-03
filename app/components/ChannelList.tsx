const channels = {
  categories: [
    {
      id: 1,
      name: "Information",
      channels: [
        { id: 1, name: "announcements", type: "text" },
        { id: 2, name: "rules", type: "text" }
      ]
    },
    {
      id: 2,
      name: "Text Channels",
      channels: [
        { id: 3, name: "general", type: "text" },
        { id: 4, name: "bot-commands", type: "text" },
        { id: 5, name: "development", type: "text" }
      ]
    },
    {
      id: 3,
      name: "Voice Channels",
      channels: [
        { id: 6, name: "General Voice", type: "voice" },
        { id: 7, name: "Gaming", type: "voice" },
        { id: 8, name: "Music", type: "voice" }
      ]
    }
  ]
};

export default function ChannelList() {
  return (
    <div
      id="channelList"
      style={{
        position: "fixed",
        top: 0,
        left: "72px",
        height: "100vh",
        width: "240px",
        background: "#2b2d31",
        margin: "0",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        zIndex: 1,
        overflowY: "auto",
      }}
    >
      {/* Server name header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #1e1f22",
          fontWeight: "bold",
          fontSize: "16px",
          color: "white",
        }}
      >
        Bot Development
      </div>

      {channels.categories.map((category) => (
        <div key={category.id}>
          <div
            style={{
              padding: "16px 8px 0 16px",
              color: "#96989d",
              fontSize: "12px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {category.name}
          </div>
          {category.channels.map((channel) => (
            <div
              key={channel.id}
              style={{
                padding: "6px 8px 6px 20px",
                color: "#96989d",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                marginLeft: "8px",
                borderRadius: "4px",
                marginRight: "8px",
              }}
            >
              {channel.type === "text" ? "#" : "🔊"} {channel.name}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
