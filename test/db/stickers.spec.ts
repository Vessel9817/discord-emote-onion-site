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
    
    describe('setDefault', () => {
        describe('sets default fields', () => {
            it('with no fields set', () => {
                const id = '123456789012345';
                const sticker = Stickers.setDefault({ id });

                assert.strictEqual(sticker.id, id);
                assert.strictEqual(sticker.name, '');
                assert.strictEqual(sticker.ext, 'png');
            });

            it('with fields preset', () => {
                // If fields are present, they shouldn't be defaulted
                const sticker: Stickers.Sticker = {
                    id: '123456789012345',
                    name: 'test',
                    ext: 'gif'
                };
                const newSticker = Stickers.setDefault(sticker);

                assert.strictEqual(sticker.id, newSticker.id);
                assert.strictEqual(sticker.name, newSticker.name);
                assert.strictEqual(sticker.ext, newSticker.ext);
            });
        });
    });

    describe('merge', () => {
        it('uses default', () => {
            const sticker: Stickers.PartialSticker = {
                id: '111111111111111',
                name: 'test',
                ext: 'gif'
            };

            const newSticker = Stickers.merge(undefined, sticker);

            assert.strictEqual(newSticker.id, sticker.id);
            assert.strictEqual(newSticker.name, sticker.name);
            assert.strictEqual(newSticker.ext, sticker.ext);
        });

        it('infers default values', () => {
            const emoji: Stickers.PartialSticker = {
                id: '111111111111111'
            };

            const newEmoji = Stickers.merge(emoji, emoji);

            assert.strictEqual(newEmoji.id, emoji.id);
            assert.strictEqual(newEmoji.name, '');
            assert.strictEqual(newEmoji.ext, 'png');
        });

        it('throws on mismatched IDs', () => {
            const sticker1: Stickers.PartialSticker = {
                id: '111111111111111'
            }
            const sticker2: Stickers.PartialSticker = {
                id: '222222222222222'
            };

            assert.throws(() => Stickers.merge(sticker1, sticker2));
        });

        describe('prioritizes', () => {
            it('json over png', () => {
                const sticker1: Stickers.PartialSticker = {
                    id: '111111111111111',
                    ext: 'png'
                };
                const sticker2: Stickers.PartialSticker = {
                    id: sticker1.id,
                    ext: 'json'
                };

                const newSticker = Stickers.merge(sticker1, sticker2);

                assert.strictEqual(newSticker.id, sticker2.id);
                assert.strictEqual(newSticker.ext, sticker2.ext);
            });

            it('apng over json', () => {
                const sticker1: Stickers.PartialSticker = {
                    id: '111111111111111',
                    ext: 'json'
                };
                const sticker2: Stickers.PartialSticker = {
                    id: sticker1.id,
                    ext: 'apng'
                };

                const newSticker = Stickers.merge(sticker1, sticker2);

                assert.strictEqual(newSticker.id, sticker2.id);
                assert.strictEqual(newSticker.ext, sticker2.ext);
            });

            it('gif over apng', () => {
                const sticker1: Stickers.PartialSticker = {
                    id: '111111111111111',
                    ext: 'apng'
                };
                const sticker2: Stickers.PartialSticker = {
                    id: sticker1.id,
                    ext: 'gif'
                };

                const newSticker = Stickers.merge(sticker1, sticker2);

                assert.strictEqual(newSticker.id, sticker2.id);
                assert.strictEqual(newSticker.ext, sticker2.ext);
            });

            it('non-empty names', async () => {
                const sticker1: Stickers.PartialSticker = {
                    id: '111111111111111',
                    name: 'test'
                };
                const sticker2: Stickers.PartialSticker = {
                    id: sticker1.id,
                    name: ''
                };

                const newSticker = Stickers.merge(sticker1, sticker2);

                assert.strictEqual(newSticker.id, sticker1.id);
                assert.strictEqual(newSticker.name, sticker1.name);
            });

            it('latest name', async () => {
                const sticker1: Stickers.PartialSticker = {
                    id: '111111111111111',
                    name: 'number1'
                };
                const sticker2: Stickers.PartialSticker = {
                    id: sticker1.id,
                    name: 'number2'
                };

                const newSticker = Stickers.merge(sticker1, sticker2);

                assert.strictEqual(newSticker.id, sticker1.id);
                assert.strictEqual(newSticker.name, sticker2.name);
            });
        });
    });

    describe('get', () => {
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
    })

    describe('update', () => {
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

            it('duplicate documents', async () => {
                // Creating duplicate stickers with varied parameters
                const sticker1: Stickers.Sticker = {
                    id: '111111111111111',
                    name: 'number1',
                    ext: 'apng'
                };
                const sticker2: Stickers.Sticker = {
                    id: sticker1.id,
                    name: 'number2',
                    ext: 'gif'
                };
                const sticker3: Stickers.PartialSticker = {
                    id: sticker1.id
                };

                await Stickers.update([sticker1, sticker2, sticker3]);

                const stickers = await Stickers.get([sticker3.id]);

                assert.strictEqual(stickers.length, 1);
                assert.strictEqual(stickers[0].id, sticker3.id);
                assert.strictEqual(stickers[0].name, 'number2');
                assert.strictEqual(stickers[0].ext, 'gif');
            });
        });
    });
});
