interface StoredDocument {
    id: string
}

interface UpdateOne<T extends StoredDocument> {
    updateOne: {
        filter: { id: string };
        update: T;
        upsert: boolean;
    };
}

/**
 * Replaces the small part of a Mongoose model used by the collection tests.
 * Keeping this at the model boundary exercises the collection code without
 * starting a MongoDB binary for every test file.
 * @returns A cleanup function to revert mutations to the model
 */
export function mockMongooseCollection<T extends StoredDocument>(
    model: object
): () => void {
    const documents = new Map<string, T>();
    const methodNames = ['find', 'insertMany', 'bulkWrite'] as const;
    const originalDescriptors = new Map(
        methodNames.map((name) => [name, Object.getOwnPropertyDescriptor(model, name)])
    );

    Object.defineProperties(model, {
        find: {
            configurable: true,
            value: (filter: { id: { $in: string[] } }) => {
                return Promise.resolve(filter.id.$in.flatMap((id) => {
                    const document = documents.get(id);

                    return document == null ? [] : [document];
                }))
            }
        },
        insertMany: {
            configurable: true,
            value: (newDocuments: T[]) => {
                for (const document of newDocuments) {
                    documents.set(document.id, { ...document });
                }

                return Promise.resolve(newDocuments);
            }
        },
        bulkWrite: {
            configurable: true,
            value: (writes: UpdateOne<T>[]) => {
                for (const { updateOne } of writes) {
                    documents.set(updateOne.filter.id, { ...updateOne.update });
                }

                return Promise.resolve({ ok: 1 });
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
