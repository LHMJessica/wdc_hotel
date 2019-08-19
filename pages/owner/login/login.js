// pages/owner/login/login.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    CustomBarText: "登录"
  },
  getUserInfo: function (e) {
    app.checkUserInfo();
  }
})