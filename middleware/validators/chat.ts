import { check } from 'express-validator';
import { ObjectId } from 'mongodb';
import { MsgBoard } from '../../db';

const idValidator = check('id')
    .trim()
    // Is stringified ObjectId (24 hexadecimal characters)
    .isString()
    .isLength({ min: 24, max: 24 })
    .isHexadecimal()
    .custom((rawId: string) => ObjectId.isValid(rawId))
    .withMessage('Invalid id')
    .bail()
    // Id exists in database
    .custom(async (rawId: string) => {
        const id = new ObjectId(rawId);

        return await MsgBoard.idExists(id);
    })
    .withMessage('Invalid id')
    .bail();

const nameValidator = check('name')
    // Is string
    .isString()
    .withMessage('Invalid display name')
    .bail()
    // Is not empty
    .notEmpty()
    .withMessage('Please enter your display name')
    .bail()
    // Is between 1 and 32 characters
    .isLength({ min: 1, max: 32 })
    .withMessage(
        'Display name must be between 1 and 32 characters, inclusive'
    )
    .bail();

const contentValidator = check('content')
    .isString()
    .notEmpty()
    .withMessage('Please enter a message')
    .bail()
    // Is between 1 and 2048 characters
    .isLength({ min: 1, max: 2048 })
    .withMessage((value: string) =>
        `Message must be between 1 and 2048 characters, inclusive (got ${value.length.toString()})`
    )
    .bail();

export const sendMsgValidators = [
    nameValidator,
    contentValidator
];

export const editMsgValidators = [
    ...sendMsgValidators,
    idValidator,
];

export const deleteMsgValidators = [idValidator];
