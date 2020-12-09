export CC_NAME="e-vote";
export CC_LANGUAGE="javascript";

./network.sh down
./network.sh up
./network.sh createChannel
./network.sh deployCC -ccn $CC_NAME -ccl $CC_LANGUAGE
