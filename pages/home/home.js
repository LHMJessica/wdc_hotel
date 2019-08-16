// pages/home/home.js
var app = getApp()
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
Page({
  data: {
    TabCur: 1,
    scrollLeft: 0,
    bars:[]
  },
  tabSelect(e) {
    var idx = e.currentTarget.dataset.idx;
    this.setData({
      TabCur: idx,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    this.newGoodsShow(idx);
  },
  toshopdetail:function(e){
    var goodid = e.currentTarget.dataset.goodid;
    wx.navigateTo({
      url: '../good/goods?goodid=' + goodid,
    })
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
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this;
    //加载navbar导航条
    that.navbarShow();
    //加载商品信息
    that.newGoodsShow(1);
  },
  /**请求商品分类 */
  navbarShow: function (success) {
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryShopTypes";
    $ajax._post(params, function (res) {
      //console.log(JSON.stringify(res));
      var navbarsdata = [];
      navbarsdata.push({ "type_id": "1", "type_name": '全部', seq: "" });
      for (var i in res.data) {
        navbarsdata.push({ "type_id": res.data[i].type_id, "type_name": res.data[i].type_name, seq: "" });
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
        //  wx.clearStorageSync();
        }
      });
    });
  },
  newGoodsShow: function (type_id) {
    var that = this;
    var newGoodsData = [];
    var params = config.service.host + "funid=app_full&eventcode=qryShopCatalogByType&type_id="+type_id+"&sp_name=sp_name";
    $ajax._post(params, function (res) {
      for (var i in res.data) {
        res.data[i].sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + res.data[i].sp_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
        if(type_id=="1"){//状态为全部
          if (res.data[i].status=="1"){//商品状态为设备商品  首页的全部 仅显示设备上有的商品
            newGoodsData.push(res.data[i]);
          }
        }else{
          newGoodsData.push(res.data[i]);
        }
      }
      //  console.log(JSON.stringify(newGoodsData));   
      that.setData({
        sp_catalogs: newGoodsData
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
  findByName: function (e) {
    var that = this;
    var sp_name = e.detail.value;
    var newGoodsData = [];
    var params = config.service.host + "funid=app_full&eventcode=qryShopCatalogByType&type_id=1&sp_name=" + sp_name;
    $ajax._post(params, function (res) {
      for (var i in res.data) {
        res.data[i].sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + res.data[i].sp_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
        newGoodsData.push(res.data[i]);
      }
      //  console.log(JSON.stringify(newGoodsData));   
      that.setData({
        sp_catalogs: newGoodsData
      })
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