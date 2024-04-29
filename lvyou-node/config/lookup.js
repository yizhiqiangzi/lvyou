//共用连表

const {
  modelUser,
    modelArticle,
    modelLike,
    modelCollection,
    modelComment,
    modelSignup,
    modelCompanion
} = require('@/models/collection')

const looKup = ()=>{
        const model_user = {//用户表
          $lookup: {
              from: modelUser.collection.name,
              localField: 'author_uid',
              foreignField: 'uid',
              as: 'author_data'
          }
      };
      const model_like = {//点赞表
          $lookup: {
              from: modelLike.collection.name,
              localField: '_id',
              foreignField: 'article_id',
              as: 'likes'
          }
      };
      const model_comment = {//评论表
          $lookup: {
              from: modelComment.collection.name,
              localField: '_id',
              foreignField: 'article_id',
              as: 'comments'
          }
      };
      const model_collect = {//收藏表
          $lookup: {
              from: modelCollection.collection.name,
              localField: '_id',
              foreignField: 'article_id',
              as: 'collections'
          }
      };
      const project = {//返给前端的瀑布流数据
          $project: {
              '_id': 1,
              'title': 1,
              'cover_image': 1,
              'address': 1,
              'fileType': 1,
              'author_data.avatarUrl': 1,
              'author_data.nickname': 1,
              'likes': { $size: '$likes' }
          }
      }
  return{
    model_user,
    model_like,
    model_comment,
    model_collect,
    project
  }
}


// 四个推荐游记的公用连表
const looKupRecommend = () => {
  const model_Article = {//游记表
      $lookup: {
          from: modelArticle.collection.name,   //其中 modelArticle 是模型的名称，.collection.name 是获取该模型对应的数据库集合的名称
          localField: 'travel_id',
          foreignField: '_id',
          as: 'articleData'
      }
  };
  const model_reco_user = {//用户表
      $lookup: {//$lookup 是 MongoDB 的聚合管道操作符之一,具体而言，它用于在一个集合中查找与另一个集合中的字段匹配的文档，并将这些文档合并到当前文档中。
          from: modelUser.collection.name,        //指定要从哪个集合中进行查找匹配的文档。
          localField: 'articleData.author_uid',    // localField: 指定当前集合中用于匹配的字段。
          foreignField: 'uid',    //foreignField: 指定外部集合中用于匹配的字段。
          as: 'userData'          //as: 指定将匹配的文档合并到当前文档时所创建的字段名称。
      }
  }
  return {
      model_Article,
      model_reco_user
  }
}



// 关注页面：获取用户关注的作者以及作者的游记
const looKupConcern = (_id) => {
  const model_like = {//点赞表
      $lookup: {
          from: modelLike.collection.name,
          localField: _id,
          foreignField: 'article_id',
          as: 'likes'
      }
  };
  const model_comment = {//评论表
      $lookup: {
          from: modelComment.collection.name,
          localField: _id,
          foreignField: 'article_id',
          as: 'comments'
      }
  };
  const model_collect = {//收藏表
      $lookup: {
          from: modelCollection.collection.name,
          localField: _id,
          foreignField: 'article_id',
          as: 'collections'
      }
  };
  return {
      model_like,
      model_comment,
      model_collect
  }
}

// 旅游结伴：首页筛选活动
const looKupCompanion = () => {
  const model_user = {//用户表
      $lookup: {
          from: modelUser.collection.name,
          localField: 'uid',
          foreignField: 'uid',
          as: 'author_data'
      }
  };
  const model_signup = {//报名表
      $lookup: {
          from: modelSignup.collection.name,
          localField: '_id',
          foreignField: 'signup_id',
          as: 'signups'
      }
  };
  const model_companion = {//活动表
      $lookup: {
          from: modelCompanion.collection.name,
          localField: 'signup_id',
          foreignField: '_id',
          as: 'my_companion'
      }
  };

  return {
      model_signup,
      model_user,
      model_companion






      
  }
}

module.exports = {
  looKup,
  looKupRecommend,
  looKupConcern,
  looKupCompanion
}