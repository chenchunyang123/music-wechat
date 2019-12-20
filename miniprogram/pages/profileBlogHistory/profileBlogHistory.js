// pages/profileBlogHistory/profileBlogHistory.js
const MAX_LIMIT = 10
Page({

    /**
     * 页面的初始数据
     */
    data: {
        blogList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this._getMyBlogList()
    },

    goComment(e) {
        wx.navigateTo({
            url: `../../pages/blogComment/blogComment?blogId=${e.target.dataset.blogid}`,
        })
    },

    _getMyBlogList() {
        wx.showLoading({
            title: '加载中',
        })
        wx.cloud.callFunction({
            name: 'blog',
            data: {
                $url: 'getListByOpenId',
                start: this.data.blogList.length,
                count: MAX_LIMIT
            }
        }).then(res => {
            this.setData({
                blogList: this.data.blogList.concat(res.result)
            })
            wx.hideLoading()
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this._getMyBlogList()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
        console.log(e)
        const blogObj = e.target.dataset.blog
        return {
            title: blogObj.content,
            path: `/pages/blogComment/blogComment?blogId=${blogObj._id}`,
        }
    }
})