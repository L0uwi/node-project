import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"
import { UserHandler, User } from './user'
import express = require('express')

var chai = require('chai')
  , chaiHttp = require('chai-http');

chai.use(chaiHttp);

const dbPath: string = 'db_test_users'
var dbUser: UserHandler
var server

const app = require('./server');


describe('Signup', function () {



    before(function () {
        LevelDB.clear(dbPath)
        dbUser = new UserHandler(dbPath)


    })

    after(function () {
        dbUser.closeDB()
    })

    describe('#Wrong values handling', function () {

        it('should not work because password too short', function(done) {
            chai.request(app)
            .post('/signup')
            .send({
                'username': 'test',
                'mail': 'l.c@gmail.com',
                'confirm_mail':'l.c@gmail.com',
                'password': '1',
                'confirm_password': '1'
                })
            .end(function(err, res) {
                chai.expect(res).to.have.status(409);
                });

            dbUser.get("test", function(err: Error | null, result?: User) {
                expect(err).to.not.be.null
                expect(result).to.be.undefined
            
            })

            done();
        });

        it('should not work because password and confirm password are different', function(done) {
            chai.request(app)
            .post('/signup')
            .send({
                'username': 'test',
                'mail': 'l.c@gmail.com',
                'confirm_mail':'l.c@gmail.com',
                'password': '12345',
                'confirm_password': '12346'
                })
            .end(function(err, res) {
                chai.expect(res).to.have.status(409);
                });

            dbUser.get("test", function(err: Error | null, result?: User) {
                expect(err).to.not.be.null
                expect(result).to.be.undefined
            
            })

            done();
        });

        it('should not work because not a valid mail', function(done) {
            chai.request(app)
            .post('/signup')
            .send({
                'username': 'test',
                'mail': 'l.gmail.com',
                'confirm_mail':'l.gmail.com',
                'password': '12345',
                'confirm_password': '12345'
                })
            .end(function(err, res) {
                chai.expect(res).to.have.status(409);
                });

            dbUser.get("test", function(err: Error | null, result?: User) {
                expect(err).to.not.be.null
                expect(result).to.be.undefined
            
            })

            done();
        });

        it('should not work because mail and confirm mail are different', function(done) {
            chai.request(app)
            .post('/signup')
            .send({
                'username': 'test',
                'mail': 'l.gmail.com',
                'confirm_mail':'e.gmail.com',
                'password': '12345',
                'confirm_password': '12345'
                })
            .end(function(err, res) {
                chai.expect(res).to.have.status(409);
                });

            dbUser.get("test", function(err: Error | null, result?: User) {
                expect(err).to.not.be.null
                expect(result).to.be.undefined
            
            })

            done();
        });

        it('should not work because user already exists', function(done) {
            let user = new User("Louis", "l.c@gmail.com", "admin")

            dbUser.save(user, function(err: Error | null, result?: User) {
                expect(err).to.not.be.null
            })
            
            chai.request(app)
            .post('/signup')
            .send({
                'username': 'Louis',
                'mail': 'l.c@gmail.com',
                'confirm_mail':'l.c@gmail.com',
                'password': 'admin',
                'confirm_password': 'admin'
                })
            .end(function(err, res) {
                chai.expect(res).to.have.status(409);
                });

           /* dbUser.get("Louis", function(err: Error | null, result?: User) {
                expect(err).to.be.null
                expect(result).to.not.be.undefined
            
            })*/

            done();
        });
    })

    describe('#Success', function () {

        it('should signup a new user successfully', function(done) {
            chai.request(app)
            .post('/signup')
            .send({
                'username': 'auhbcxuahcbuagvcsghaixbjzbcibcuhzvbugvzhubscbjznjscbzibcizc',
                'mail': 'e.a@gmail.com',
                'confirm_mail':'e.a@gmail.com',
                'password': 'admin',
                'confirm_password': 'admin'
                })
            .end(function(err, res) {
                chai.expect(res).to.have.status("200");
            });
            done();
        });

        it('should delete a user successfully', function(done) {
            chai.request(app)
            .delete('/user/auhbcxuahcbuagvcsghaixbjzbcibcuhzvbugvzhubscbjznjscbzibcizc')
            .end(function(err, res) {
                chai.expect(res).to.have.status("200");
            });
            done();
        });

    })
})

