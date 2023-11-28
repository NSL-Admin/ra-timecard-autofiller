# ra-timecard-autofiller: Chrome extension to help RAs fill in the timecard on MyWaseda.

## 概要

[Slackの勤務記録Bot](https://github.com/NSL-Admin/ra-timecard-recorder)を通して記録したRAの勤務記録をMyWasedaの画面で自動入力するためのChrome拡張機能です。

## インストール

[Chrome Web Store](https://chromewebstore.google.com/detail/ra-timecard-autofiller/cmlgpkjckdgjackdkahmppghikhecajn)よりインストールしてください。

## 使用方法

1. MyWasedaにて特定月の業務従事内容報告の画面を開きます。
2. 画面右上の拡張機能のアイコントレイにあるこの拡張機能のアイコンをクリックします。業務従事内容報告ページ内に以下のような自動入力用ツールが表示されます。

    <img src="https://github.com/NSL-Admin/ra-timecard-autofiller/assets/37496476/8b4fa387-9e6a-4ff4-afd8-8b73ccc04f52" height=60% width=60%>

3. 「ファイルを選択」をクリックし、[Slackの勤務記録Bot](https://github.com/NSL-Admin/ra-timecard-recorder)からダウンロードしたCSVファイルを読み込ませます。
4. プルダウンメニューから、この画面で入力したいRA区分名を選択します。
5. "Fill"をクリックして自動入力を開始します。

## 注意

- 同一のRA区分名で1日に複数回の勤務を行った場合には自動入力ができず、自動入力用ツールの下にエラーメッセージが表示されます。この場合はCSVファイルを参照しながら当該日のみ手動で入力してください。