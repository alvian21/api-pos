import {
    ThrottlerGuard,
    ThrottlerException,
    ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
    protected async throwThrottlingException(
      context: ExecutionContext,
      throttlerLimitDetail: ThrottlerLimitDetail,
    ): Promise<void> {
      // Kirim pesan khusus jika batas permintaan dilampaui
      throw new ThrottlerException(`Terlalu banyak permintaan. Silahkan coba lagi dalam ${throttlerLimitDetail.ttl/1000} detik.`);
    }
  }
