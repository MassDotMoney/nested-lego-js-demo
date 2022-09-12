This repository demonstrates how to use [Nested](https://nested.fi) JS libary: [@nested-finance/lego-contracts](https://www.npmjs.com/package/@nested-finance/lego-contracts)

# Setup

1) Setup your .env file, based on [.env.sample](.env.sample)

2) Run `yarn`  to install dependencies

3) Run `yarn run:clone` to run the only current example in this repository... it should create a copy of the [DIFFER MATIC](https://app.nested.fi/explorer/poly:3) portolio, worth approximately 1 MATIC.


nb: The gas price has been hard-coded for demonstration purposes, so please update it based on [current gas price](https://polygonscan.com/gastracker)

# Demonstrated use cases

- [clone.ts](src/clone.ts) 👉 Clones a given NFT
