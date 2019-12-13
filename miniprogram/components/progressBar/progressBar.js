// components/progressBar/progressBar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 // 当前的秒数
let duration = 0 // 歌曲总的秒数
let isMoving = false // 当前的进度条是否正在拖拽, 解决和timeUpdate冲突
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        showTime: {
            currentTime: '00:00',
            totalTime: '00:00'
        },
        movableDis: 0,
        progress: 0,
    },

    lifetimes: {
        ready() {
            this._getMovableDis()
            this._bindBGMEvent()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onChange(e) {
            console.log(e)
            if (e.detail.source == 'touch') { // 拖动
                this.data.progress = e.detail.x / (movableAreaWidth - movableViewWidth) * 100
                this.data.movableDis = e.detail.x
                isMoving = true
            }
        },
        onTouchEnd() {
            // 设置音频跳到对应的时间(获取到的时候不是拖动后的，是之前的)
            // const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
            // console.log('now:',backgroundAudioManager.currentTime)
            this.setData({
                progress: this.data.progress,
                movableDis: this.data.movableDis,
                // ['showTime.currentTime']: currentTimeFmt.min + ':' + currentTimeFmt.sec
            })
            backgroundAudioManager.seek(duration * this.data.progress / 100)
            isMoving = false
        },
        _getMovableDis() { // 获取进度条宽度
            const query = this.createSelectorQuery()
            query.select('.movable-area').boundingClientRect()
            query.select('.movable-view').boundingClientRect()
            query.exec(rect => {
                movableAreaWidth = rect[0].width
                movableViewWidth = rect[1].width
            })
        },

        _setTime() {
            duration = backgroundAudioManager.duration
            const formatTime = this._dateFormat(duration)
            this.setData({
                ['showTime.totalTime']: `${formatTime.min}:${formatTime.sec}`
            })
        },

        _dateFormat(sec) { // 格式化时间
            const min = Math.floor(sec / 60)
            sec = Math.floor(sec % 60)
            return {
                'min': this._parseZero(min),
                'sec': this._parseZero(sec)
            }
        },

        _parseZero(num) { // 小于10补0
            return num < 10 ? '0' + num : num
        },

        _bindBGMEvent() {
            backgroundAudioManager.onPlay(() => {
                console.log('onPlay')
                isMoving = false
            })
            backgroundAudioManager.onStop(() => {
                console.log('onStop')
            })
            backgroundAudioManager.onPause(() => {
                console.log('onPause')
            })
            backgroundAudioManager.onWaiting(() => {
                console.log('onWaiting')
            })
            backgroundAudioManager.onCanplay(() => {
                console.log('onCanplay')
                if (typeof backgroundAudioManager.duration != 'undefined') {
                    this._setTime()
                } else {
                    setTimeout(() => {
                        this._setTime()
                    }, 1000)
                }
            })
            backgroundAudioManager.onTimeUpdate(() => {
                // console.log('onTimeUpdate')
                if (!isMoving) {
                    const currentTime = backgroundAudioManager.currentTime
                    const duration = backgroundAudioManager.duration
                    const nowSec = currentTime.toString().split('.')[0]
                    // 处理一下，每一秒再去setData，避免1s内多次setdata
                    if (nowSec != currentSec) {
                        const currentFormat = this._dateFormat(currentTime)
                        this.setData({
                            movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
                            progress: currentTime / duration * 100,
                            ['showTime.currentTime']: `${currentFormat.min}:${currentFormat.sec}`
                        })
                        currentSec = nowSec
                    }
                }
            })
            backgroundAudioManager.onEnded(() => {
                console.log('onEnded')
                this.triggerEvent('musicEnd')
            })
            backgroundAudioManager.onError((res) => {
                console.error(res)
                wx.showToast({
                    title: '错误' + res.errCode,
                })
            })
        }
    }
})