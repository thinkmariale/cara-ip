'use server';
import { http, createWalletClient, createPublicClient, Address } from 'viem'
import {  account } from './util'
import { iliad } from '@story-protocol/core-sdk'
import { defaultNftContractAbi } from './defaultNftContractAbi'


const baseConfig = {
    chain: iliad,
    transport: http(process.env.RPC_PROVIDER_URL),
} as const
 const publicClient = createPublicClient(baseConfig)
 const walletClient = createWalletClient({
    ...baseConfig,
    account,
})

export async function mintNFT(to: Address, uri: string): Promise<number | undefined> {
    console.log('Minting a new NFT...')

    const { request } = await publicClient.simulateContract({
        address: process.env.NFT_CONTRACT_ADDRESS,
        functionName: 'mintNFT',
        args: [to, uri],
        abi: defaultNftContractAbi,
    })
    const hash = await walletClient.writeContract(request)
    const { logs } = await publicClient.waitForTransactionReceipt({
        hash,
    })
    if (logs[0].topics[3]) {
        return parseInt(logs[0].topics[3], 16)
    }
}

