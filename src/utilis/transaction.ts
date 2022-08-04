import { TransactionRequest } from "./transactionrequest";
import Network from "./network"

export default class Transaction extends TransactionRequest {


    state: { index: number, data: any } = { index: 0, data: null };
    transactions: TransactionRequest[] = [];
    postRequest: TransactionRequest = {
        successRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: undefined
        },
        failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: undefined
        }
    };
    preRequest: TransactionRequest;

    _req = new Network();


    Transaction() {
        // this.transactions.push()
        this.state.index = 0;// = { index : 0 };
        this.postRequest = new TransactionRequest();
        this.preRequest = new TransactionRequest();

    }

    async createTransaction() {
        var logData: any;

        for await (const iterator of this.transactions) {
            if (iterator.successRequest && iterator.successRequest.URL && iterator.successRequest.URL !== "") {
                if (iterator.successRequest.Type == "get") {
                    logData = await this._req.get(iterator.successRequest.URL);
                    iterator.response = logData;
                    iterator.successRequest.func(logData);
                }
                if (iterator.successRequest.Type == "post") {
                    console.log('iterator', iterator)
                    logData = await this._req.post(iterator.successRequest.URL, iterator.successRequest.Body);
                    iterator.response = logData;
                    if (iterator.successRequest.func != undefined)
                        iterator.successRequest.func(logData);
                }

                if (!logData || logData.responseCode != 200) {
                    this.reverseTransaction();
                    break;
                }
                else {

                    this.state.index += 1;

                }

            }
            else if (iterator.callback) {
                logData = await iterator.callback();
                console.log("***inside Call back***", logData)
                if (logData.responseCode !== 200)
                    break;
            }
        }
        return logData;
    }

    async reverseTransaction() {

        if (this.state.index < this.transactions.length) {
            let iterator = this.transactions[this.state.index];
            if (iterator.failureRequest?.URL) {
                var logData = undefined;
                if (iterator.failureRequest?.Type == "get") {
                    logData = await this._req.get(iterator.failureRequest?.URL);
                }
                else {
                    logData = await this._req.post(iterator.failureRequest?.URL, iterator.failureRequest?.Body);
                }

                if (!logData || logData.responseCode != 200) {
                    // we have to enter the log, that revert process had issues and automatic revert wont work. 
                }
                logData = await this._req.post(iterator.successRequest.URL, iterator.successRequest.Body);

                if (logData && logData.responseCode == 200) {
                    this.state.index -= 1;
                    this.postRequest.successRequest.Body = { transactionID: 123, status: this.state.index };
                    logData = await this._req.post(this.postRequest.successRequest.URL, this.postRequest.successRequest.Body);
                    await this.reverseTransaction();
                }
            }
        }
    }

    validateTransaction(params: any) {
        if (this.transactions.length == 0) {
            return false;
        }
    }



}

