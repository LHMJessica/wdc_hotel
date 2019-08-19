// pages/order/affirm/affirm.js
const app = getApp();
var utils = require('../../../utils/util.js');
var config = require('../../../utils/config');
var $ajax = require('../../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    CustomBarText: "确认订单",
    devices: [],
    currdevice: 0
  },
  onLoad: function (options) {
   var goods=wx.getStorageSync("goods");
    if (goods){
      this.setData({
        goods: goods
      });
   }
    this.getOnlineDevice();
  },
  /* 减数 */
  delCount: function (e) {
    console.log("刚刚您点击了减1");
    var count = this.data.goods.count;
    // 商品总数量-1
    if (count > 1) {
      this.data.goods.count--;
    }
    // 将数值与状态写回  
    this.setData({
      goods: this.data.goods
    });
    this.priceCount();
  },
  /* 加数 */
  addCount: function (e) {
    console.log("刚刚您点击了加1");
    var count = this.data.goods.count;
    // 商品总数量-1  
    if (count < 10) {
      this.data.goods.count++;
    }
    // 将数值与状态写回  
    this.setData({
      goods: this.data.goods
    });
    this.priceCount();
  },
  toscan:function(){
    var that = this;
    wx.scanCode({
      success: (res) => {
        var show = "--result:" + res.result + "--scanType:" + res.scanType + "--charSet:" + res.charSet + "--path:" + res.path;
        console.log(show);
        var params = config.service.host + "funid=app_full&eventcode=qryDeviceAddress&qrcode=" + res.result;
        $ajax._post(params, function (res) {
          console.log(res);
          that.setData({
            address: res.data
          });
        }, function () { });
      },
      fail: (res) => {

      },
      complete: (res) => { }
    })
  },
  //价格计算
  priceCount: function (e) {
    this.data.goods.totalMoney = (this.data.goods.dollar_price * this.data.goods.count).toFixed(2);
    this.data.goods.totalRMoney = (this.data.goods.sale_price * this.data.goods.count).toFixed(2);
    var discount = (this.data.goods.discount < 1 ? (1 - this.data.goods.discount) : 0);
    this.data.goods.reduced = (this.data.goods.sale_price * this.data.goods.count * discount).toFixed(2);
    this.data.goods.money = (this.data.goods.totalRMoney - this.data.goods.reduced).toFixed(2);
    this.setData({
      goods: this.data.goods
    })
  },
  getOnlineDevice: function () {
    var that = this;
    var user = wx.getStorageSync("user");
    var params = config.service.host + "funid=app_full&eventcode=qryonlineDevice";
    $ajax._post(params, function (res) {
      that.setData({
        devices: res.data
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
  submitOrder: function () {
    if (!this.data.goods) {
      wx.showToast({
        title: '选择商品不能为空',
        icon:"none"
      });
      return;
    }
    if (!this.data.address) {
      wx.showToast({
        title: '收货不能为空',
        icon: "none"
      });
      return;
    }
    var goods = this.data.goods;
    var address = this.data.address;
    var device = this.data.devices[this.data.currdevice];
    var user = wx.getStorageSync("user");
    //拼接订单详情
    var orderdetail = {
      "sp_code": goods.sp_code,
      "sp_name": goods.sp_name,
      "dollar_price": goods.dollar_price,
      "sale_price": goods.sale_price,
      "discount": goods.discount,
      "qty": goods.count,
      "money": goods.money,
      "shop_id": goods.sp_id
    };
    //拼接请求参数
    var params = config.service.host + "funid=app_full&eventcode=addOrder&order_type=1&status=4&account_code=" + user.account_code +
      "&account_img=123&account_name=" + user.account_name + "&sp_num=" + goods.count + "&pay_money=" + goods.money + "&device_code=" + device.device_code + "&device_name=" + device.device_name + "&hotal_name=" + address.hotal_name + "&hotal_address=" + address.hotal_address + "&area_code=" + address.area_code + "&area_name=" + address.area_name + "&area_id=" + device.area_id + "&hotal_id=" + address.hotal_id + "&device_id=" + device.device_id + "&member_id=" + user.member_id + "&room_name=" + address.room + "&device_take=" + goods.status + "&detail=" + JSON.stringify(orderdetail);
    $ajax._post(params, function (res) {
      console.log(res)
      if (res.success) {
        wx.removeStorageSync("goods");
        var order_id = res.data.data;
        wx.redirectTo({
          ///pages/order/details/detaild?orderid={{item.order_id}}
          url: '../../order/details/detaild?orderid=' + order_id,
        })
      }
    }, function () {

    });
  },
  chooseaddress:function(){
    var that=this;
    wx.authorize({
      scope: 'scope.address',
      success(res) {
        wx.chooseAddress({
          success: function (res) {
            let address={
              "contact":res.userName,
              "phone":res.telNumber,
              "province":res.provinceName,
              "city":res.cityName,
              "area":res.countyName,
              "detailed":res.detailInfo,
              "full_address": res.provinceName + res.cityName + res.countyName + res.detailInfo
            }
            that.setData({
              address: address
            });
          },
          fail: function (err) {
            wx.showToast({
              title: "请尽快填写收货地址",
              icon: "none"
            })
          }
        })
      },
      fail(res) {
        //用户拒绝授权后执行
        wx.openSetting({})
      }
    })
  }
})