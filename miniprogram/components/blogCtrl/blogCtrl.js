// components/blogCtrl/blogCtrl.js
let userInfo = {} // 当前使用者的用户信息
const db = wx.cloud.database()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        blogId: String,
        blog: Object
    },

    externalClasses: [
        'iconfont',
        'icon-pinglun',
        'icon-fenxiang'
    ],

    /**
     * 组件的初始数据
     */
    data: {
        loginShow: false, // 获取授权组件是否显示
        modalShow: false, // 显示评论底部组件
        content: '',
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onComment() { // 评论
            // 先判断是否授权
            wx.getSetting({
                success: res => {
                    if(res.authSetting['scope.userInfo']) {
                        wx.getUserInfo({
                            success: res => {
                                userInfo = res.userInfo
                                // 显示评论的弹出层
                                this.setData({
                                    modalShow: true
                                })
                            }
                        })
                    } else {
                        this.setData({
                            loginShow: true,
                        })
                    }
                }
            })
        },
        authorizeSuccess(e) {
            userInfo = e.detail
            this.setData({
                loginShow: false,
            }, () => {
                this.setData({
                    modalShow: true
                })
            })
        },
        authorizeFail() {
            wx.showModal({
                title: '授权用户才能评价',
                content: '',
            })
        },
        onInput(e) {
            this.setData({
                content: e.detail.value
            })
        },
        onSend() {
            // 插入数据库
            let content = this.data.content
            if(content.trim() === '') {
                wx.showModal({
                    title: '评论内容不能为空',
                    content: '',
                })
                return
            }
            wx.showLoading({
                title: '提交中',
                mask: true
            })
            db.collection('comment').add({
                data: {
                    content,
                    createTime: db.serverDate(),
                    blogId: this.properties.blogId,
                    nickName: userInfo.nickName,
                    avatarUrl: userInfo.avatarUrl
                }
            }).then(res => {
                wx.hideLoading()
                wx.showToast({
                    title: '评论成功',
                })
                this.setData({
                    modalShow: false,
                    content: ''
                })
                // 评论后父元素刷新页面
                this.triggerEvent('refreshCommentList')
            })
        }
    }
})
