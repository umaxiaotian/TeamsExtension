const { ActivityHandler, MessageFactory, CardFactory } = require('botbuilder'); // 必要なモジュールをインポート
const axios = require('axios'); // HTTPリクエストを送信するためのモジュール
let conversationIsStart = false; // 会話が始まっているかどうか判定します。
let conversationData = {}; // メモリ内の変数に保存するためのオブジェクト
const welcomeText = `
## こんにちは！Obabotです。

Obabot(オバボット)は、Notionという情報管理ツールの情報を読み取り回答するチャットボットです。

### 機能

1. ユーザーの質問に答える: ObabotはNotionに格納された情報を元に、ユーザーからの質問に適切に回答します。これにより、特定のトピックに関する知識の共有と検索が容易になります。

2. マークダウンでのまとめ: Notionのマークダウン形式を利用して、Obabotは情報を整理し、簡潔な形でユーザーに提供します。この方法により、情報の構造化と視覚的な分かりやすさが向上します。
`;

const helpText = `
## こんにちは！Obabotです。

ヘルプを参照いただきましてありがとうございます。
本BOTのコマンドは下記となります。

### コマンド
| コマンド     | 機能                                   |
|------------|----------------------------------------|
| #HELP      | ヘルプを参照します。                        |
| #TALKSTART | 会話セッションを開始します。既存の会話セッションがある場合は上書きされます。 |
| #TALKEXIT  | 会話セッションを終了します。                 |
`;
const menu = CardFactory.heroCard(
    'メニュー',
    undefined,
    CardFactory.actions([
        {
            type: 'postBack',
            title: '新しいAIチャットセッションを始める',
            value: '#TALKSTART'
        },
        {
            type: 'postBack',
            title: '会話セッションを終了する',
            value: '#TALKEXIT'
        },
        {
            type: 'postBack',
            title: 'ヘルプ',
            value: '#HELP'
        }
    ])
); // メニューカード

class ObaBot extends ActivityHandler {
    constructor() {
        super();

        // メッセージハンドリング
        this.onMessage(async (context, next) => {
            const pattern = /^(#.*\?#|@.*|#.*)$/; // 正規表現パターンを定義
            const userMessage = context.activity.text; // ユーザーからのメッセージ

            if (pattern.test(userMessage)) {
                // 正規表現パターンにマッチするか判定
                switch (userMessage) {
                    case '#TALKSTART':
                        const newSessionText = `
## 新しいセッションへようこそ
▼▼ここから新しいチャットボットとの会話になります。▼▼
                        `;
                        conversationIsStart = true;
                        await context.sendActivity(MessageFactory.text(newSessionText, newSessionText));
                        break;
                    case '#HELP':
                        await context.sendActivity(MessageFactory.text(helpText, helpText));
                        break;
                    case '#TALKEXIT':
                        if (conversationIsStart) {
                            conversationData = {};
                            conversationIsStart = false;
                            const conversationNone = `会話セッションを終了いたしました。またのご利用をお待ちしております。`;
                            await context.sendActivity(MessageFactory.text(conversationNone, conversationNone));
                        } else {
                            const conversationNone = `会話セッションが開始されていませんので、セッションを終了する事ができませんでした。`;
                            await context.sendActivity(MessageFactory.text(conversationNone, conversationNone));
                        }
                        break;
                }
            } else {
                if (conversationIsStart) {
                    // http://127.0.0.1/questionにJSON形式でデータをPOSTリクエストで送信
                    const response = await this.postToQuestionAPI(userMessage);
                    const talkHistoryId = context.activity.conversation.id;
                    if (!conversationData[talkHistoryId]) {
                        conversationData[talkHistoryId] = [];
                    }

                    conversationData[talkHistoryId].push(['user', userMessage]);
                    conversationData[talkHistoryId].push(['assistant', response]);
                    conversationData[talkHistoryId].forEach(element => {
                        console.log(element);
                    });

                    await context.sendActivity(MessageFactory.text(response, response));
                    await next();
                } else {
                    const conversationNone = `会話セッションが開始がされていません。新しい会話セッションを作成してください。`;
                    await context.sendActivity(MessageFactory.text(conversationNone, conversationNone));
                }
            }
        });

        // メンバーが追加されたときのハンドリング
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;

            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    const message = MessageFactory.attachment(menu, welcomeText);
                    await context.sendActivity(message);
                }
            }
            await next();
        });
    }
}

module.exports.ObaBot = ObaBot; // ボットクラスをエクスポート
