const router = require("@koa/router")();
const ws = require("ws");
const crypto = require("crypto");
const { Auth } = require('@/token/auth')
const { API_SECRET, API_KEY, APPID } = require('@/config/Account')

function getDataObj(content) {
  return {
    header: {
      app_id: APPID,
    },
    parameter: {
      chat: {
        domain: "generalv3.5",
        temperature: 0.5,
        max_tokens: 1024,
      },
    },
    payload: {
      message: {
        text: [
          {
            role: "user",
            content
          },
        ],
      },
    },
  };
}

// 访问讯飞api
function initUrl(content) {
  // 定义讯飞api的主机和路径
  const host = "spark-api.xf-yun.com";
  const path = "/v3.5/chat";
  return new Promise((resolve, reject) => {
    let messageArr = []
    const dateString = new Date().toGMTString();
    // 构建用于签名的请求头
    let tmp = `host: ${host}\ndate: ${dateString}\nGET ${path} HTTP/1.1`;
    let signature = crypto
      .createHmac("sha256", API_SECRET)
      .update(tmp)
      .digest("base64");
    const authorization_origin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    // 将授权信息转成base64格式
    const buff = Buffer.from(authorization_origin);
    const authorization = buff.toString("base64");
    // 构建 ws 地址
    const wsUrl = `wss://${host
      }${path}?authorization=${authorization}&date=${encodeURIComponent(dateString)}&host=${host}`;
    console.log(wsUrl);
    // 创建ws连接
    let socket = new ws(wsUrl);
    socket.on("open", () => {
      console.log('<==========连接打开===========>');
      const obj = getDataObj(content)
      socket.send(JSON.stringify(obj));
    });
    // 监听返回消息
    socket.on('message', (data) => {

      
      const messageData = JSON.parse(data)

      console.log(messageData);
      
      // 获取文本
      const textObj = messageData.payload.choices.text[0]
      messageArr.push(textObj)
    })
    // 监听错误消息
    socket.on('error', err => {
      console.log('错误信息=====>', err);
      reject([null, err])
    })
    // 监听连接关闭
    socket.on('close', () => {
      console.log('<==========连接关闭===========>');
      resolve([messageArr, null])
    })
  });
}
// new Auth().m 权限校验中间件
// router.get("/openai", new Auth().m, async (ctx) => {
router.get("/openai",  async (ctx) => {
  const { question } = ctx.query
  const [data, err] = await initUrl(question)
  if(err){
    ctx.send("SUCCESS", 500, err)
  }
  const dataTextArr = data.map(item=>item.content).join('')
  ctx.send("SUCCESS", 200, dataTextArr);
});

module.exports = router.routes();
