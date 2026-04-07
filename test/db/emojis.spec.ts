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

    describe('setDefault', () => {
        describe('sets default fields', () => {
            it('with no fields set', () => {
                const id = '123456789012345';
                const emoji = Emojis.setDefault({ id });

                assert.strictEqual(emoji.id, id);
                assert.strictEqual(emoji.name, '');
                assert.strictEqual(emoji.animated, false);
            });

            it('with fields preset', () => {
                // If fields are present, they shouldn't be defaulted
                const emoji: Emojis.Emoji = {
                    id: '123456789012345',
                    name: 'test',
                    animated: true
                };
                const newEmoji = Emojis.setDefault(emoji);

                assert.strictEqual(emoji.id, newEmoji.id);
                assert.strictEqual(emoji.name, newEmoji.name);
                assert.strictEqual(emoji.animated, newEmoji.animated);
            });
        });
    });

    describe('merge', () => {
        it('uses default', () => {
            const emoji: Emojis.PartialEmoji = {
                id: '111111111111111',
                name: 'test',
                animated: true
            };

            const newEmoji = Emojis.merge(undefined, emoji);

            assert.strictEqual(newEmoji.id, emoji.id);
            assert.strictEqual(newEmoji.name, emoji.name);
            assert.strictEqual(newEmoji.animated, emoji.animated);
        });

        it('infers default values', () => {
            const emoji: Emojis.PartialEmoji = {
                id: '111111111111111'
            };

            const newEmoji = Emojis.merge(emoji, emoji);

            assert.strictEqual(newEmoji.id, emoji.id);
            assert.strictEqual(newEmoji.name, '');
            assert.strictEqual(newEmoji.animated, false);
        });

        it('throws on mismatched IDs', () => {
            const emoji1: Emojis.PartialEmoji = {
                id: '111111111111111'
            }
            const emoji2: Emojis.PartialEmoji = {
                id: '222222222222222'
            };

            assert.throws(() => Emojis.merge(emoji1, emoji2));
        });

        describe('prioritizes', () => {
            it('animation', () => {
                const emoji1: Emojis.PartialEmoji = {
                    id: '111111111111111',
                    animated: true
                };
                const emoji2: Emojis.PartialEmoji = {
                    id: emoji1.id,
                    animated: false
                };

                const newEmoji = Emojis.merge(emoji1, emoji2);

                assert.strictEqual(newEmoji.id, emoji1.id);
                assert.strictEqual(newEmoji.animated, true);
            });

            it('non-empty names', async () => {
                const emoji1: Emojis.PartialEmoji = {
                    id: '111111111111111',
                    name: 'test'
                };
                const emoji2: Emojis.PartialEmoji = {
                    id: emoji1.id,
                    name: ''
                };

                const newEmoji = Emojis.merge(emoji1, emoji2);

                assert.strictEqual(newEmoji.id, emoji1.id);
                assert.strictEqual(newEmoji.name, emoji1.name);
            });

            it('latest name', async () => {
                const emoji1: Emojis.PartialEmoji = {
                    id: '111111111111111',
                    name: 'number1'
                };
                const emoji2: Emojis.PartialEmoji = {
                    id: emoji1.id,
                    name: 'number2'
                };

                const newEmoji = Emojis.merge(emoji1, emoji2);

                assert.strictEqual(newEmoji.id, emoji1.id);
                assert.strictEqual(newEmoji.name, emoji2.name);
            });
        });
    });

    describe('get', () => {
        describe('retrieves documents', () => {
            it('from an array', async () => {
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

            it('from a set', async () => {
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
                const emojis = await Emojis.get(new Set([emoji1.id, emoji2.id]));

                assert.strictEqual(emojis.length, 2);
                assert.strictEqual(emojis[0].id, emoji1.id);
                assert.strictEqual(emojis[0].name, emoji1.name);
                assert.strictEqual(emojis[0].animated, emoji1.animated);
                assert.strictEqual(emojis[1].id, emoji2.id);
                assert.strictEqual(emojis[1].name, emoji2.name);
                assert.strictEqual(emojis[1].animated, emoji2.animated);
            });
        });
    });

    describe('update', () => {
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

            it('latest name', async () => {
                // Creating emoji
                const emoji: Emojis.PartialEmoji = {
                    id: '111111111111111',
                    name: 'abc'
                };

                await Emojis.update([emoji]);

                // Updating emoji
                emoji.name = 'def';

                await Emojis.update([emoji]);

                const emojis = await Emojis.get([emoji.id]);

                assert.strictEqual(emojis.length, 1);
                assert.strictEqual(emojis[0].id, emoji.id);
                assert.strictEqual(emojis[0].name, 'def');
            });
        });

        it('merges duplicate documents', async () => {
            // Creating duplicate stickers with varied parameters
            const emoji1: Emojis.Emoji = {
                id: '111111111111111',
                name: 'number1',
                animated: false
            };
            const emoji2: Emojis.Emoji = {
                id: emoji1.id,
                name: 'number2',
                animated: true
            };
            const emoji3: Emojis.PartialEmoji = {
                id: emoji1.id
            };

            await Emojis.update([emoji1, emoji2, emoji3]);

            const emojis = await Emojis.get([emoji3.id]);

            assert.strictEqual(emojis.length, 1);
            assert.strictEqual(emojis[0].id, emoji3.id);
            assert.strictEqual(emojis[0].name, 'number2');
            assert.strictEqual(emojis[0].animated, true);
        });
    });
});
