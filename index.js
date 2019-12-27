const ejs = require("ejs");
const fs = require("fs");
const md5 = require("js-md5");
const request = require("request");

function init() {
  request(
    "https://f1.qcmuzhi.com:8446/dmc/services-ssl/transLog!findTransLog.do?date=2019-12-25&lastLogId=&pageSize=",
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        getRecommend(JSON.parse(body));
      }
    }
  );
}

function getRecommend(data) {
  request(
    "https://trans.qcmuzhi.com:8443/cmc/services-ssl/transLib!findTransLib4Web.do?lastId=&pageSize=",
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        render(data, JSON.parse(body));
      }
    }
  );
}

function render(data, recommendData) {
  fs.readdirSync("./html").map(file => {
    fs.unlink(`./html/${file}`, err => {
      if (err) {
      } else {
        let list = compute(data);
        let recommend = computeRecommend(recommendData);
        list.forEach(item => {
          ejs.renderFile(
            "./template.html",
            {
              title: item.title,
              content: item.content,
              recommend: recommend,
              src: item.src,
              transTime: item.transTime,
              to: item.to
            },
            function(err, str) {
              fs.writeFile("./html/" + item.name + ".html", str, function() {});
            }
          );
        });
      }
    });
  });
}

function computeRecommend(recommendData) {
  let list = [];

  recommendData.result.forEach(item => {
    if (item.src.length < 20) {
      let obj = {};
      obj.title = item.src + "的" + item.toName + "怎么说";
      obj.name = md5(item.logId + "");
      obj.link = "./" + obj.name + ".html";
      list.push(obj);
    }
  });
  return list.slice(0, 8);
}

function compute(data) {
  let list = [];
  data.result.forEach(item => {
    if (item.src.length < 20) {
      let obj = {};
      obj.src = item.src;
      obj.transTime = item.transTime;
      obj.title = item.src + "的" + item.toName + "怎么说";
      obj.content = item.dst;
      obj.name = md5(item.logId + "");
      obj.to = item.to;
      list.push(obj);
    }
  });
  return list;
}

init();
