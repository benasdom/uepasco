import {
  InfoCircleFilled, LockOutlined, MailOutlined, MessageOutlined,
  UserAddOutlined, PhoneOutlined, ClockCircleOutlined, CheckCircleOutlined,
  EyeOutlined, EyeInvisibleOutlined, GoogleOutlined, ArrowLeftOutlined,
  SafetyCertificateOutlined, LoadingOutlined,
} from "@ant-design/icons";

export function GoogleBtn({
  googleLoading,
  blocked = false,
  blockedMessage = "Please try again.",
  onBlockedClick,
  containerRef,
})
{
    return (
  <div style={{ position: "relative" }}>
    <br />
    <div
      className="regbutton"
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ffffff9a",
        zIndex:0,
        pointerEvents:"none",
        borderRadius: "5px",
        justifyContent: "center",
        fontWeight: 600,
        opacity: googleLoading ? 0.7 : 1,
      }}
    >
      {googleLoading ? (
        <>
          <LoadingOutlined style={{ fontSize: "1.1rem" }} /> Signing in…
        </>
      ) : (
        <>
          <GoogleOutlined
            style={{
              fontSize: "1.1rem",
              backgroundColor: "#00aeff",
              padding: 4,
              marginRight:5,
              borderRadius: "50%",
            }}
          />
          Continue with Google
        </>
      )}
    </div>

    {/* Blocking overlay */}
    {blocked && !googleLoading && (
      <div
        style={{ position: "absolute", inset: 0, zIndex: 2, cursor: "pointer" }}
        onClick={() => onBlockedClick?.(blockedMessage)}
      />
    )}

    {/* Google Identity iframe container */}
    <div
      ref={containerRef}
      style={{
        marginTop: 15,
        position: "absolute",
        inset: 0,
        opacity: 1,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color:"black",
        pointerEvents: blocked || googleLoading ? "none" : "auto",
      }}
    />
  </div>
)};
