// pages/owner/modifyaddress/modifyaddress.js
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
    CustomBarText: "编辑收货地址",
    region: []
  },
  RegionChange: function(e) {
    console.log(e);
    this.setData({
      region: e.detail.value
    })
  },
  onLoad: function() {
    let that = this;
    wx.getStorage({
      key: 'address',
      success: function(res) {
        console.log(res.data);
        let address = res.data;
        //  that.data.region = [address.province,address.city,address.area];
        if (address) {
          that.setData({
            region: [address.province, address.city, address.area],
            storageAddress: address
          });
          wx.removeStorage({
            key: 'address',
            success: function(res) {
              console.log("地址已移除");
            },
          })
        }
      },
    })
  },
  formSubmit: function(e) {
    console.log(e);
    let that = this;
    let consignee = e.detail.value.contact; //联系人
    let mobile = e.detail.value.phone; //电话
    let provinceName = e.detail.value.addresspicker[0]; //省
    let cityName = e.detail.value.addresspicker[1]; //市
    let countyName = e.detail.value.addresspicker[2]; //区
    let address = e.detail.value.detailed;
    let isAgree = that.data.isdefault;
    console.log(provinceName + "," + cityName + "," + countyName + "," + address + "," + isAgree + "," + mobile + "," + consignee);
    isAgree = isAgree ? 0 : 1;
    console.log(provinceName + "," + cityName + "," + countyName + "," + address + "," + isAgree + "," + mobile + "," + consignee);
    let user = wx.getStorageSync("user");
    let address_id = "";
    if (that.data.storageAddress) {
      address_id = that.data.storageAddress.address_id
    }
    console.log(address_id);

   /*  let params = config.service.host + "funid=app_full&eventcode=upAddress&member_id=" + user.member_id + "&account_code=" + user.account_code + "&account_name=" + user.account_name + "&contact=" + consignee + "&phone=" + mobile + "&province=" + provinceName + "&city=" + cityName + "&area=" + countyName + "&detailed=" + address + "&isdefault=" + isAgree + "&full_address=" + provinceName + cityName + countyName + address + "&address_id=" + address_id; */
    wx.request({
      url: config.service.host,
      'content-type': 'application/json',
      method: 'GET',
      data: {
        'nousercheck': '1',
        'funid': 'app_full',
        'eventcode': 'upAddress',
        'member_id': user.member_id,
        'account_code': user.account_code,
        'account_name': user.account_name,
        'contact': consignee,
        'phone': mobile,
        'province': provinceName,
        'city': cityName,
        'area': countyName,
        'detailed': address,
        'isdefault': isAgree,
        'full_address': provinceName + cityName + countyName + address,
        'address_id': address_id
      },
      success: function(res) {
        if (res.statusCode == 200) {
          wx.showToast({
            title: '您的收货地址已修改',
            icon: 'none',
            duration: 1000,
            success: function(res) {
              wx.navigateBack({})
            }
          });
        }
      },
      fail: function() {
        wx.showToast({
          title: '请求失败了!',
          icon: 'none',
          duration: 5000,
          success: function(res) {
            //  同步清理本地缓存
            //wx.clearStorageSync();
          }
        });
      }
    });
  },
  /* 删除地址 */

  delAddress: function(e) {
    var that = this;
    wx.showModal({
      title: '删除地址',
      content: '确定要删除吗？',
      showCancel: true, //是否显示取消按钮
      cancelText: "否", //默认是“取消”
      cancelColor: '#f0145a', //取消文字的颜色
      confirmText: "是", //默认是“确定”
      confirmColor: 'skyblue', //确定文字的颜色
      success: function(res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          let params = config.service.host + "funid=app_full&eventcode=delAddress&address_id=" + that.data.storageAddress.address_id;
          $ajax._post(params, function(res) {
            wx.navigateBack({})
          }, function(error) {
            wx.showToast({
              title: '请求失败了!',
              icon: 'none',
              duration: 5000,
              success: function(res) {
                //  同步清理本地缓存
                //  wx.clearStorageSync();
              }
            });
          });
        }
      },
      fail: function(res) {}, //接口调用失败的回调函数
      complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
    })
  }
})