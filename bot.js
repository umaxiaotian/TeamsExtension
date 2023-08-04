const { ActivityHandler, MessageFactory, ActivityTypes, CardFactory } = require('botbuilder');
const axios = require('axios');

const conversationData = {}; // メモリ内の変数に保存するためのオブジェクト
const welcomeText = `
## こんにちは! Obabotです。

Obabot(オバボット)は、Notionという情報管理ツールの情報を読み取り回答するチャットボットです。

### 機能

1. ユーザーの質問に答える:ObabotはNotionに格納された情報を元に、ユーザーからの質問に適切に回答します。これにより、特定のトピックに関する知識の共有と検索が容易になります。

2. マークダウンでのまとめ:Notionのマークダウン形式を利用して、Obabotは情報を整理し、簡潔な形でユーザーに提供します。この方法により、情報の構造化と視覚的な分かりやすさが向上します。
`;
  const menu = CardFactory.heroCard(
            'メニュー',
            undefined,
            CardFactory.actions([
                {
                    type: 'postBack',
                    title: '新しいAIチャットセッションを始める',
                    value: '#?NEWBTNCLICK?#'
                },
                {
                    type: 'postBack',
                    title: 'ヘルプ',
                    value: '#?HELPBTNCLICK?#'
                }
            ])
        );
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
            const pattern = /^(#.*\?#|@.*)$/;
            const userMessage = context.activity.text;

            // 文字列が正規表現パターンにマッチするか判定
            if (pattern.test(userMessage)) {


                // 文字列が正規表現パターンにマッチするか判定
                switch (userMessage) {
                    case '#?NEWBTNCLICK?#':
                        const NewSessionText=`
## 新しいセッションへようこそ
▼▼ここから新しいチャットボットとの会話になります。▼▼
                        
                        `
                        await context.sendActivity(MessageFactory.text(NewSessionText, NewSessionText));
                        break;
                    case '#?HELPBTNCLICK?#':
                        await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                        break;
                    case '@obabot':
                        const message = MessageFactory.attachment(menu, welcomeText);
                        await context.sendActivity(message);
                        break;
                }


            } else {



                
                // http://127.0.0.1/questionにJSON形式でデータをPOSTリクエストで送信
                const response = await this.postToQuestionAPI(userMessage);
                const talkHistoryId = context.activity.conversation.id;
                if (!conversationData[talkHistoryId]) {
                    conversationData[talkHistoryId] = [];
                }

                conversationData[talkHistoryId].push(['user', userMessage])
                conversationData[talkHistoryId].push(['assistant', response])
                conversationData[talkHistoryId].forEach(element => {
                    console.log(element)
                });

                await context.sendActivity(MessageFactory.text(response, response));
                // next() を呼び出すことで、次の BotHandler が実行されることを保証します。
                await next();
            }

        });

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
