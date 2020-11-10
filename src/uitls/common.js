const axios = require('axios')
const ora = require('ora')
const {promisify} = require('util')
let downloadGit = require('download-git-repo')
const {downloadDirectory} = require('./constants')
const path = require('path')
const fs = require('fs')
const ncp = require('ncp')
const MetalSmith = require('metalsmith')
const inquirer = require('inquirer')
const {render} = require('ejs')

const {log_bule, log_error} = require('./log')

downloadGit = promisify(downloadGit)

const mapActions = {
    create: {
        alias: 'c',
        description: 'create a poject',
        examples: [
            'kami-cli create | c <project name>'
        ]
    },
    // config: {
    //     alias: 'conf',
    //     description: 'config project variable',
    //     examples: [
    //         'kami-cli config set <K> <V>',
    //         'kami-cli config get <K>'
    //     ]
    // },
    '*': {
        alias: '',
        description: 'command not found',
        examples: []
    }
}

const helpCb = () => {
    console.log('\nExamples:')
    Reflect.ownKeys(mapActions).forEach(action => {
        mapActions[action].examples.forEach(example => {
            log_bule(example)
        })
    })
}

const oraLoading = (fn, message) => async (...args) => {
    const spinner = ora(message)
    spinner.start()
    let res = await fn(...args)
    spinner.succeed()
    return res
}

const fetchRepoList = async () => {
    const {
        data
    } = await axios.get('https://api.github.com/orgs/deeproute-cli/repos')
    // console.log(data)
    return data
}

const getTagList = async (repo) => {
    const {data} = await axios.get(`https://api.github.com/repos/deeproute-cli/${repo}/tags`)
    return data
}

const downDir = async (repo, tag) => {
    console.log('down dir')
    let project = `deeproute-cli/${repo}`
    if(tag) {
        project += `#${tag}`
    }
    let dest = `${downloadDirectory}/${repo}`
    // console.log('dest 内容', dest)
    // console.log('project..', project)
    console.log(project)
    console.log(dest)
    try {
        await downloadGit(project, dest)
    } catch (error) {
        log_error('download error')
        log_error(error)
    }
    return dest
}

const copyTempLocalhost = async (target, projectName, flag) => {
    const resolvePath = path.join(path.resolve(), projectName)
    if(!flag) {
        await ncp(target,  resolvePath)
        // console.log(target)
        // fs.rmdir(target)
    } else {
        //复杂项目
             // 1) 让用户填信息
             await new Promise((resolve, reject) => {
                MetalSmith(__dirname)
                    .source(target) // 遍历下载的目录
                    .destination(resolvePath) // 最终编译好的文件存放位置
                    .use(async (files, metal, done) => {
                        // let args = require(path.join(target, 'ask.js'));
                        // let res = await inquirer.prompt(args);
                        let res = {name: projectName}
                        let met = metal.metadata();
                        // 将询问的结果放到metadata中保证在下一个中间件中能够获取到
                        Object.assign(met, res);
                       //  ask.js 只是用于 判断是不是复杂项目 且 内容能够定制复制到本地不须要
                        // delete files['ask.js'];
                        done();
                    })
                    .use((files, metal, done) => {
                        const res = metal.metadata();
                       //  获取文件中的内容
                        Reflect.ownKeys(files).forEach(async (file) => {
                           //  文件是.js或者.json才是模板引擎
                            if (file.includes('.js') || file.includes('.json')) {
                                let content = files[file].contents.toString(); //文件内容
                               //  咱们将ejs模板引擎的内容找到 才编译
                                if (content.includes('<%')) {
                                    content = await render(content, res);
                                    files[file].contents = Buffer.from(content); //渲染
                                }
                            }
                        })
                        done();

                    })
                    .build((err) => {
                        if (err) {
                            reject();

                        } else {
                            resolve();
                        }
                    })

            });
    }
}

module.exports = {
    mapActions,
    helpCb,
    oraLoading,
    getTagList,
    fetchRepoList,
    downDir,
    copyTempLocalhost
}
// https://www.shangmayuan.com/a/86bd3d7c82a74ddca9527f8b.html