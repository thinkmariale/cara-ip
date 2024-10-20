"use client"
import { VStack, SimpleGrid} from '@chakra-ui/react'
import { Box,Text, Center} from '@chakra-ui/react'
import {
  VerificationStatus
} from '@mentaport/certificates';
import { useState, useEffect } from 'react';
import { ImageEvent, Predicton, NewAsset, CardCert } from '@/lib/types';
import { ImgCard } from '@/components/img-cards/img-cards';
import {Chatbox} from '@/components/chatbox/chatbox'
import { ImageBox } from '@/components/chatbox/imageBox';
import {ButtonCreate} from '@/components/buttons/button-create'

import {prepareImageFileForUpload, prepareImageDownload} from "@/lib/img-upload";
import { getRandomSeed } from "@/lib/seeds";
import { sendPredictions, getPrediction } from '@/app/actions/predictions/index';
import {createIPTest, createIP} from '@/app/actions/story/index'
import styles from "./main-page.module.css"

import { GetCertificates } from '@/lib/mentaport/index';
import {
  useDynamicContext,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";

 // Sample data for the cards
 const cardData = [
  { id: 1, title: 'Card 1', description: 'Content for Card 1',},
  { id: 2, title: 'Card 2', description: 'Content for Card 2'},
  { id: 3, title: 'Card 3', description: 'Content for Card 3', },
  { id: 4, title: 'Card 4', description: 'Content for Card 4', },
  { id: 5, title: 'Card 5', description: 'Content for Card 5', },
];
const sleep = (ms:number) => new Promise((r) => setTimeout(r, ms));

export const MainPage = () => {

  const { primaryWallet, user } = useDynamicContext();

  const [events, setEvents] = useState<ImageEvent[]>([]); 
  const [predictions, setPredictions] =useState<Predicton[]>([]); 
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [certDownload, setCertDownload] = useState('');

  const [isDerivative, setIsDerivative] = useState(false);
  const [ipId, setIpId] = useState('');
  const [cards, setCards] = useState<CardCert[]>([]); 

  const [seed] = useState(getRandomSeed());
  const [initialPrompt, setInitialPrompt] = useState(seed.prompt);


  //set the initial image from a random seed
  // useEffect(() => {
  //     setEvents([{ image: seed.image }]);
  // }, [seed.image]);

  useEffect(() => {
    const executeFetcher = async () => {
      try {
       const cert = await GetCertificates();
       if(cert.status){
        let data:CardCert[] =[]
        cert.data.certificates.map((c:any, index:number)=>(
          data.push({id:index, title:c.name, imageUrl:c.thumbnail, description:c.description})
        )) 
        setCards(data)
       }
       console.log(cert)
      } catch (e: any) {
        console.log(e);
      }
    };

    executeFetcher();
  
  }, []);

  const handleImageDropped = async (image:File) => {
    try {
      setIsProcessing(true)
      setIpId('');
      setIsDerivative(false)
      const res = await prepareImageFileForUpload(image);

      setIsProcessing(false)
      if(res.status){
        const img_url=res.url as string
        setEvents(events.concat([{ image:img_url }]));
        // check if already certified:
        console.log(res.verRes.data, VerificationStatus.Certified)
        if(res.verRes.data.status === VerificationStatus.Certified) {
          const ipDerivative = res.verRes.data.certificate.username
          setIpId(ipDerivative);
          setIsDerivative(true)
        }
      }
     
    } catch (error) {
      console.log(error)
      setError("Error selecting image");
      return;
    }
  };

  const handleDownload = async () => {
    try {
      if(certDownload =='' || !isDownload){
        return;
      }
      await prepareImageDownload(certDownload) ;
    } catch (error) {
      console.log(error)
      return;
    }
  };
  const handleSubmit = async (prompt:string) => {
   
    if(isProcessing) {
      console.log("back here./...")
      return;
    }
    // const lastImage = events.findLast((ev) => ev.image)?.image;
    const lastImage = events[events.length-1]?.image;

    setError("");
    setIsProcessing(true);
    setInitialPrompt("");

    // make a copy so that the second call to setEvents here doesn't blow away the first. Why?
    const myEvents:ImageEvent[] = [...events, { prompt }];
    setEvents(myEvents);

    const newEvent = {
      prompt,
      image: lastImage,
    };

    const response = await sendPredictions( newEvent);
    console.log(response)
      if(!response.status) {
        setIsProcessing(false);
        setError(response.message);
        return;
      }
    let prediction:Predicton = response.data!;
    console.log("got pre", prediction)
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await getPrediction( prediction.id);
      if(!response.status) {
        setIsProcessing(false);
        setError(response.message);
        return;
      }
      prediction = response.data!;
      console.log("got pre #2 : ", prediction)
      // just for bookkeeping
      setPredictions(predictions.concat([prediction]));

      if (prediction.status === "succeeded") {
        console.log("SUCCESS", prediction)
        setEvents(
          myEvents.concat([
            { image: prediction.output?.[prediction.output.length - 1] },
          ])
        );
      }
    }

    setIsProcessing(false);
  };

  const handleCreate = async (title:string, description:string) =>{
    try {
    
      setIsProcessing(true)
        console.log("handleCreate")
        if(events.length <= 0 || title == '' || description == ''){
          alert("Make art first!")
          return;
        }

        if(events[events.length-1].image == null) {
          alert("No image!")
          return;
        }
        let promps:string[]= []
        events.map((event)=> {
          if(event.prompt)
            promps.push(event.prompt)
        })
        const newAsset:NewAsset ={
          title:title,
          description:description,
          promps:promps,
          imageUrl:events[events.length-1].image!
        }
        
      //let result = await createIPTest(newAsset, '0xa821ece9B4584574F08E782b6a20AF7a26cb1d55')
      let result = await createIP(newAsset, primaryWallet.address, isDerivative, ipId)
      if(result.status) {
        const certId = result.data.certId
        setCertDownload(certId)
        setIsDownload(true)
        alert("Your IP has been registred and secured! Now you can download your image and share it.")
      } else {
        alert("There was an issue registering your IP")
      }
      setIsProcessing(false)
    } catch(error){
      setIsProcessing(false);
      alert("There was an issue registering your IP")
    }
  }

  return (
    <Center >
     
    <VStack spacing={8}  w="90%">
    <Text className={styles.title}> CARA </Text>
    {!user? 
    ( 
    <DynamicWidget />
   )
    :
    (
      <>
      <DynamicWidget />
     {/* Top section: Horizontal card carousel */}
     <Box className={styles.img_carousel}>
      <SimpleGrid  overflowX="auto"
        templateColumns={`repeat(${cardData.length}, 12em)`}
        gap={4}
        px={4}
      >
        {cards.map((card) => (
          <ImgCard key={card.id} 
           imageUrl={card.imageUrl}
           title={card.title} 
           description={card.description} 
           />
      
        ))}
      </SimpleGrid>
    </Box>
    {/* Bottom section: Container */}
      <ImageBox events={events} isProcessing={isProcessing} onUndo={(index:number) => {
            setInitialPrompt(events[index - 1].prompt!);
            setEvents(
              events.slice(0, index - 1).concat(events.slice(index + 1))
            );
          }}/>
      <Chatbox initialPrompt={"What do you want to update?"} 
          onSubmit={handleSubmit} 
          onImageUpload={handleImageDropped} 
          onImageDownload={handleDownload}
          isDownload={isDownload}
          isDerivative={isDerivative}
          isProcessing={isProcessing} />
      <ButtonCreate onClick={handleCreate} isProcessing={isProcessing}/>
   
   </> )}
  </VStack>
  </Center>
  );
};