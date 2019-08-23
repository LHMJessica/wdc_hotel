// pages/owner/owner.js
const app=getApp();
var utils = require('../../utils/util.js');
var config = require('../../utils/config.js');
var $ajax = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    CustomBarText: "我的"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  onPullDownRefresh: function () {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    that.getNoread();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var user = wx.getStorageSync("user");
    if (user) {
      this.setData({
        user: user
      });
        this.getNoread();
    } else {
      wx.navigateTo({
        url: '../owner/login/login'
      })
    }
   // console.log(user);
  },
  onReady:function(){
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