// components/blogCard/blogCard.js
import formatTime from '../../utils/formatTime.js'
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        content: Object
    },

    observers: {
        ['content.createTime'](val) {
            if(val) {
                this.setData({
                    _createTime: formatTime(new Date(val))
                })
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        _createTime: '',
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onPreview(e) {
            const { imgSrc, imgs } = e.target.dataset
            wx.previewImage({
                urls: imgs,
                current: imgSrc
            })
        }
    }
})
