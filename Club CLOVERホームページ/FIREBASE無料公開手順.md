# Firebase 無料保存への切り替え手順

管理画面で編集した内容をスマホにも反映するため、Firebase Firestoreを使います。

## 1. Firebaseプロジェクトを作る

1. https://console.firebase.google.com/ を開く
2. 「プロジェクトを追加」
3. プロジェクト名は「club-clover」
4. GoogleアナリティクスはオフでOK
5. 作成

## 2. ウェブアプリを追加

1. Firebaseのプロジェクト画面で「</>」アイコンを押す
2. アプリ名は「Club CLOVER」
3. HostingはチェックしなくてOK
4. 表示された firebaseConfig の中身をコピー

## 3. 設定を入れる

assets/js/firebase-config.js を開き、「ここに...」と書いてある部分をFirebaseの値に置き換えます。

## 4. Firestoreを作る

1. 左メニュー「構築」→「Firestore Database」
2. 「データベースを作成」
3. 最初はテストモードでOK
4. ロケーションは asia-northeast1 など近い場所

## 5. GitHub Desktopで公開

1. Summary に「Firebase保存に変更」と入力
2. Commit to main
3. Push origin

反映後、管理画面で保存した内容がスマホ側にも表示されます。
