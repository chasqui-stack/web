/**
 * Scoped styles injected into the widget's Shadow DOM (ADR-011 §1/§6) — no
 * leakage to or from the host page. Chasqui brand tokens (admin/DESIGN.md):
 * amber accent #EA9B27, charcoal chrome #1C1917, warm neutrals.
 */
export const styles = `
:host, * { box-sizing: border-box; }
.root {
  position: fixed; bottom: 20px; right: 20px; z-index: 2147483000;
  font-family: Rubik, system-ui, -apple-system, sans-serif;
}
.bubble {
  width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
  background: #EA9B27; color: #1C1917; font-size: 24px; line-height: 56px;
  box-shadow: 0 6px 20px rgba(28,25,23,.28); transition: transform .12s ease;
}
.bubble:hover { transform: scale(1.06); }
.panel {
  width: 360px; max-width: calc(100vw - 32px); height: 520px; max-height: calc(100vh - 100px);
  display: flex; flex-direction: column; overflow: hidden;
  background: #FAFAF9; border-radius: 16px; box-shadow: 0 12px 40px rgba(28,25,23,.28);
}
.header {
  background: #1C1917; color: #FAFAF9; padding: 14px 16px; font-weight: 600;
  display: flex; align-items: center; justify-content: space-between;
}
.header button { background: none; border: none; color: #FAFAF9; font-size: 20px; cursor: pointer; }
.log { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.msg { max-width: 78%; padding: 9px 12px; border-radius: 14px; font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-wrap: break-word; }
.msg.out { align-self: flex-start; background: #F0EEEC; color: #1C1917; border-bottom-left-radius: 4px; }
.msg.in { align-self: flex-end; background: #EA9B27; color: #1C1917; border-bottom-right-radius: 4px; }
.msg.media { font-style: italic; opacity: .8; }
.composer { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #E7E5E4; align-items: center; }
.composer input[type=text] { flex: 1; border: 1px solid #D6D3D1; border-radius: 20px; padding: 9px 14px; font-size: 14px; outline: none; }
.composer input[type=text]:focus { border-color: #EA9B27; }
.composer button { background: #1C1917; color: #FAFAF9; border: none; border-radius: 20px; padding: 9px 14px; font-size: 14px; cursor: pointer; }
.composer .icon { background: none; color: #78716C; font-size: 18px; padding: 4px 6px; }
.composer .icon.rec { color: #C94B22; }
.status { font-size: 11px; color: #A8A29E; padding: 0 14px 6px; }
`
