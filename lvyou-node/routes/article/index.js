
//专门处理文章内容的一个方法

const router = require('@koa/router')()
const {
    modelArticle, 
    modelUser,//获取uid
    modelLike,
    modelCollection,  //收藏表
    modelComment,  //评论表
    modelConcern  //关注表
} = require('@/models/collection')
const {
    Articlekeyword,//关键词
    Articlepblish, //发布游记——图片
    ArticlepblishVideo,  //发布游记——视频
    CompanionDetails,
    Comment,
    Commentget,
    Userconcern,
    Resreturn
} = require('@/config/valiData')
const { Auth } = require('@/token/auth')
const { Authuid } = require('@/token/auth_uid')
// 百度ai关键词提取
const aiKeyword = require('@/aikeyword/index')
const moment = require('moment')
moment.locale('zh-cn')
// 计算图片宽高
const imageInfor = require('@/config/image-info')
const mongoose = require('mongoose')
const { looKup, looKupConcern } = require('@/config/lookup')
moment.updateLocale('zh-cn', {
    relativeTime: {
        future: '%s内',
        past: '%s前',
        s: '刚刚',
        ss: '%d秒前',
        m: '1分钟',
        mm: '%d分钟',
        h: '1小时',
        hh: '%d小时',
        d: '1天',
        dd: '%d天',
        w: '1周',
        ww: '%d周',
        M: '1个月',
        MM: '%d个月',
        y: '1年',
        yy: '%d年'
    },
});


// 分析游记关键词
router.post('/article-keyword', async ctx => {

  const { text } = ctx.request.body
  Articlekeyword(text)
  if (text.trim() == '') {//空格
      ctx.send('SUCCESS', 200, [])
      return false
  }
  const res = await aiKeyword(text)
  console.log(res);
  const aitext = res.map((item => { return item.word }))
  const newarr = ['摄影', '自驾', '自由行', '徒步', ...aitext]
  ctx.send('SUCCESS', 200, newarr)
})

//发布游记:图片类型new Auth().m,
router.post('/article-publish',new Auth().m,  async ctx => {//加这个new Auth().m  为了表示，只有登陆后才能进行发布
  const { title, content, image, city, address, province, tag } = ctx.request.body
  //校验
  Articlepblish(title, content, image, city, address, province, tag)
  //封面图位图片数组的第一张，需先得到图片的宽高
  // imageInfor('https://c-ssl.duitang.com/uploads/blog/202101/04/20210104105957_b8a4d.thumb.1000_0.jpeg')

  //获取封面图的宽高
  const imageUrl = await imageInfor(image[0])
  const userUid = await modelUser.find({uid:ctx.auth.uid},{_id:true}).lean()//lean()转化为js的普通字符串
  const saveRes = await modelArticle.create({
        author_uid: ctx.auth.uid,
        author_id: userUid[0]._id,
        title, content,
        cover_image: {//封面图
            url: image[0],
            width: imageUrl.width,
            height: imageUrl.height
        },
        image, city, address, province
  })
  console.log(saveRes);
  //tag标签可能重复，所以我们去重
  await modelArticle.findOneAndUpdate({_id:saveRes._id},{'$addToSet':{tag:{'$each':tag}}})
  ctx.send()
  //更新用户感兴趣的标签
  await modelUser.findOneAndUpdate({ _id: userUid[0]._id },{ '$addToSet': { my_tags: { '$each': tag } } })
})



// 发布游记:视频类型new Auth().m,
router.post('/article-publish-Video', new Auth().m, async ctx => {
  const { title, content, city, address, province,
      tag, videoPoster, videoUrl, videoWidth, videoHeight } = ctx.request.body
  //校验
  ArticlepblishVideo(title, content, city, address, province,
      tag, videoPoster, videoUrl, videoWidth, videoHeight)
  // 获取封面图的宽高
  const imageUrl = await imageInfor(videoPoster)
  const userUid = await modelUser.find({ uid: ctx.auth.uid }, { _id: true }).lean()
  const saveRes = await modelArticle.create({
      author_uid: ctx.auth.uid,
      author_id: userUid[0]._id,
      title, content,
      cover_image: {
          url: videoPoster,
          width: imageUrl.width,
          height: imageUrl.height
      },
      city, address, province,
      videoUrl: {
          url: videoUrl,
          width: videoWidth,
          height: videoHeight
      },
      fileType: 'video'
  })
  await modelArticle.findOneAndUpdate({ _id: saveRes._id },
      { '$addToSet': { tag: { '$each': tag } } })
  ctx.send()
  // 更新用户标签
  await modelUser.findOneAndUpdate({ _id: userUid[0]._id },
      { '$addToSet': { my_tags: { '$each': tag } } })
})


