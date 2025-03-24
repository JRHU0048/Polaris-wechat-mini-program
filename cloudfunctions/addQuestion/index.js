// cloud/functions/addQuestion/index.js

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'hu2419-2g5edmmqa8bf6bd8'
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取问题数据
    const questionData = event.question;

    // 插入问题到数据库
    await db.collection('questions').add({
      data: questionData
    });

    return {
      success: true,
      message: '问题添加成功'
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: '问题添加失败'
    };
  }
};