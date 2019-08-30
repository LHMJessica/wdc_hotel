// pages/welfare/welfare.js
const app = getApp();
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: false,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    CustomBarText: "好福利"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //加载打折商品数据
    that.brandShow();
  },
  onPullDownRefresh: function() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    //加载打折商品数据
    that.brandShow();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  brandShow: function() {
    var that = this;
    var newGoodsData = [];
    var params = config.service.host + "funid=app_full&eventcode=qryGoodwelfare";
    $ajax._post(params, function(res) {
      if (res.data != undefined && res.data != "" && res.data != null) {
        newGoodsData = res.data;
      }
      //  console.log(JSON.stringify(newGoodsData));   
      that.setData({
        sp_catalogs: newGoodsData
      })
    }, function(error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function(res) {
          //  同步清理本地缓存
          //wx.clearStorageSync();
        }
      });
    });
  },
  toshopdetail: function(e) {
    var goodid = e.currentTarget.dataset.goodid;
    wx.navigateTo({
      url: '../good/goods?goodid=' + goodid,
    })
  },
})