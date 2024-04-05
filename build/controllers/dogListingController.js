"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDogListing = exports.editDogInfo = exports.addDog = exports.getMyDogs = exports.getDogInfo = exports.getAllDogs = void 0;
const listing_1 = require("../models/listing");
const auth_1 = require("../services/auth");
const sequelize_1 = require("sequelize");
const getAllDogs = async (req, res, next) => {
    let dogs = await listing_1.DogListing.findAll();
    const breed = req.query.breed;
    const gender = req.query.gender;
    let maxPrice = req.query.maxPrice;
    let breedSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                breed: {
                    [sequelize_1.Op.like]: `%${breed}%`
                }
            }
        });
    };
    let genderSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                gender: {
                    [sequelize_1.Op.eq]: gender
                }
            }
        });
    };
    let maxPriceSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                price: {
                    [sequelize_1.Op.lte]: maxPrice
                }
            }
        });
    };
    let breedGenderSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { breed: {
                            [sequelize_1.Op.like]: `%${breed}%`
                        } },
                    { gender: {
                            [sequelize_1.Op.eq]: gender
                        } }
                ]
            }
        });
    };
    let breedMaxPriceSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { breed: {
                            [sequelize_1.Op.like]: `%${breed}%`
                        } },
                    { price: {
                            [sequelize_1.Op.lte]: maxPrice
                        } }
                ]
            }
        });
    };
    let genderMaxPriceSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { gender: {
                            [sequelize_1.Op.eq]: gender
                        } },
                    { price: {
                            [sequelize_1.Op.lte]: maxPrice
                        } }
                ]
            }
        });
    };
    let breedGenderMaxPriceSearch = async () => {
        dogs = await listing_1.DogListing.findAll({
            where: {
                [sequelize_1.Op.and]: [
                    { breed: {
                            [sequelize_1.Op.like]: `%${breed}%`
                        } },
                    { gender: {
                            [sequelize_1.Op.eq]: gender
                        } },
                    { price: {
                            [sequelize_1.Op.lte]: maxPrice
                        } }
                ]
            }
        });
    };
    if (breed && gender && maxPrice) {
        await breedGenderMaxPriceSearch();
    }
    else if (breed && gender) {
        await breedGenderSearch();
    }
    else if (breed && maxPrice) {
        await breedMaxPriceSearch();
    }
    else if (gender && maxPrice) {
        await genderMaxPriceSearch();
    }
    else if (breed) {
        await breedSearch();
    }
    else if (gender) {
        await genderSearch();
    }
    else if (maxPrice) {
        await maxPriceSearch();
    }
    res.status(200).json(dogs);
};
exports.getAllDogs = getAllDogs;
const getDogInfo = async (req, res, next) => {
    let reqId = req.params.id;
    let dogInfo = await listing_1.DogListing.findByPk(reqId);
    if (dogInfo) {
        res.status(200).json(dogInfo);
    }
    else {
        res.status(400).send('sorry, dog does not exist ... please go back to the listings page');
    }
};
exports.getDogInfo = getDogInfo;
const getMyDogs = async (req, res, next) => {
    let user = await (0, auth_1.verifyUser)(req);
    if (!user) {
        return res.status(401).send('please sign in to add a listing');
    }
    try {
        let myDogs = await listing_1.DogListing.findAll({
            where: {
                userId: user.userId
            }
        });
        res.status(200).json(myDogs);
    }
    catch (error) {
        res.status(400).send(error);
    }
};
exports.getMyDogs = getMyDogs;
const addDog = async (req, res, next) => {
    let user = await (0, auth_1.verifyUser)(req);
    let dogBody = req.body;
    if (!user) {
        return res.status(401).send('please sign in to add a listing');
    }
    dogBody.userId = user.userId;
    console.log(dogBody);
    try {
        let created = await listing_1.DogListing.create(dogBody);
        res.status(201).json(created);
    }
    catch (error) {
        res.status(400).send(error);
    }
};
exports.addDog = addDog;
const editDogInfo = async (req, res, next) => {
    let dogBody = req.body;
    let reqId = req.params.id;
    let user = await (0, auth_1.verifyUser)(req);
    if (!user) {
        return res.status(401).send('please sign in to edit a listing');
    }
    let idedDog = await listing_1.DogListing.findByPk(reqId);
    if (idedDog) {
        if (idedDog.userId === user.userId) {
            await listing_1.DogListing.update(dogBody, {
                where: {
                    dogId: reqId
                }
            });
            res.status(200).json({
                updated: true,
                dogId: reqId
            });
        }
        else {
            res.status(401).send("cannot edit another user's dog");
        }
    }
    else {
        res.status(400).send('no such dog exists');
    }
};
exports.editDogInfo = editDogInfo;
const deleteDogListing = async (req, res, next) => {
    let user = await (0, auth_1.verifyUser)(req);
    if (!user) {
        return res.status(401).send('please sign in to edit a listing');
    }
    let reqId = req.params.id;
    let idedDog = await listing_1.DogListing.findByPk(reqId);
    if (idedDog) {
        if (idedDog.userId === user.userId) {
            await listing_1.DogListing.destroy({
                where: {
                    dogId: reqId
                }
            });
            res.status(200).json({
                dogId: idedDog.dogId,
                deleted: true
            });
        }
        else {
            res.status(401).send("cannot delete another user's listing");
        }
    }
    else {
        res.status(400).send('dog listing does not exist');
    }
};
exports.deleteDogListing = deleteDogListing;
