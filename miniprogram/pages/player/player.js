// pages/player/player.js
let musiclist = [] // 不在页面渲染的值就不放在data里面,逻辑判断的值放在外面就可以
let nowPlayingIndex = 0 // 正在播放的音乐在列表中的索引值
const backgroundAudioManager = wx.getBackgroundAudioManager() // 获取全局唯一的背景音频管理器
const app = getApp()
Page({
    data: {
        picUrl: '',
        isPlaying: false,
        isLyricShow: false,
        lyric: '', // 歌词
        isSame: false, // 点击列表的音乐是不是正在播放的
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        nowPlayingIndex = options.index
        musiclist = wx.getStorageSync('musiclist')
        this._loadMusicDetail(options.musicId)
    },

    onPlay() {
        this.setData({
            isPlaying: true
        })
    },

    onPause() {
        this.setData({
            isPlaying: false
        })
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

    onChangeLyricShow() { // 显示隐藏歌词
        this.setData({
            isLyricShow: !this.data.isLyricShow
        })
    },

    timeUpdate(event) {
        this.selectComponent('.lyric').update(event.detail.currentTime)
    },

    _loadMusicDetail(musicId) { // 读取歌曲详情并播放
        // --- 判断是不是同一首歌曲 ---
        if (musicId === app.getPlayingMusicId()) {
            this.setData({
                isSame: true
            })
        } else {
            this.setData({
                isSame: false
            })
        }
        // --- end ---
        if (!this.data.isSame) {
            backgroundAudioManager.stop()
        }
        let music = musiclist[nowPlayingIndex]
        wx.setNavigationBarTitle({
            title: music.name
        })
        this.setData({
            picUrl: music.al.picUrl,
            isPlaying: false
        })

        // 设置全局的当前播放歌曲的id
        app.setPlayingMusicId(musicId)

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
            if (result.data[0].url === null) {
                // 歌单为vip可播放的
                wx.showToast({
                    title: '无权限播放',
                })
                return
            }
            console.log(result)
            if (!this.data.isSame) {
                backgroundAudioManager.src = result.data[0].url
                backgroundAudioManager.title = music.name
                backgroundAudioManager.coverImgUrl = music.al.picUrl
                backgroundAudioManager.singer = music.ar[0].name
                backgroundAudioManager.epname = music.al.name
            }

            this.setData({
                isPlaying: true
            })
            wx.hideLoading()

            // 加载歌词
            wx.cloud.callFunction({
                name: 'music',
                data: {
                    musicId,
                    $url: 'lyric'
                }
            }).then(res => {
                let lyric = '暂无歌词'
                const lrc = JSON.parse(res.result).lrc
                if (lrc) {
                    lyric = lrc.lyric
                }
                this.setData({
                    lyric
                })
            })
        })
    }
})