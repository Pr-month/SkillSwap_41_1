import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger';

export const ApiUploadFile = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Upload image',
      description: 'Send file in `file` field and get back `{ url }`.',
    }),

    ApiConsumes('multipart/form-data'),

    ApiBody({
      description:
        'Types: image/jpeg, image/png, image/webp. Max size: 2 MB. Field name: `file`.',
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
        },
        required: ['file'],
      },
    }),

    ApiCreatedResponse({
      description: 'Returns uploaded file URL.',
      schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            example: '/public/uploads/example.webp',
          },
        },
        required: ['url'],
      },
    }),

    // поменять Error на BadRequestException в multer
    ApiBadRequestResponse({
      description: 'Only image files are allowed',
    }),

    ApiPayloadTooLargeResponse({
      description: 'Payload too large',
    }),
  );
