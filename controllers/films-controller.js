const app = require('../server/server')

module.exports = {
    FilmsController: {
        list(req,res) {
            app.models.Film.find().then(list => {
                res.render('films/list',{films: list})
            })
            
        },

        registerEdit(req,res) {
            res.render('films/register-edit')
        },

        save(req,res) {
            console.log('salvando filme')
            let film = {
                title: req.body.title
            }

            app.models.Film.create(film).then(() => {
                res.render('films/list')    
            })
        }
    }
}