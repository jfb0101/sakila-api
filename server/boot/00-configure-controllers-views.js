const path = require('path')
const {FilmsController} = require('../../controllers/films-controller')
const bodyParser = require('body-parser');


module.exports = function(app) {

    // configurar as views
    app.set('views',path.join(__dirname,'../../views'))
    app.set('view engine','ejs')

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

    const router = app.loopback.Router()

    // configurar as rotas para filmes

    app.get('/films',FilmsController.list)
    app.get('/films/register-edit',FilmsController.registerEdit)
    app.post('/films',FilmsController.save)

    app.use(router)
}