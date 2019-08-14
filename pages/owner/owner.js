// pages/owner/owner.js
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var user = wx.getStorageSync("user");
    var token = wx.getStorageSync("token");
    this.setData({
      token: token
    })
    if (user) {
      this.setData({
        user: user
      });
      this.getNoread();
    } else {
      wx.redirectTo({
        url: '../owner/login/login'
      })
    }
  },
  getNoread:function(){
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryNoreadMesCount&member_id="+this.data.user.member_id;
    $ajax._post(params, function (res) {
      that.setData({
        readcount: res.data.count
      })
    }, function (error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function (res) {
          //  同步清理本地缓存
          // wx.clearStorageSync();
        }
      });
    });
  }
})