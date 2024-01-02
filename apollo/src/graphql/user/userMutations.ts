import { builder } from '../../builder.js';
import { ApiKey, ObjectionApiKey } from '../auth/auth.js';
import {v4 as uuidv4} from 'uuid';

builder.mutationFields((t) => ({
    createApiKey: t.field({
        type: ApiKey,
        async resolve(root, args, ctx) {
            const results = ObjectionApiKey.transaction(async (trx) => {
                const apiKey = uuidv4().replace(/-/g, "");
                const userApiKey = await ObjectionApiKey.query(trx)
                    .insertAndFetch({
                        userId: ctx.userAuth.userId,
                        apiKey: apiKey,
                    })
                    .first();

                return userApiKey;
            });
            return results;
        },
    }),
    archiveApiKey: t.field({
        type: ApiKey,
        args: {
            apiKeyId: t.arg.string({ required: true }),
        },
        async resolve(root, args, ctx) {
            const results = ObjectionApiKey.transaction(async (trx) => {
                const userApiKey = await ObjectionApiKey.query(trx)
                    .patchAndFetchById(
                        args.apiKeyId,
                        { isArchived: true }
                    )
                    .where('userId', ctx.userAuth.userId)
                    .first();

                return userApiKey;
            });
            return results;
        },
    }),
}));