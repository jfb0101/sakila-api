const app = require('./server/server')
const ds = app.dataSources.sakilaDS
let lbTables = ['User','AccessToken','ACL','RoleMapping','Role']

ds.automigrate(lbTables,error => {
    if (error) {
        console.log(`falha ao realizar migração dos modelos do loopback`,error)
        return
    }

    console.log(`modelos do loopback criados no banco com sucesso`)
    ds.disconnect()
})