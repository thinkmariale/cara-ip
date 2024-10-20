import { privateKeyToAccount, Address, Account } from 'viem/accounts'

// Add your private key to your .env file.
const privateKey: Address = `0x${process.env.WALLET_PRIVATE_KEY}`

export const account: Account = privateKeyToAccount(privateKey)

// This is a pre-configured PIL Flavor: https://docs.story.foundation/docs/pil-flavors
export const NonCommercialSocialRemixingTermsId = '1'

// A NFT contract address that will be used to represent your IP Assets
export const SPGNFTContractAddress: Address =
    (process.env.SPG_NFT_CONTRACT_ADDRESS as Address) || '0x9BDca7dbdd7cFB7984993e6EcEbB91DAE360f791'


// The currency used for paying License Tokens or tipping
// This address must be whitelisted by the protocol. You can see the
// currently whitelisted addresses here: https://docs.story.foundation/docs/royalty-module#whitelisted-revenue-tokens
export const CurrencyAddress: Address = (process.env.CURRENCY_ADDRESS as Address) || '0x91f6F05B08c16769d3c85867548615d270C42fC7'