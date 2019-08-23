// pages/order/order.js
const app = getApp();
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({
  data: {
    TabCur: 100,
    scrollLeft: 0,
    hidden: false,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    CustomBarText: "订单"
  },
  tabSelect(e) {
    var idx = e.currentTarget.dataset.idx;
    this.setData({
      TabCur: idx,
      scrollLeft: (e.currentTarget.dataset.idx - 1) * 60
    })
    this.qryOrders(idx);
  },
  onPullDownRefresh: function() {
    console.log('--------下拉刷新-------')
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    //加载navbar导航条
    that.navbarShow();
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var user = wx.getStorageSync("user");
    var token = wx.getStorageSync("token");
    this.setData({
      token: token
    })
    if (user) {
      this.setData({
        user: user
      });
      //加载navbar导航条
      this.navbarShow();
    } else {
      wx.navigateTo({
        url: '../owner/login/login'
      })
    }
  },
  /**订单类别 */
  navbarShow: function() {
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryOrderSatus";
    $ajax._post(params, function(res) {
     // console.log(res);
      var navbarsdata = [];
      for (var i in res.data) {
        navbarsdata.push({
          "type_id": res.data[i].value_data,
          "type_name": res.data[i].display_data,
          seq: ""
        });
      }
      that.setData({
        bars: navbarsdata,
        TabCur: 4
      })
      that.qryOrders(4);
    }, function(error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function(res) {
          //  同步清理本地缓存
          // wx.clearStorageSync();
        }
      });
    });
  },
  toorderdetail: function(e) {
    var order_id = e.currentTarget.dataset.idx;
    wx.navigateTo({
      url: "../order/details/detaild?orderid=" + order_id
    })
  },
  qryOrders: function(status) {
    var that = this;
    var orders = [];
    var user = wx.getStorageSync("user");
    var hidden = true;
    var params = config.service.host + "funid=app_full&eventcode=qryOrdersByStatus&member_id=" + user.member_id + "&status=" + status;
    $ajax._post(params, function(res) {
      for (var i in res.data) {
        res.data[i].sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + res.data[i].shop_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
        orders.push(res.data[i]);
      }
      that.setData({
        orders: orders
      })
     // console.log(orders);
    }, function(error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function(res) {
          //  同步清理本地缓存
          // wx.clearStorageSync();
        }
      });
    });
  },
  cancelorder: function(e) {
    var that = this;
    let order_id = e.currentTarget.dataset.idx;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消吗？',
      showCancel: true, //是否显示取消按钮
      cancelText: "否", //默认是“取消”
      cancelColor: '#f0145a', //取消文字的颜色
      confirmText: "是", //默认是“确定”
      confirmColor: 'skyblue', //确定文字的颜色
      success: function(res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          var params = config.service.host + "funid=app_full&eventcode=setOrder&order_id=" + order_id + "&status=7";
          $ajax._post(params, function(res) {
            that.onLoad();
          }, function(error) {
            wx.showToast({
              title: '请求失败了!',
              icon: 'none',
              duration: 5000,
              success: function(res) {
                //  同步清理本地缓存
                // wx.clearStorageSync();
              }
            });
          });
        }
      },
      fail: function(res) {}, //接口调用失败的回调函数
      complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
    })
  },
  tocomment: function(e) {
    let comment = {
      "order_id": this.data.orders[e.currentTarget.dataset.idx].order_id,
      "order_code": this.data.orders[e.currentTarget.dataset.idx].order_code,
      "comment_star":4,
      "account_name": this.data.user.account_name,
      "account_img": this.data.user.account_img,
      "account_code": this.data.user.account_code,
      "sp_code": this.data.orders[e.currentTarget.dataset.idx].sp_code,
      "sp_name": this.data.orders[e.currentTarget.dataset.idx].sp_name,
      "sp_id": this.data.orders[e.currentTarget.dataset.idx].shop_id,
      "parent_id": this.data.orders[e.currentTarget.dataset.idx].shop_id
    };
    wx.navigateTo({
      url: '../comment/comment?comment=' + JSON.stringify(comment),
    })
  }
})