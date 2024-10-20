'use client';
import {
  CertificateSDK,
  Environment,
  ContentFormat,
  ContentTypes,
  CertificateStatus,
  VerificationStatus
} from '@mentaport/certificates';

import { NewAsset } from '@/lib/types'
const sleep = (ms:number) => new Promise((r) => setTimeout(r, ms));


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
    const url = "https://api.mentaport.com";
    const verRes = await sdk.verifyContent(typeInfo.format, url, blob);
    if(!verRes.status){
      return verRes
    }
    const verId = verRes.data.verId
    let status=VerificationStatus.Initiating;
    let resVerStatus=null
    while (
      status !== VerificationStatus.NoCertificate && 
      status !== VerificationStatus.Certified 
    ) {
      await sleep(1000);
      resVerStatus = await sdk.getVerificationStatus(verId);
      console.log(resVerStatus)
      if(resVerStatus.data ) {
        status = resVerStatus.data.status
      }
    }

    return resVerStatus 
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