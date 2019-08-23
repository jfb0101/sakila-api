'use strict';

const app = require('../../server/server')
const fs = require('fs')
const path = require('path')
import * as moment from 'moment'
const util = require('util')

module.exports = function (Film) {
    Film.doRental = function (filmId: number, customerId: number, cb: (error?: any, rental?: any) => void) {
        new Promise(async (resolve, reject) => {
            try {
                let availableInventory = await getAvailabelInventory(filmId)

                if (!availableInventory) {
                    let error = new Error("não existe exemplar disponível para locação");
                    (<any>error).status = 400
                    throw error
                }

                let rental = await createRental(availableInventory.inventoryId, customerId)


                resolve(rental)

            } catch (error) {
                reject(error)
            }
        }).then((rental) => cb(null, rental)).catch(error => cb(error))

        async function getAvailabelInventory(filmId: number): Promise<any> {
            // buscar os inventários para o filme
            let inventories = await app.models.Inventory.find({
                where: {
                    and: [
                        { film_id: filmId }
                    ]
                },
                include: [
                    {
                        relation: 'rentals',
                        scope: {
                            fields: ['returnDate'],
                            order: 'rentalId desc',
                            limit: 1
                        }
                    }
                ],
                fields: [
                    'inventoryId'
                ]
            })



            fs.writeFileSync(path.join(__dirname, '/../../allInventories.json'), JSON.stringify(inventories, null, 2))



            let availableInventories = inventories.filter(i => i.toJSON().rentals.some(r => r.returnDate < new Date()))

            fs.writeFileSync(path.join(__dirname, '/../../availableInventories.json'), JSON.stringify(availableInventories, null, 2))

            return availableInventories.length == 0 ? null : availableInventories[0]



        }

        async function createRental(inventoryId, customerId): Promise<any> {
            let rental = {
                rentalDate: new Date(),
                returnDate: moment(new Date()).add(3, 'days').toDate(),
                inventoryId: inventoryId,
                customerId: customerId,
                staffId: 1
            }

            return await app.models.Rental.create(rental)
        }
    }


    Film.remoteMethod('doRental', {
        accepts: [
            {
                arg: 'filmId',
                type: 'number',
            },
            {
                arg: 'customerId',
                type: 'number'
            }
        ],
        returns: {
            arg: 'data',
            type: 'object',
            root: true
        },
        http: {
            path: '/doRental/:filmId/:customerId',
            verb: 'post'
        }
    })

    Film.inventoriesInStock = function (filmId: number, storeId: number, cb: (error?: any, result?: any) => void) {
        new Promise(async (resolve, reject) => {
            try {
                let result: number[] = []

                let ds = app.dataSources.sakilaDS

                let query = util.promisify(ds.connector.query)

                let data: any = await new Promise(async (resolve, reject) => {
                    ds.connector.query(`call film_in_stock(${filmId},${storeId})`, (error, data) => {
                        if (error) return reject(error)

                        resolve(data)
                    })
                })


                result = data[0].map(r => r.inventory_id)

                resolve(result)
            } catch (error) {
                reject(error)
            }
        }).then(result => cb(null, result)).catch(error => cb(error))
    }

    Film.remoteMethod('inventoriesInStock', {
        accepts: [
            {
                arg: 'filmId',
                type: 'number'
            },
            {
                arg: 'storeId',
                type: 'number'
            }
        ],
        returns: {
            root: true,
            type: 'array'
        },
        http: {
            path: '/inventoriesInStock/:filmId/:storeId',
            verb: 'get'
        }
    })

    Film.inventoriesInStockForAllFilms = function (cb: (error?: any, results?: any) => void) {
        new Promise(async (resolve, reject) => {
            try {
                let result: any = {}

                let films = await app.models.Film.find({

                })

                let inventoriesInStock = util.promisify(Film.inventoriesInStock)

                for (let film of films) {
                    result[film.filmId] = {
                        1: await inventoriesInStock(film.filmId, 1),
                        2: await inventoriesInStock(film.filmId, 2)
                    }
                }

                resolve(result)
            } catch (error) {
                reject(error)
            }
        }).then(result => cb(null, result)).catch(error => cb(error))
    }

    

    Film.remoteMethod('inventoriesInStockForAllFilms', {
        returns: {
            root: true,
            type: 'array'
        },
        http: {
            verb: 'get'
        }
    })

    Film.inventoriesInStockForFilm = function(filmId,cb) {
        new Promise(async (resolve, reject) => {
            try {
                let result: any = {}

                let films = await app.models.Film.find({

                })

                let inventoriesInStock = util.promisify(Film.inventoriesInStock)

                for (let film of films) {
                    result[film.filmId] = {
                        1: await inventoriesInStock(film.filmId, 1),
                        2: await inventoriesInStock(film.filmId, 2)
                    }
                }

                resolve(result)
            } catch (error) {
                reject(error)
            }
        }).then(result => cb(null, result)).catch(error => cb(error))
    }

    Film.remoteMethod('inventoriesInStockForFilm', {
        returns: {
            root: true,
            type: 'array'
        },
        accepts: {
            arg: 'filmId',
            type: 'number',

        },
        http: {
            verb: 'get',
            path: '/inventoriesInStockForFilm/:filmId'
        }
    })

    Film.observe('after save', (context,next) => {
        app.io.emit('filmModified',{filmId: context.instance.id})
        next()
    })

    Film.getLastUpdate = function(cb:Function) {
        new Promise(async (resolve,reject) => {
            try {
                let result = await app.models.Film.findOne({
                    order: 'lastUpdate desc',
                    limit: 1,
                    fields: 'lastUpdate'
                })

                resolve(result.lastUpdate.getTime())

            } catch (error) {
                reject(error)
            }
        }).then(lastUpdate => cb(undefined,lastUpdate)).catch(error => cb(error))
    }

    Film.remoteMethod('getLastUpdate',{
        http: {
            verb: 'get'
        },
        returns: {
            type: 'number',
            root: true
        }
    })
    
};
