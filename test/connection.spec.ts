import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { describe, it, type TestContext } from 'node:test';
import { connect } from '../db/connection';

const URI = 'mongodb://mongo-1:27017/test';

void describe('connection', () => {
    void it('leaves reconnection to the driver', async (t: TestContext) => {
        const dial = t.mock.method(mongoose, 'connect', () => Promise.resolve(mongoose));

        await connect(URI);
        // What Mongoose emits on a replica set while there is no primary
        mongoose.connection.emit('disconnected');

        assert.equal(dial.mock.callCount(), 1);
        assert.equal(dial.mock.calls[0].arguments[0], URI);
    });

    void it('closes the connection after a failed attempt, then retries', async (t: TestContext) => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        t.mock.method(console, 'error', () => undefined);
        t.mock.method(mongoose, 'connect', () => Promise.reject(new Error('refused')));
        const close = t.mock.method(mongoose.connection, 'close', () => Promise.resolve(mongoose.connection));
        const retry = t.mock.method(globalThis, 'setTimeout');

        await connect(URI, 1000);

        assert.equal(close.mock.callCount(), 1);
        assert.equal(retry.mock.callCount(), 1);
    });
});
