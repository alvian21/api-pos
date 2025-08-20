import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class BaseService {
    /**
     * Return success response object
     */
    sendResponse(res: Response, result: any, message: string) {
        const response = {
            success: true,
            data: result,
            message: message,
            statusCode: HttpStatus.OK
        };
        return res.status(HttpStatus.OK).json(response);
    }

    sendResponseWithoutRes(data: any, message: string, status: number = HttpStatus.OK) {

        const response = {
            success: true,
            data: data,
            message: message,
            statusCode: HttpStatus.OK
        };

        return response;
      }

    /**
     * Return error response object
     */
    sendError(res: Response, error: string, errorMessages: string[] = [], code = HttpStatus.NOT_FOUND) {
        const response: any = {
            success: false,
            message: error,
            statusCode: code,
        };
        if (errorMessages.length > 0) {
            response.data = errorMessages;
        }

        return res.status(code).json(response);
    }


    sendErrorWithoutRes( error: string, errorMessages: string[] = [], code = HttpStatus.NOT_FOUND) {
        const response: any = {
            success: false,
            message: error,
            statusCode: code,
        };
        if (errorMessages.length > 0) {
            response.data = errorMessages;
        }

        return response;
    }
}
