// pages/player/player.js
let musiclist = [] // 不在页面渲染的值就不放在data里面,逻辑判断的值放在外面就可以
let nowPlayingIndex = 0
const backgroundAudioManager = wx.getBackgroundAudioManager() // 获取全局唯一的背景音频管理器
Page({
    data: {
        picUrl: '',
        isPlaying: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        nowPlayingIndex = options.index
        musiclist = wx.getStorageSync('musiclist')
        this._loadMusicDetail(options.musicId)
    },

    togglePlaying() { // 切换播放暂定
        if (this.data.isPlaying) {
            backgroundAudioManager.pause()
        } else {
            backgroundAudioManager.play()
        }
        this.setData({
            isPlaying: !this.data.isPlaying
        })
    },

    onPrev() { // 上一首
        nowPlayingIndex--
        if (nowPlayingIndex < 0) {
            nowPlayingIndex = musiclist.length - 1
        }
        this._loadMusicDetail(musiclist[nowPlayingIndex].id)
    },

    onNext() { // 下一首
        nowPlayingIndex++
        if (nowPlayingIndex === musiclist.length) {
            nowPlayingIndex = 0
        }
        this._loadMusicDetail(musiclist[nowPlayingIndex].id)
    },

    _loadMusicDetail(musicId) { // 读取歌曲详情并播放
        backgroundAudioManager.stop()
        let music = musiclist[nowPlayingIndex]
        wx.setNavigationBarTitle({
            title: music.name
        })
        this.setData({
            picUrl: music.al.picUrl,
            isPlaying: false
        })
        wx.showLoading({
            title: '歌曲加载中',
        })
        wx.cloud.callFunction({
            name: 'music',
            data: {
                musicId,
                $url: 'musicUrl',
            }
        }).then(res => {
            let result = JSON.parse(res.result)
            console.log(result)
            backgroundAudioManager.src = result.data[0].url
            backgroundAudioManager.title = music.name
            backgroundAudioManager.coverImgUrl = music.al.picUrl
            backgroundAudioManager.singer = music.ar[0].name
            backgroundAudioManager.epname = music.al.name

            this.setData({
                isPlaying: true
            })
            wx.hideLoading()
        })
    }
})