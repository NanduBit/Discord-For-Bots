import Image from "next/image";

const servers = [
  { id: 1, name: "Bot Development", icon: "/next.svg" },
  { id: 2, name: "Gaming Hub", icon: "/vercel.svg" },
  { id: 3, name: "Coding Community", icon: "/globe.svg" },
  { id: 4, name: "AI Discussion", icon: "/window.svg" },
];

export default function ServerList() {
  return (
    <div
      id="serverList"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "72px",
        background: "#1e1f22",
        borderRadius: "0",
        margin: "0",
        padding: "12px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        overflowY: "auto",
        zIndex: 1,
      }}
    >
      {/* Home Button */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#36393f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "8px",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <Image
          src="./next.svg"
          alt="Home"
          width={24}
          height={24}
        />
      </div>

      {/* Server divider */}
      <div
        style={{
          width: "32px",
          height: "2px",
          background: "#36393f",
          borderRadius: "1px",
          margin: "4px 0",
        }}
      />

      {/* Server icons - example */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#5865f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Image
          src="./next.svg"
          alt="Server"
          width={24}
          height={24}
        />
        {/* Selected server indicator */}
        <div
          style={{
            position: "absolute",
            left: "-12px",
            width: "8px",
            height: "40px",
            background: "white",
            borderRadius: "0 4px 4px 0",
          }}
        />
      </div>

      {/* More server icons would go here */}
    </div>
  );
}
