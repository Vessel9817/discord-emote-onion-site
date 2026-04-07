import { beforeEach, describe, it } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'node:assert';
import { Emojis } from '../../db/index.ts';

describe('Emojis collection', () => {
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
        // Creating emojis
        const emoji1: Emojis.Emoji = {
            id: '111111111111111',
            name: 'number1',
            animated: false
        };
        const emoji2: Emojis.Emoji = {
            id: '222222222222222',
            name: 'number2',
            animated: true
        };

        await Emojis.EmojiModel.insertMany([emoji1, emoji2]);

        // Retrieving emojis
        const emojis = await Emojis.get([emoji1.id, emoji2.id]);

        assert.strictEqual(emojis.length, 2);
        assert.strictEqual(emojis[0].id, emoji1.id);
        assert.strictEqual(emojis[0].name, emoji1.name);
        assert.strictEqual(emojis[0].animated, emoji1.animated);
        assert.strictEqual(emojis[1].id, emoji2.id);
        assert.strictEqual(emojis[1].name, emoji2.name);
        assert.strictEqual(emojis[1].animated, emoji2.animated);
    });

    describe('creates document', () => {
        it('with default fields', async () => {
            const id = '123456789012345';

            await Emojis.update([{ id }]);

            const emojis = await Emojis.get([id]);

            assert.strictEqual(emojis.length, 1);
            assert.strictEqual(emojis[0].id, id);
            assert.strictEqual(emojis[0].name, '');
            assert.strictEqual(emojis[0].animated, false);
        });

        it('with preset fields', async () => {
            const emoji: Emojis.Emoji = {
                id: '123456789012345',
                name: 'test',
                animated: true
            };

            await Emojis.update([emoji]);

            const emojis = await Emojis.get([emoji.id]);

            assert.strictEqual(emojis.length, 1);
            assert.strictEqual(emojis[0].id, emoji.id);
            assert.strictEqual(emojis[0].name, emoji.name);
            assert.strictEqual(emojis[0].animated, emoji.animated);
        });
    });

    it('updates documents', async () => {
        // Creating emojis
        const emoji1: Emojis.Emoji = {
            id: '111111111111111',
            name: 'number1',
            animated: true
        };
        const emoji2: Emojis.Emoji = {
            id: '222222222222222',
            name: 'number2',
            animated: false
        };

        await Emojis.update([emoji1, emoji2]);

        // Updating emojis
        emoji1.name = 'test1';
        emoji2.animated = true;

        await Emojis.update([emoji1, emoji2]);

        const emojis = await Emojis.get([emoji1.id, emoji2.id]);

        assert.strictEqual(emojis.length, 2);
        assert.strictEqual(emojis[0].id, emoji1.id);
        assert.strictEqual(emojis[0].name, emoji1.name);
        assert.strictEqual(emojis[0].animated, emoji1.animated);
        assert.strictEqual(emojis[1].id, emoji2.id);
        assert.strictEqual(emojis[1].name, emoji2.name);
        assert.strictEqual(emojis[1].animated, emoji2.animated);
    });

    it('creates and updates documents', async () => {
        // Creating emoji
        const emoji1: Emojis.Emoji = {
            id: '111111111111111',
            name: 'number1',
            animated: false
        };

        await Emojis.update([emoji1]);

        // Creating and updating emojis
        const emoji2: Emojis.Emoji = {
            id: '222222222222222',
            name: 'number2',
            animated: false
        };

        emoji1.name = 'test';
        emoji1.animated = true;

        await Emojis.update([emoji1, emoji2]);

        const emojis = await Emojis.get([emoji1.id, emoji2.id]);

        assert.strictEqual(emojis.length, 2);
        assert.strictEqual(emojis[0].id, emoji1.id);
        assert.strictEqual(emojis[0].name, emoji1.name);
        assert.strictEqual(emojis[0].animated, emoji1.animated);
        assert.strictEqual(emojis[1].id, emoji2.id);
        assert.strictEqual(emojis[1].name, emoji2.name);
        assert.strictEqual(emojis[1].animated, emoji2.animated);
    });

    describe('prioritizes', () => {
        it('animation', async () => {
            // Creating emoji
            const emoji: Emojis.PartialEmoji = {
                id: '111111111111111',
                animated: false
            };

            await Emojis.update([emoji]);

            // Updating emoji
            emoji.animated = true;

            await Emojis.update([emoji]);

            // Updating emoji again
            emoji.animated = false;

            await Emojis.update([emoji]);

            const emojis = await Emojis.get([emoji.id]);

            assert.strictEqual(emojis.length, 1);
            assert.strictEqual(emojis[0].id, emoji.id);
            assert.strictEqual(emojis[0].animated, true);
        });

        it('non-empty names', async () => {
            // Creating emoji
            const emoji: Emojis.PartialEmoji = {
                id: '111111111111111',
                name: ''
            };

            await Emojis.update([emoji]);

            // Updating emoji
            emoji.name = 'test';

            await Emojis.update([emoji]);

            // Updating emoji again
            emoji.name = '';

            await Emojis.update([emoji]);

            const emojis = await Emojis.get([emoji.id]);

            assert.strictEqual(emojis.length, 1);
            assert.strictEqual(emojis[0].id, emoji.id);
            assert.strictEqual(emojis[0].name, 'test');
        });
    });
});
