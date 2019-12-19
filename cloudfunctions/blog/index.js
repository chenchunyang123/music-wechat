// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()

const blogCollection = db.collection('blog')
const commentCollection = db.collection('comment')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {

    const app = new TcbRouter({
        event
    })

    // 列表
    app.router('list', async(ctx, next) => {
        const keywords = event.keywords
        let obj = {}
        if (keywords.trim() !== '') {
            obj = {
                content: db.RegExp({
                    regexp: keywords,
                    options: 'i'
                })
            }
        }
        let blogList = await blogCollection
            .where(obj)
            .skip(event.start)
            .limit(event.count)
            .orderBy('createTime', 'desc')
            .get()
            .then(res => {
                return res.data
            })
        ctx.body = blogList
    })

    // 详情
    app.router('detail', async(ctx, next) => {
        let blogId = event.blogId
        let detail = await blogCollection.where({
            _id: blogId
        }).get().then(res => {
            return res.data
        })

        // 评论查询
        const countResult = await commentCollection.count()
        const total = countResult.total
        let commentList = {
            data: []
        }
        const task = []
        if(total > 0) {
            const batchTimes = Math.ceil(total / MAX_LIMIT)
            for (let i = 0; i < batchTimes; i++) {
                let promise = commentCollection.skip(i * MAX_LIMIT).where({
                    blogId
                }).orderBy('createTime', 'desc').get()
                task.push(promise)
            }
        }
        if (task.length > 0) {
            commentList = (await Promise.all(task)).reduce((acc, cur) => {
                return {
                    data: acc.data.concat(cur.data)
                }
            })
        }

        ctx.body = {
            commentList,
            detail
        }
    })

    return app.serve()
}