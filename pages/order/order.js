// pages/order/order.js
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({
  data: {
    TabCur: 100,
    scrollLeft: 0,
    hidden: false
  },
  tabSelect(e) {
    var idx = e.currentTarget.dataset.idx;
    this.setData({
      TabCur: idx,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    this.qryOrders(idx);
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this;
    //加载navbar导航条
    that.navbarShow();
    that.qryOrders(100);
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
    } else {
      wx.redirectTo({
        url: '../owner/login/login'
      })
    }
  },
  /**请求商品分类 */
  navbarShow: function () {
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryOrderSatus";
    $ajax._post(params, function (res) {
      //console.log(JSON.stringify(res));
      var navbarsdata = [];
      navbarsdata.push({ "type_id": "100", "type_name": '全部', seq: "" });
      for (var i in res.data) {
        navbarsdata.push({ "type_id": res.data[i].value_data, "type_name": res.data[i].display_data, seq: "" });
      }
      that.setData({
        bars: navbarsdata
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
  },
  qryOrders: function (status) {
    var that = this;
    var orders = [];
    var user = wx.getStorageSync("user");
    var hidden = true;
    var params = config.service.host + "funid=app_full&eventcode=qryOrdersByStatus&member_id=" + user.member_id + "&status=" + status;
    $ajax._post(params, function (res) {
      for (var i in res.data) {
        res.data[i].sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + res.data[i].shop_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
        orders.push(res.data[i]);
      }  
      console.log(orders);
      that.setData({
        orders: orders
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