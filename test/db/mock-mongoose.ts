type StoredDocument = { id: string };

type UpdateOne<T extends StoredDocument> = {
    updateOne: {
        filter: { id: string };
        update: T;
        upsert: boolean;
    };
};

/**
 * Replaces the small part of a Mongoose model used by the collection tests.
 * Keeping this at the model boundary exercises the collection code without
 * starting a MongoDB binary for every test file.
 */
export function mockMongooseCollection<T extends StoredDocument>(model: object) {
    const documents = new Map<string, T>();
    const methodNames = ['find', 'insertMany', 'bulkWrite'] as const;
    const originalDescriptors = new Map(
        methodNames.map((name) => [name, Object.getOwnPropertyDescriptor(model, name)])
    );

    Object.defineProperties(model, {
        find: {
            configurable: true,
            value: async (filter: { id: { $in: string[] } }) =>
                filter.id.$in.flatMap((id) => {
                    const document = documents.get(id);
                    return document == null ? [] : [document];
                })
        },
        insertMany: {
            configurable: true,
            value: async (newDocuments: T[]) => {
                for (const document of newDocuments) {
                    documents.set(document.id, { ...document });
                }
                return newDocuments;
            }
        },
        bulkWrite: {
            configurable: true,
            value: async (writes: UpdateOne<T>[]) => {
                for (const { updateOne } of writes) {
                    documents.set(updateOne.filter.id, { ...updateOne.update });
                }
                return { ok: 1 };
            }
        }
    });

    return () => {
        for (const name of methodNames) {
            const descriptor = originalDescriptors.get(name);
            if (descriptor == null) {
                delete (model as Record<string, unknown>)[name];
            }
            else {
                Object.defineProperty(model, name, descriptor);
            }
        }
    };
}
