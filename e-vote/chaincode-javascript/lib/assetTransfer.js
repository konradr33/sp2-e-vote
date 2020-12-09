'use strict';

const {Contract} = require('fabric-contract-api');
const {v5: uuidv5} = require('uuid');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [];

        this.start = new Date(2020, 5, 1);
        this.estop = new Date(2020, 11, 20);
        this.stop = new Date(2020, 11, 22);

        // for (const asset of assets) {
        //     asset.docType = 'asset';
        //     await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
        //     console.info(`Asset ${asset.ID} initialized`);
        // }
    }

    async CreatePoll(ctx, pollName, pollStart, pollEnd, candidates, isVoteFinal) {
        pollStart = parseInt(pollStart);
        pollEnd = parseInt(pollEnd);
        isVoteFinal = isVoteFinal == 'true';
        candidates = JSON.parse(candidates);

        console.info(`CreatePoll: pollName: ${pollName}, pollStart: ${pollStart}, pollEnd: ${pollEnd}, candidates: ${candidates.toString()}, isVoteFinal: ${isVoteFinal}`);

        let now = new Date();

        if (now > pollStart) {
            console.info(`Cannot create poll that starts in past`);
            throw new Error('Cannot create poll that starts in past');
        } else if (now > pollEnd) {
            console.info(`Cannot create poll that ends in past`);
            throw new Error('Cannot create poll that ends in past');
        }

        console.log('JSON.stringify', JSON.stringify({pollName, pollStart, pollEnd, candidates, isVoteFinal}));

        const id = uuidv5(JSON.stringify({pollName, pollStart, pollEnd, candidates, isVoteFinal}), uuidv5.URL);

        const poll = {
            ID: id,
            type: 'poll',
            name: pollName,
            start: pollStart,
            end: pollEnd,
            candidates: candidates,
            isVoteFinal: isVoteFinal
        };

        console.info(`Created new poll: ${JSON.stringify(poll)}`);

        ctx.stub.putState(poll.ID, Buffer.from(JSON.stringify(poll)));
        return JSON.stringify(poll);
    }

    async Vote(ctx, identity, optionIndex, pollId) {
        console.info(`Vote: optionIndex: ${optionIndex}, pollId: ${pollId}`);

        const poll = JSON.parse(await this.ReadAsset(ctx, pollId));
        let now = new Date();

        if (!poll) {
            console.info(`No poll found`);
            throw new Error('No poll found');
        } else if (now > poll.end) {
            console.info(`Poll is over`);
            throw new Error('Poll is over');
        } else if (now < poll.start) {
            console.info(`Poll has not started yet`);
            throw new Error('Poll has not started yet');
        }

        const id = uuidv5(JSON.stringify({identity, pollId}), uuidv5.URL);

        const vote = {
            ID: id,
            type: 'vote',
            pollId: pollId,
            optionIndex: optionIndex,
        };

        ctx.stub.putState(vote.ID, Buffer.from(JSON.stringify(vote)));
        return JSON.stringify(vote);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        return ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes an given asset from the world state.
    // async DeleteAsset(ctx, id) {
    //     const exists = await this.AssetExists(ctx, id);
    //     if (!exists) {
    //         throw new Error(`The asset ${id} does not exist`);
    //     }
    //     return ctx.stub.deleteState(id);
    // }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }


    // GetAllAssets returns all assets found in the world state.
    async GetAllVotes(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;
