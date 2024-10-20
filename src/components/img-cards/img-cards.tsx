
import { Box, Badge,Image , Card} from '@chakra-ui/react'
import { FunctionComponent, useState } from 'react';
import styles from "./card-page.module.css"

export interface CardProps {
  imageUrl:string;
  title: string,
  description:string,

  onClick?: () => void;
}

export const ImgCard:FunctionComponent<CardProps> =props=> {
  const imageAlt = "CC image"

  return (
    <Card className={styles.card}>
      <Image src={props.imageUrl} alt={imageAlt} />
      <Box p='2' className={styles.card}>
        <Box display='flex' alignItems='baseline' >
          <Box
            color='white'
            fontWeight='semibold'
            letterSpacing='wide'
            fontSize='xs'
            textTransform='uppercase'
            ml='2'
          >
       {props.title}   
          </Box>
        </Box>
      </Box>
    </Card>
  )
}