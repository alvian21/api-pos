import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { extname, join } from 'path';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import * as crypto from 'crypto';
import { existsSync } from 'fs';
import { DateTime } from 'luxon';

@Injectable()
export class HelperService {

  dateToHourMinute(date: any) {

    if(!date){
      return '';
    }

    return DateTime.fromISO(date.toISOString(), { zone: 'utc' })
      .setZone('Asia/Jakarta')
      .toFormat('HH:mm')
  }

  date(date: any) {
    if(!date){
      return '';
    }

    return DateTime.fromISO(date.toISOString(), { zone: 'utc' })
      .setZone('Asia/Jakarta')
      .toFormat('dd/MM/yyyy HH:mm:ss')
  }

  checkType(input: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input);
    const isPhoneNumber = /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(input);
    const isWaNumber = /^62[0-9]{9,13}@c\.us$/.test(input);
    const isValidIndoPhoneOrWA = /^62[0-9]{9,13}(@c\.us)?$/.test(input);


    if (isUUID) return 'UUID';
    // if (isWaNumber) return 'WhatsApp Number';
    if (isValidIndoPhoneOrWA) return 'Phone Number';
    return 'Unknown';
  }

  ensureWhatsAppFormat(number: string) {
    if (typeof number !== 'string') return '';

    return number.endsWith('@c.us') ? number : number + '@c.us';
  }

  removeWhastAppFormat(phone: string){
    return phone.replace(/@c\.us$/, '');
  }

  checkHttpStatus(status: number, customMessage?: string): void {
    const httpStatusMessages = Object.entries(HttpStatus).reduce((acc, [key, value]) => {
      if (typeof value === 'number') {
        acc[value] = key.replace(/_/g, ' ').toUpperCase();
      }
      return acc;
    }, {} as Record<number, string>);

    if (status !== HttpStatus.OK) {
      const message = customMessage || httpStatusMessages[status] || `HTTP Error ${status}`;
      throw new HttpException(message, status);
    }
  }

  getRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  includesIgnoreCase(array, target) {
    if (target == true || target == false) {
      return false;
    } else {
      return array.some(item => item.toLowerCase() === target.toLowerCase());
    }

  }

  leftPad(input: string, length: number = 4, paddingCharacter: string = '0'): string {
    if (input.length >= length) {
      return input;
    }

    const paddingLength = length - input.length;
    const padding = paddingCharacter.repeat(paddingLength);

    return padding + input;
  }

  findAllWithPagination(page: number = 1, limit: number = 10, orderBy: string = 'createdAt', orderDirection: 'asc' | 'desc' = 'asc', data: any, count: any) {
    let resultPage = page / 10;
    const startIndex = resultPage > 0 ? (resultPage - 1) * limit : 0;
    const endIndex = resultPage > 0 ? resultPage * limit : 10;

    // Sort the posts array based on the specified orderBy column and order direction
    const sortedData = data.sort((a, b) => {
      let comparison = 0;
      if (a[orderBy] > b[orderBy]) comparison = 1;
      else if (a[orderBy] < b[orderBy]) comparison = -1;
      return orderDirection === 'asc' ? comparison : -comparison;
    });

    return {
      data: sortedData.slice(startIndex, endIndex),
      count: data.length
    }
  }

  hasMultipleOccurrences(arr: any[]): boolean {
    const uniqueValues = new Set();
    for (const item of arr) {
      if (uniqueValues.has(item)) {
        return true;
      }
      uniqueValues.add(item);
    }
    return false;
  }

  async uploadFile(file: any, destinationPrefix: string, nameFilePrefix: string, status: Boolean, oldFilePath: string) {

    const currentDate = moment();
    const dateAsInteger = parseInt(currentDate.format('YYYYMMDD'), 10);

    const fileName = `${nameFilePrefix}-${dateAsInteger}`;
    const fileExt = extname(file.originalname).toLocaleLowerCase();

    const folderDate = currentDate.format('YYMMDD');
    const destination = `./uploads/${destinationPrefix}/${folderDate}`;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const fullPath = `${destination}/${fileName}${fileExt}`;

    const fullPathDefault = join(process.cwd(), fullPath);

    if (status && oldFilePath && this.checkFileExists(oldFilePath)) {
      await this.unlink(oldFilePath);
    }

    await fs.promises.writeFile(fullPathDefault, file.buffer);

    let filepath = `${destinationPrefix}/${folderDate}/${fileName}${fileExt}`;

    return filepath;
  }

  checkFileExists(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      return stats.isFile();
    } catch (error) {
      return false;
    }
  }

  async uploadFileBase64(file: any, destinationPrefix: string, nameFilePrefix: string, fileExt: string, status: Boolean, oldFilePath: string) {

    const currentDate = moment();
    const dateAsInteger = parseInt(currentDate.format('YYYYMMDD'), 10);

    const fileName = `${nameFilePrefix}-${dateAsInteger}`;

    const folderDate = currentDate.format('YYMMDD');
    const destination = `./uploads/${destinationPrefix}/${folderDate}`;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const fullPath = `${destination}/${fileName}.${fileExt}`;

    const fullPathDefault = join(process.cwd(), fullPath);

    if (status && oldFilePath && this.checkFileExists(oldFilePath)) {
      await this.unlink(oldFilePath);
    }

    try {

      fs.writeFileSync(fullPathDefault, file);

      console.log('File written sucessfully');
    } catch (error) {
      console.log('Write file error: ');
    }

    let filepath = `${destinationPrefix}/${folderDate}/${fileName}.${fileExt}`;

    return filepath;
  }

  async unlink(filepath: string) {
    const file = join(process.cwd(), './uploads/' + filepath);
    fs.unlink(`${file}`, () => 0);
  }


  countDistance(lat1, lng1, lat2, lng2) {
    const EarthRadius = 6371 * 1000; // in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EarthRadius * c;
    return distance;
  }

  customSuccess(code: number, message: string) {
    return {
      code,
      message,
    };
  }

  skipAfterText(arr: any[][], text: string): any[][] {
    const index = arr.findIndex(subArray => subArray.includes(text));
    if (index !== -1) {
      return arr.slice(0, index);
    }
    return arr;
  }

  parseDateLocal(dateString: any) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    // gives you your current date
    const today = new Date(dateString);
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let mmm = monthNames[today.getMonth()];
    let dd = today.getDate();

    if (dd < 10) dd = 0 + dd;
    if (mm < 10) mm = 0 + mm;

    const formattedToday = dd + " " + mmm + " " + yyyy;
    return formattedToday;
  };

  exportToExcel(data: any[]): Buffer {
    // Create a worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Create a workbook with the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook to a buffer
    const excelBuffer: Buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return excelBuffer;
  }


  IsMoreThan60Second(createdAt: Date) {
    const currentTime = new Date();
    const timeDifferenceInSeconds = Math.floor((currentTime.getTime() - createdAt.getTime()) / 1000);
    return timeDifferenceInSeconds > 60;
  }

  generateRandomCode(): string {
    const randomBytes = crypto.randomBytes(4); // You can adjust the number of bytes based on your needs
    const randomCode = parseInt(randomBytes.toString('hex'), 16) % 100000000; // Ensure it's 8 digits

    return randomCode.toString().padStart(8, '0'); // Ensure it's always 8 digits
  }

  columnToLetter(columnIndex: number): string {
    let tempIndex = columnIndex;
    let letter = '';
    while (tempIndex > 0) {
      const remainder = (tempIndex - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      tempIndex = Math.floor((tempIndex - remainder) / 26);
    }
    return letter;
  }

  convertArrayToString(array: string[]): any {
    return array.join(',');
  }


  generateTimeAndSignatureHash(signatureSecret: string) {
    const currentTime = new Date();

    // 2. Format the date as DD/MM/YYYY HH:mm:ss
    const day = currentTime.getDate().toString().padStart(2, '0');
    const month = (currentTime.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = currentTime.getFullYear();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const seconds = currentTime.getSeconds().toString().padStart(2, '0');

    // 3. Final formatted time string (e.g., 20/09/2024 13:58:01)
    const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

    const secretKey = signatureSecret;

    // 6. Generate HMAC SHA256 hash using the formatted time as the message
    const hash = crypto.createHmac('sha256', secretKey).update(formattedTime).digest('base64');


    return {
      xApiTimestamp: formattedTime,
      xApiSignature: hash
    }
  }

  getFile(filePath: string) {

    if (filePath != null) {
      const fullPath = join(process.cwd(), 'uploads', filePath); // Absolute path to the file

      // Check if the file exists
      if (!existsSync(fullPath)) {
        return false;
      }

      return fullPath;
    }

    return false;
  }

  createResponse<T>(
    statusCode: number,
    status: boolean,
    message: string,
    data?: T,
    count?: number,
    errors?: any
  ): ResponseTemplate<T> {

    if (!data && count == 0 && errors) {
      return { statusCode, status, message, errors };
    }

    return { statusCode, status, message, data, count, errors };
  }

}

class ResponseTemplate<T> {
  statusCode: number;
  status: boolean;
  message: string;
  data?: T;
  count?: number;
  errors?: any;
}