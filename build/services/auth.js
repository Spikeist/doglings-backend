"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenAssigner = exports.comparePasswords = exports.hashedPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashedPassword = async (inputtedText) => {
    const saltRound = 12;
    return await bcrypt_1.default.hash(inputtedText, saltRound);
};
exports.hashedPassword = hashedPassword;
const comparePasswords = async (inputtedText, hashedPassword) => {
    return await bcrypt_1.default.compare(inputtedText, hashedPassword);
};
exports.comparePasswords = comparePasswords;
const secret = "We are secretly Jedi of the Old Republic!";
const tokenAssigner = async (user) => {
    let token = jsonwebtoken_1.default.sign({ userId: user.userId }, secret, { expiresIn: '2hr' });
    return token;
};
exports.tokenAssigner = tokenAssigner;
