Page({
  data: {
    competitions: [],
    index: -1  //竞赛索引从0开始
  },
  onLoad: function () {
    this.getCompetitions();
  },
  getCompetitions: function () {
    wx.cloud.init();
    const db = wx.cloud.database();
    db.collection('competitions').get().then(res => {
      if (res.data && res.data.length > 0) {
        const competitionNames = res.data.map(item => item.name);
        // console.log('Competitions loaded:', competitionNames); // 调试信息
        this.setData({
          competitions: competitionNames
        });
      } else {
        // console.log('No competitions found'); // 调试信息
      }
    }).catch(err => {
      // console.error('Error fetching competitions:', err); // 调试信息
    });
  },

  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    });
  },

  formSubmit: function(e) {
    const formData = e.detail.value;
    const index = this.data.index;
    // 检查 index 是否为 -1
    if (index === -1) {
      wx.showToast({
        title: '请选择竞赛',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 检查所有必填字段是否已填写
    const requiredFields = ['studentID', 'name', 'phone', 'teacher'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 将选择的竞赛名称添加到 formData 中
    formData.competitionName = this.data.competitions[index];

    wx.cloud.init();
    const db = wx.cloud.database();

    // 查询是否存在相同的学号和竞赛名称
    db.collection('enrollment')
      .where({
        studentID: formData.studentID,
        competitionName: formData.competitionName
      })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          const existingData = res.data[0];

          // 检查所有数据是否相同
          const isSameData = Object.keys(formData).every(key => {
            return existingData[key] === formData[key];
          });

          if (isSameData) {
            wx.showToast({
              title: '不能重复报名',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          // 更新现有数据
          db.collection('enrollment')
            .doc(existingData._id)
            .update({
              data: formData
            })
            .then(() => {
              wx.showToast({
                title: '更新成功',
                icon: 'success',
                duration: 2000
              });
              wx.navigateBack(); // 返回上一页
            })
            .catch(err => {
              wx.showToast({
                title: '更新失败',
                icon: 'none',
                duration: 2000
              });
              console.error(err);
            });
        } else {
          // 添加新数据
          db.collection('enrollment')
            .add({
              data: formData
            })
            .then(res => {
              wx.showToast({
                title: '报名成功',
                icon: 'success',
                duration: 2000
              });
              wx.navigateBack(); // 返回上一页
            })
            .catch(err => {
              wx.showToast({
                title: '报名失败',
                icon: 'none',
                duration: 2000
              });
              console.error(err);
            });
        }
      })
      .catch(err => {
        wx.showToast({
          title: '查询失败',
          icon: 'none',
          duration: 2000
        });
        console.error(err);
      });
  }
});



  
//     wx.cloud.init();
//     const db = wx.cloud.database();
//     db.collection('enrollment').add({
//       data: formData,
//       success: res => {
//         wx.showToast({
//           title: '报名成功',
//           icon: 'success',
//           duration: 2000
//         });
//         wx.navigateBack();        // 返回上一页
//       },
//       fail: err => {
//         wx.showToast({
//           title: '报名失败',
//           icon: 'none',
//           duration: 2000
//         });
//         // console.error(err);
//       }
//     });
//   }
// });