import { RequestHandler } from "express";
import { DogListing } from "../models/listing";
import { User } from "../models/user";
import { verifyUser } from "../services/auth";
import { Op } from "sequelize";

export const getAllDogs: RequestHandler = async (req, res, next) => {

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 0;
    
    let dogs: DogListing[];

    if (limit > 0) {
        dogs = await DogListing.findAll({ limit: limit });
    } else {
        dogs = await DogListing.findAll();
    }

    const breed = req.query.breed as string;
    const gender = req.query.gender as string;
    let maxPrice = req.query.maxPrice as string;

    let breedSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                breed: {
                  [Op.like]: `%${breed}%`
                }
              }
        })
    }
    let genderSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                gender: {
                    [Op.eq]: gender
                }
              }
        })
    }
    let maxPriceSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                price: {
                    [Op.lte]: maxPrice
                }
              }
        })
    }
    let breedGenderSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                [Op.and]: [
                    {breed: {
                        [Op.like]: `%${breed}%`
                    }},
                    {gender: {
                        [Op.eq]: gender
                    }}
                ]
            }
        })
    }
    let breedMaxPriceSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                [Op.and]: [
                    {breed: {
                        [Op.like]: `%${breed}%`
                    }},
                    {price: {
                        [Op.lte]: maxPrice
                    }}
                ]
            }
        })
    }
    let genderMaxPriceSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                [Op.and]: [
                    {gender: {
                        [Op.eq]: gender
                    }},
                    {price: {
                        [Op.lte]: maxPrice
                    }}
                ]
            }
        })
    }
    let breedGenderMaxPriceSearch = async () => {
        dogs = await DogListing.findAll({
            where: {
                [Op.and]: [
                    {breed: {
                        [Op.like]: `%${breed}%`
                    }},
                    {gender: {
                        [Op.eq]: gender
                    }},
                    {price: {
                        [Op.lte]: maxPrice
                    }}
                ]
            }
        })
    }

    if (breed && gender && maxPrice) {
        await breedGenderMaxPriceSearch();
    } else if (breed && gender) {
        await breedGenderSearch();
    } else if (breed && maxPrice) {
        await breedMaxPriceSearch();
    } else if (gender && maxPrice) {
        await genderMaxPriceSearch();
    } else if (breed) {
        await breedSearch();
    } else if (gender) {
        await genderSearch();
    } else if (maxPrice) {
        await maxPriceSearch();
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

export const getMyDogs: RequestHandler = async (req, res, next) => {
    let user: User | null = await verifyUser(req);
    if(!user){
        return res.status(401).send('please sign in to add a listing')
    }

    try{
        let myDogs: DogListing[] | null = await DogListing.findAll({
            where: {
                userId: user.userId
            }
        })

        res.status(200).json(myDogs)
    }
    catch(error){
        res.status(400).send(error)
    }
}

export const addDog: RequestHandler = async (req, res, next) => {
    let user: User | null = await verifyUser(req);
    let dogBody: DogListing = req.body;


    if(!user){
        return res.status(401).send('please sign in to add a listing')
    }

    dogBody.userId = user.userId

    console.log(dogBody)
    try{

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
            await DogListing.destroy({
                where: {
                    dogId: reqId
                }
            })

            res.status(200).json({
                dogId: idedDog.dogId,
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