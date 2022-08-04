export class TransactionRequest {

    successRequest: { URL: string, Type: string, Body: {}, func: any };
    failureRequest: { URL: string, Type: string, Body: {}, func: any };
    response?: {}
    callback?: any
}