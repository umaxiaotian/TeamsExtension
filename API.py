from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain.llms import OpenAI
import openai
import os
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,   # 追記により追加
    allow_methods=["*"],      # 追記により追加
    allow_headers=["*"]       # 追記により追加
)

# Pydanticモデルを定義
class PageData(BaseModel):
    qa: str
    history: object

os.environ["OPENAI_API_KEY"] = os.getenv("API_KEY")
openai.api_key = os.environ["OPENAI_API_KEY"]

@app.get("/")
async def root():
    return {"message": "Hello Obachat Engine!"}

@app.post("/question/")
def process_data(data: PageData):
    message = [{"role": "system", "content": "あなたは賢いAIです。あなたは下記の内容に答えてください。"}]
    for col in data.history:
        USER = col[0]
        TALK = col[1].replace("\n", "")
        message.append({"role": f"{USER}", "content": f"{TALK}"})
    message.append({"role": f"user", "content": f"{data.qa}"})
    res = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=message,
        temperature=1
    )

    print(res["choices"][0]["message"]["content"])
    return {"ans": res["choices"][0]["message"]["content"]}
