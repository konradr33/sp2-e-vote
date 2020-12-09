/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [];

        this.start =  new Date(2020,5,1);
        this.estop = new Date(2020,11,20);
        this.stop = new Date(2020,11,22);

        // for (const asset of assets) {
        //     asset.docType = 'asset';
        //     await ctx.stub.putState(asset.ID, Buffer.from(JSON.stringify(asset)));
        //     console.info(`Asset ${asset.ID} initialized`);
        // }
    }


    async Vote(ctx, id, optionId, optionName, statData, voteDate, isFinal) {
        let now= new Date();
        console.info(`final vote adding${now} ${this.start} ${this.stop}`);
        if( this.start < now && now <  this.estop  ){
            console.info(`e-vote adding`);

        }else if(isFinal && this.estop < now && now < this.stop){
            console.info(`final vote adding`);
        }else{
            return JSON.stringify({error:"Voting is over"});
        }

        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            const assetString = await this.ReadAsset(ctx, id);
            const asset = JSON.parse(assetString);
            if(asset.isFinal)
                return  JSON.stringify({error:"Cannot Owerride final vote"});
        }

        const asset = {
            ID: id,
            optionId: optionId ,
            optionName: optionName,
            statData: statData,
            voteDate: voteDate,
            isFinal: isFinal
        };
        ctx.stub.putState(id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(`Voted to ${asset.optionId}:${optionName}`);
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
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

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
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }


}

module.exports = AssetTransfer;
