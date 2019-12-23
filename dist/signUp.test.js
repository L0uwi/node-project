"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var leveldb_1 = require("./leveldb");
var user_1 = require("./user");
var chai = require('chai'), chaiHttp = require('chai-http');
chai.use(chaiHttp);
var dbPath = 'db_test_users';
var dbUser;
var server;
var app = require('./server');
describe('Signup', function () {
    before(function () {
        leveldb_1.LevelDB.clear(dbPath);
        dbUser = new user_1.UserHandler(dbPath);
    });
    after(function () {
        dbUser.closeDB();
    });
    describe('#Wrong values handling', function () {
        it('should not work because password too short', function (done) {
            chai.request(app)
                .post('/signup')
                .send({
                'username': 'test',
                'mail': 'l.c@gmail.com',
                'confirm_mail': 'l.c@gmail.com',
                'password': '1',
                'confirm_password': '1'
            })
                .end(function (err, res) {
                chai.expect(res).to.have.status(409);
            });
            dbUser.get("test", function (err, result) {
                chai_1.expect(err).to.not.be.null;
                chai_1.expect(result).to.be.undefined;
            });
            done();
        });
        it('should not work because password and confirm password are different', function (done) {
            chai.request(app)
                .post('/signup')
                .send({
                'username': 'test',
                'mail': 'l.c@gmail.com',
                'confirm_mail': 'l.c@gmail.com',
                'password': '12345',
                'confirm_password': '12346'
            })
                .end(function (err, res) {
                chai.expect(res).to.have.status(409);
            });
            dbUser.get("test", function (err, result) {
                chai_1.expect(err).to.not.be.null;
                chai_1.expect(result).to.be.undefined;
            });
            done();
        });
        it('should not work because not a valid mail', function (done) {
            chai.request(app)
                .post('/signup')
                .send({
                'username': 'test',
                'mail': 'l.gmail.com',
                'confirm_mail': 'l.gmail.com',
                'password': '12345',
                'confirm_password': '12345'
            })
                .end(function (err, res) {
                chai.expect(res).to.have.status(409);
            });
            dbUser.get("test", function (err, result) {
                chai_1.expect(err).to.not.be.null;
                chai_1.expect(result).to.be.undefined;
            });
            done();
        });
        it('should not work because mail and confirm mail are different', function (done) {
            chai.request(app)
                .post('/signup')
                .send({
                'username': 'test',
                'mail': 'l.gmail.com',
                'confirm_mail': 'e.gmail.com',
                'password': '12345',
                'confirm_password': '12345'
            })
                .end(function (err, res) {
                chai.expect(res).to.have.status(409);
            });
            dbUser.get("test", function (err, result) {
                chai_1.expect(err).to.not.be.null;
                chai_1.expect(result).to.be.undefined;
            });
            done();
        });
        it('should not work because user already exists', function (done) {
            var user = new user_1.User("Louis", "l.c@gmail.com", "admin");
            dbUser.save(user, function (err, result) {
                chai_1.expect(err).to.not.be.null;
            });
            chai.request(app)
                .post('/signup')
                .send({
                'username': 'Louis',
                'mail': 'l.c@gmail.com',
                'confirm_mail': 'l.c@gmail.com',
                'password': 'admin',
                'confirm_password': 'admin'
            })
                .end(function (err, res) {
                chai.expect(res).to.have.status(409);
            });
            /* dbUser.get("Louis", function(err: Error | null, result?: User) {
                 expect(err).to.be.null
                 expect(result).to.not.be.undefined
             
             })*/
            done();
        });
    });
    describe('#Success', function () {
        it('should signup a new user successfully', function (done) {
            chai.request(app)
                .post('/signup')
                .send({
                'username': 'auhbcxuahcbuagvcsghaixbjzbcibcuhzvbugvzhubscbjznjscbzibcizc',
                'mail': 'e.a@gmail.com',
                'confirm_mail': 'e.a@gmail.com',
                'password': 'admin',
                'confirm_password': 'admin'
            })
                .end(function (err, res) {
                chai.expect(res).to.have.status("200");
            });
            done();
        });
        it('should delete a user successfully', function (done) {
            chai.request(app)
                .delete('/user/delete/auhbcxuahcbuagvcsghaixbjzbcibcuhzvbugvzhubscbjznjscbzibcizc')
                .end(function (err, res) {
                chai.expect(res).to.have.status("200");
            });
            done();
        });
    });
});
