# 記事アレンジャー (Article Arranger)

URLまたはテキストを貼り付けるだけで、好きな著名人の語り口に変換して読み直せるReactアプリです。

## 機能

- **URL取得モード** — URLを貼ると記事本文を自動抽出
- **テキスト直貼りモード** — コピーしたテキストをそのまま入力
- **13キャラクター対応** — マツコ・デラックス、村上春樹、ひろゆき、叶姉妹など
- **もっと詳しく機能** — 同じキャラで段階的に深掘り
- **コピーボタン** — 変換結果をワンクリックでクリップボードへ

## セキュリティ構成

**APIキーはフロントエンドに置いていません。**  
`ArticleArranger.jsx` は `/api/fetch-article` と `/api/arrange` という自前エンドポイントを呼ぶだけで、Anthropic API へ直接リクエストしません。

```
ブラウザ
  └─ POST /api/fetch-article  ─┐
  └─ POST /api/arrange        ─┤  Expressサーバー（APIキーはここだけ）
                                └─ Anthropic API
```

APIキーは `.env` ファイルにのみ書き、サーバープロセスの環境変数として読み込みます。`.gitignore` で `.env*` は除外済みです。

```
# .env（gitにコミットしない）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

### 注意：`VITE_` / `REACT_APP_` 環境変数にAPIキーを入れない

```js
// ❌ ビルド後のJSバンドルに含まれて誰でも見える
import.meta.env.VITE_ANTHROPIC_API_KEY
process.env.REACT_APP_ANTHROPIC_API_KEY
```

これらはフロントエンド向けの変数で、ビルド時にバンドルへ埋め込まれます。`ANTHROPIC_API_KEY` はサーバー側の変数として、フロントに渡さないでください。

## セットアップ

### 前提

- Node.js 18 以上
- Anthropic API キー（[Anthropic Console](https://console.anthropic.com/) で取得）

### インストール

```bash
npm install @anthropic-ai/sdk
```

### 環境変数の設定

```bash
cp .env.example .env
# .env を編集して ANTHROPIC_API_KEY を設定
```

### Expressアプリへのマウント

```js
import arrangeRouter from "./article-arranger/server/arrange.router.js";

app.use("/api", arrangeRouter);
// → POST /api/fetch-article
// → POST /api/arrange
```

### 開発サーバー起動

```bash
node --env-file=.env server.js
```

## ファイル構成

```
article-arranger/
├── ArticleArranger.jsx         # フロントエンド（APIキーなし）
├── server/
│   └── arrange.router.js       # Expressルーター（APIキーはここ）
├── .env.example                # 環境変数のテンプレート
├── .gitignore
└── README.md
```

## 使い方

1. **STEP 1** — URLを貼って「取得」するか、テキストを直接ペーストする
2. **STEP 2** — 13人のキャラクターから語り口を選ぶ
3. **STEP 3** — 変換結果を読む。「もっと詳しく」で深掘りも可能

## ライセンス

MIT
