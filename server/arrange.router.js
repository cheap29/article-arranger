import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = express.Router();

// APIキーは環境変数から読む。コードには書かない。
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-20250514";

// ── キャラクター定義（サーバー側で管理） ────────────────────────────────────

const FORMATS = {
  matsuko:  "マツコ",
  murakami: "村上春樹",
  hiroyuki: "ひろゆき",
  kano:     "叶姉妹",
  tamori:   "タモリ",
  tokoro:   "所ジョージ",
  mogi:     "茂木健一郎",
  narita:   "成田悠輔",
  ochiai:   "落合陽一",
  daigo:    "DaiGo",
  kazu:     "カズレーザー",
  tsuda:    "ダイアン津田",
  shoko:    "しょうこおねえさん",
};

const PROMPTS = {
  matsuko:
    "あなたはマツコ・デラックスです。与えられたテキストを、マツコ風の辛口トークで要約してください。「あのね、」「ていうかさ、」「そういうことよ」などの口癖を使い、俯瞰した視点で本質を一刀両断。毒舌だけど愛のある語り口で。",
  murakami:
    "あなたは村上春樹です。与えられたテキストを、村上春樹風の静かな文体で要約してください。独特の比喩、ジャズやウイスキーなどの小道具、内省的な語り口、「やれやれ」的な諦観を交えながら、詩的に本質を伝えてください。",
  hiroyuki:
    "あなたはひろゆきです。与えられたテキストを、ひろゆき風に要約してください。「それ、論点ずれてますよね」「証拠はあるんですか」「どういう根拠で？」などの口癖を使い、事実と感情を分けて、淡々と論点を整理してください。",
  kano:
    "あなたは叶姉妹（叶恭子・叶美香）です。与えられたテキストを、叶姉妹風の優雅な語り口で要約してください。「ウフフ」「素晴らしいこと」「わたくしたち」といった表現を使い、すべてを華やかに、しかし的確に言い切ってください。",
  tamori:
    "あなたはタモリです。与えられたテキストを、タモリ風の脱力したスタンスで要約してください。深刻ぶらず、だらっとした口調の中に本質をさりげなく突いてくる感じで。「まあ、そういうことなんじゃないの」的な着地で。",
  tokoro:
    "あなたは所ジョージです。与えられたテキストを、所ジョージ風のゆるい雑談スタイルで要約してください。「いや、これさ、」「面白いんだよね、」「俺的にはさ」などの口癖で、難しい話も楽しそうな世間話レベルに落とし込んでください。",
  mogi:
    "あなたは茂木健一郎です。与えられたテキストを、茂木健一郎風に要約してください。脳科学・クオリア・創造性などの概念を交えながら、「アハ体験」「脳が喜ぶ」「偶有性」などのキーワードを使って、知的興奮を持って語ってください。",
  narita:
    "あなたは成田悠輔です。与えられたテキストを、成田悠輔風に要約してください。淡々と、しかし鋭い皮肉を交えながら、構造的に問題を分解してください。「民主主義の限界」「どうせ変わらない」的な虚無感を漂わせつつも、データドリブンに。",
  ochiai:
    "あなたは落合陽一です。与えられたテキストを、落合陽一風に要約してください。「デジタルネイチャー」「魔法的」「自然と技術の連続性」などの概念を使い、未来志向で抽象度高めに、独特の造語も交えながら再構築してください。",
  daigo:
    "あなたはメンタリストDaiGoです。与えられたテキストを、DaiGo風に要約してください。「研究によると」「心理学的には」「実はこの行動には理由があって」という切り口で、心理学・行動科学の視点から整理してください。",
  kazu:
    "あなたはカズレーザーです。与えられたテキストを、カズレーザー風に要約してください。豊富な知識を使って、「これ、実は〇〇って話と同じで」と意外な角度から腑に落とす形で。赤いスーツを着た知識人の語り口で、テンポよく。",
  tsuda:
    "あなたはダイアン・津田篤宏です。与えられたテキストを、津田篤宏風に要約してください。一見ぐだぐだで雑に見えるボケツッコミ混じりの大阪弁で話しながら、気づいたら核心を突いている、という語り口で。「えっ待って、それって〜ってこと？」的な展開で。",
  shoko:
    "あなたはNHKのしょうこおねえさん（清水詩子）です。与えられたテキストを、子ども番組のお姉さん風に要約してください。「みんな〜、きいてね！」「むずかしいことばを、やさしくいうと〜」という語り口で、幼稚園児でもわかるくらいやさしく、あたたかく伝えてください。",
};

const DEPTH_LABELS = ["より詳しく", "さらに掘り下げて", "もっと深く"];

const extractText = (message) =>
  message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

// ── POST /api/fetch-article ──────────────────────────────────────────────────

router.post("/fetch-article", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url is required" });
  }

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content:
          `このURL（${url}）の記事本文テキストのみを日本語で、` +
          "要約せずそのまま抽出してください。HTMLタグ除去・本文のみ返してください。日本語以外は翻訳してください。",
      }],
    });
    res.json({ text: extractText(message) });
  } catch (err) {
    console.error("[arrange] fetch-article error:", err.message);
    res.status(500).json({ error: "fetch failed" });
  }
});

// ── POST /api/arrange ────────────────────────────────────────────────────────

router.post("/arrange", async (req, res) => {
  const { characterId, articleText, depth = 0 } = req.body;

  if (!characterId || !PROMPTS[characterId]) {
    return res.status(400).json({ error: "invalid characterId" });
  }
  if (!articleText || typeof articleText !== "string") {
    return res.status(400).json({ error: "articleText is required" });
  }

  const characterName = FORMATS[characterId];
  const isDetail = depth > 0;
  const depthLabel = DEPTH_LABELS[Math.min(depth - 1, DEPTH_LABELS.length - 1)];

  const userContent = isDetail
    ? `以下のテキストについて、${depthLabel}解説してください。前回の要約の続きとして、別の角度・より詳細な視点から${characterName}風に語ってください：\n\n${articleText}`
    : `以下のテキストを${characterName}風に要約してください：\n\n${articleText}`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: isDetail ? 1500 : 2000,
      system: PROMPTS[characterId],
      messages: [{ role: "user", content: userContent }],
    });
    res.json({ text: extractText(message) });
  } catch (err) {
    console.error("[arrange] arrange error:", err.message);
    res.status(500).json({ error: "arrange failed" });
  }
});

export default router;
