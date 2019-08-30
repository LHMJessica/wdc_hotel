//app.js
var config = require('utils/config');
var $ajax = require('utils/ajax.js');
App({
  onLaunch: function () {
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
        this.globalData.CustomBarText ="小万嗨嗨商城";
      }
    })
  },
  globalData:{},

  /**
   * funName:本地缓存是否存有用户信息
   * type:公用函数
   * return:不存在返回FALSE并跳转至首页，存在返回用户信息
   */
  is_login: function() {
    console.log('is_login');
    let user = wx.getStorageSync('user');
    if (user == '' || user == null) {
      return false;
    } else {
      return user;
    }
  },
  checkUserInfo: function() {
    /**
     * 微信用户授权
     * 1.获取Openid
     * 2.微信昵称
     * 3.获取微信头像
     * wx.login
     * 调用接口获取登录凭证（code）进而换取用户登录态信息，包括用户的唯一标识（openid） 
     * 及本次登录的 会话密钥（session_key）。用户数据的加解密通讯需要依赖会话密钥完成。
     */
    wx.login({
      success: function(res) {
        if (res.code != "" && res.code!=undefined ) {
          let codeToken = res.code; //  有效期为5分钟的令牌
          /**
           * 唤起微信请求授权会话框
           */
          wx.getUserInfo({
            //  用户回应结果
            success: function(res) {
              //  根据Openid查询是否存在该用户，有就返回信息没有就注册返回注册后的用户信息
              let user = res.userInfo;
              //  根据Openid查询是否存在该用户，有就返回信息没有就注册返回注册后的用户信息
              let hurl = config.service.host + 'funid=app_full&eventcode=wxLogin&js_code=' + codeToken;
              $ajax._post(hurl, function(res) {
                if (res.data != null && res.data !=undefined && res.data != '' && res.data.openid != null && res.data.openid != '') {
                  console.log(res);
                  let that = this;
                  wx.request({
                    url: config.service.host,
                    'content-type': 'application/json',
                    method: 'GET',
                    data: {
                      'funid': 'app_full',
                      'eventcode': 'IsMember',
                      'account_type': 1,
                      'code': res.data.openid,
                      'name': user.nickName,
                      'sex': user.gender,
                      'avatarUrl': user.avatarUrl
                    },
                    success: function (res) {
                      console.log(res);
                      if (res.statusCode == 200) {
                        console.log(res);
                        if (res.data.data) {
                          console.log(res);
                          wx.setStorageSync("user", res.data.data.data);
                        }
                        //console.log(wx.getStorageSync("user"));
                        wx.navigateBack({})
                      }
                    },
                    fail: function () {
                      wx.showToast({
                        title: '登录失败!',
                        icon: 'none',
                        duration: 10000,
                        success: function (res) {
                          //  同步清理本地缓存
                          wx.clearStorageSync();
                          wx.switchTab({
                            url: '/pages/home/home'
                          })
                        }
                      });
                    }
                  });
                } else {
                  wx.showToast({
                    title: '请删除微信小程序后，重新登陆',
                    icon: 'none',
                    duration: 10000,
                    success: function(res) {}
                  });
                }
              }, function() {});
            },
            fail: function(e) {
              wx.showToast({
                title: '为获取更好的用户体验请同意微信授权!',
                icon: 'none',
                duration: 10000,
                success: function(res) {
                  //  同步清理本地缓存
                  wx.clearStorageSync();
                  wx.switchTab({
                    url: '/pages/home/home'
                  })
                }
              });
            },
            complete: function(e) {}
          })

        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }

      }
    });
  },

  /**
   * PublicVariable
   */
  globalData: {
    userInfo: null,
    ucode: null,
    name: null,
    avatar: null,
    pUser: get_user(), //  本地User信息
  },
  pUser: get_user(), //  本地User信息
})

function get_user(name = 'user', filed = '*') {
  return wx.getStorageSync(name) ? (filed === '*') ? wx.getStorageSync(name) : wx.getStorageSync(name)[filed] : false;
}