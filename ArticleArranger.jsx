import { useArranger } from "./useArranger.js";
import { FORMATS, C } from "./constants.js";
import { IconLink, IconText, IconCopy, IconCheck, IconArrowRight, IconRefresh, IconBack } from "./icons.jsx";
import { StepDot, Tab, PrimaryBtn, SubBtn, inputStyle } from "./ui.jsx";

export default function ArticleArranger() {
  const {
    inputMode, setInputMode,
    url, setUrl,
    directText, setDirectText,
    step, setStep,
    articleText,
    result,
    selected, setSelected,
    fmt,
    loading, fetchLoading, detailLoading, detailDepth,
    error, setError,
    copied,
    fetchArticle, handleDirectText, arrangeArticle,
    loadMoreDetail, handleCopy, reset,
  } = useArranger();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 16px", fontFamily: "Georgia,serif" }}>

      {/* ヘッダー */}
      <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 32px" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 11, letterSpacing: 3, color: C.textMute, textTransform: "uppercase", marginBottom: 8 }}>
          Article Arranger
        </p>
        <h1 style={{ fontSize: "clamp(18px,3.5vw,24px)", fontWeight: 400, color: C.textSub, margin: "0 0 8px", letterSpacing: "1px", fontFamily: "sans-serif" }}>
          記事アレンジャー
        </h1>
        <p style={{ fontSize: 13, color: C.textSub, fontFamily: "sans-serif", margin: "0 0 24px" }}>
          URLかテキストを貼るだけ。好きな人物の語り口で読み直せる。
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          <StepDot n={1} label="テキストを入れる" currentStep={step} />
          <StepDot n={2} label="キャラを選ぶ"     currentStep={step} />
          <StepDot n={3} label="読む"             currentStep={step} />
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <Tab id="url"  icon={<IconLink />} label="URLを貼る"    activeMode={inputMode} onSelect={(id) => { setInputMode(id); setError(""); }} />
              <Tab id="text" icon={<IconText />} label="テキストを貼る" activeMode={inputMode} onSelect={(id) => { setInputMode(id); setError(""); }} />
            </div>

            {inputMode === "url" ? (
              <>
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: C.textSub, marginBottom: 10 }}>
                  記事のURLをペーストしてください
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    onKeyDown={(e) => e.key === "Enter" && fetchArticle()}
                    style={{ ...inputStyle, flex: 1, minWidth: 180 }}
                  />
                  <PrimaryBtn onClick={fetchArticle} disabled={fetchLoading || !url.trim()}>
                    {fetchLoading ? "取得中…" : <><IconArrowRight />取得</>}
                  </PrimaryBtn>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "sans-serif", fontSize: 13, color: C.textSub, marginBottom: 10 }}>
                  テキストを直接ペーストしてください
                </p>
                <textarea
                  value={directText}
                  onChange={(e) => setDirectText(e.target.value)}
                  placeholder="ニュース記事・コラム・メモなど、なんでもOK。"
                  rows={7}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.75, marginBottom: 12 }}
                />
                <PrimaryBtn onClick={handleDirectText} disabled={!directText.trim()} wide>
                  <IconArrowRight />キャラを選ぶ
                </PrimaryBtn>
              </>
            )}

            {error && (
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#fdf0ee", border: "1px solid #e8c5c0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <p style={{ color: "#c0392b", margin: 0, fontFamily: "sans-serif", fontSize: 12, lineHeight: 1.5 }}>
                  {error}
                </p>
                <button
                  onClick={() => { setError(""); setUrl(""); }}
                  style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 6, border: "1px solid #e8c5c0", background: "#fff", color: "#c0392b", fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  やり直す
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            {/* 入力テキストプレビュー */}
            <div style={{ background: C.surface, borderRadius: 12, padding: "14px 18px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
              <p style={{ fontFamily: "sans-serif", fontSize: 11, color: C.textMute, margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>
                入力テキスト
              </p>
              <p style={{ fontFamily: "sans-serif", fontSize: 13, color: C.textSub, margin: 0, overflow: "hidden", maxHeight: 48, lineHeight: 1.6 }}>
                {articleText.slice(0, 180)}…
              </p>
            </div>

            <p style={{ fontFamily: "sans-serif", fontSize: 13, color: C.textSub, marginBottom: 14, textAlign: "center" }}>
              誰の語り口で読む？
            </p>

            {/* キャラグリッド */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelected(f.id)}
                  style={{
                    padding: "14px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                    border:     selected === f.id ? `2px solid ${f.color}` : `1px solid ${C.border}`,
                    background: selected === f.id ? `${f.color}18` : C.surface,
                    transition: "all 0.15s",
                    boxShadow:  selected === f.id ? `0 2px 10px ${f.color}30` : "none",
                  }}
                >
                  <div style={{
                    display: "inline-block", padding: "2px 8px", borderRadius: 20,
                    background: selected === f.id ? f.color : C.card,
                    color:      selected === f.id ? "#fff"   : C.textSub,
                    fontFamily: "sans-serif", fontSize: 11, fontWeight: 700, marginBottom: 6,
                  }}>
                    {f.label}
                  </div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, color: C.textMute, lineHeight: 1.4 }}>
                    {f.mode}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <SubBtn onClick={reset}><IconBack />戻る</SubBtn>
              <PrimaryBtn onClick={arrangeArticle} disabled={!selected || loading} wide>
                {loading ? "変換中…" : <><IconArrowRight />変換する</>}
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div>
            {/* キャラバッジ */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 20, marginBottom: 16,
              background: fmt ? `${fmt.color}18` : C.accentLt,
              border: `1px solid ${fmt ? fmt.color + "44" : C.borderDk}`,
            }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: fmt?.color || C.accent }}>
                {fmt?.label} 風
              </span>
              <span style={{ fontFamily: "sans-serif", fontSize: 11, color: C.textMute }}>
                {fmt?.mode}
              </span>
            </div>

            {/* ノートエリア */}
            <div style={{ position: "relative", marginBottom: 20, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.08))" }}>
              {/* コピーボタン */}
              <button
                onClick={handleCopy}
                style={{
                  position: "absolute", top: 12, right: 12, zIndex: 10,
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background:  copied ? C.accent : C.surface,
                  color:       copied ? "#fff"   : C.textSub,
                  fontFamily: "sans-serif", fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {copied ? <><IconCheck />コピー済み</> : <><IconCopy />コピー</>}
              </button>

              {/* ノート本体 */}
              <div style={{
                background: "#ffffff",
                borderRadius: "3px 12px 12px 3px",
                borderLeft: `4px solid ${fmt?.color || C.borderDk}`,
                padding: "24px 24px 24px 56px",
                lineHeight: 1.65, fontSize: 14,
                whiteSpace: "pre-wrap",
                fontFamily: "sans-serif",
                color: C.text,
                maxHeight: "46vh", overflowY: "auto",
                backgroundImage: "repeating-linear-gradient(transparent,transparent 27px,rgba(180,170,155,0.2) 27px,rgba(180,170,155,0.2) 28px)",
                backgroundPositionY: "24px",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)",
              }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: 48, width: 1, background: "rgba(200,100,80,0.2)", pointerEvents: "none" }} />
                {result}
              </div>
            </div>

            {/* もっと詳しくリンク */}
            <div style={{ textAlign: "right", marginBottom: 12 }}>
              <button
                onClick={loadMoreDetail}
                disabled={detailLoading}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: "none", border: "none",
                  cursor:     detailLoading ? "not-allowed" : "pointer",
                  color:      detailLoading ? C.textMute    : C.accent,
                  fontFamily: "sans-serif", fontSize: 13, fontWeight: 600,
                  padding: "4px 2px",
                  borderBottom: detailLoading ? "none" : `1px solid ${C.accent}44`,
                  transition: "all 0.15s",
                }}
              >
                {detailLoading     ? "読み込み中…"    :
                 detailDepth === 0 ? "もっと詳しく →" :
                 detailDepth === 1 ? "さらに詳しく →" :
                                    "もっと深く →"}
              </button>
            </div>

            {/* ボタン */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <SubBtn onClick={() => setStep(2)}><IconBack />別のキャラで読む</SubBtn>
              <SubBtn onClick={reset}><IconRefresh />新しい記事を読む</SubBtn>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
