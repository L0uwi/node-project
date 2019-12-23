import { LevelDB } from "./leveldb"
import WriteStream from 'level-ws'

export class User {
    public username: string
    public email: string
    private password: string = ""

    //Constructor
    constructor(username: string, email: string, password: string, passwordHashed: boolean = false) {
        this.username = username
        this.email = email

        if (!passwordHashed) {
            this.setPassword(password)
        } else this.password = password
    }

    //Get data and returns it as an User object 
    static fromDb(username: string, value: any): User {
        const [password, email] = value.split(":")
        return new User(username, email, password)
    }

    //Set the password
    public setPassword(toSet: string): void {
        // Hash and set password
        this.password = toSet
    }

    //Return Password
    public getPassword(): string {
        return this.password
    }

    //Validate if password given is the same as user's password
    public validatePassword(toValidate: String): boolean {
        // return comparison with hashed password
        return this.password == toValidate
    }
}

//Definition of UserHandler class (used in server.ts)
export class UserHandler {

    //Creation of DB
    public db: any

    //Initialization of DB
    constructor(path: string) {
        this.db = LevelDB.open(path)
    }

    public closeDB(){
        this.db.close()
      }

    //Return data from db using the given username (used in server.ts for the connexion)
    public get(username: string, callback: (err: Error | null, result?: User) => void) {
        this.db.get(`user:${username}`, function (err: Error, data: any) {
            if (err) callback(err)
            else if (data === undefined) callback(null, data)
            else {
                callback(null, User.fromDb(username, data))
            }
        })
    }

    

    //Save data to db (password and mail are in the same string so we need to use split we we read them)
    public save(user: User, callback: (err: Error | null) => void) {
        this.db.put(`user:${user.username}`, `${user.getPassword()}:${user.email}`, (err: Error | null) => {
            callback(err)
        })
    }

    //Delete data from db
    public delete(username: string, callback: (err: Error | null) => void) {
        // TODO
    }

    
    //Validate if password given is the same as confirm password
    public confirmPassword(password: string, confirmPassword: string): boolean {
        // return comparison with hashed password
        return password == confirmPassword
    }

    //Validate if mail given is the same as confirm mail
    public confirmMail(mail: string, confirmMail: string): boolean {
        // return comparison with hashed password
        return mail == confirmMail
    }

   
}