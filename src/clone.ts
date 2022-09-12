import { config } from 'dotenv';
config();
import { Chain, connect, HexNumber, HexString, } from '@nested-finance/lego-contracts';
import { Wallet, utils, BigNumber } from 'ethers';
import fetch from 'node-fetch';

// config
const chain = Chain.poly;
const toClone = 'poly:3';
const gasPrice = BigNumber.from('50000000000'); // 50 GWEI... update this based on current gas price https://polygonscan.com/gastracker
const budget = utils.parseEther('1');
const budgetToken: HexString = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // MATIC
// const budgetToken: HexString = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'; // DAI


(async () => {

    // ==== get info about porfolio to copy
    const result = await fetch('https://api.nested.finance/graphql', {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            query: `query {
                nft(id: "${toClone}") {
                  holdings {
                    qty
                    valueRatio
                    token {
                      id
                      name
                    }
                  }
                }
              }
              `
        })
    });

    if (!result.ok) {
        throw new Error('Failed to fetch porfolio: ' + result.statusText);
    }

    type Response = { data: { nft: { holdings: { qty: HexNumber; valueRatio: number; token: { id: string, name: string } }[] } } };
    const data = await result.json() as Response;
    console.log(data);

    // ==== connect web3
    const nested = await connect({
        chain,
        signer: Wallet.fromMnemonic(process.env.MNEMONIC!),
    });

    const ptf = nested.createPortfolio(budgetToken, {
        originalPortfolioId: toClone,
    });

    const precision = 100000;

    await Promise.all(data.data.nft.holdings.map(h => (async () => {
        const id = h.token.id.substring(chain.length + 1) as HexString;
        const tokenBudget = budget.mul(Math.round(h.valueRatio * precision)).div(precision);
        console.log(`Buying ${utils.formatEther(tokenBudget)} MATIC of ${h.token.name}`);
        await ptf.addToken(id, 0.05) // 5% slippage
            .setInputAmount(tokenBudget);
    })()));

    // ==== approve token if needed (but given that we're sending the native token as input, then this wont do anything)
    if (!ptf.isApproved()) {
        await ptf.approve();
    }

    // === creating NFT
    // console.log(ptf.buildCallData())
    const { publicUrl } = await ptf.execute({
        gasPrice,
    });

    console.log('Created NFT: ' + publicUrl);
})();
