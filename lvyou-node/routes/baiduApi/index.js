const router = require("@koa/router")();
const { BAIDU_AK } = require('@/config/Account')
const fs = require('fs');
const csv = require('csv-parser');
const path = require("path");
const https = require("https");
const baseURL = 'https://api.map.baidu.com/weather/v1/'

function objectToQueryString(obj) {
  const keyValuePairs = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
  }

  return keyValuePairs.join('&');
}

// 获取地区数据
function readCsvFile() {
  const results = [];
  const filePath = path.join(__dirname, './weather_district_id.csv')
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const dataList = results.map(item => {
          return {
            district: item['district'],
            city: item['city'],
            province: item['province'],
            lon: item['lon'],
            lat: item['lat'],
            district_id: item['districtcode']
          }
        })
        resolve([dataList, null])
      })
      .on('error', () => {
        reject([null, '解析文件出错，请联系后台'])
      });
  })
}

// 请求百度api
function requestBaiDu(params) {
  params = {
    ...params,
    data_type: 'all',
    ak: BAIDU_AK
  }
  const paramsStr = objectToQueryString(params)
  return new Promise((resolve, reject) => {
    let result = ''
    https.get(baseURL + '?' + paramsStr, (res) => {
      res.on('data', (data) => {
        result += data
      })
      res.on('end', () => {
        try {
          const data = JSON.parse(result)
          if (data.status) {
            reject([null, data.message])
          } else {
            resolve([data.result, null])
          }
        } catch {
          reject([null, 'JSON.parse解析错误'])
        }

      })
      res.on('error', (err) => {
        reject([null, err])
      })
    })
  })
}


// 获取地区数据
router.get("/getDistrict", async (ctx) => {
  const [data, err] = await readCsvFile()
  if (err) {
    ctx.send("SUCCESS", 500, err)
  }
  ctx.send("SUCCESS", 200, data);
});


// 地区天气查询
router.get("/getWeather", async (ctx) => {
  const { district_id } = ctx.query
  const [data, err] = await requestBaiDu({ district_id })
  if (err) {
    ctx.send("SUCCESS", 500, err)
  }
  ctx.send("SUCCESS", 200, data);
});

// 经纬度天气查询
router.post("/getWeatherLon", async (ctx) => {
  const { lon, lat } = ctx.request.body
  const location = lon + ',' + lat
  const [data, err] = await requestBaiDu({ location })
  if (err) {
    ctx.send("SUCCESS", 500, err)
  }
  ctx.send("SUCCESS", 200, data);

});

module.exports = router.routes();
