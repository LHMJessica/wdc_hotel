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
    currroom: 0,
    address:null,
    room:null
    //currdevice: 0
  },
  onLoad: function(options) {
    var goods = wx.getStorageSync("goods");
    if (goods) {
      this.setData({
        goods: goods
      });
    }
   // this.getOnlineDevice();
    if (this.data.address == null || this.data.address == {}){
     this.getDefaultAddress();
   }
  },
  formatStr:function(str){
    if(str==undefined){
      return "";
    }
    return str;
  },
  roomChange(e) {
    //console.log(e);
    this.setData({
      currroom: e.detail.value
    })
  },
  /* 减数 */
  delCount: function(e) {
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
  addCount: function(e) {
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
  toscan: function() {
    var that = this;
    wx.scanCode({
      success: (res) => {
        var show = "--result:" + res.result + "--scanType:" + res.scanType + "--charSet:" + res.charSet + "--path:" + res.path;
        console.log(show);
        var params = config.service.host + "funid=app_full&eventcode=qryDeviceAddress&qrcode=" + res.result;
        $ajax._post(params, function(res) {
          console.log(res);
          that.setData({
            address: res.data,
            picker: JSON.parse(res.data.rooms)
          });
        }, function() {});
      },
      fail: (res) => {

      },
      complete: (res) => {}
    })
  },
  //价格计算
  priceCount: function(e) {
    this.data.goods.totalMoney = (this.data.goods.dollar_price * this.data.goods.count).toFixed(2);
    this.data.goods.totalRMoney = (this.data.goods.sale_price * this.data.goods.count).toFixed(2);
    var discount = (this.data.goods.discount < 1 ? (1 - this.data.goods.discount) : 0);
    this.data.goods.reduced = (this.data.goods.sale_price * this.data.goods.count * discount).toFixed(2);
    this.data.goods.money = (this.data.goods.totalRMoney - this.data.goods.reduced).toFixed(2);
    this.setData({
      goods: this.data.goods
    })
  },
  getOnlineDevice: function() {
    var that = this;
    var user = wx.getStorageSync("user");
    var params = config.service.host + "funid=app_full&eventcode=qryonlineDevice";
    $ajax._post(params, function(res) {
      that.setData({
        devices: res.data
      })
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
  submitOrder: function() {
    if (!this.data.goods) {
      wx.showToast({
        title: '选择商品不能为空',
        icon: "none"
      });
      return;
    }
    if (!this.data.address) {
      wx.showToast({
        title: '收货地址不能为空',
        icon: "none"
      });
      return;
    }
    var goods = this.data.goods;
    var address = this.data.address;
    //var device = this.data.devices[this.data.currdevice];
    var room = {};
    if (this.data.picker){
      this.data.picker[this.data.currroom];
    }
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
      "&account_img=123&account_name=" + user.account_name + "&sp_num=" + goods.count + "&pay_money=" + goods.money + "&hotal_name=" + this.formatStr(address.hotal_name) + "&hotal_address=" + this.formatStr(address.hotal_address) + "&area_code=" + this.formatStr(address.area_code) + "&area_name=" + this.formatStr(address.area_name) + "&area_id=" + this.formatStr(address.area_id) + "&hotal_id=" + this.formatStr(address.hotal_id) + "&member_id=" + user.member_id + "&room_name=" + this.formatStr(room.room_no) + "&device_take=" + goods.status + "&detail=" + JSON.stringify(orderdetail) + "&contact=" + this.formatStr(address.contact) + "&full_address=" + this.formatStr(address.full_address) + "&phone=" + this.formatStr(address.phone);
    $ajax._post(params, function(res) {
      console.log(res)
      if (res.data.type!="error") {
        wx.removeStorageSync("goods");
        var order_id = res.data.data;
        wx.redirectTo({
          ///pages/order/details/detaild?orderid={{item.order_id}}
          url: '../../order/details/detaild?orderid=' + order_id,
        })
      }
    }, function() {

    });
  },
  chooseaddress: function() {
    var that = this;
    wx.navigateTo({
      url: '../../owner/addresslist/addresslist?choose=true',
    })
  },
  /**获取用户的默认地址 */
  getDefaultAddress: function() {
    var that = this;
    var user = wx.getStorageSync("user");
    var params = config.service.host + "funid=app_full&eventcode=qryDefaultAddress&member_id=" + user.member_id;
    $ajax._post(params, function(res) {
     // console.log(res.data);
      that.setData({
        address: res.data
      })
      //console.log(res);
    }, function(error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function(res) {
          //  同步清理本地缓存
          wx.clearStorageSync();
        }
      });
    });
  }
})