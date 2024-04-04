const replacer = function(content , stats, account, monitoringVal) {
    const replaceMatrix = [
        {from: '%id_user' , to: stats[0]._attributes.id_user},
        {from: '%send' , to: stats.reduce((sum, item) => sum += +item._attributes.send, 0)},
        {from: '%deliver' , to:stats.reduce((sum, item) => sum += +item._attributes.deliver, 0)},
        {from: '%p_deliver' , to: Math.round(stats.reduce((sum, item) => sum += +item._attributes.deliver_p, 0))},
        {from: '%read' , to: stats.reduce((sum, item) => sum += +item._attributes.read, 0)},
        {from: '%p_read' , to: Math.round(stats.reduce((sum, item) => sum += +item._attributes.read_p, 0))},
        {from: '%not_deliver' , to: stats.reduce((sum, item) => sum += +item._attributes.not_deliver, 0)},
        {from: '%expired' , to: stats.reduce((sum, item) => sum += +item._attributes.expired, 0)},
        {from: '%partly_deliver' , to: stats.reduce((sum, item) => sum += +item._attributes.partly_deliver, 0)},
        {from: '%monitoring_param' , to: account.ParametrString.split(' ')[0]},
        {from: '%monitoring_value' , to: monitoringVal},
        {from: '%expected_value' , to: account.ParametrString.split(' ')[2]},
        {from: '%MCC' , to: account.MCC},
        {from: '%MNC' , to: account.MNC},
        {from: '%SID' , to: account.SIDs},
        {from: '%operator' , to: account.MNC_text},
        {from: '%country' , to: account.MCC_text},
        {from: '%period' , to: 'За период'},
    ]
    //Replace into content string
    replaceMatrix.forEach(item => {
        content = content.replace(new RegExp(item.from,"g"), item.to)
    })

    return content
}

module.exports = { replacer }