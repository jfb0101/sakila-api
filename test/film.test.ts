const app = require('../server/server')
import * as chai from 'chai'
const should = chai.should();
const expect = chai.expect
import * as supertest from 'supertest'
import { Film } from '../common/models/types/Film';


describe('testes sobre filmes',function(){
    describe('CT0001 - listagem de filmes',function(){
        it("teste",async function(){
            let response = await supertest(app)
                .get(`/api/Films`)
            expect(response.body.length).to.equal(1000,'eram esperados 1000 filmes no banco')
                
        })
    })

    describe('CT0002 - cadastrar filme',function(){
        it("teste",async function(){
            let film: Film = {
                title: "filme teste"
            }

            let response = await supertest(app)
            .post(`/api/Films`)
            .send(film)

            expect(response.status).to.equal(200,response.error.message)
        })
    })
})