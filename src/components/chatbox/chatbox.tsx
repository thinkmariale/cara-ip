
import {Container, Text, Input, Box, Stack, Button, Link} from '@chakra-ui/react'
import { FunctionComponent, useState, useEffect } from 'react';
import { Upload as UploadIcon, Download as DownloadIcon} from "lucide-react";

import { checkImageSize} from '@/lib/img-upload'

import styles from "./chatbox.module.css"

export interface PromptForm {
  initialPrompt:string;
  isProcessing:boolean;
  isDownload:boolean;
  isDerivative:boolean;
  onSubmit: (e:string) => void;
  onImageUpload:(file:File) => void;
  onImageDownload:()=>void
}

export const Chatbox:FunctionComponent<PromptForm> =props=> {

  const [prompt, setPrompt] = useState(props.initialPrompt);
  const [loading, setOnLoading] = useState<boolean>(props.isProcessing);
  const [contentAsFile, setContentAsFile] = useState<File>();

  const handleContentChange = (e: any) => {
    e.preventDefault();

    const file = e.target.files[0];
    if (file) {
      const readerPreview = new FileReader();
      readerPreview.readAsDataURL(file);
      readerPreview.onloadend = () => {
        setContentAsFile(file);
      };
      readerPreview.onload = event => {
        const base64Data = event.target?.result;

        const image = new Image();
        image.src = base64Data as string;
        image.onload = function () {
          
          // if (checkImageSize(image.width, image.height)) {
           
            setContentAsFile(file);
            props.onImageUpload(file)
          // } else {
          //   setContentAsFile(undefined);
          //   alert(`Please upload image with correct size.`)
          // };
        }
       
      };
    }
  };
  const handleSubmit  = () => {
    console.log("handle submit",prompt)
    // e.preventDefault();
    setPrompt("");
    setOnLoading(true)
    props.onSubmit(prompt);
  };

  useEffect(() => {
   setOnLoading(props.isProcessing)
  }, [props.isProcessing]);

  return (
  <Container className={styles.mainContainer} p={6} borderRadius="md">
    <Text fontSize="xl" fontWeight="bold">Let your imagination fly: </Text>
    {props.isDerivative &&
      <Text fontSize="xs" fontWeight="bold" color="white">This will be a derivative work.</Text>
    }
    <Box className={styles.mainBoxWrapper}>
      <Stack spacing={1} direction='row' align='left'>
      <Input placeholder='your imagination' value={prompt}  onChange={(e:any) => setPrompt(e.target.value)}/>
      <Button colorScheme='purple' onClick={()=>handleSubmit()} isLoading={loading}>Paint</Button>
      </Stack>
    </Box>
    <Box className={styles.buttonContainer}>
      <Input
          type="file"
          name="photo"
          accept={".jpg,.png"}
          hidden
          id="upload-content"
          // onClick={event => (event.currentTarget.value = '')}
          onChange={handleContentChange}
        />
        <label htmlFor="upload-content" className={styles.label}>
         <Stack spacing={1} direction='row' align='left'>
            <UploadIcon className="icon" />
            <Text>Upload image</Text>
          </Stack>
        </label>
          <button disabled={!props.isDownload} onClick={()=>props.onImageDownload()}>
          <Stack className= {props.isDownload? styles.Spacer:styles.SpacerDis} spacing={1} direction='row' align='left'>
            <DownloadIcon className="icon" />
            <Text>Download image</Text>
          </Stack>
        </button>
    </Box>
    </Container>
  
  )
}