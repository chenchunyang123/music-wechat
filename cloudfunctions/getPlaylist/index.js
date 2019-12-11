// 云函数入口文件
const cloud = require('wx-server-sdk')

// 云函数初始化
cloud.init()

// 云数据库初始化
const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

// 云函数入口函数
exports.main = async(event, context) => {
    const list = await playlistCollection.get() // 数据库拿数据
    console.log(list)

    const playlist = await rp(URL).then(res => { // 获取歌单数据
        return JSON.parse(res).result
    })

    const newData = [] // 要插入的数据集合
    for (let i = 0; i < playlist.length; i++) { // 循环对比数据，不重复的才插入
        let flag = true
        for (let j = 0; j < list.data.length; j++) {
            if(playlist[i].id === list.data[j].id) {
                flag = false
                break
            }
        }
        if (flag) {
            newData.push(playlist[i])
        }
    }

    for (let i = 0; i < playlist.length; i++) { // 循环插入数据
        await playlistCollection.add({
            data: {
                ...playlist[i],
                createTime: db.serverDate(),
            }        
        }).then(res => {
            console.log('插入成功')
        }).catch(err => {
            console.error('插入失败')
        })
    }

    return newData.length
}