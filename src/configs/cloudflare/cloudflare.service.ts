// src/configs/cloudflare/cloudflare.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

@Injectable()
export class CloudflareService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${this.configService.get(
      'ACCOUNT_ID',
    )}/images/v1`;

    const formData = new FormData();
    formData.append('file', imageBuffer, filename);

    const response = await this.httpService
      .post(cloudflareUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${this.configService.get('API_TOKEN')}`,
        },
      })
      .toPromise();

    if (!response.data.success) {
      throw new Error('Failed to upload image to Cloudflare');
    }
    return response.data.result.variants;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Cloudflare 이미지 URL에서 이미지 ID 추출
    const urlParts = imageUrl.split('/');
    const imageIdIndex = urlParts.length - 2; // 'public' 바로 앞 부분이 이미지 ID
    const imageId = urlParts[imageIdIndex];

    const cloudflareDeleteUrl = `https://api.cloudflare.com/client/v4/accounts/${this.configService.get(
      'ACCOUNT_ID',
    )}/images/v1/${imageId}`;

    const response = await this.httpService
      .delete(cloudflareDeleteUrl, {
        headers: {
          Authorization: `Bearer ${this.configService.get('API_TOKEN')}`,
        },
      })
      .toPromise();

    if (!response.data.success) {
      throw new Error('Failed to delete image from Cloudflare');
    }
  }
}
