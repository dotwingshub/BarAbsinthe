# BarAbsinthe - バー管理Webアプリ

## プロジェクト概要

バーにおける注文受付・伝票作成・会計・売上集計を行うシンプルなWebアプリケーション。

## 技術スタック

- **フロントエンド**: HTML / CSS / JavaScript（フレームワーク不使用）
- **データ永続化**: ブラウザのLocalStorage
- **外部依存なし**: ライブラリ・外部サービス不使用

## ファイル構成

```
BarAbsinthe/
├── CLAUDE.md       # このファイル
├── index.html      # メインHTMLファイル（シングルページアプリ）
├── style.css       # スタイルシート
└── app.js          # アプリケーションロジック
```

## 機能一覧

1. **メニュー管理** - ドリンク・フードのメニュー追加・編集・削除
2. **伝票作成** - テーブルごとに注文を受け付け、伝票を管理
3. **お会計** - 伝票を締めて会計処理、売上として記録
4. **集計** - 日次・月次の売上集計・レポート表示

## LocalStorageデータ構造

### `bar_menu_items`
```json
[
  {
    "id": "uuid",
    "name": "商品名",
    "price": 800,
    "category": "ドリンク | フード"
  }
]
```

### `bar_orders`
```json
[
  {
    "id": "uuid",
    "tableNumber": "1",
    "items": [
      { "menuItemId": "uuid", "name": "商品名", "price": 800, "quantity": 2 }
    ],
    "status": "open | closed",
    "createdAt": "ISO8601",
    "closedAt": "ISO8601 | null",
    "total": 1600
  }
]
```

## 開発メモ

- UIはすべて日本語
- モバイル・タブレット対応（バーでのタブレット操作を想定）
- シンプルで視認性の高いデザイン
