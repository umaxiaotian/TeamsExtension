const path = require('path');

const dotenv = require('dotenv');
// 必要なボットの構成をインポートします。
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const restify = require('restify');

// 必要なボットサービスをインポートします。
// 異なるボットの部分については、https://aka.ms/bot-servicesを参照
const {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication
} = require('botbuilder');

// このボットのメインダイアログ。
const { ObaBot } = require('./bot');

// HTTPサーバーを作成します。
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} が ${server.url} でリッスンしています`);
    console.log('\nBot Framework Emulatorを取得する：https://aka.ms/botframework-emulator');
    console.log('\nボットと会話するには、エミュレータを開いて「ボットを開く」を選択します');
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(process.env);

// アダプターを作成します。
// ボットの動作については、https://aka.ms/about-bot-adapterを参照
const adapter = new CloudAdapter(botFrameworkAuthentication);

// エラーのキャッチオール処理。
const onTurnErrorHandler = async (context, error) => {
    // このチェックはエラーをコンソールログに出力します。app insightsではなくです。
    // 注意：本番環境では、これをAzureアプリケーションインサイトに記録することを検討する
    // テレメトリの構成手順については、https://aka.ms/bottelemetryを参照
    console.error(`\n [onTurnError] 未処理のエラー：${error}`);

    // Bot Framework Emulatorに表示されるトレースアクティビティを送信します
    await context.sendTraceActivity(
        'OnTurnError トレース',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // ユーザーにメッセージを送信します
    await context.sendActivity('ボットでエラーまたはバグが発生しました。');
    await context.sendActivity('このボットを引き続き実行するには、ボットのソースコードを修正');
};

// シングルトンCloudAdapterにonTurnErrorを設定します。
adapter.onTurnError = onTurnErrorHandler;

// メインダイアログを作成します。
const obabot = new ObaBot();

// 受信リクエストを監視します。
server.post('/api/messages', async (req, res) => {
    // ルートは受信したリクエストを処理するためにアダプターに送ります
    await adapter.process(req, res, (context) => obabot.run(context));
});

// ストリーミングのUpgradeリクエストを監視します。
server.on('upgrade', async (req, socket, head) => {
    // セッションデータを保存できるように、このWebSocket接続にスコープのあるアダプターを作成します。
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
    // 各接続用に作成されたCloudAdapterのonTurnErrorを設定します。
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket, head, (context) => obabot.run(context));
});
