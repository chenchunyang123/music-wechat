// pages/blogEdit/blogEdit.js
const MAX_WORDS_LENGTH = 120 // 文字限制
const MAX_IMG_NUM = 9 // 图片选择最多张数
let content = ''    // 输入文字内容
let userInfo = {}   // 用户昵称和头像地址
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        wordsNum: 0, // 输入的文字个数
        footerBottom: 0, // 页底距底部的距离
        imgs: [], // 已经选择的图片
        selectIconShow: true, // 选择图片是否显示
    },

    onInput(e) {
        let wordsNum = e.detail.value.length
        if (wordsNum >= MAX_WORDS_LENGTH) {
            wordsNum = `最大字数为${MAX_WORDS_LENGTH}`
        }
        this.setData({
            wordsNum
        })
        content = e.detail.value
    },

    onFocus(e) {
        this.setData({
            footerBottom: e.detail.height
        })
    },

    onBlur(e) {
        this.setData({
            footerBottom: 0
        })
    },

    onChooseImg() {
        let max = MAX_IMG_NUM - this.data.imgs.length
        wx.chooseImage({
            count: max,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: res => {
                console.log(res.fileID)
                this.setData({
                    imgs: this.data.imgs.concat(res.tempFilePaths)
                })
                max = MAX_IMG_NUM - this.data.imgs.length
                this.setData({
                    selectIconShow: max <= 0 ? false : true
                })
            },
        })
    },

    onDel(e) {
        this.data.imgs.splice(e.target.dataset.index, 1)
        this.setData({
            imgs: this.data.imgs
        })
        if (this.data.imgs.length < MAX_IMG_NUM) {
            this.setData({
                selectIconShow: true
            })
        }
    },

    onViewImg(e) { // 查看图片
        wx.previewImage({
            urls: this.data.imgs,
            current: e.target.dataset.src
        })
    },

    onPublish() {
        // 先判断content为不为空
        if(content.trim() === '') {
            wx.showModal({
                title: '请输入内容',
                content: '',
            })
            return
        }

        wx.showLoading({
            title: '发布中',
        })

        let fileIds = []
        let promiseArr = []
        // 图片上传(这个api只能一张一张上传)
        for (let i = 0; i < this.data.imgs.length; i++) {
            let p = new Promise((resolve, reject) => {
                let item = this.data.imgs[i]
                // 取文件拓展名
                let suffix = /\.\w+$/.exec(item)[0]
                wx.cloud.uploadFile({
                    cloudPath: 'blog/' + Date.now() + '-' + Math.random() + suffix,
                    filePath: item,
                    success: res => {
                        console.log(res)
                        fileIds = fileIds.concat(res.fileID)
                        resolve()
                    },
                    fail: err => {
                        console.error(err)
                        reject()
                    }
                })
            })
            promiseArr.push(p)
        }
        // 存到云数据库中
        Promise.all(promiseArr).then(res => {
            db.collection('blog').add({
                data: {
                    ...userInfo,
                    content,
                    img: fileIds,
                    createTime: db.serverDate(), // 服务端的时间
                }
            }).then(res => {
                wx.hideLoading()
                wx.showToast({
                    title: '发布成功',
                })
                // 返回分享页面，并且刷新
                wx.navigateBack()
            }).catch(err => {
                wx.hideLoading()
                wx.showToast({
                    title: '发布失败',
                })
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        userInfo = options
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})