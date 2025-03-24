// cloud/functions/saveReply/index.js

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'hu2419-2g5edmmqa8bf6bd8'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { questionId, content, author, authorId, createTime } = event;
    // 更新 questions 集合中的 answers 字段
    await db.collection('questions').doc(questionId).update({
      data: {
        answers: db.command.push({
          content,
          author,
          authorId,
          createTime
        })
      }
    });

    return {
      success: true,
      message: '回复添加成功',
      _id: result._id
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: '回复添加失败'
    };
  }
};