//用户给游记点赞
router.get('/user-like', new Auth().m, async ctx => {
    const { article_id } = ctx.query   //前端传一个游记的-id就够了
    // console.log(ctx);
    //校验
    CompanionDetails(article_id)
    // 查询是否点过赞
    const exist = await modelLike.find(
        { article_id, user_uid: ctx.auth.uid })//用户的uid只要登录就能看到user_uid: ctx.auth.uid
    if (exist.length <= 0) {//小于0,表示没有点赞,这时,你才能给作品点赞
        // 查询游记表的作者uid
        const authorUid = await modelArticle.find(
            { _id: article_id }, { author_uid: true }).lean()    //根据游记的id去查询,查询后返回作者的id
        // 查询用户表的uid
        const userUid = await modelUser.find(
            { uid: ctx.auth.uid }, { _id: true }).lean()
        await modelLike.create({
            user_uid: ctx.auth.uid,
            author_uid: authorUid[0].author_uid,
            user_id: userUid[0]._id,
            article_id
        })
        ctx.send()
        // 用户对该篇游记感兴趣，那就更新用户标签
        const tagData = await modelArticle.find({ _id: article_id },  //查到这篇游记的标签
            { tag: true }
        )
        // 更新用户标签
        await modelUser.findOneAndUpdate({ uid: ctx.auth.uid },
            { '$addToSet': { my_tags: { '$each': tagData[0].tag } } })
    } else {
        ctx.send()
    }
})

// 取消点赞
router.get('/cancel-like', new Auth().m, async ctx => {
    const { article_id } = ctx.query
    CompanionDetails(article_id)
    const res = await modelLike.deleteMany(
        { user_uid: ctx.auth.uid, article_id })
    if (res.deletedCount > 0) {
        ctx.send()
    } else {
        ctx.send('取消点赞失败', 422)
    }
})



// 用户收藏游记
router.get('/collect-travel', new Auth().m, async ctx => {
    const { article_id } = ctx.query
    CompanionDetails(article_id)
    // 查询是否收藏过
    const exist = await modelCollection.find(
        { article_id, user_uid: ctx.auth.uid })
    if (exist.length <= 0) {
        // 查询游记表的作者uid
        const authorUid = await modelArticle.find(
            { _id: article_id }, { author_uid: true }).lean()
        // 查询用户表的uid
        const userUid = await modelUser.find(
            { uid: ctx.auth.uid }, { _id: true }).lean()
        await modelCollection.create({
            user_uid: ctx.auth.uid,
            author_uid: authorUid[0].author_uid,
            user_id: userUid[0]._id,
            article_id
        })
        ctx.send()
        // 用户对该篇游记感兴趣，那就更新用户标签
        const tagData = await modelArticle.find({ _id: article_id },
            { tag: true }
        )
        // 更新用户标签
        await modelUser.findOneAndUpdate({ uid: ctx.auth.uid },
            { '$addToSet': { my_tags: { '$each': tagData[0].tag } } })
    } else {
        ctx.send()
    }
})

// 取消收藏
router.get('/cancel-collection', new Auth().m, async ctx => {
    const { article_id } = ctx.query
    CompanionDetails(article_id)
    const res = await modelCollection.deleteMany(
        { user_uid: ctx.auth.uid, article_id })
    if (res.deletedCount > 0) {
        ctx.send()
    } else {
        ctx.send('取消收藏失败', 422)
    }
})


// 用户评论游记
router.post('/comment-travel', new Auth().m, async ctx => {
    const { article_id, comment_content } = ctx.request.body
    Comment(article_id, comment_content)
    // 查询游记表的作者uid
    const authorUid = await modelArticle.find(
        { _id: article_id }, { author_uid: true }).lean()
    // 查询用户表的uid
    const userUid = await modelUser.find(
        { uid: ctx.auth.uid }).lean()
    const res = await modelComment.create({
        user_uid: ctx.auth.uid,
        author_uid: authorUid[0].author_uid,
        user_id: userUid[0]._id,
        article_id,
        content: comment_content
    })
    const resObj = {
        _id: res._id,
        article_id,
        content: comment_content,
        time: res.time,
        user_uid: ctx.auth.uid,
        comment_user: [{
            avatarUrl: userUid[0].avatarUrl,
            nickname: userUid[0].nickname
        }],
        isComment_user: true
    }
    ctx.send('SUCCESS', 200, resObj)
})

