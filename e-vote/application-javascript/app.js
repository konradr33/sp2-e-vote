/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const {Gateway, Wallets} = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const {buildCAClient, registerAndEnrollUser, enrollAdmin} = require('../../test-application/javascript/CAUtil.js');
const {buildCCPOrg1, buildWallet} = require('../../test-application/javascript/AppUtil.js');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const channelName = 'mychannel';
const chaincodeName = 'e-vote';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
//Every app restart creates new user to vote,
const org1UserId = 'User'+makeid(5);



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = buildCCPOrg1();

        // build an instance of the fabric ca services client based on
        // the information in the network configuration
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

        // setup the wallet to hold the credentials of the application user
        const wallet = await buildWallet(Wallets, walletPath);

        // in a real application this would be done on an administrative flow, and only once
        await enrollAdmin(caClient, wallet, mspOrg1);

        // in a real application this would be done only when a new user was required to be added
        // and would be part of an administrative flow
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

        // Create a new gateway instance for interacting with the fabric network.
        // In a real application this would be done as the backend server session is setup for
        // a user that has been verified.
        const gateway = new Gateway();

        try {
            // setup the gateway instance
            // The user will now be able to create connections to the fabric network and be able to
            // submit transactions and query. All transactions submitted by this gateway will be
            // signed by this user using the credentials stored in the wallet.
            await gateway.connect(ccp, {
                wallet,
                identity: org1UserId,
                discovery: {enabled: true, asLocalhost: true} // using asLocalhost as this gateway is using a fabric network deployed locally
            });

            // Build a network instance based on the channel where the smart contract is deployed
            const network = await gateway.getNetwork(channelName);

            // Get the contract from the network.
            const contract = network.getContract(chaincodeName);

            // Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
            // This type of transaction would only be run once by an application the first time it was started after it
            // deployed the first time. Any updates to the chaincode deployed later would likely not need to run
            // an "init" type function.
            console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
            await contract.submitTransaction('InitLedger');
            console.log('*** InitLedger: committed');

            app.use(bodyParser.json());

            // Return all polls
            app.get('/polls', async (req, res) => {
                let result = await contract.evaluateTransaction('GetAllPolls');
                res.json(JSON.parse(result.toString()));
            });

            // create poll
            // example body:
            // {
            //     "pollName":"generated poll",
            //     "pollStart":"1609980425080",
            //     "pollEnd":"1609980426080",
            //     "candidates":["cand1","cand2"],
            //     "isVoteFinal":"true",
            //     "publicKey":"",
            //     "signature":""
            // }
            app.post('/polls', async (req, res) => {
                let result = await contract.submitTransaction('CreatePoll', req.body.pollName,
                    req.body.pollStart, req.body.pollEnd, JSON.stringify(req.body.candidates), req.body.isVoteFinal);
                res.json(JSON.parse(result.toString()));
            });

            // get exact poll
            app.get('/polls/:id', async (req, res) => {
                try {
                    let result = await contract.evaluateTransaction('ReadAsset', req.params.id);
                    res.json(JSON.parse(result.toString()));
                } catch (e) {
                    res.sendStatus(404);
                }
            });

            // Return all votes
            app.get('/votes', async (req, res) => {
                let result = await contract.evaluateTransaction('GetAllVotes');
                res.json(JSON.parse(result.toString()));
            });

            // Return exact vote
            app.get('/votes/:id', async (req, res) => {
                try {
                    let result = await contract.evaluateTransaction('ReadAsset', req.params.id);
                    res.json(JSON.parse(result.toString()));
                } catch (e) {
                    res.sendStatus(404);
                }
            });

            // Return exact vote results
            app.get('/results/:id', async (req, res) => {
                try {
                    let result = await contract.evaluateTransaction('GetPollResults', req.params.id);
                    res.json(result.toString());
                } catch (e) {
                    res.sendStatus(404);
                }
            });

            // vote
            // example body:
            // {
            //     "pollId":"16b2e1b1-4798-5382-bcdd-9e0c599d5f20",
            //     "optionIndex":1,
            //     "publicKey":"",
            //     "signature":""
            // }
            app.post('/votes', async (req, res) => {
                let result = await contract.submitTransaction('Vote', org1UserId, req.body.optionIndex, req.body.pollId);
                res.json(JSON.parse(result.toString()));
            });

            app.listen(port, () => {
                console.log(`E-vote app listening at http://localhost:${port}`)
            });

            process.on('SIGTERM', () => {
                console.log("Exiting application...")
                gateway.disconnect();
                process.exit(0);
            });

        } finally {
            // Disconnect from the gateway when the application is closing
            // This will close all connections to the network
            // console.log('Gateway disconnect');
            // gateway.disconnect();
        }
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();
