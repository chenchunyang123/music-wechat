module.exports = date => {
    let fmt = 'yyyy-MM-dd hh:mm:ss'
    const obj = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分钟
        's+': date.getSeconds(), // 秒
    }

    if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, date.getFullYear())
    }
    for (let k in obj) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, obj[k].toString().length === 1 ? '0' + obj[k] : obj[k])
        }
    }

    return fmt
}