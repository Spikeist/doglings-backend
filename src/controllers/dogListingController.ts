import { RequestHandler } from "express";
import { DogListing } from "../models/listing";
import { User } from "../models/user";
import { verifyUser } from "../services/auth";

export const getAllDogs: RequestHandler = async (req, res, next) => {
    let {Op} = require("sequelize")
    let query = req.query;
    let dogs: DogListing[] = [];
    if(query.breed){
        if(query.gender){

            if(query.maxPrice){

                dogs = await DogListing.findAll({
                    where: {
                        [Op.and] : [
                            {breed : query.breed},
                            {gender: query.gender},
                            {price: query.maxPrice}
                        ]
                    }
                })

            }else{
                dogs = await DogListing.findAll({
                    where: {
                        [Op.and] : [
                            {breed : query.breed},
                            {gender: query.gender}
                        ]
                    }
                })
            }

        }else{
            dogs = await DogListing.findAll({
                where: {
                    breed: {
                        [Op.equal] : query.breed
                    }
                }
            })
        }
    }
    if(query.gender){

        if(query.maxPrice){

            dogs = await DogListing.findAll({
                where: {
                    [Op.and] : [
                        {gender: query.gender},
                        {price: query.maxPrice}
                    ]
                }
            })

        }else{
            dogs = await DogListing.findAll({
                where: {
                    gender: {
                        [Op.equal] : query.gender
                    }
                }
            })
        }

    }
    if(query.maxPrice){

        dogs = await DogListing.findAll({
            where: {
                price: {
                    [Op.equal] : query.maxPrice
                }
            }
        })

    }
    if(!query){
        dogs = await DogListing.findAll();
    }


    res.status(200).json(dogs)
}

export const getDogInfo: RequestHandler = async (req, res, next) =>{
    let reqId = req.params.id
    let dogInfo: DogListing | null = await DogListing.findByPk(reqId);

    if(dogInfo){

        res.status(200).json(dogInfo);
    }else{
        res.status(400).send('sorry, dog does not exist ... please go back to the listings page')
    }
}

export const addDog: RequestHandler = async (req, res, next) => {
    let user: User | null = await verifyUser(req);
    let dogBody: DogListing = req.body;

    if(!user){
        return res.status(401).send('please sign in to add a listing')
    }

    try{

        dogBody.userId = user.userId;

        let created = await DogListing.create(dogBody);
        res.status(201).json(created);

    }
    catch(error){
        res.status(400).send(error)
    }
}

export const editDogInfo: RequestHandler = async (req, res, next) => {
    let dogBody: DogListing = req.body;
    let reqId = req.params.id;
    let user: User | null = await verifyUser(req);

    if(!user){
        return res.status(401).send('please sign in to edit a listing')
    }

    let idedDog: DogListing | null = await DogListing.findByPk(reqId);

    if(idedDog){
        if(idedDog.userId === user.userId){
            await DogListing.update(dogBody, {
                where: {
                    dogId: reqId
                }
            })
            res.status(200).json({
                updated: true,
                dogId: reqId
            })
        }
        else{
            res.status(401).send("cannot edit another user's dog")
        }
        
    }
    else{
        res.status(400).send('no such dog exists')
    }
}

export const deleteDogListing: RequestHandler = async (req, res, next) => {
    let user: User | null = await verifyUser(req);

    if(!user){
        return res.status(401).send('please sign in to edit a listing')
    }

    let reqId = req.params.id;
    let idedDog: DogListing | null = await DogListing.findByPk(reqId);

    if(idedDog){

        if(idedDog.userId === user.userId){
            await User.destroy({
                where: {
                    userId: reqId
                }
            })

            res.status(200).json({
                userId: user.userId,
                deleted: true
            })
        }
        else{
            res.status(401).send("cannot delete another user's listing")
        }
    }
    else{
        res.status(400).send('dog listing does not exist')
    }


}

// export const findByBreed: RequestHandler = async (req, res, next) => {
//     let breedParams = req.params.breed

//     let breedDogs: DogListing[] | [] = await DogListing.findAll({
//         where:{
//             breed: breedParams
//         }
//     })

//     res.status(200).json(breedDogs);
// }

// export const findByLocation: RequestHandler = async (req, res, next) => {
//     let user: User | null = await verifyUser(req);

//     if(!user){
//         return res.status(401).send('please sign in to find by location')
//     }

//     let paramsLocation = req.params.location;
//     let closeUsers: User[] | [] = await User.findAll({
//         where: {
//             state: paramsLocation
//         }
//     })

//     let closeDogs: DogListing[][] = await Promise.all(closeUsers.flatMap(async (usr) => {
//         return await DogListing.findAll({
//             where: {
//                 userId: usr.userId
//             }
//         });
//     }));
     

// }