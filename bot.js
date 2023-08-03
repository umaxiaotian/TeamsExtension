const { ActivityHandler, MessageFactory } = require('botbuilder');
const axios = require('axios');


class ObaBot extends ActivityHandler {
    async postToQuestionAPI(userMessage) {
        const url = 'http://127.0.0.1:8888/question';
    
        // JSONデータを作成
        const data = {
            pageid: '',
            qa: userMessage
        };
    
        try {
            // POSTリクエストを送信して応答を取得
            const response = await axios.post(url, data);
            console.log(response.data)
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

            const replyText = `発話テスト: ${context.activity.text}`;

            const userMessage = context.activity.text;
            // http://127.0.0.1/questionにJSON形式でデータをPOSTリクエストで送信
            const response = await this.postToQuestionAPI(userMessage);


            await context.sendActivity(MessageFactory.text(response, response));
            // next() を呼び出すことで、次の BotHandler が実行されることを保証します。
            await next();

            // const userMessage = context.activity.text;
            // // http://127.0.0.1/questionにJSON形式でデータをPOSTリクエストで送信
            // const response = await this.postToQuestionAPI(userMessage);
            // // 応答をチャットに返す
            // await context.sendActivity(response);
            // await next();

        
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = `
## こんにちは! Obabotです。

Obabot(オバボット)は、Notionという情報管理ツールの情報を読み取り回答するチャットボットです。

### 機能

1. ユーザーの質問に答える:ObabotはNotionに格納された情報を元に、ユーザーからの質問に適切に回答します。これにより、特定のトピックに関する知識の共有と検索が容易になります。

2. マークダウンでのまとめ:Notionのマークダウン形式を利用して、Obabotは情報を整理し、簡潔な形でユーザーに提供します。この方法により、情報の構造化と視覚的な分かりやすさが向上します。
`;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // next() を呼び出すことで、次の BotHandler が実行されることを保証します。
            await next();
        });
    }
}

module.exports.ObaBot = ObaBot;
