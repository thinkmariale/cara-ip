import Image from "next/image";
import { RotateCcw as UndoIcon } from "lucide-react";
import {Spinner, Stack, Text,} from '@chakra-ui/react'
import { Fragment, FunctionComponent, useState, useEffect, useRef } from 'react';

import { ImageEvent } from '@/lib/types';
import Message from './message'
import styles from "./chatbox.module.css"

export interface PromptForm {
  events:ImageEvent[];
  isProcessing:boolean;
  onUndo?: (index:number) => void;
  onClick?: () => void;
}

export const ImageBox:FunctionComponent<PromptForm> =props=> {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (props.events.length > 2) {
      if(messagesEndRef.current!= null)
        // @ts-ignore
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [props.events.length]);


  return (
    <section >
      {props.events.map((ev, index) => {
        if (ev.image) {
          return (
            <Fragment key={"image-" + index}>
              <Message sender="replicate" shouldFillWidth>
                <div className={styles.imageDiv} >
                <Image
                  alt={
                    ev.prompt
                      ? `The result of the prompt "${ev.prompt}" on the previous image`
                      : "The source image"
                  }
                  style={{
                    width: '55%',
                    height: 'auto',
                    
                  }}
                  width={300}
                  height={500}
                  src={ev.image}
                />
                </div>
                {props.onUndo && index > 0 && index === props.events.length - 1 && (
                  
                    <button
                      onClick={() => {
                        props.onUndo!(index);
                      }}
                    >
                      <Stack spacing={1} direction='row' align='center'>
                      <UndoIcon className="icon" /> 
                      <Text> Undo and try something different.</Text>
                      </Stack>
                    </button>
           
                )}
                
              </Message>
              
              {(props.isProcessing || index < props.events.length - 1) && (
                <Message sender="replicate" isSameSender>
                  {index === 0
                    ? "What should we change?"
                    : "What should we change now?"}
                </Message>
              )}
           
            </Fragment>
          );
        }

        if (ev.prompt) {
          return (
            <Message key={"prompt-" + index} sender="user">
              {ev.prompt}
            </Message>
          );
        }
      })}

      {props.isProcessing && (
        <Message sender="replicate">
          <Spinner size='xl' />
        </Message>
      )}

      <div ref={messagesEndRef} />
    </section>
  );
}

