const app = getApp();
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    scrollLeft: 0,
    list: [],
    load: true
  },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let list = [{
      "name": "商品",
      "id": "0"
    }, {
      "name": "评价",
      "id": "1"
    }, {
      "name": "详情",
      "id": "2"
    }];
    this.setData({
      list: list,
      listCur: list[0]
    })
    var goodid = options.goodid;
    this.goodsInfoShow(goodid);
  },
  onReady() {
    wx.hideLoading()
  },
  tabSelect: function(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  HorizontalMain: function(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          scrollLeft: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  toaffirmorder: function() {
    this.data.goods.count = "1";
    this.data.goods.totalMoney = (this.data.goods.dollar_price * this.data.goods.count).toFixed(2);
    this.data.goods.totalRMoney = (this.data.goods.sale_price * this.data.goods.count).toFixed(2);
    var discount = (this.data.goods.discount < 1 ? (1 - this.data.goods.discount) : 0);
    this.data.goods.reduced = (this.data.goods.sale_price * this.data.goods.count * discount).toFixed(2);
    this.data.goods.money = (this.data.goods.totalRMoney - this.data.goods.reduced).toFixed(2);
    wx.setStorageSync("goods", this.data.goods);
    wx.navigateTo({
      url: '../order/affirm/affirm',
    })
  },
  goodsInfoShow: function(goodid) {
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryCatalogByID&sp_id=" + goodid;
    $ajax._post(params, function(res) {
      let goods = res.data;
      goods.imgurls = [];
      goods.sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + goods.sp_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
      let imgurl = config.service.host + "funid=sp_catalog&nousercheck=1&pagetype=grid&eventcode=showpic&tablename=sp_catalog&dataType=json&user_id=administrator&keyid=" + goods.sp_id + "&_dc=1565855835928"
      $ajax._post(imgurl, function(obj) {
        for (var i in obj.data) {
          let url = obj.data[i].url.substr(1, obj.data[i].url.length);
          goods.imgurls.push({
            "url": config.service.service + url + "&nousercheck=1"
          });
        }
        that.setData({
          goods: goods
        })
      }, function() {});
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
})