// 删除评论
router.get('/comments-delete', new Auth().m, async ctx => {
    const { comment_id } = ctx.query
    CompanionDetails(comment_id)
    // 判断是否是该用户的评论
    const res = await modelComment.find(
        { _id: comment_id, user_uid: ctx.auth.uid })
    if (res.length <= 0) {
        ctx.send('SUCCESS', 422, { message: '评论不存在或者不能删除别人的评论' })
        return false
    }
    await modelComment.findByIdAndDelete({ _id: comment_id })
    ctx.send()
})


// 获取游记的评论数据：需要考虑用户在登录的情况下是可以删除评论的
router.get('/comments-data', new Authuid().m, async ctx => {
    const { article_id, page } = ctx.query
    Commentget(article_id, page)
    const myUid = ctx.auth.uid ? ctx.auth.uid : 'm1'
    const res = await modelComment.aggregate([
        { $match: { article_id: new mongoose.Types.ObjectId(article_id) } },
        { $sort: { time: -1 } },
        { $skip: (page - 1) * 7 },
        { $limit: 7 },
        {
            $lookup: {//连接用户表
                from: modelUser.collection.name,
                localField: 'user_uid',
                foreignField: 'uid',
                as: 'comment_user'
            }
        },
        {
            $project: {//将字段输出给前端
                "_id": 1,
                "article_id": 1,
                "content": 1,
                "time": 1,
                "user_uid": 1,
                "comment_user.nickname": 1,
                "comment_user.avatarUrl": 1,
                "isComment_user": {//如果这条评论是自己发布的，那就为true  ，能删，
                    $cond: {//类似js的三元表达式
                        if: { $eq: ['$user_uid', myUid] },   //$user_uid和myUid进行比较
                        then: true,
                        else: false
                    }
                }
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})


// 关注接口
router.get('/follow-author', new Auth().m, async ctx => {
    const { im_concerned_uid } = ctx.query  //传入作者的uid
    //校验
    Userconcern(im_concerned_uid)
    // 不能关注自己
    if (im_concerned_uid === ctx.auth.uid) { //作者的uid和自己的uid相比较   //ctx.auth = {uid: authcode.uid}     authcode = jwt.verify(token.name, secretkey)
        ctx.send('你不能关注自己', 422)
        return false
    }
    // 是否已经关注过
    const exist = await modelConcern.find({
        user_uid: ctx.auth.uid,
        im_concerned_uid
    })
    if (exist.length <= 0) {
        await modelConcern.create({
            user_uid: ctx.auth.uid,
            im_concerned_uid
        })
        ctx.send()
    } else {
        ctx.send()
    }
})

// 取消关注
router.get('/unfollow-author', new Auth().m, async ctx => {
    const { im_concerned_uid } = ctx.query
    Userconcern(im_concerned_uid)
    await modelConcern.deleteMany({
        user_uid: ctx.auth.uid,
        im_concerned_uid
    })
    ctx.send()
})


// 进入游记详情页：多表联查         （因为在详情页就需要我们看到点赞数，评论数，收藏数，要是点过赞了那也就能看到红心）
router.get('/article-data', new Authuid().m, async ctx => {
    const { article_id } = ctx.query
    CompanionDetails(article_id)
    const myUid = ctx.auth.uid ? ctx.auth.uid : 'm1'
    const res = await modelArticle.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(article_id) } },
        looKup().model_user,//连接用户表
        looKup().model_like,//连接点赞表
        looKup().model_collect,//连接收藏表
        looKup().model_comment,//连接评论表
        {
            $lookup: {//关注表，用于判断某用户是否关注某作者
                from: modelConcern.collection.name,
                localField: 'author_uid',
                foreignField: 'im_concerned_uid',
                as: 'concernedUsers'
            }
        },
        {
            $project: {
                "_id": 1,
                "author_id": 1,
                "title": 1,
                "content": 1,
                "image": 1,
                "videoUrl": 1,
                "city": 1,
                "address": 1,
                "time": 1,
                "likes": { $size: '$likes' },//计算点赞数量
                "comments": { $size: '$comments' },//计算评论数量
                "collections": { $size: '$collections' },//计算收藏数量
                "author_data._id": 1,
                "author_data.avatarUrl": 1,
                "author_data.nickname": 1,
                "author_data.uid": 1,
                "isLike": {
                    // 判断是否点过赞
                    // $in操作符用于匹配两个值是否相等，如果相等，返回true，否则false
                    $in: [myUid, "$likes.user_uid"]
                },
                "isCollecTions": {
                    // 判断是否已收藏过
                    // $in操作符用于匹配两个值是否相等，如果相等，返回true，否则false
                    $in: [myUid, "$collections.user_uid"]
                },
                "isConcerned": {
                    // 判断是否已关注过该作者
                    // $in操作符用于匹配两个值是否相等，如果相等，返回true，否则false
                    $in: [myUid, "$concernedUsers.user_uid"]
                }
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})

// 进入游记详情页：推荐相关游记
router.get('/rec-the-same', async ctx => {
    const { article_id, page } = ctx.query        //前端传的值
    Commentget(article_id, page)
    const articleCity = await modelArticle.find(
        { _id: article_id }, { city: true }).lean()     //根据article_id去查询到城市
    const query = { $regex: articleCity[0].city, $options: 'i' }   //模糊匹配
    const articleId = new mongoose.Types.ObjectId(article_id)
    const userTravels = await modelArticle.aggregate([   
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { city: query },
                            { address: query },
                            { province: query }
                        ]
                    },
                    {//过滤掉当前正在阅读的游记
                        _id: { $nin: [articleId] }
                    }
                ]
            }
        },
        { $skip: (page - 1) * 6 },
        { $limit: 6 },
        looKup().model_user,
        looKup().model_like,
        looKup().project
    ])
    ctx.send('SUCCESS', 200, userTravels)
})

