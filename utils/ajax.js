/**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function _get(url, _success, _fail) {
  wx.request({
    url: url,
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8' // 默认值 
    },
    data: {},
    method: 'GET',
    success: _success,
    fail: _fail
  });
}
/**
 * url 请求地址
 * success 成功的回调
 * fail 失败的回调
 */
function _post(url, _success, _fail) {
  wx.showLoading({
    title: '加载中···',
  })
  wx.request({
    url: url,
    header: {
      'content-type': 'application/x-www-form-urlencoded;charset=utf-8' // 默认值 
    },
    method: 'POST',
    data: {},
    success: function(res) {
      wx.hideLoading();
      _success(res.data)
    },
    fail: _fail
  });
}
module.exports = {
  _get: _get,
  _post: _post,
}