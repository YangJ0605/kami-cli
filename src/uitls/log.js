const chalk = require('chalk')

const log_bule = (info) => {
    console.log(chalk.blue(info))
}


const log_green = (info) => {
    console.log(chalk.green(info))
}

const log_error = (info) => {
    console.log(chalk.red(info))
}

const log_clear = (info) => {
    console.clear()
}

module.exports = {
    log_bule,
    log_error,
    log_clear,
    log_green
}