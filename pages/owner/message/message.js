// pages/owner/message/message.js
var utils = require('../../../utils/util.js');
var config = require('../../../utils/config');
var $ajax = require('../../../utils/ajax.js');
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
    this.qryNoreadMessage();
  },
  qryNoreadMessage:function(){
    var user=wx.getStorageSync("user");
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryMemberMessage&member_id=" +user.member_id;
    $ajax._post(params, function (res) {
      for (var i in res.data) {
        res.data[i].message_date = res.data[i].message_date.substr(0,10);
      }
      that.setData({
        messages: res.data
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