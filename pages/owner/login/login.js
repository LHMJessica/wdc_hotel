// pages/owner/login/login.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  getUserInfo: function (e) {
    app.checkUserInfo();
  }
})