// lib/Generator.js

const { getRepoList, getTagList } = require('./http') // 引入http.js
const ora = require('ora') // 引入ora，用于加载动画
const inquirer = require('inquirer') // 引入inquirer，用于和用户进行交互
const util = require('util') // 引入util，用于将回调函数转换为promise
const downloadGitRepo = require('download-git-repo') // 不支持 Promise
const chalk = require('chalk') // 引入chalk，用于修改控制台输出样式
const path = require('path'); // 引入path，用于处理路径
const fs = require("fs-extra"); // 引入fs-extra，用于文件操作
const { create } = require('domain')

// 添加加载动画
async function wrapLoading (fn, message, ...args) {
  // 使用ora初始化，传入提示信息message
  const spinner = ora(message)
  // 开始加载动画
  spinner.start()
  try {
    // 执行传入方法fn，传入参数args
    const result = await fn(...args)
    // fan方法执行成功，停止加载动画，且改变文字信息  
    // 这里的fn是getRepoList, getTagList作用是获取仓库列表和标签列表，返回的是promise，所以这里要加await
    // 成功，停止加载动画，且改变文字信息
    spinner.succeed()
    return result
  } catch (error) {
    // 失败，停止加载动画，且改变文字信息
    spinner.fail('Request failed, refetch ...')
  }
}

class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  // 获取用户选择的模板
  // 1）从远程拉取模板数据
  // 2）用户选择自己需要的模板名称
  // 3）return返回用户选择的模板名称

  async getRepo () {
    // 从远程拉取模板数据
    const repoList = await wrapLoading(getRepoList, 'waiting fetch template')
    if (!repoList) return
    // 过滤我们需要的模板名称
    const repos = repoList.map(item => item.name) // 获取模板名称

    // 2) 用户选择自己需要的模板名称
    const { repo } = await inquirer.prompt({
      name: 'repo', // 获取用户选择的模板名称
      type: 'list', // 选择类型
      choices: repos, // 选择的模板
      message: 'please choise a template to create project', // 提示信息

    })
    // 3) return返回用户选择的模板名称
    return repo
  }

  // 获取用户选择的版本号
  // 1）基于repo结果,从远程拉取版本号数据
  // 2）自动选择最新版本号
 
  async getTag (repo) {
    // 1) 基于repo结果,从远程拉取版本号数据
    const tags = await wrapLoading(getTagList, 'waiting fetch tag', repo);
    if (!tags) return

    // 过滤我们需要的版本号
    const tagsList = tags.map(item => item.name) // 获取版本号

    // 2) return返回用户选择的版本号
    return tagsList[0]
  }

  // 下载远程模板
  // 1）拼接下载地址
  // 2）调用下载方法

  async downloadGitRepo (repo, tag) {
    // 1、拼接下载地址
    const requestUrl = `geeksTest/${repo}{tag ? '#' + tag : ''}`;
    // 2、调用下载方法
    await wrapLoading(
      this.downloadGitRepo, //远程下载方法
      'waiting download template', //加载提示信息
      requestUrl, //参数1：下载地址
      path.resolve(process.cwd(), this.targetDir) //参数2：创建位置
    )
  }

  // 核心创建逻辑
  // 1）获取模板名称
  // 2）获取tag名称
  // 3）下载模板到模板目录
  // 4）对于uniapp模板中部分文件进行读写
  // 5）模板使用提示
  async create () {
    // 1)获取模板名称
    const repo = await this.getRepo()

    // 2）获取tag名称
    const tag = await this.getTag(repo)

    // 3）下载模板到模板目录
    await this.downloadGitRepo(repo, tag)

    // 5）模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`)
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`)
    console.log(`\r\n  启动前请务必阅读 ${chalk.cyan("README.md")} 文件`)
  }
}

module.exports = Generator