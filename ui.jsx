import { C } from "./constants.js";
import { IconCheck } from "./icons.jsx";

export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 16px",
  borderRadius: 10,
  border: `1px solid ${C.border}`,
  background: C.surface,
  color: C.text,
  fontSize: 14,
  fontFamily: "sans-serif",
  outline: "none",
};

export const StepDot = ({ n, label, currentStep }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div style={{
      width: 24, height: 24, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontFamily: "sans-serif", fontWeight: 700,
      background: currentStep > n ? C.accent : currentStep === n ? C.surface : C.card,
      color:      currentStep > n ? "#fff"   : currentStep === n ? C.accent  : C.textMute,
      border:     currentStep === n ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
    }}>
      {currentStep > n ? <IconCheck /> : n}
    </div>
    <span style={{ fontSize: 12, color: currentStep === n ? C.accent : C.textMute, fontFamily: "sans-serif" }}>
      {label}
    </span>
    {n < 3 && <span style={{ color: C.border, fontSize: 12 }}>›</span>}
  </div>
);

export const Tab = ({ id, icon, label, activeMode, onSelect }) => (
  <button
    onClick={() => onSelect(id)}
    style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "9px 16px", borderRadius: 8,
      border:     activeMode === id ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
      background: activeMode === id ? C.accentLt : C.surface,
      color:      activeMode === id ? C.accent   : C.textSub,
      fontFamily: "sans-serif",
      fontWeight: activeMode === id ? 700 : 400,
      fontSize: 13, cursor: "pointer", transition: "all 0.15s",
    }}
  >
    {icon}{label}
  </button>
);

export const PrimaryBtn = ({ onClick, disabled, children, wide }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: wide ? "13px" : "12px 22px",
      width: wide ? "100%" : undefined,
      borderRadius: 10, border: "none",
      background:  disabled ? C.card     : C.accent,
      color:       disabled ? C.textMute : "#fff",
      fontFamily: "sans-serif", fontWeight: 700, fontSize: 14,
      cursor:     disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s",
      boxShadow:  disabled ? "none" : "0 2px 8px rgba(139,111,71,0.25)",
    }}
  >
    {children}
  </button>
);

export const SubBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 5,
      padding: "10px 18px", borderRadius: 8,
      border: `1px solid ${C.border}`, background: C.surface,
      color: C.textSub, fontFamily: "sans-serif", fontSize: 13,
      cursor: "pointer", transition: "all 0.15s",
    }}
  >
    {children}
  </button>
);
