'use strict';

const loopback = require('loopback');
const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));

const DATASOURCE_NAME = 'sakilaDS'
const dataSourceConfig = require('./server/datasources.json')
const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME])

const models = ['inventory', 'rental', 'customer', 'actor', 'address', 'category', 'city', 'country', 'customer', 'film', 'film_actor', 'film_category', 'film_text', 'language', 'payment', 'staff', 'store']

function upperCaseFirstLetter(str) {
    return str.substring(0,1).toUpperCase() + str.substring(1,str.length)
}
async function discover() {
    let currentModel = 0

    function processNextModel() {
        new Promise(async (resolve,reject) => {
            let model = models[currentModel]

            try {
                const options = { relations: true }
    
                const schema = await db.discoverSchemas(model, options)
    
                await writeFile(
                    `common/models/${model}.json`,
                    JSON.stringify(schema['sakila.' + model], null, 2)
                )
    
                const configJson = await readFile('server/model-config.json', 'utf-8')
    
                const config = JSON.parse(configJson)

                const modelName = upperCaseFirstLetter(model)
    
                if (config[modelName] == undefined) {
                    config[modelName] = {
                        dataSource: DATASOURCE_NAME,
                        public: true
                    }
    
    
                    await writeFile(
                        'server/model-config.json',
                        JSON.stringify(config, null, 2)
                    )
                }
    
                resolve()
            } catch (error) {
                reject(error)
            }
        }).then(() => {
            if (currentModel < models.length) {
                currentModel++
                processNextModel()
            }
        })
        
    }

    processNextModel()

}

discover()