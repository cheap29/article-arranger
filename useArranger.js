import { useState } from "react";
import { FORMATS } from "./constants.js";
import { api } from "./api.js";

export function useArranger() {
  const [inputMode,     setInputMode]     = useState("url");
  const [url,           setUrl]           = useState("");
  const [directText,    setDirectText]    = useState("");
  const [selected,      setSelected]      = useState(null);
  const [articleText,   setArticleText]   = useState("");
  const [result,        setResult]        = useState("");
  const [loading,       setLoading]       = useState(false);
  const [fetchLoading,  setFetchLoading]  = useState(false);
  const [error,         setError]         = useState("");
  const [step,          setStep]          = useState(1);
  const [copied,        setCopied]        = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailDepth,   setDetailDepth]   = useState(0);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      const t = document.createElement("textarea");
      t.value = result;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchArticle = async () => {
    if (!url.trim()) return;
    setFetchLoading(true);
    setError("");
    try {
      const data = await api("/api/fetch-article", { url });
      setArticleText(data.text);
      setStep(2);
    } catch {
      setError("記事の取得に失敗したよ。URLを確認してみて！");
    }
    setFetchLoading(false);
  };

  const handleDirectText = () => {
    if (!directText.trim()) return;
    setArticleText(directText.trim());
    setStep(2);
  };

  const arrangeArticle = async () => {
    if (!selected || !articleText) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = await api("/api/arrange", {
        characterId: selected,
        articleText: articleText.slice(0, 3000),
        depth: 0,
      });
      setResult(data.text);
      setStep(3);
    } catch {
      setError("変換に失敗したよ。");
    }
    setLoading(false);
  };

  const loadMoreDetail = async () => {
    if (!selected || !articleText || detailLoading) return;
    setDetailLoading(true);
    const depth = detailDepth + 1;
    try {
      const data = await api("/api/arrange", {
        characterId: selected,
        articleText: articleText.slice(0, 3000),
        depth,
      });
      setResult((prev) => prev + "\n\n---\n\n" + data.text);
      setDetailDepth(depth);
    } catch {
      // silent
    }
    setDetailLoading(false);
  };

  const reset = () => {
    setUrl("");
    setDirectText("");
    setSelected(null);
    setArticleText("");
    setResult("");
    setError("");
    setStep(1);
    setDetailDepth(0);
  };

  const fmt = FORMATS.find((f) => f.id === selected);

  return {
    // 入力
    inputMode, setInputMode,
    url, setUrl,
    directText, setDirectText,
    // ステップ管理
    step, setStep,
    // 変換結果
    articleText,
    result,
    selected, setSelected,
    fmt,
    // ローディング・エラー
    loading,
    fetchLoading,
    detailLoading,
    detailDepth,
    error, setError,
    // コピー
    copied,
    // ハンドラ
    fetchArticle,
    handleDirectText,
    arrangeArticle,
    loadMoreDetail,
    handleCopy,
    reset,
  };
}
