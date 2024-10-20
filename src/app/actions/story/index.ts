'use server';
import { AddressZero, Address, PIL_TYPE, RegisterIpAndAttachPilTermsResponse,RegisterIpAndMakeDerivativeResponse,  StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import { http } from 'viem'
import { setupIPFSMetadata } from '@/lib/web3/ipfsManager';
import { mintNFT} from '@/lib/web3/index'
import { account, NonCommercialSocialRemixingTermsId} from '@/lib/web3/util'

import { CreateCertificate } from '@/lib/mentaport/index';
import { NewAsset } from '@/lib/types'


export async function createIPTest(newAsset:NewAsset, address:string) {
 try {
  console.log("CREATE createIPTest")
  const res= await CreateCertificate(newAsset, address)
  return res
 } catch(e) {
  
  return {status:false, message:""}
 } 

}

export async function createIP(newAsset:NewAsset, address:string, isDerivative:boolean, ipId:string) {
  try {
    console.log('createIP', newAsset.title)
    //  Set up your Story Config
    const config: StoryConfig = {
        account: account,
        transport: http(process.env.RPC_PROVIDER_URL),
        chainId: 'iliad',
    }
    const client = StoryClient.newClient(config)
    // Setup IPFS Metadata
    const res = await setupIPFSMetadata(client, newAsset)
    //  Mint an NFT
    const tokenId = await mintNFT(account.address, `https://ipfs.io/ipfs/${res.nftIpfsHash}`)
    console.log(`NFT minted with tokenId ${tokenId}`)
    let newIpId=''
    // Mint Derivative
    if(isDerivative) {
      console.log("DERIVATIVE")
      const response: RegisterIpAndMakeDerivativeResponse = await client.ipAsset.registerDerivativeIp({
        nftContract: process.env.NFT_CONTRACT_ADDRESS,
        tokenId: tokenId!,
        derivData: {
            parentIpIds: [ipId as Address],
            licenseTermsIds: [NonCommercialSocialRemixingTermsId],
        },
        // NOTE: The below metadata is not configured properly. It is just to make things simple.
        // See `simpleMintAndRegister.ts` for a proper example.
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${res.ipIpfsHash}`,
          ipMetadataHash: `0x${res.ipHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${res.nftIpfsHash}`,
          nftMetadataHash: `0x${res.nftHash}`,
      },
        txOptions: { waitForTransaction: true },
      })
      console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`)
      console.log(`View on the explorer: https://explorer.story.foundation/ipa/${response.ipId}`)
      newIpId = response.ipId
      
    } else {
      // Register an IP Asset
      const response: RegisterIpAndAttachPilTermsResponse = await client.ipAsset.registerIpAndAttachPilTerms({
        nftContract: process.env.NFT_CONTRACT_ADDRESS,
        tokenId: tokenId!,
        pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
        mintingFee: 0, // empty - doesn't apply
        currency: AddressZero, // empty - doesn't apply
        ipMetadata: {
            ipMetadataURI: `https://ipfs.io/ipfs/${res.ipIpfsHash}`,
            ipMetadataHash: `0x${res.ipHash}`,
            nftMetadataURI: `https://ipfs.io/ipfs/${res.nftIpfsHash}`,
            nftMetadataHash: `0x${res.nftHash}`,
        },
        txOptions: { waitForTransaction: true },
    })
    newIpId = response.ipId
    console.log(`Root IPA created at transaction hash ${response.txHash}, IPA ID: ${response.ipId}`)
    console.log(`View on the explorer: https://explorer.story.foundation/ipa/${response.ipId}`)
  }
 
  // send to our server to save
  const resMenta = await CreateCertificate(newAsset, newIpId)
  if(resMenta.status){
    return resMenta;
  }
  return {status:true, message:"", data: newIpId}
  } catch(error){
    console.log(error)
    return {status:false,message:"Error minting IP"}
  }
}

