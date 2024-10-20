import { getDownloadUrl } from "./mentaport/index";
import {  Verify } from "./mentaport/index-client";


export async function prepareImageFileForUpload(file:File) {  
  try {
    console.log("prepareImageFileForUpload")
    const verRes = await Verify(file)
    const url = await prepareImageFile(file)

    return {status:true, "verRes":verRes, "url":url}
  }catch(error){
    return {status:false, "verRes":'', "url":''}
  }
}
function prepareImageFile(file:File) { 
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = reject;
    fr.onload = (e) => {
      const img = document.createElement("img");
      img.onload = function () {
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 608;


        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height *= Math.ceil(MAX_WIDTH / width);
          width = MAX_WIDTH;
        }
      
        if (height > MAX_HEIGHT) {
          width *= Math.ceil(MAX_HEIGHT / height);
          height = MAX_HEIGHT;
        }
        // https://replicate.delivery/yhqm/Hhfm5McIAu2QFi7iE4paAN9EtcclHQ0iDOBUJwIGow9e1ioTA/out-0.png
        // if (width > height) {
        //   if (width > MAX_WIDTH) {
        //     width = MAX_WIDTH;
        //     height = height * (MAX_WIDTH / width);
        //   }
        // } else {
        //   if (height > MAX_HEIGHT) {
        //     width = width * (MAX_HEIGHT / height);
        //     height = MAX_HEIGHT;
        //   }
        // }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        console.log(width, height)
        const ctx = canvas.getContext("2d");
        // ctx.mozImageSmoothingEnabled = false;
        // ctx.webkitImageSmoothingEnabled = false;
        // ctx.msImageSmoothingEnabled = false;
        // ctx.imageSmoothingEnabled = false;

        ctx!.drawImage(img, 0, 0, width, height);
        const dataURL = canvas.toDataURL(file.type);
        resolve(dataURL);
      };
      if (img)
        img.src = e.target!.result as string;
    };
    fr.readAsDataURL(file);
  });
}

export async function prepareImageDownload(certId:string){
  const downloadResult = await getDownloadUrl(certId);
  const link = document.createElement('a');
  link.href = downloadResult!.data!;
  link.click();
  link.remove(); //afterwards we remove the element

}
export const checkImageSize = (width:number, height:number) => {
  if (width == height && width == 1920) {
    //1:1
    return true;
  }
  if (width == 1350 && height == 1800) {
    // 3:4
    return true;
  }
  if (width == 1620 && height == 1080) {
    //3:2
    return true;
  }
  if (width == 1920 && height == 1080) {
    // 16:9
    return true;
  }
  if (width == 1080 && height == 1920) {
    // 9:16
    return true;
  }
  return false;
};