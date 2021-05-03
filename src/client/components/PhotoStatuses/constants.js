export class PhotoStatusIcons {  
  toPrint = -1;
  toShare = false;
  
  static checkHide({
    status,
    val,
  }) {
    return PhotoStatusIcons[`${status}CheckHide`]({
      val,
    });
  }
  static setToPrint({ cnt = this.toPrint } = {}) {
    this.toPrint = cnt >= 0  ? -1 : 1;
  }
  static setToShare({ flag = this.toShare } = {}) {
    this.toShare = flag === false ? true : false;
  }

  static toPrintCheckHide({
    val,
  }) {
    return val >= 0 ? false : true;
  }
  static toShareCheckHide({
    val,
  }) {
    return !val;
  }  
 };