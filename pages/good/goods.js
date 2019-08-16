// pages/good/goods.js
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: false
  },
  toaffirmorder:function(){
    this.data.goods.count="1";
    this.data.goods.totalMoney = (this.data.goods.dollar_price * this.data.goods.count).toFixed(2);
    this.data.goods.totalRMoney = (this.data.goods.sale_price * this.data.goods.count).toFixed(2);
    var discount = (this.data.goods.discount < 1 ? (1-this.data.goods.discount):0);
    this.data.goods.reduced = (this.data.goods.sale_price * this.data.goods.count * discount).toFixed(2);
    this.data.goods.money = (this.data.goods.totalRMoney - this.data.goods.reduced).toFixed(2);
    wx.setStorageSync("goods", this.data.goods);
    wx.navigateTo({
      url: '../order/affirm/affirm',
    })
  },
  onLoad:function(options){
    var goodid=options.goodid;
    this.goodsInfoShow(goodid);
  },
  goodsInfoShow: function (goodid) {
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryCatalogByID&sp_id=" + goodid;
    $ajax._post(params, function (res) {
      let goods=res.data;
      goods.imgurls=[];
      goods.sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + goods.sp_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
      let imgurl = config.service.host + "funid=sp_catalog&nousercheck=1&pagetype=grid&eventcode=showpic&tablename=sp_catalog&dataType=json&user_id=administrator&keyid=" + goods.sp_id+"&_dc=1565855835928"
      $ajax._post(imgurl,function(obj){
          for(var i in obj.data){
            let url = obj.data[i].url.substr(1, obj.data[i].url.length);
            goods.imgurls.push({ "url": config.service.service + url + "&nousercheck=1" });
          }
        that.setData({
          goods: goods
        })
      },function(){});
    }, function (error) {
      wx.showToast({
        title: '请求失败了!',
        icon: 'none',
        duration: 5000,
        success: function (res) {
          //  同步清理本地缓存
        //  wx.clearStorageSync();
        }
      });
    });
  }
})