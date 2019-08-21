// pages/home/home.js
const app = getApp();
var utils = require('../../utils/util.js');
var config = require('../../utils/config');
var $ajax = require('../../utils/ajax.js');
var newGoodsData = []; //保存商品数组
Page({
  data: {
    TabCur: 1001,
    ItemCur:10010001,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    CustomBarText: app.globalData.CustomBarText,
    scrollLeft: 0,
    bars: [],
    currpage: 1,
    pagesize: 10,
    gridCol:4,
    sp_name: "sp_name",
    navitems:[],
    hidden:false
  },
  onPullDownRefresh: function() {　　
    console.log('--------下拉刷新-------')　　
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    //加载navbar导航条
    that.navbarShow();
    that.data.currpage=1;
    //加载商品信息
    that.newGoodsShow(that.data.ItemCur, that.data.sp_name);
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    that.data.currpage++;
    // that.newGoodsShow(that.data.TabCur, that.data.sp_name);
  },
  tabSelect(e) {
    var idx = e.currentTarget.dataset.idx;
    this.data.currpage = 1;
    this.setData({
      TabCur: idx,
      scrollLeft: (e.currentTarget.dataset.idx - 1) * 60,
      hidden: true
    })
    this.qrytypeitem(idx);
  },
  tabItemSelect(e) {
    var idx = e.currentTarget.dataset.idx;
    this.data.currpage = 1;
    this.setData({
      ItemCur: idx,
      scrollLeft: (e.currentTarget.dataset.idx - 1) * 60,
      hidden: false
    })
    newGoodsData = [];
    this.newGoodsShow(idx, "sp_name");
  },
  toshopdetail: function(e) {
    var goodid = e.currentTarget.dataset.goodid;
    wx.navigateTo({
      url: '../good/goods?goodid=' + goodid,
    })
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
    } else {
      wx.redirectTo({
        url: '../owner/login/login'
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //加载navbar导航条
    that.navbarShow();
    //加载商品信息
    that.newGoodsShow(that.data.ItemCur, "sp_name");
  },
  /**请求商品分类 */
  navbarShow: function(success) {
    var that = this;
    var params = config.service.host+"funid=queryevent&eventcode=query_data&query_funid=shop_type&limit=50&start=0&where_sql=shop_type.type_level = 1&user_id=admin";
    $ajax._post(params, function(res) {
      //console.log(JSON.stringify(res));
      var navbarsdata = [];
      for (var i in res.data.root) {
        navbarsdata.push({
          "type_id": res.data.root[i].shop_type__type_id,
          "type_name": res.data.root[i].shop_type__type_name,
          seq: ""
        });
      }
      that.setData({
        bars: navbarsdata,
        TabCur: navbarsdata[0].type_id
      })
      that.qrytypeitem(that.data.TabCur);
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
  },
  newGoodsShow: function (type_id, sp_name) {
    var that = this;
    newGoodsData = []; 
    var params = config.service.host + "funid=app_full&eventcode=qryShopCatalogByType&type_id=" + type_id + "&sp_name="+sp_name+"&currpage=" + that.data.currpage + "&pagesize=" + that.data.pagesize;
    $ajax._post(params, function(res) {
      if (res.data.length == 0) {
        wx.showToast({
          title: '没有更多的数据了',
          icon:"none"
        })
      } else {
        for (var i in res.data) {
          res.data[i].sp_img = config.service.host + "funid=sys_attach&pagetype=editgrid&eventcode=fdown&attach_field=sp_img&dataid=" + res.data[i].sp_id + "&table_name=sp_catalog&datafunid=sp_catalog&dataType=byte&nousercheck=1&dc=1556729137482";
          if (type_id == "1") { //状态为全部
            if (res.data[i].status == "1") { //商品状态为设备商品  首页的全部 仅显示设备上有的商品
              newGoodsData.push(res.data[i]);
            }
          } else {
            newGoodsData.push(res.data[i]);
          }
        }
      }
      //  console.log(JSON.stringify(newGoodsData));   
      that.setData({
        sp_catalogs: newGoodsData
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
  qrytypeitem:function(type_id){
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryShopTypes&type_id=" + type_id +"";
    $ajax._post(params, function (res) {
     // console.log(JSON.stringify(res));
     // console.log(res);
      var navitems = [];
      for (var i in res.data) {
        navitems.push({
          "type_id": res.data[i].type_id,
          "type_name": res.data[i].type_name,
          seq: ""
        });
      }
      that.setData({
        navitems: navitems,
        ItemCur: navitems[0].type_id
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