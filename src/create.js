const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const {
    oraLoading,
    getTagList,
    fetchRepoList,
    downDir,
    copyTempLocalhost
} = require('./uitls/common')
const shell = require('shelljs')
const chalk = require('chalk')

const {log_green} = require('./uitls/log')


module.exports = async (projectName) => {
    const cwd = process.cwd()
    const targetDir = path.resolve(cwd, projectName || '.')
    if (fs.existsSync(targetDir) && cwd !== targetDir) throw Error('file already exists')
    let repos = await oraLoading(fetchRepoList, 'linking git repository ...')()
    repos = repos.map(item => item.name)
    // console.log(repos)
    const {
        repo
    } = await inquirer.prompt([{
        type: 'list',
        name: 'repo',
        message: 'please choice a template',
        default: true,
        choices: repos
    }])
    let tags = await oraLoading(getTagList, `linking ${chalk.blue(repo)} tags ...`)(repo)
    tags = tags.map(item => item.name)

    const {
        tag
    } = await inquirer.prompt([{
        type: 'list',
        name: 'tag',
        message: `${chalk.green('please choice a tag')}`,
        choices: tags
    }])
    const target = await oraLoading(downDir, 'downloading...')(repo, tag)
    await copyTempLocalhost(target, projectName, true)
    log_green(`projectName: ${projectName}`)
    log_green(`repository: ${repo}`)
    // console.log(`仓库${repo}对应的tag列表:${tags}`)
    log_green(`tag: ${tag}`)
    setTimeout(() => {
        shell.cd(projectName)
        shell.exec('yarn install')
        log_green(`${projectName} created successed!\n`)
        // console.log(chalk.magenta(`${projectName} created successed!`))
        console.log('you can exec these commands:\n')
        console.log(chalk.magenta(`     cd ${projectName}\n`))
        console.log(chalk.magenta('     yarn start'))
    }, 300)
}