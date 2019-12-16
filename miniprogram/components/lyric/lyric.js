// components/lyric/lyric.js
let lyricHeight = 0 // 歌词高度
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isLyricShow: {
            type: Boolean,
            value: false
        },
        lyric: String,
    },

    observers: {
        lyric(lyric) {
            if (lyric === '暂无歌词') {
                this.setData({
                    lrcList: [
                        {
                            time: 0,
                            lrc: lyric
                        }
                    ],
                    nowLyricIndex: -1
                })
            }
            this._parseLyric(lyric)
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        lrcList: [],
        nowLyricIndex: 0, // 当前歌词对应的索引
        scrollTop: 0, // 滚动条滚动的高度
    },

    lifetimes: {
        ready() {
            // 歌词间最小高度的单位为rpx，这里设置scrollTop只能用px，所以要处理换算
            // 750rpx
            wx.getSystemInfo({
                success: function(res) {
                    // res.screenWidth / 750 求出1rpx等于多少px
                    lyricHeight = res.screenWidth / 750 * 64
                },
            })
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        update(currentTime) { // 传递来的方法
            let lrcList = this.data.lrcList
            let lrcLength = lrcList.length
            if (lrcLength === 0) {
                return
            }
            // --- 处理拉到歌曲最后没有歌词部分，歌词不跳到最后一句的bug ---
            if (currentTime > lrcList[lrcLength - 1].time) {
                if(this.data.nowLyricIndex != -1) {
                    this.setData({
                        nowLyricIndex: -1,
                        scrollTop: lrcLength * lyricHeight
                    })
                }
            }
            // --- end ---
            for (let i = 0; i < lrcLength; i++) {
                if (currentTime <= lrcList[i].time) {
                    this.setData({
                        nowLyricIndex: i - 1,  // 高亮的是上一个
                        scrollTop: (i - 1) * lyricHeight,
                    })
                    break
                }
            }
        },
        _parseLyric(lyric) {
            let lrcArr = [] // 定义一个空数组接收格式化对象
            let line = lyric.split('\n')
            line.forEach(item => {
                let time = item.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
                if(time !== null) {
                    let lrc = item.split(time[0])[1]
                    let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)  // 取出分钟和秒
                    let timeToSec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg) / 1000
                    lrcArr.push({
                        lrc,
                        time: Math.floor(timeToSec)
                    })
                }
            })
            this.setData({
                lrcList: lrcArr
            })
        }
    }
})
