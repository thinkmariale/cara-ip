'use server';
import Replicate from "replicate";

import { ImageEvent, IResults, Predicton } from "@/lib/types";

import packageData from "../../../../package.json";

const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: `${packageData.name}/${packageData.version}`
});

export async function getPrediction(
  predictionId: number,
): Promise<IResults<Predicton>> {
  try {
    console.log("getPrediction",)
    const response = await fetch(`${API_HOST}/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
   
    if (response.status !== 200) {
      let error = await response.json();
      return {
        status: false,
        message:error.detail,
      };
    }
   
    const prediction:Predicton = await response.json();
    // console.log('prediction',prediction)
    // res.end(JSON.stringify(prediction));
    return {
      status: true,
      message:"",
      data: prediction
    }
  } catch (error: any) {
    return {status:false, message:"Error"}
  }
}

export async function sendPredictions(
  props: ImageEvent,
): Promise<IResults<Predicton>> {
  try {
    console.log("sendPredictions")
    console.log("Not using deployment")
    // https://replicate.com/timothybrooks/instruct-pix2pix/versions
    const version = "30c1d0b916a6f8efce20493f5d61ee27491ab2a60437c13c588468b9810ec23f"
    let prediction = await replicate.predictions.create({
      version, 
      input:props
    });

    return {
      status: true,
      message:"",
      data: prediction
    }
  } catch (error: any) {
    console.log(error)
    return {status:false, message:"Error"}
  }
}

