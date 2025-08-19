import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  generateRandom(size = 8) {
    return randomBytes(size).toString('hex');
  }
}
