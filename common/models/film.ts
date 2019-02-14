'use strict';

module.exports = function(Film) {
    Film.doRental = function(filmId:number, customerId:number,cb:(error?:any) => void ) {
        new Promise((resolve,reject) => {
            try {
                
                resolve()
            } catch (error) {
                reject(error)
            }
        }).then(() => cb(null)).catch(error => cb(error))
    }
};
