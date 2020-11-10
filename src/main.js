const program = require('commander')
const path = require('path')

const {version} = require('./uitls/constants')
const {mapActions, helpCb} = require('./uitls/common')

const {log_error} = require('./uitls/log')

Reflect.ownKeys(mapActions).forEach(action => {
    program.command(action)
           .alias(mapActions[action].alias)
           .description(mapActions[action].description)
           .action(() => {
               if(action === '*') {
                //    console.log(mapActions[action].description)
                log_error('command not found')
                helpCb()
               }else {
                //    console.log(action)
                //    console.log(process.argv)
                   require(path.join(__dirname, action))(...process.argv.slice(3))
               }
           })
})


program.on('--help', helpCb)


program.version(version)
       .parse(process.argv)
