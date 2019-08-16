var app = getApp()
var utils = require('../../../utils/util.js');
var config = require('../../../utils/config');
var $ajax = require('../../../utils/ajax.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    order: null,
    orderdetail: null,
    rownumsize: null,
    index: 0,
    user: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      order_id: options.orderid
    });
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryOrderDetail&order_id=" + that.data.order_id;
    $ajax._post(params, function (res) {
      console.log(res);
      var detail = JSON.parse(res.data.detail);
      console.log(detail);
      var row = JSON.parse(res.data.rownum);
      var index = 0;
      for (var i in row) {
        if (row[i].order_id == res.data.order_id) {
          index = row[i].rownum;
        }
      }
      for (var i in detail) {
        detail[i].shop_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + detail[i].shop_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
      }
      that.setData({
        order: res.data,
        orderdetail: detail,
        rownumsize: row.length,
        index: index
      });
      console.log(JSON.stringify(res))
    }, function () {

    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var user = wx.getStorageSync("user");
    this.setData({ "user": user });
    //执行初始化
  },
  //刷新数据
  dataRefresh: function (_action) {
    //提交到服务器
    var that = this

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  setRoomCode: function (e) {
    this.setData({
      room: e.detail.value
    });
  },
  /**
   * 支付订单
   */
  payOrder: function () {
    var user = wx.getStorageSync("user");
    var that = this;
    console.log(that.data.order.order_code);
    var urls = config.service.host + "funid=app_api&eventcode=wxPaySmall&order_code=" + that.data.order.order_code + "&money=" + that.data.order.pay_money + "&openid=" + user.account_code;
    console.log(urls);
    $ajax._post(urls, function (res) {
      console.log(res);
      wx.requestPayment({
        'timeStamp': res.data.timeStamp,
        'nonceStr': res.data.nonceStr,
        'package': res.data.package,
        'signType': res.data.signType,
        'paySign': res.data.sign,
        success: function (res) {
          wx.showLoading({
            title: '正在支付....'
          });
          $ajax._post(config.service.host + "funid=app_api&eventcode=upPayOrder&order_code=" + that.data.order.order_code, function (res) {
            wx.hideLoading();
            wx.showToast({
              title: '支付成功！',
            })
            that.onLoad();//支付成功后重新加载页面
          }, function () {
            wx.hideLoading();
          });
        },
        fail: function (res) {
          wx.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000,
          })
          console.log(res)
        }
      });
    }, function () {
      wx.showToast({
        title: '发起支付失败',
        icon: 'none',
        duration: 2000,
      })
      //失败回调函数
    });

  },
  /**
   * 取消订单
   */
  cancelorder: function (e) {
    let order_id = e.currentTarget.dataset.idx
    var that=this;
    wx.showModal({
      title: '取消订单',
      content: '确定要取消吗？',
      showCancel: true,//是否显示取消按钮
      cancelText: "否",//默认是“取消”
      cancelColor: '#f0145a',//取消文字的颜色
      confirmText: "是",//默认是“确定”
      confirmColor: 'skyblue',//确定文字的颜色
      success: function (res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          var params = config.service.host + "funid=app_full&eventcode=setOrder&order_id=" + order_id + "&status=7";
          $ajax._post(params, function (res) {
            that.onLoad();
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
      },
      fail: function (res) { },//接口调用失败的回调函数
      complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
    })
  }
})