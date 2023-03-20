// lib/create.js

const path = require('path')
// fs-extra 是对 fs 模块的扩展，支持 promise 语法
const fs = require('fs-extra')
// 用于交互式询问用户问题
const inquirer = require('inquirer')
// 导出Generator类
const Generator = require('./Generator')

// 1、抛出一个方法用来接收用户要创建的文件夹（项目）名和其他参数
module.exports = async function (name, options) {
  // 当前命令行执行选择的目录
  const cwd = process.cwd()
  // 需要创建的目录地址
  const targetDir = path.join(cwd, name)

  // 2、判断当前目录下是否已经存在同名文件夹（项目）
  if(fs.existsSync(targetDir)) {
    // 判断是否强制创建
    if(options.force) {
      await fs.remove(targetDir)
    } else {
      // 询问用户是否要覆盖
      let { action } = await inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists Pick an action:',
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false }
          ]
        }
      ])
      // 如果用户选择取消覆盖，终止当前命令
      if(!action) {
        return
      } else if(action === 'overwrite') {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`)
      }
    }
  }
  // 新建generator类
  const generator = new Generator(name, targetDir)
  // 执行创建项目
  generator.create()
}