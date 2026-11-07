import "./MonitorScreen.css";
import { useNavigate } from "react-router-dom";
import { Html } from "@react-three/drei";

export default function CenterMonitorScreen({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  const navigate = useNavigate();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Black monitor background */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[1.7, 0.86]} />
        <meshBasicMaterial color="#05070A" toneMapped={false} />
      </mesh>

      {/* React / HTML interface */}
      <Html
        wrapperClass="neoevo-monitor-portal"
        transform
        position={[0, 0, 0.01]}
        distanceFactor={1}
        style={{
          width: "680px",
          height: "344px",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            background: "linear-gradient(135deg, #05070A 0%, #071426 100%)",
            color: "white",
            fontFamily: "Inter, Arial, sans-serif",
            padding: "34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div>
            <div
              style={{
                fontSize: "14px",
                color: "#0A84FF",
                letterSpacing: "4px",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              NEOEVO
            </div>

            <div
              style={{
                fontSize: "30px",
                fontWeight: "700",
                lineHeight: "1.1",
              }}
            >
              Digital Systems
              <br />
              for Growing Businesses
            </div>

            <div
              style={{
                marginTop: "10px",
                width: "70px",
                height: "3px",
                background: "#0A84FF",
              }}
            />
          </div>

          {/* Navigation */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <MonitorButton
              title="Work"
              subtitle="Explore projects"
              onClick={() => navigate("/projects")}
            />

            <MonitorButton
              title="Services"
              subtitle="What we build"
              onClick={() => navigate("/services")}
            />

            <MonitorButton
              title="About"
              subtitle="Meet NeoEvo"
              onClick={() => navigate("/about")}
            />

            <MonitorButton
              title="Contact"
              subtitle="Start a project"
              onClick={() => navigate("/contact")}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}

function MonitorButton({ title, subtitle, onClick }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "10px",
        padding: "12px 14px",
        color: "white",
        textAlign: "left",
        cursor: "pointer",
        transition: "0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#0A84FF";
        e.currentTarget.style.background = "rgba(10,132,255,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: "700",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          opacity: 0.6,
          marginTop: "3px",
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}
