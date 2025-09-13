# Dodo Discover Screen Viewer

Google Discoverを定期的に取得し、全画面で表示する壁紙（スクリーンセーバー）的アプリケーション。  
Puppeteer + Electron を使って実装しています。

## 概要

- Puppeteer を使って Google Discover をスクレイピング
- 記事を 1 枚ずつ全画面で表示（フェード切り替え）
- 時計・日付・~~天気~~を右上に常時表示
- 記事カードはブラー付きシェードで視認性を確保
- ~~クリックすると記事をブラウザで開ける~~
- ~~Google カレンダーと連携して、予定の 15 分前からは Discover 部分が次の予定表示に切り替わる~~

## インストール

1. リポジトリをクローン

   ```bash
   git clone https://github.com/yourname/discover-screen-viewer.git
   cd discover-screen-viewer````

2. 依存関係をインストール

   ```bash
   npm install```
3. 開発モードで起動

   ```bash
   npm start```
4. ビルド

   ```bash
   npm run build
   ```

   `dist/` に実行ファイルが生成されます（Windowsなら `.exe`）。

## 設定

`config.json` に Chrome 実行パスやユーザーデータディレクトリを指定できます。

```json
{
  "chromeExecutablePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "userDataDir": "E:\\Documents\\DiscoverScreen\\chrome-profile",
  "headless": false
}
```

- `chromeExecutablePath`: 使用する Chrome/Chromium のパス
- `userDataDir`: プロファイルの保存先（ログイン保持用）
- `headless`: 開発中は `false` にして動作確認推奨

## ファイル構成

```bash
viewer/
  ├── main.mjs        # Electron メインプロセス
  ├── preload.cjs     # Renderer へのブリッジ
  ├── index.html      # 表示画面
  ├── style.css       # デザイン
get_discovers.js      # Puppeteer で Discover を取得
config.json           # 設定ファイル
discover_items.json   # 取得結果を保存
```

## 今後の予定

- UI カスタマイズ機能（テーマや表示時間調整）
- 天気情報の取得ソース拡張
- マルチモニタ対応
- 配布用の軽量化

## ライセンス

MIT