// 进入游记详情页:短视频类型
router.get('/rec-the-video', new Authuid().m, async ctx => {
    const { article_id, page } = ctx.query
    Commentget(article_id, page)
    const articleId = new mongoose.Types.ObjectId(article_id)  //过滤
    const myUid = ctx.auth.uid ? ctx.auth.uid : 'm1'
    const res = await modelArticle.aggregate([
        {
            $match: {
                fileType: 'video',
                _id: { $nin: [articleId] }
            }
        },
        { $skip: (page - 1) * 4 },
        { $limit: 4 },
        looKup().model_user,//连接用户表
        looKup().model_like,//连接点赞表
        looKup().model_collect,//连接收藏表
        looKup().model_comment,//连接评论表
        {
            $lookup: {//关注表，用于判断某用户是否关注某作者
                from: modelConcern.collection.name,
                localField: 'author_uid',
                foreignField: 'im_concerned_uid',
                as: 'concernedUsers'
            }
        },
        {
            $project: {
                "_id": 1,
                "author_id": 1,
                "title": 1,
                "content": 1,
                "videoUrl": 1,
                "address": 1,
                "time": 1,
                "likes": { $size: '$likes' },//计算点赞数量
                "comments": { $size: '$comments' },//计算评论数量
                "collections": { $size: '$collections' },//计算收藏数量
                "author_data._id": 1,
                "author_data.avatarUrl": 1,
                "author_data.nickname": 1,
                "author_data.uid": 1,
                "isLike": {
                    // 判断是否点过赞
                    // $in操作符用于匹配两个值是否相等，如果相等，返回true，否则false
                    $in: [myUid, "$likes.user_uid"]
                },
                "isCollecTions": {
                    // 判断是否已收藏过
                    // $in操作符用于匹配两个值是否相等，如果相等，返回true，否则false
                    $in: [myUid, "$collections.user_uid"]
                },
                "isConcerned": {
                    // 判断是否已关注过该作者
                    // $in操作符用于匹配两个值是否相等，如果相等，返回true，否则false
                    $in: [myUid, "$concernedUsers.user_uid"]
                }
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})


// 获取用户的点赞，关注，粉丝数量
router.get('/my-related', new Auth().m, async ctx => {
    // 我收到的点赞数量
    const likeCount = await modelLike.find({
        author_uid: ctx.auth.uid     //有我的id的就是我点赞的
    }).countDocuments()
    // 我关注的作者数量
    const concernCount = await modelConcern.find({
        user_uid: ctx.auth.uid
    }).countDocuments()
    // 关注我的粉丝数量
    const fansCount = await modelConcern.find({
        im_concerned_uid: ctx.auth.uid
    }).countDocuments()
    ctx.send('SUCCESS', 200, { likeCount, concernCount, fansCount })
})


// 查询用户发布的游记
router.get('/myTravEls', new Auth().m, async ctx => {
    const { page } = ctx.query
    Resreturn(page)
    const res = await modelArticle.find({
        author_uid: ctx.auth.uid
    })
        .sort({ time_stamp: -1 })
        .skip((page - 1) * 6)
        .limit(6)
        .select('cover_image address fileType')
    ctx.send('SUCCESS', 200, res)
})

// 查询用户收藏的游记
router.get('/myCollEction', new Auth().m, async ctx => {
    const { page } = ctx.query
    Resreturn(page)
    const articleId = await modelCollection.find({
        user_uid: ctx.auth.uid
    }, { article_id: true })
    const resId = await articleId.map(item => item.article_id)
    const res = await modelArticle.aggregate([
        { $match: { _id: { $in: resId } } },//以数组形式匹配游记表的_id
        { $sort: { time_stamp: -1 } },
        { $skip: (page - 1) * 6 },
        { $limit: 6 },
        {
            $project: {
                "_id": 1,
                "address": 1,
                "fileType": 1,
                "cover_image": 1
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})

// 查询用户点赞(喜欢)的游记
router.get('/myLikeArticle', new Auth().m, async ctx => {
    const { page } = ctx.query
    Resreturn(page)
    const articleId = await modelLike.find({
        user_uid: ctx.auth.uid
    }, { article_id: true })
    const resId = await articleId.map(item => item.article_id)
    const res = await modelArticle.aggregate([
        { $match: { _id: { $in: resId } } },//以数组形式匹配游记表的_id
        { $sort: { time_stamp: -1 } },
        { $skip: (page - 1) * 6 },
        { $limit: 6 },
        {
            $project: {
                "_id": 1,
                "address": 1,
                "fileType": 1,
                "cover_image": 1
            }
        }
    ])
    ctx.send('SUCCESS', 200, res)
})


// 关注页面：获取用户关注的作者以及作者的游记
router.get('/user-following-author', new Auth().m, async ctx => {
    const { page } = ctx.query
    Resreturn(page)
    // 获取用户关注的作者的uid
    const imcUid = await modelConcern.find({ user_uid: ctx.auth.uid }, { im_concerned_uid: true })
    const imcUidMap = imcUid.map(item => item.im_concerned_uid)
    // 获取点赞表里的游记_id
    const likeArtId = await modelLike.find({ user_uid: ctx.auth.uid }, { article_id: true })
    const likeArtIdMap = likeArtId.map(item => item.article_id)
    // 获取收藏表里的游记_id
    const collctArtId = await modelCollection.find({ user_uid: ctx.auth.uid }, { article_id: true })
    const collectArtIdMap = collctArtId.map(item => item.article_id)
    const res = await modelArticle.aggregate([
        { $match: { author_uid: { $in: imcUidMap } } },
        { $sort: { time_stamp: -1 } },
        {
            $group: {
                _id: "$author_uid",//根据作者的uid分组
                articles: { $push: "$$ROOT" },//将每篇文章作为数组元素，$$ROOT表示该作者的所有游记
            }
        },
        {//对每个作者限制前三篇游记
            $project: {
                _id: 0,
                author_uid: "$_id",
                articles: { $slice: ["$articles", 3] }
            }
        },
        { $unwind: "$articles" },//展开每篇游记
        looKup().model_user,//关联用户表，获取作者的头像昵称
        looKupConcern("articles._id").model_like,//关联点赞表
        looKupConcern("articles._id").model_comment,//关联评论表
        looKupConcern("articles._id").model_collect,//关联收藏表
        {
            $project: {
                _id: "$articles._id",
                title: "$articles.title",
                content: "$articles.content",
                image: "$articles.image",
                address: "$articles.address",
                cover_image: "$articles.cover_image",
                videoUrl: "$articles.videoUrl",
                fileType: "$articles.fileType",
                time_stamp: "$articles.time_stamp",
                likes: { $size: "$likes" },//计算点赞数量
                comments: { $size: "$comments" },//计算评论数量
                collections: { $size: "$collections" },//计算收藏数量
                "author_data.avatarUrl": 1,//头像
                "author_data.nickname": 1,//昵称
                "isLiked": {//判断用户对每篇游记的点赞情况
                    $cond: {
                        if: { $in: ["$articles._id", likeArtIdMap] },
                        then: true,
                        else: false
                    }
                },
                "isCollect": {//判断用户对每篇游记的收藏情况
                    $cond: {
                        if: { $in: ["$articles._id", collectArtIdMap] },
                        then: true,
                        else: false
                    }
                }

            }
        },
        { $skip: (page - 1) * 6 },
        { $limit: 6 }
    ])
    // 处理相对时间
    res.forEach(item => {
        const diff = moment().diff(item.time_stamp * 1000, 'seconds')
        item.time_stamp = diff < 60 ? `${diff}秒前` : moment(item.time_stamp * 1000).fromNow()
    })
    ctx.send('SUCCESS', 200, res)
})



module.exports = router.routes()