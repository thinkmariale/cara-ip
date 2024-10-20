'use server';
import {
  CertificateSDK,
  Environment,
  ICertificate,
  ICertificateArg,
  ContentFormat,
  ContentTypes,
  IResults,
  CopyrightInfo,
  AITrainingMiningInfo,
  CertificateStatus,
  VerificationStatus
} from '@mentaport/certificates';

import { NewAsset } from '@/lib/types'
const sleep = (ms:number) => new Promise((r) => setTimeout(r, ms));

const contractId = process.env.MENTAPORT_CONTRACT_ID
let _mentaportSDK: CertificateSDK | null = null;

function _getMentaportSDK(): CertificateSDK {
  // Check if the data is already cached
  if (_mentaportSDK != null ) {
    return _mentaportSDK;
  }
  _mentaportSDK = new CertificateSDK(process.env.NEXT_PUBLIC_MENTAPORT_API);
  _mentaportSDK.setClientEnv( Environment.DEVELOPMENT);
  return _mentaportSDK;
}

// Create new certificate
export async function CreateCertificate( asset:NewAsset, address:string):Promise<IResults<ICertificate>> {
  try {
    console.log("CREATE CERTIFICATES")
    // eslint-disable-next-line prefer-const
  let newCert:ICertificateArg = {
    contractId: contractId,
    contentType: ContentTypes.Image,
    name: asset.title,
    username: address,
    description: asset.description,
    usingAI: true,
    copyrightInfo: CopyrightInfo.Registered,
    aiTrainingMiningInfo: AITrainingMiningInfo.Allow,
    // aiSoftware?: string;
    aiMode: 'instruct-pix2pix'
  }
    const response = await fetch(asset.imageUrl!);
    if (!response.ok) {
      return {status:false, message:"na", statusCode:501}
    }
    const blob = await response.blob();

    // const file: File | null = data.get('file') as unknown as File
    // if (!file) {
    //   throw new Error('No file uploaded')
    // }
    // const bytes = await file.arrayBuffer()
    // const buffer = Buffer.from(bytes)
    // const blob = new Blob([buffer], { type: file.type });

    const format = ContentFormat.jpg;
    const sdk = _getMentaportSDK();
    const initResult = await sdk.initCertificate(newCert);
   
    if(!initResult.status || !initResult.data) {
      console.error('There was a problem creating the certificate')
      return {status:false, statusCode: initResult.statusCode, message:initResult.message}
    }
    console.log("now uploading content", initResult)
    const certId = initResult.data.certId;
    console.log(certId,)
    // generate
    const genRes = await sdk.createCertificate(
      contractId,
      certId,
      format,
      blob
    );

    if(!genRes.status){
      console.error('There was a problem uploading contnet for certificate')
      return genRes
    }
    // while
    let status=CertificateStatus.Initiating;
    while (status !== CertificateStatus.Pending) {
      await sleep(1000);
      const res = await sdk.getCertificateStatus(certId, contractId);
      if(res.data && res.data == CertificateStatus.Pending) {
        status = CertificateStatus.Pending
      }
    }
    console.log("Now approving certificate");
    // TODO: Before approving, confirm the data from the above call to ensure everything looks good.
    const appRes = await sdk.approveCertificate(contractId, certId, true);
    return appRes;
    
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(error:any) {
    console.log(error)
    let message = "Error creating certificate"
    if(error.response && error.response.data ){
      message = error.response.data.message
    }
    return {status:false, message, statusCode:501}
  }
}

// Verify content 
export async function Verify(file: File) {
  try {
    console.log("veriy")
    // const file: File | null = data.get('file') as unknown as File
    if (!file) {
      throw new Error('No file uploaded')
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const blob = new Blob([buffer], { type: file.type });
    const typeInfo = getFileTypeStr(file.type)
    const sdk = _getMentaportSDK();
    const url = "app_url";
    const verRes = await sdk.verifyContent(typeInfo.format, url, blob);
    if(!verRes.status){
      return verRes
    }
    const verId = verRes.data.verId
    let status=VerificationStatus.Initiating;
    while (
      status !== CertificateStatus.NoCertificate && 
      status !== CertificateStatus.Certified 
    ) {
      await sleep(1000);
      const res = await sdk.getVerificationStatus(verId, contractId);
      if(res.data ) {
        status = res.data.status
      }
    }

    return verRes 
  } // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(error:any) {
    let message = "Error verifying content"
    if(error.response && error.response.data ){
      message = error.response.data.message
    }
    return {status:false, message, statusCode:501}
  }
}


// Get Certificates
export async function GetCertificates() {
  try {
    const sdk =  _getMentaportSDK();
    const result = await sdk.getCertificates();
    console.log(result);
    return result
  }  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(error:any) {
    let message = "Error getting certificates"
    if(error.response && error.response.data ){
      message = error.response.data.message
    }
    console.log(error)
    return {status:false, message, statusCode:501}
  }
}

export async function getDownloadUrl(
  certId: string,
): Promise<IResults<string>> {
  try {
  
    const sdk = await _getMentaportSDK();
    const result = await sdk.getDownloadUrl(contractId, certId, ContentFormat.jpg);
    //console.log(result);
    return result;
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let message = 'Error getting contracts';
    if (error.response && error.response.data) {
      message = error.response.data.message;
    }
    console.log(error);
    return { status: false, message, statusCode: 501 };
  }
}
const getFileTypeStr = (fileType: string) => {
  const types = fileType.split('/');
  let type = ""
  let format: ContentFormat = ContentFormat[types[1] as keyof typeof ContentFormat];
  if(!format && types[1] == 'jpeg')
    format = ContentFormat.jpg;
  for (const key in ContentTypes) {
    if (ContentTypes[key as keyof typeof ContentTypes].toLowerCase() === types[0]) {
      type =  ContentTypes[key as keyof typeof ContentTypes];
    }
  }
  
  return {type, format};
};
const getUrlTypeStr = (url: string) => {
  const types = url.split('.');
  let type = ""
  let format: ContentFormat = ContentFormat[types[1] as keyof typeof ContentFormat];
  if(!format && types[1] == 'jpeg')
    format = ContentFormat.jpg;
  for (const key in ContentTypes) {
    if (ContentTypes[key as keyof typeof ContentTypes].toLowerCase() === types[0]) {
      type =  ContentTypes[key as keyof typeof ContentTypes];
    }
  }
  
  return {type, format};
};