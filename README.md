# ObaBot

Bot Framework v4をベースにしています。

このボットは[Bot Framework](https://dev.botframework.com)を使用して作成されたもので、ユーザーからの入力を受け取り、それをGPTで返すシンプルなBOTです。

## 前提条件

- [Node.js](https://nodejs.org) バージョン 16.16.0 以上

    ```bash
    # Node.jsのバージョン確認
    node --version
    ```

## 試し方

- リポジトリをクローン

    ```bash
    git clone https://github.com/microsoft/botbuilder-samples.git
    ```

- ターミナルで`samples/javascript_nodejs/02.obabot`ディレクトリに移動（ディレクトリ名を'obabot'に変更）

    ```bash
    cd samples/javascript_nodejs/02.obabot
    ```

- モジュールをインストール

    ```bash
    npm install
    ```

- ボットを起動

    ```bash
    npm start
    ```

## Bot Framework Emulatorを使ったボットのテスト

[Bot Framework Emulator](https://github.com/microsoft/botframework-emulator)は、ボット開発者がローカルホストまたはトンネル経由でリモートで実行中のボットをテストおよびデバッグするためのデスクトップアプリケーションです。

- [こちら](https://github.com/Microsoft/BotFramework-Emulator/releases)から最新のBot Framework Emulatorをインストール

### Bot Framework Emulatorを使用してボットに接続

- Bot Framework Emulatorを起動
- File -> Open Bot
- ボットのURLに `http://localhost:3978/api/messages` を入力

## ボットとの対話

エミュレーターにテキストを入力してください。ボットによって入力されたテキストがエコーバックされます。

## ボットをAzureにデプロイ

Azureにボットをデプロイする方法の詳細については、[Deploy your bot to Azure](https://aka.ms/azuredeployment) を参照してください。

## 追記資料

- [Bot Frameworkドキュメント](https://docs.botframework.com)
- [Botの基本](https://docs.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0)
- [アクティビティ処理](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0)
- [Azure Bot Service入門](https://docs.microsoft.com/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0)
- [Azure Bot Serviceドキュメント](https://docs.microsoft.com/azure/bot-service/?view=azure-bot-service-4.0)
- [Azure CLI](https://docs.microsoft.com/cli/azure/?view=azure-cli-latest)
- [Azure Portal](https://portal.azure.com)
- [チャネルとBot Connector Service](https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0)
- [Restify](https://www.npmjs.com/package/restify)
- [dotenv](https://www.npmjs.com/package/dotenv)
