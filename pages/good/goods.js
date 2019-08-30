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
    load: true,
    floorstatus: false,
    goods: null
  },
  onLoad: function(options) {
    let list = [{
      "name": "商品",
      "id": "0"
    }, {
      "name": "详情",
      "id": "1"
    }, {
      "name": "评价",
      "id": "2"
    }];
    this.setData({
      list: list,
      listCur: list[0]
    })
    if (options.goodid != undefined && options.goodid != null && options.goodid != "") {
      var goodid = options.goodid;
      this.goodsInfoShow(goodid);
      this.qryDetailImage(goodid);
      this.qryComment(goodid);
    }
    
  },
  //预览图片
  previewImage: function(e) {
    var current = e.target.dataset.src;
    var goodsimg = this.data.goods.imgurls;
    console.log(JSON.stringify(goodsimg));
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: goodsimg // 需要预览的图片http链接列表  
    })
  },
  showModal(e) {
    this.calcPrice();
    this.setData({
      modalName: "bottomModal"
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
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
          tabHeight = data.height + tabHeight;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop;
    if (scrollTop > 50) {
      that.setData({
        floorstatus: true
      });
    } else {
      that.setData({
        floorstatus: false
      });
    }
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          scrollLeft: (list[i].id - 1) * 60,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  toaffirmorder: function() {
    var user = wx.getStorageSync("user");
    if (user) {
      this.calcPrice();
      wx.setStorageSync("goods", this.data.goods);
      wx.navigateTo({
        url: '../order/affirm/affirm',
      })
    } else {
      wx.navigateTo({
        url: '../owner/login/login',
      })
    }
  },
  calcPrice: function() {
    this.data.goods.totalMoney = (this.data.goods.dollar_price * this.data.goods.count).toFixed(2);
    this.data.goods.totalRMoney = (this.data.goods.sale_price * this.data.goods.count).toFixed(2);
    let discount = (this.data.goods.discount < 1 ? (1 - this.data.goods.discount) : 0);
    this.data.goods.reduced = (this.data.goods.sale_price * this.data.goods.count * discount).toFixed(2);
    this.data.goods.money = (this.data.goods.totalRMoney - this.data.goods.reduced).toFixed(2);
    this.setData({
      goods: this.data.goods
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
    this.calcPrice();
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
    this.calcPrice();
  },
  addcart: function() {
    var user = wx.getStorageSync("user");
    if (user) {
      let that = this;
      wx.request({
        url: config.service.host,
        'content-type': 'application/json',
        method: 'GET',
        data: {
          'funid': 'app_full',
          'eventcode': 'upCart',
          'sp_code': that.data.comment.order_id,
          'sp_name': that.data.comment.order_code,
          'sp_size': that.data.comment.comment_star,
          'sp_unit': that.data.comment.account_name,
          'sale_price': that.data.comment.account_img,
          'account_code': that.data.comment.account_code,
          'sp_code': that.data.comment.sp_code,
          'sp_name': that.data.comment.sp_name,
          'sp_id': that.data.comment.sp_id,
          'parent_id': that.data.comment.sp_id,
          'content': that.data.comment.content
        },
        success: function(res) {
          if (res.statusCode == 200) {
            wx.showToast({
              title: '您的评论已提交',
              icon: 'none',
              duration: 1000,
              success: function(res) {
                wx.navigateBack({
                  delta: 1
                });
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
    } else {
      wx.navigateTo({
        url: '../owner/login/login',
      })
    }
  },
  goodsInfoShow: function(goodid) {
    var that = this;
    var params = config.service.host + "funid=app_full&eventcode=qryCatalogByID&sp_id=" + goodid;
    $ajax._post(params, function(res) {
      if(res.data!=undefined&& res.data!=null){
        let goods = res.data;
        goods.imgurls = [];
        let imgurl = config.service.host + "funid=queryevent&eventcode=query_data&query_funid=sys_attach&limit=50&start=0&where_sql=sys_attach.data_id='"+goods.sp_id+"'&user_id=admin";
        $ajax._post(imgurl, function (obj) {
          if (obj.data != undefined && obj.data != "" && obj.data != null) {
            for (var i in obj.data.root) {
              goods.imgurls.push({
                "url": obj.data.root[i].sys_attach__attach_name
              });
            }
          }
          goods.count = 1;
          that.setData({
            goods: goods
          })
        }, function () { });
      }
    }, function(error) {
      wx.showToast({
        title: '网络异常!',
        icon: 'none',
        duration: 5000,
        success: function(res) {
          //  同步清理本地缓存
          //  wx.clearStorageSync();
        }
      });
    });
  },
  qryDetailImage: function(goodid) {
    let that = this;
    var params = config.service.host + "funid=queryevent&eventcode=query_data&query_funid=sp_details&limit=50&start=0&user_id=admin&where_sql=sp_details.sp_id='" + goodid + "'";
    $ajax._post(params, function(res) {
      //  console.log(params);
      // console.log(res);
      let details = [];
      if (res.data != undefined && res.data != "") {
        for (let i in res.data.root) {
          details.push({
            img_path: res.data.root[i].sp_details__img_path
          });
        }
        console.log(details);
      }
      that.setData({
        details: details
      });
      //  console.log(details);
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
  qryComment: function(goodid) {
    let that = this;
    var params = config.service.host + "funid=queryevent&eventcode=query_data&query_funid=sp_comment&limit=1&start=0&user_id=admin&where_sql=sp_comment.sp_id='" + goodid + "'";
    $ajax._post(params, function(res) {
      // console.log(res);

      let comments = [];
      if (res.data != undefined && res.data != "") {
        for (let i in res.data.root) {
          res.data.root[i].sp_comment__comment_star = parseInt(res.data.root[i].sp_comment__comment_star);
        }
        comments = res.data.root;
      }
      that.setData({
        comments: comments
      });
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