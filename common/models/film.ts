'use strict';

const app = require('../../server/server')
const fs = require('fs')
const path = require('path')
import * as moment from 'moment'

module.exports = function(Film) {
    Film.doRental = function(filmId:number, customerId:number,cb:(error?:any,rental?:any) => void ) {
        new Promise(async (resolve,reject) => {
            try {
                let availableInventory = await getAvailabelInventory(filmId)

                if (!availableInventory) {
                    let error = new Error("não existe exemplar disponível para locação");
                    (<any>error).status = 400
                    throw error
                }

                let rental = await createRental(availableInventory.inventoryId,customerId)

                
                resolve(rental)

            } catch (error) {
                reject(error)
            }
        }).then((rental) => cb(null,rental)).catch(error => cb(error))

        async function getAvailabelInventory(filmId:number):Promise<any> {
            // buscar os inventários para o filme
            let inventories = await app.models.Inventory.find({
                where: {
                    and: [
                        {film_id: filmId}
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

            

            fs.writeFileSync(path.join(__dirname,'/../../allInventories.json'),JSON.stringify(inventories,null,2))

            

            let availableInventories = inventories.filter(i => i.toJSON().rentals.some(r => r.returnDate < new Date()))

            fs.writeFileSync(path.join(__dirname,'/../../availableInventories.json'),JSON.stringify(availableInventories,null,2))

            return availableInventories.length == 0 ? null : availableInventories[0]

           

        }

        async function createRental(inventoryId,customerId):Promise<any> {
            let rental = {
                rentalDate: new Date(),
                returnDate: moment(new Date()).add(3,'days').toDate(),
                inventoryId: inventoryId,
                customerId: customerId,
                staffId: 1
            }

            return await app.models.Rental.create(rental)
        }
    }


    Film.remoteMethod('doRental',{
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
};
