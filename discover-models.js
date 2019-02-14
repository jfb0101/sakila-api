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

const models = ['inventory', 'rental', 'customer']

async function discover() {
    let promises = []

    models.forEach(model => {
        promises.push(new Promise((resolve, reject) => {
            try {
                const options = { relations: false }

                const schema = await db.discoverSchemas(model, options)

                await writeFile(
                    `common/models/${model}.json`,
                    JSON.stringify(schema['sakila.' + model], null, 2)
                )

                const configJson = await readFile('server/model-config.json', 'utf-8')

                const config = JSON.parse(configJson)

                if (config[model] == undefined) {
                    config[model] = {
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
        }))
    })

    return Promise.all(promises)
}

discover().then(() => process.exit()).catch(error =>
    console.error(`erro ao descobrir modelos ${models.join()}`, error)
)