
export interface IResults<T> {
  status:boolean,
  message:string,
  data?: T
}

export interface ImageEvent {
  image?: string,
  prompt?:string
}
export interface Predicton {
  status:string,
  id:number,
  output?:string
}
export interface NewAsset {
  title:string,
  description:string,
  promps:string[]
  imageUrl:string
}

export interface CardCert {
  id:number;
    imageUrl:string;
    title: string,
    description:string
}