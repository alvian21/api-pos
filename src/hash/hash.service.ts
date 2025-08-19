import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async getHash(text: string) {
    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(text, salt);

    return hash;
  }

  async isMatch(text: string, hashed: string) {
    return await bcrypt.compare(text, hashed);
  }
}
