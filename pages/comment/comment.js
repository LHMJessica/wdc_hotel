// pages/comment/comment.js
const app = getApp();
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    CustomBarText: "提交评价"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.comment != undefined && options.comment != null && options.comment != "") {
      let comment = JSON.parse(options.comment);
      this.setData({
        comment: comment
      });
    }
   // console.log(this.data.comment);
  },
  starchange: function(e) {
    var idx = e.currentTarget.dataset.idx;
    this.data.comment.comment_star = (idx + 1);
    this.setData({
      comment: this.data.comment
    });
  },
  textareaBInput:function(e){
    this.data.comment.content = e.detail.value;
    this.setData({
      comment: this.data.comment
    });
  },
  submitComment: function() {
    /* var params = config.service.host + 'funid=app_full&eventcode=addComment&order_id=' + this.data.comment.order_id + '&order_code= ' + this.data.comment.order_code + '&comment_star=' + this.data.comment.comment_star + '&account_name=' + this.data.comment.account_name + '&account_img= ' + this.data.comment.account_img + '&account_code=' + this.data.comment.account_code + '&sp_code=' + this.data.comment.sp_code + '&sp_name=' + this.data.comment.sp_name + '&sp_id=' + this.data.comment.sp_id + '&parent_id=' + this.data.comment.sp_id + '&content=' + this.data.comment.content; */
    let that=this;
    wx.request({
      url: config.service.host,
      'content-type': 'application/json',
      method: 'GET',
      data: {
        'nousercheck': '1',
        'funid': 'app_full',
        'eventcode': 'addComment',
        'order_id': that.data.comment.order_id,
        'order_code': that.data.comment.order_code,
        'comment_star': that.data.comment.comment_star,
        'account_name': that.data.comment.account_name,
        'account_img': that.data.comment.account_img,
        'account_code': that.data.comment.account_code,
        'sp_code': that.data.comment.sp_code,
        'sp_name': that.data.comment.sp_name,
        'sp_id': that.data.comment.sp_id,
        'parent_id': that.data.comment.sp_id,
        'content': that.data.comment.content
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.showToast({
            title: '您的评论已提交',
            icon: 'none',
            duration: 1000,
            success: function (res) {
              wx.navigateBack({
                delta: 1
              });
            }
          });
        }
      },
      fail: function () {
        wx.showToast({
          title: '请求失败了!',
          icon: 'none',
          duration: 5000,
          success: function (res) {
            //  同步清理本地缓存
            //wx.clearStorageSync();
          }
        });
      }
    });
  }
})