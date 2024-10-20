
import {
  Modal, 
  ModalOverlay, 
  ModalFooter, 
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Button,
  Input,
  useDisclosure} from '@chakra-ui/react'
import { FunctionComponent, useState, useRef, SetStateAction, SetStateAction } from 'react';

export interface ButtonProps {
  isProcessing:Boolean,
  onClick: (title:string, des:string) => void;
}

export const ButtonCreate:FunctionComponent<ButtonProps> = props=> {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const initialRef = useRef(null)
  const finalRef = useRef(null)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  function SaveCreate() {
    if(title == '' || description == '') {
      alert("Add info please.")
      return
    }
    props.onClick(title, description);
    onClose();
  }
  return (
    <>
      <Button w='100%' onClick={onOpen} colorScheme='purple'
       isLoading={props.isProcessing}>CREATE</Button>
     
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>IP Info</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input ref={initialRef}
               placeholder='Title of work' 
               value={title}
               onChange={(event: { currentTarget: { value: SetStateAction<string>; }; }) => {
                 setTitle(event.currentTarget.value);
               }}
               />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input placeholder='Description'
               value={description}
                onChange={(event: { currentTarget: { value: SetStateAction<string>; }; }) => {
                  setDescription(event.currentTarget.value);
                }}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={()=>SaveCreate()} >
              Save
            </Button>
            <Button onClick={onClose} >Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
//   return (
//     <Box w='80%'>
//       <Button w='100%' onClick={()=>props.onClick()}  colorScheme='purple'> CREATE</Button>
//     </Box>
//   )
// }