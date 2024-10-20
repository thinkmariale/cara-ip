import { IpMetadata } from '@story-protocol/core-sdk'
import { PinataSDK } from "pinata-web3";
import { NewAsset } from '@/lib/types'
import { createHash } from 'crypto'

function createPromsAttribute(promps:string[]) {
  let array:any[]=[]
  promps.map((card:string) => (
    array.push(
      {
      key: 'Promp',
      value: card,
    })
  ))
 
  return array;
}

async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_API_JWT!,
  
  });
  const upload = await pinata.upload.json(jsonMetadata)
  console.log('ipfds',upload)
  return upload.IpfsHash;
}
//@ts-ignore
export async function setupIPFSMetadata(client,newAsset:NewAsset){

  const attributes = createPromsAttribute(newAsset.promps);
  // Set up your IP Metadata
  const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
    title: newAsset.title,
    description: newAsset.description,
    attributes: attributes,
  })

  // Set up your NFT Metadata
  const nftMetadata = {
    name: 'NFT representing ownership of IP Asset',
    description: 'This NFT represents ownership of an IP Asset',
    image: newAsset.imageUrl,
    attributes: attributes
  }
  // Upload your IP and NFT Metadata to IPFS
  const ipIpfsHash = await uploadJSONToIPFS(ipMetadata)
  const ipHash = createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex')
  const nftIpfsHash = await uploadJSONToIPFS(nftMetadata)
  const nftHash = createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex')

  return {ipIpfsHash,ipHash,nftIpfsHash,nftHash}
}

