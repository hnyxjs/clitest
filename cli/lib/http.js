// lib/http.js

// 通过axios 处理请求
const axios = require('axios') // 引入axios

axios.interceptors.response.use(res => {
  return res.data
})

/**
 * 获取模板列表
 * @returns Promise
 */
async function getRepoList() {
  return axios.get('https://github.com/hnlyxjs/testcli.git/repos')
}

/**
 * 获取版本信息
 * @param {string} repo 模板名称
 * @returns Promise
 */
async function getTagList(repo) {
  return axios.get(`https://github.com/hnlyxjs/testcli.git/${repo}/tags`)
}

module.exports = {
  getRepoList,
  getTagList
}

