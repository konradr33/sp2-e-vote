'use strict';

const {Contract} = require('fabric-contract-api');
const {v5: uuidv5} = require('uuid');

class AssetTransfer extends Contract {
    // Add few polls
    // Example usage: '{"function":"InitLedger","Args":[]}'
    async InitLedger(ctx) {
        const assets = [
            {
                ID: '16b2e1b1-4798-5382-bcdd-9e0c599d5f20',
                type: 'poll',
                name: 'poll1',
                start: new Date(2020, 5, 1).getTime(),
                end: new Date(2021, 5, 1).getTime(),
                candidates: ['candidate1', 'candidate2'],
                isVoteFinal: true,
            }, {
                ID: '36b2e1b1-4798-5382-bcdd-9e0c599d5f20',
                type: 'poll',
                name: 'poll2',
                start: new Date(2019, 5, 1).getTime(),
                end: new Date(2020, 12, 24).getTime(),
                candidates: ['candidate4', 'candidate5'],
                isVoteFinal: false,
            }
        ];

        for (const asset of assets) {
            await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ID} initialized`);
        }
    }

    // Add poll
    // Example usage: '{"function":"CreatePoll","Args":["poll1","1607539400070","1609528834609","[\"cand1\",\"cand2\"]","false"]}'
    async CreatePoll(ctx, pollName, pollStart, pollEnd, candidates, isVoteFinal) {
        pollStart = parseInt(pollStart);
        pollEnd = parseInt(pollEnd);
        isVoteFinal = isVoteFinal === 'true';
        candidates = JSON.parse(candidates);

        console.info(`CreatePoll: pollName: ${pollName}, pollStart: ${pollStart}, pollEnd: ${pollEnd}, candidates: ${candidates.toString()}, isVoteFinal: ${isVoteFinal}`);

        let now = new Date();

        if (now > pollStart) {
            console.info('Cannot create poll that starts in past');
            throw new Error('Cannot create poll that starts in past');
        } else if (now > pollEnd) {
            console.info('Cannot create poll that ends in past');
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

    // Vote for candidate in poll
    // Example usage: '{"function":"Vote","Args":["me", "3", "60852e31-a55e-5915-b615-ca32cdeb4a85"]}'
    async Vote(ctx, identity, optionIndex, pollId) {
        console.info(`Vote: optionIndex: ${optionIndex}, pollId: ${pollId}`);

        const poll = JSON.parse(await this.ReadAsset(ctx, pollId));
        let now = new Date();

        if (!poll) {
            console.info('No poll found');
            throw new Error('No poll found');
        } else if (now > poll.end) {
            console.info('Poll is over');
            throw new Error('Poll is over');
        } else if (now < poll.start) {
            console.info('Poll has not started yet');
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

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // GetAllVotes returns all votes found in the world state.
    // Example usage: '{"function":"GetAllVotes","Args":[]}'
    async GetAllVotes(ctx) {
        const allVotes = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                console.info(`parsed obj ${JSON.stringify(record)}, record.type: ${record.type}`);

                if (record.type === 'vote') {
                    console.info(`adding ${record.name}`);
                    allVotes.push(record);
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allVotes);
    }

    // GetAllPolls returns all polls found in the world state.
    // Example usage '{"function":"GetAllPolls","Args":[]}'
    async GetAllPolls(ctx) {
        const allPolls = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                console.info(`parsed obj ${JSON.stringify(record)}, record.type: ${record.type}`);

                if (record.type === 'poll') {
                    console.info(`adding ${record.name}`);
                    allPolls.push(record);
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allPolls);
    }
}

module.exports = AssetTransfer;
