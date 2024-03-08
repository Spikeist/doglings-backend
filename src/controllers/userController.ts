import { RequestHandler } from "express";
import { User } from "../models/user";
import { comparePasswords, hashedPassword, tokenAssigner, verifyUser } from "../services/auth";


export const getAllUsers: RequestHandler = async (req, res, next) => {
    let users : User[] = await User.findAll() 

    res.status(200).json(users);
}

export const registerUser: RequestHandler = async (req, res, next) => {
    let regUser: User = req.body;
    let foundUser: User | null = await User.findOne({
        where: {
            username: regUser.username
        }
    })

    if(!foundUser){

        try{

                if(regUser.username && regUser.password) {
                    let encryptedPass = await hashedPassword(regUser.password);
                    regUser.password = encryptedPass;
            
                    let createdUser = await User.create(regUser);
            
                    res.status(201).json({
                        userId:  createdUser.userId,
                        password: createdUser.password
                    })
                }
                else{
                    res.status(400).send('Please enter the username & pasword')
                }
        }
        catch(error){
            res.status(400).send(error)
        }

    }else{
        res.status(401).send('Username is already being used')
    }

}

export const loginUser: RequestHandler = async (req, res, next) => {

    let existingUser: User | null = await User.findOne({
        where: {
            username: req.body.username
        }
    })

    if(existingUser){
        let passwordResult = await comparePasswords(req.body.password, existingUser.password)
        let userId = existingUser.userId

        if(passwordResult){
            let token = await tokenAssigner(existingUser);
            res.status(200).json({token, userId})
        }
        else{
            res.status(404).send('incorrect password')
        }
    }
    else{
        res.status(404).send(`username ${req.body.username} does not exist`)
    }
    
}

export const getUser: RequestHandler = async (req, res, next) => {
    let user: User | null = await verifyUser(req);
    let reqId = parseInt(req.params.id)

    if (user){
        let idedUser: User | null = await User.findByPk(reqId);
        res.status(200).json({idedUser})
    }else{
        res.status(401).send();
    }
}