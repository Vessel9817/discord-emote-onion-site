import { beforeEach, describe, it } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'node:assert';
import { Stickers } from '../../db/index.ts';

describe('Stickers collection', () => {
    let mongod: MongoMemoryServer;

    beforeEach(async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri());
    });

    afterEach(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    it('retrieves documents', async () => {
        // Creating stickers
        const sticker1: Stickers.Sticker = {
            id: '111111111111111',
            name: 'number1',
            ext: 'png'
        };
        const sticker2: Stickers.Sticker = {
            id: '222222222222222',
            name: 'number2',
            ext: 'gif'
        };

        await Stickers.StickerModel.insertMany([sticker1, sticker2]);

        // Retrieving stickers
        const stickers = await Stickers.get([sticker1.id, sticker2.id]);

        assert.strictEqual(stickers.length, 2);
        assert.strictEqual(stickers[0].id, sticker1.id);
        assert.strictEqual(stickers[0].name, sticker1.name);
        assert.strictEqual(stickers[0].ext, sticker1.ext);
        assert.strictEqual(stickers[1].id, sticker2.id);
        assert.strictEqual(stickers[1].name, sticker2.name);
        assert.strictEqual(stickers[1].ext, sticker2.ext);
    });

    describe('creates document', () => {
        it('with default fields', async () => {
            const id = '123456789012345';

            await Stickers.update([{ id }]);

            const stickers = await Stickers.get([id]);

            assert.strictEqual(stickers.length, 1);
            assert.strictEqual(stickers[0].id, id);
            assert.strictEqual(stickers[0].name, '');
            assert.strictEqual(stickers[0].ext, 'png');
        });

        it('with preset fields', async () => {
            const sticker: Stickers.Sticker = {
                id: '123456789012345',
                name: 'test',
                ext: 'gif'
            };

            await Stickers.update([sticker]);

            const stickers = await Stickers.get([sticker.id]);

            assert.strictEqual(stickers.length, 1);
            assert.strictEqual(stickers[0].id, sticker.id);
            assert.strictEqual(stickers[0].name, sticker.name);
            assert.strictEqual(stickers[0].ext, sticker.ext);
        });
    });

    it('updates documents', async () => {
        // Creating stickers
        const sticker1: Stickers.Sticker = {
            id: '111111111111111',
            name: 'number1',
            ext: 'gif'
        };
        const sticker2: Stickers.Sticker = {
            id: '222222222222222',
            name: 'number2',
            ext: 'png'
        };

        await Stickers.update([sticker1, sticker2]);

        // Updating stickers
        sticker1.name = 'test1';
        sticker2.ext = 'apng';

        await Stickers.update([sticker1, sticker2]);

        const stickers = await Stickers.get([sticker1.id, sticker2.id]);

        assert.strictEqual(stickers.length, 2);
        assert.strictEqual(stickers[0].id, sticker1.id);
        assert.strictEqual(stickers[0].name, sticker1.name);
        assert.strictEqual(stickers[0].ext, sticker1.ext);
        assert.strictEqual(stickers[1].id, sticker2.id);
        assert.strictEqual(stickers[1].name, sticker2.name);
        assert.strictEqual(stickers[1].ext, sticker2.ext);
    });

    it('creates and updates documents', async () => {
        // Creating sticker
        const sticker1: Stickers.Sticker = {
            id: '111111111111111',
            name: 'number1',
            ext: 'png'
        };

        await Stickers.update([sticker1]);

        // Creating and updating stickers
        const sticker2: Stickers.Sticker = {
            id: '222222222222222',
            name: 'number2',
            ext: 'png'
        };

        sticker1.name = 'test';
        sticker1.ext = 'gif';

        await Stickers.update([sticker1, sticker2]);

        const stickers = await Stickers.get([sticker1.id, sticker2.id]);

        assert.strictEqual(stickers.length, 2);
        assert.strictEqual(stickers[0].id, sticker1.id);
        assert.strictEqual(stickers[0].name, sticker1.name);
        assert.strictEqual(stickers[0].ext, sticker1.ext);
        assert.strictEqual(stickers[1].id, sticker2.id);
        assert.strictEqual(stickers[1].name, sticker2.name);
        assert.strictEqual(stickers[1].ext, sticker2.ext);
    });

    describe('prioritizes', () => {
        it('json over png', async () => {
            // Creating sticker
            const sticker: Stickers.PartialSticker = {
                id: '111111111111111',
                ext: 'png'
            };

            await Stickers.update([sticker]);

            // Updating sticker
            sticker.ext = 'json';

            await Stickers.update([sticker]);

            // Updating sticker again
            sticker.ext = 'png';

            await Stickers.update([sticker]);

            const stickers = await Stickers.get([sticker.id]);

            assert.strictEqual(stickers.length, 1);
            assert.strictEqual(stickers[0].id, sticker.id);
            assert.strictEqual(stickers[0].ext, 'json');
        });

        it('apng over json', async () => {
            // Creating sticker
            const sticker: Stickers.PartialSticker = {
                id: '111111111111111',
                ext: 'json'
            };

            await Stickers.update([sticker]);

            // Updating sticker
            sticker.ext = 'apng';

            await Stickers.update([sticker]);

            // Updating sticker again
            sticker.ext = 'json';

            await Stickers.update([sticker]);

            const stickers = await Stickers.get([sticker.id]);

            assert.strictEqual(stickers.length, 1);
            assert.strictEqual(stickers[0].id, sticker.id);
            assert.strictEqual(stickers[0].ext, 'apng');
        });

        it('gif over apng', async () => {
            // Creating sticker
            const sticker: Stickers.PartialSticker = {
                id: '111111111111111',
                ext: 'apng'
            };

            await Stickers.update([sticker]);

            // Updating sticker
            sticker.ext = 'gif';

            await Stickers.update([sticker]);

            // Updating sticker again
            sticker.ext = 'apng';

            await Stickers.update([sticker]);

            const stickers = await Stickers.get([sticker.id]);

            assert.strictEqual(stickers.length, 1);
            assert.strictEqual(stickers[0].id, sticker.id);
            assert.strictEqual(stickers[0].ext, 'gif');
        });

        it('non-empty names', async () => {
            // Creating sticker
            const sticker: Stickers.PartialSticker = {
                id: '111111111111111',
                name: ''
            };

            await Stickers.update([sticker]);

            // Updating sticker
            sticker.name = 'test';

            await Stickers.update([sticker]);

            // Updating sticker again
            sticker.name = '';

            await Stickers.update([sticker]);

            const stickers = await Stickers.get([sticker.id]);

            assert.strictEqual(stickers.length, 1);
            assert.strictEqual(stickers[0].id, sticker.id);
            assert.strictEqual(stickers[0].name, 'test');
        });
    });
});
