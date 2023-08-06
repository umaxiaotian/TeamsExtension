const { ActivityHandler, MessageFactory, ActivityTypes, CardFactory } = require('botbuilder');
const axios = require('axios');
let conversationIsStart = false; // 会話が始まっているかどうか判定します。 
let conversationData = {}; // メモリ内の変数に保存するためのオブジェクト

const welcomeText = `
## こんにちは! Obabotです。

Obabot(オバボット)は、Notionという情報管理ツールの情報を読み取り回答するチャットボットです。

### 機能

1. ユーザーの質問に答える:ObabotはNotionに格納された情報を元に、ユーザーからの質問に適切に回答します。これにより、特定のトピックに関する知識の共有と検索が容易になります。

2. マークダウンでのまとめ:Notionのマークダウン形式を利用して、Obabotは情報を整理し、簡潔な形でユーザーに提供します。この方法により、情報の構造化と視覚的な分かりやすさが向上します。
`;

const NewSessionText = `
## 新しいセッションへようこそ
▼▼ここから新しいチャットボットとの会話になります。▼▼
`

const helpText = `
## こんにちは! Obabotです。

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
);
class ObaBot extends ActivityHandler {


    async postToQuestionAPI(userMessage, history) {
        const url = 'http://127.0.0.1:8888/question';

        // JSONデータを作成
        const data = {
            qa: userMessage,
            history: history
        };

        try {
            // POSTリクエストを送信して応答を取得
            const response = await axios.post(url, data);
            // console.log(response.data)
            return response.data['ans'];
        } catch (error) {
            console.error('Error sending POST request:', error.message);
            return 'エラーが発生しました。';
        }
    }
    constructor() {
        super();


        // メッセージと他のアクティビティタイプについては、https://aka.ms/about-bot-activity-messageを参照
        this.onMessage(async (context, next) => {


            // 正規表現パターンを定義
            const pattern = /^(#.*\?#|@.*|#.*)$/;
            const userMessage = context.activity.text;

            // 文字列が正規表現パターンにマッチするか判定
            if (pattern.test(userMessage)) {
                // 文字列が正規表現パターンにマッチするか判定
                switch (userMessage) {
                    case '#TALKSTART':

                        conversationIsStart = true
                        await context.sendActivity(MessageFactory.text(NewSessionText, NewSessionText));
                        break;
                    case '#HELP':
                        await context.sendActivity(MessageFactory.text(helpText, helpText));
                        break;
                    case '#MENU':
                    case '@obabot':
                        const message = MessageFactory.attachment(menu, welcomeText);
                        await context.sendActivity(message);
                        break;
                    case '#TALKEXIT':
                        if (conversationIsStart == true) {
                            conversationData = {}
                            conversationIsStart = false;
                            const conversationNone = `会話セッションを終了いたしました。またのご利用をお待ちしております。`
                            await context.sendActivity(MessageFactory.text(conversationNone, conversationNone));
                        } else {
                            const conversationNone = `会話セッションが開始されていませんので、セッションを終了する事ができませんでした。`
                            await context.sendActivity(MessageFactory.text(conversationNone, conversationNone));
                        }
                }

            } else {
                //コマンド操作ではなければ
                if (conversationIsStart == true) {
                    const talkHistoryId = context.activity.conversation.id;
                    if (!conversationData[talkHistoryId]) {
                        conversationData[talkHistoryId] = [];
                    }
                    console.log(conversationData[talkHistoryId])
                    // http://127.0.0.1/questionにJSON形式でデータをPOSTリクエストで送信
                    const response = await this.postToQuestionAPI(userMessage, conversationData[talkHistoryId]);
                    conversationData[talkHistoryId].push(['user', userMessage])
                    conversationData[talkHistoryId].push(['assistant', response])
                    await context.sendActivity(MessageFactory.text(response, response));
                    // next() を呼び出すことで、次の BotHandler が実行されることを保証します。
                    await next();
                } else {
                    const conversationNone = `会話セッションが開始がされていません。新しい会話セッションを作成してください。`
                    await context.sendActivity(MessageFactory.text(conversationNone, conversationNone));
                }
            }
        })
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    // カードと応答メッセージを送信
                    const message = MessageFactory.attachment(menu, welcomeText);
                    await context.sendActivity(message);
                }
            }
            // next() を呼び出すことで、次の BotHandler が実行されることを保証します。
            await next();
        });
    }
}

module.exports.ObaBot = ObaBot;
