/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'http://www.fujinsoftware.com:8080/znhotel_cloud//fileAction.do?&nousercheck=1&';
var apikey = 'wx3eabd70e64011a0f';
var wss='';
var config = {
  // 下面的地址配合云端 Demo 工作
  service: {
    host,
    wss,
    apikey,
  }
};

module.exports = config;