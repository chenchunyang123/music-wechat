// components/bottomModal/bottomModal.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        modalShow: Boolean
    },

    options: {
        styleIsolation: 'apply-shared',  // 页面的wxss会影响到这个组件，但这个组件的样式不会影响页面
        multipleSlots: true, // 启用多个插槽
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        onClose() {
            this.setData({
                modalShow: false
            })
        }
    }
})
