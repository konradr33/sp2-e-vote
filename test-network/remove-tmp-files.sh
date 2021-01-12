shopt -s extglob

rm -r ./channel-artifacts
rm -r ./organizations/ordererOrganizations ./organizations/peerOrganizations
rm  *.txt *.tar.gz
rm ./system-genesis-block/genesis.block

cd ../e-vote/application-javascript
rm -r wallet
cd ../../test-network

cd organizations/fabric-ca/ordererOrg
rm -r -v !(*.yaml)

cd ../org1
rm -r -v !(*.yaml)

cd ../org2
rm -r -v !(*.yaml)

shopt -u extglob
