// pages/owner/addresslist/addresslist.js
var utils = require('../../../utils/util.js');
var config = require('../../../utils/config');
var $ajax = require('../../../utils/ajax.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    CustomBarText: "我的收货地址",
    addressList:[]
  },
  onLoad:function(options){
    if (options || options.choose){
      this.setData({
        choose: options.choose
      });
    }
  },
  chooseAddress:function(e){
    let pages = getCurrentPages(); // 获取页面栈
    let prevPage = pages[pages.length - 2]; // 上一个页
    prevPage.setData({
      address: this.data.addressList[e.currentTarget.dataset.idx] // 假数据

    })
    wx.navigateBack({
      delta:1
    })
  },
  toadd:function(){
    wx.navigateTo({
      url: '../modifyaddress/modifyaddress',
    })
  },
  getAddressList: function () {
    var that = this;
    var user = wx.getStorageSync('user');
    var params = config.service.host + "funid=app_full&eventcode=qryAddressByMember&member_id=" + user.member_id;
    $ajax._post(params, function (res) {
      //console.log(res);
      var addressList = res.data;
      that.setData({
        addressList: addressList
      });
    }, function (error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function (res) {
          //  同步清理本地缓存
          //wx.clearStorageSync();
        }
      });
    });
  },
  onShow:function(){
   this.getAddressList();
  },
  modifyaddress:function(e){
    let idx = e.currentTarget.dataset.idx;
    console.log(idx);
    let address=this.data.addressList[idx];
    wx.setStorage({
      key: 'address',
      data: address,
    })
    wx.navigateTo({
    url: '../modifyaddress/modifyaddress',
    })
  }
})