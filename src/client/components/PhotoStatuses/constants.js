export class PhotoStatusIcons {  
  toPrint = false;
  toShare = false;
  
  setToPrint({ flag = this.toPrint}) {
    this.toPrint = flag === false ? true : false;
  }
  setToShare({ flag = this.toShare }) {
    this.toShare = flag === false ? true : false;
  }
 };

 export const photoStatusIconsEntity = new PhotoStatusIcons();