import express from "express";
import { Response } from "../../models/response";

import Network from "../../utils/network";
import { decodeJwtToken } from "../../utils/jwt";
import URLS from "tv-micro-services-common/build/urls";
import { Item } from "../../models/item";
import Transaction from "../../utils/transaction";
import { AllNFT } from "../../models/allnft";
import { Notification } from "../../models/notification";
import config from "tk-api-common/src/modules/config";
import PaymentHelper from "../../services/paymentHelper";
import { getBlockchain, getRndInteger, getStringBlockchain } from "../../utils/helper";


var router = express.Router();

var websiteURL = process.env.BLOCKCHAIN_URL || config.get("blockChainUrl");


router.post("/createauction", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var _data = {};

  _data = {
    startprice: req.body.startprice,
    reserveprice: req.body.reserveprice,
    buyprice: req.body.buyprice,
    serialnumber: req.body.serialnumber,
    type: req.body.type, // asset, pack
    itemid: req.body.id,
    itemskuid: req.body.skuid,
    userid: req.user.user_id,
    duration: req.body.duration,
  };

  let _response: Response = await _req.post(
    URLS.AUCTION_SERVICE_URL + "/auction/createauction",
    _data
  );

  if (_response.responseCode == 200) {
    if (req.body.type.toLowerCase() === "asset") {
      _data = {
        item_state: "onAuction",
        item_sku_id: req.body.skuid,
        userid: req.user.user_id.toString(),
        item_id: req.body.id,
      };

      let _responseData: Response = await _req.post(
        URLS.ASSET_SERVICE_URL + "/trading/settrade",
        _data
      );
      result = _responseData;
      res.send(result);
    }
  } else {

    result = _response;

    res.send(result);
  }
});

router.post("/cancelauction", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  let itemskuid = req.body.itemskuid;
  let itemid = req.body.itemid;
  let userid = req.user.user_id;
  var _data = { itemskuid, itemid, userid };
  let _response: Response = await _req.put(
    URLS.AUCTION_SERVICE_URL + "/auction/cancelauction",
    _data
  );
  if (_response.responseCode === 200) {
    let _body = {
      item_state: "purchased",
      item_sku_id: req.body.itemskuid.toString(),
      userid: req.user.user_id.toString(),
      item_id: req.body.itemid.toString(),
    };
    let _tradeResponse: Response = await _req.post(
      URLS.ASSET_SERVICE_URL + "/trading/canceltrade",
      _body
    );
    result = _tradeResponse;
  }
  result = _response;
  return res.send(result);

});

router.post("/canceluserallauctions", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var _data = { userid: req.user.user_id };
  let _response: Response = await _req.put(
    URLS.AUCTION_SERVICE_URL + "/auction/canceluserallauctions",
    _data
  );
  result = _response;
  return res.send(result);

});

router.get("/auctionsqueue", async (req: any, res: any, next: any) => {
  var result = [];
  let _req = new Network();
  let model = new Item();
  let finalArray: any = [];
  var userid = req.user.user_id;

  let auction_response: Response = await _req.get(
    URLS.AUCTION_SERVICE_URL + "/auction/getuserauctions?userid=" + userid
  );
  let item_skuid: any = "";
  if (auction_response.responseData) {
    auction_response.responseData.forEach((element: any) => {
      item_skuid += element.item_sku_id + ",";
    });
    item_skuid = item_skuid.toString();
    item_skuid = item_skuid.slice(0, -1);
  }

  let sku_response: Response = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + item_skuid + "&raw=true"
  );
  for (let element of auction_response.responseData) {
    for (let k of sku_response.responseData) {
      if (element.item_sku_id === k.item_sku_id) {
        k.item_sku_sale_price = element.start_price;
        k.item_description = "";
      }
    }
  }
  if (sku_response.responseData)
    finalArray = model.bindSalesResponse(sku_response.responseData);
  if (finalArray.length > 0) return res.send(new Response(finalArray, 200));
  else return res.send(new Response("", 200));
});
router.get("/salesqueue", async (req: any, res: any, next: any) => {
  var result = [];
  let _req = new Network();
  let model = new Item();
  let finalArray: any = [];
  var userid = req.user.user_id;
  let _response: Response = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/getusertrades?userid=" + userid
  );
  result = _response.responseData;
  if (_response.responseCode === 200) {
    let _pack_response: Response = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/getusertrades?userid=" + userid
    );
    if (_pack_response.responseCode === 200) {
      result = [..._response.responseData, ..._pack_response.responseData];
    }
    for await (const iterator of result) {
      let filters = { filters: { ...iterator } };
      let _filtersData = await _req.post(
        URLS.ASSET_SERVICE_URL + "/asset/filters",
        filters
      );
      if (_filtersData && _filtersData.responseCode == 200) {
        let data = _filtersData.responseData;
        finalArray.push(data);
      }
    }
    finalArray = model.bindSalesResponse(finalArray);
    return res.send(new Response(finalArray, 200));
  }
  return res.send(_response);

});
router.get("/cancelauctionsqueue", async (req: any, res: any, next: any) => {
  var resultData;
  let _req = new Network();
  let model = new Item();
  let finalArray: any = [];
  var userid = req.user.user_id;

  let auction_response: Response = await _req.get(
    URLS.AUCTION_SERVICE_URL + "/auction/getuserauctions?userid=" + userid
  );
  let item_skuid: any = "";
  if (auction_response.responseData) {
    auction_response.responseData.forEach((elementAuc: any) => {
      item_skuid += elementAuc.item_sku_id + ",";
    });
    item_skuid = item_skuid.toString();
    item_skuid = item_skuid.slice(0, -1);
  }

  let sku_response: Response = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + item_skuid + "&raw=true"
  );
  if (sku_response.responseData) {
    for (let element of auction_response.responseData) {
      for (let k of sku_response.responseData) {
        if (element.item_sku_id === k.item_sku_id) {
          k.item_sku_sale_price = element.start_price;
          k.item_description = "";
        }
      }
    }
    finalArray = model.bindSalesResponse(sku_response.responseData);
    if (finalArray.length > 0) {
      var _data = {};
      for (let element of finalArray) {
        for (let i of element?.itemSkus) {
          if (element.itemType.toLowerCase() === "asset") {
            _data = {
              item_state: "purchased",
              itemskuid: i.packSKUID.toString(),
              userid: req.user.user_id.toString(),
              itemid: element.assetID.toString(),
            };

            await _req.put(
              URLS.AUCTION_SERVICE_URL + "/auction/cancelauction",
              _data
            );
          }
          _data = {
            item_state: "purchased",
            item_sku_id: i.packSKUID.toString(),
            userid: req.user.user_id.toString(),
            item_id: element.assetID.toString(),
          };

          let _response: Response = await _req.post(
            URLS.ASSET_SERVICE_URL + "/trading/canceltrade",
            _data
          );
          resultData = _response;
        }
      }

      res.send(resultData);
      return;
    }
  }
  return res.send(sku_response);

});
router.get("/cancelsalesqueue", async (req: any, res: any, next: any) => {
  var result = [];
  let _req = new Network();
  let model = new Item();
  let finalArray: any = [];
  var userid = req.user.user_id;
  let _response: Response = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/getusertrades?userid=" + userid
  );
  result = _response.responseData;
  if (_response.responseCode === 200) {
    let _pack_response: Response = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/getusertrades?userid=" + userid
    );
    if (_pack_response.responseCode === 200) {
      result = [..._response.responseData, ..._pack_response.responseData];
    }
    for await (const iterator of result) {
      let filters = { filters: { ...iterator } };
      let _filtersData = await _req.post(
        URLS.ASSET_SERVICE_URL + "/asset/filters",
        filters
      );
      if (_filtersData && _filtersData.responseCode == 200) {
        let data = _filtersData.responseData;
        finalArray.push(data);
      }
    }
    finalArray = model.bindSalesResponse(finalArray);
    var resultData = null;

    if (finalArray.length > 0) {
      var _data = {};
      for (var element of finalArray) {
        for (var i of element?.itemSkus) {
          if (element.itemType.toLowerCase() === "asset") {
            _data = {
              item_state: "purchased",
              item_sku_id: i.packSKUID.toString(),
              userid: req.user.user_id.toString(),
              item_id: element.assetID.toString(),
            };

            _response = await _req.post(
              URLS.ASSET_SERVICE_URL + "/trading/canceltrade",
              _data
            );
            resultData = _response;
          } else {
            _data = {
              item_state: "purchased",
              item_sku_id: i.packSKUID.toString(),
              userid: req.user.user_id.toString(),
              item_id: element.assetID.toString(),
            };

            _response = await _req.post(
              URLS.PACK_SERVICE_URL + "/pack/canceltrade",
              _data
            );
            resultData = _response;
          }
        }
      }

      res.send(resultData);
      return;
    }
  }
  return res.send(_response);

});
router.post("/settrade", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var _data = {};

  if (req.body.type.toLowerCase() === "asset") {
    // type can be sale only for now
    _data = {
      item_state: "onSale",
      item_sku_id: req.body.skuid,
      userid: req.user.user_id.toString(),
      item_id: req.body.itemid,
      sale_price: req.body.saleprice,
      serialnumber: req.body.serialnumber,
    };

    let _response: Response = await _req.post(
      URLS.ASSET_SERVICE_URL + "/trading/settrade",
      _data
    );
    result = _response;
  } else {
    _data = {
      item_state: "onSale",
      item_sku_id: req.body.skuid,
      userid: req.user.user_id.toString(),
      item_id: req.body.itemid,
      sale_price: req.body.saleprice,
      serialnumber: req.body.serialnumber,
    };

    let _response: Response = await _req.post(
      URLS.PACK_SERVICE_URL + "/pack/settrade",
      _data
    );
    result = _response;
  }

  res.send(result);
});

router.post("/canceltrade", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var _data = {};

  if (req.body.type.toLowerCase() === "asset") {
    _data = {
      item_state: "purchased",
      item_sku_id: req.body.skuid,
      userid: req.user.user_id.toString(),
      item_id: req.body.itemid,
    };

    let _response: Response = await _req.post(
      URLS.ASSET_SERVICE_URL + "/trading/canceltrade",
      _data
    );
    result = _response;
  } else {
    _data = {
      item_state: "purchased",
      item_sku_id: req.body.skuid,
      userid: req.user.user_id.toString(),
      item_id: req.body.itemid,
    };

    let _response: Response = await _req.post(
      URLS.PACK_SERVICE_URL + "/pack/canceltrade",
      _data
    );
    result = _response;
  }

  res.send(result);
});
router.post("/placebid", async (req: any, res: any, next: any) => {
  var result = null;
  let _data = {};
  let _req = new Network();
  _data = {
    userid: req.user.user_id.toString(),
    auctionid: req.body.auctionid,
    price: req.body.price,
  };
  let _response: Response = await _req.post(
    URLS.AUCTION_SERVICE_URL + "/auction/placebid",
    _data
  );
  result = _response;
  if (_response.responseCode === 200) result = new Response("", 200);
  return res.send(result);

});
router.post("/trading", async (req: any, res: any, next: any) => {
  try {
    var result = null;
    var _req = new Network();
    let paymentHelper = new PaymentHelper()
    var collectionUserId = "";
    let trans = new Transaction();
    var sku
    let token: any;
    let blockChainID: any;
    var item_state;
    var item_id;
    var sale_price;
    var name;
    var itemType: any;
    var transValue: any;
    var buyerID = req.user.user_id.toString();
    let transactionID = buyerID + new Date().getTime()
    let _paymentMade = false;
    var sellerID = "";
    let transSummary: any = {
      status: "pending",
      paymentType: req.body?.fromacount,
    }
    //create transaction summary call.
    let _transactionResponse = await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummary", transSummary
    );
    transactionID = _transactionResponse?.responseData?.id
    if (req.body?.fromacount == "creditcard") {
      let amountVal = parseFloat(req.body?.transactionvalue) * 100
      let body: any = {
        amount: amountVal.toFixed(0),
        cardid: req.body?.cardid,
        orderid: transactionID
      }
      let intent = await paymentHelper.createPaymentIntent(buyerID, body)
      if (intent.responseCode == 200) {
        body.paymentintentid = intent.responseData;
        let _payment = await paymentHelper.confirmIntent(body)
        if (_payment.responseCode == 200) {
          transSummary = {
            status: "paymentDone",
            stripeId: intent.responseData,
            id: transactionID?.toString()
          }
          let _transactionUpdated = await _req.post(
            URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
          );
          if (_transactionUpdated.responseCode == 200) {
            _paymentMade = true;
          }
        }

      }
    }

    if (req.body?.fromacount == "creditcard" && !_paymentMade) {
      transSummary = {
        status: "paymentError",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
      return res.send(new Response('', 1044));
    }

    if (req.body) {
      itemType = req.body.itemtype;
      sku = req.body.skuid;
      var serialnumber = req.body.serialnumber;
      buyerID = req.user.user_id.toString();
      sale_price = "";
      var fromAccount = req.body.fromacount;
      var transType = req.body.transactiontype;
      transValue = req.body.transactionvalue;
      var paymentType = req.body.paymenttype; //sale/gift/return

      if (itemType.toLowerCase() == "asset") {
        let dataRes: Response = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + sku
        );
        sellerID = dataRes.responseData[0].skus[0].owner_id.toString();
        sale_price = dataRes.responseData[0].skus[0].sale_price.toString();
        item_state = dataRes.responseData[0].skus[0].item_state.toString();
        item_id = dataRes.responseData[0].id.toString();
        token = dataRes.responseData[0].skus[0].token_id;
        name = dataRes.responseData[0]?.name;
        blockChainID = dataRes.responseData[0].skus[0]?.blockchain_id
        collectionUserId = sellerID;
        console.log('blcockcahinid==>', blockChainID)

        if (sale_price != transValue) {
          return res.send(new Response("", 1026).compose());
        }
        if (sellerID === buyerID) {
          return res.send(new Response("", 1028).compose());
        }
        if (item_state?.toLowerCase() !== 'onsale') {
          return res.send(new Response("", 1048).compose());
        }
      } else if (
        itemType.toLowerCase() == "pack" ||
        itemType.toLowerCase() == "packs"
      ) {
        let dataRespack: Response = await _req.get(
          URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + sku
        );
        sellerID = dataRespack.responseData[0].pack_sku_owner_id.toString();
        sale_price = dataRespack.responseData[0].pack_sku_sale_price.toString();
        item_state = dataRespack.responseData[0].pack_sku_item_state.toString();
        item_id = dataRespack.responseData[0].item_id.toString();
        name = dataRespack.responseData[0]?.item_name;
        collectionUserId = sellerID;
        if (sale_price != transValue) {
          return res.send(new Response("", 1026).compose());
        }
        if (sellerID === buyerID) {
          return res.send(new Response("", 1028).compose());
        }
        if (item_state?.toLowerCase() !== 'onsale') {
          return res.send(new Response("", 1048).compose());
        }
        // get pack api for sku
      }

      if (req.body?.fromacount === "terrawallet") {
        let _amountValidation = await paymentHelper.checkWalletAmount(req.body?.transactionvalue, buyerID)
        if (_amountValidation.responseCode != 200) {
          return res.send(new Response('', 1044));
        } else {
          let _result = await paymentHelper.createWalletTransaction(parseInt(sellerID), buyerID, req.body?.transactionvalue, "transaction")
          if (_result.responseCode !== 200) {
            return res.send(new Response('', 1044));
          }
        }
      }
      let _buyersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        buyerID
      );
      let _usersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        sellerID
      );
      var to_acount = _usersData.responseData[0]?.metamask_eth_account?.toString();

      if (itemType.toLowerCase() == "asset") {
        trans.transactions.push({
          successRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: true,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              console.log(event);
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: undefined,
          },
        });

        // perform transaction log
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/trading/createtrans",
            Type: "post",
            Body: {
              itemType: itemType,
              item_sku_id: sku,
              sellerID: sellerID,
              buyerID: buyerID,
              created_by: buyerID,
              updated_by: buyerID,
              to_acount: to_acount,

              from_acount: fromAccount,
              transactionType: transType,
              transactionValue: transValue,
              paymentType: paymentType, //sale/gift/return
              status_id: "1",
              transactionID: transactionID
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/transaction/deleteitemtrans",
            Type: "post",
            Body: {
              id: req.body.id,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        //lock
        trans.transactions.push({
          successRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          callback: () => {
            return paymentHelper.transferAsset({
              to: buyerID,
              ids: [token],
              bctype: getBlockchain(blockChainID),
              from: sellerID,
              orderid: transactionID
            })
          }
        });
        // perform change of ownership
        trans.transactions.push({
          successRequest: {
            URL:
              URLS.ASSET_SERVICE_URL +
              "/trading/changeowner?buyerid=" +
              buyerID +
              "&skuid=" +
              sku,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/offer/skuofferstatus?sku=" + sku + "&itemtype=" + itemType,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {

            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
      } else if (
        itemType.toLowerCase() == "pack" ||
        itemType.toLowerCase() == "packs"
      ) {
        trans.transactions.push({
          successRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: true,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              console.log(event);
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: undefined,
          },
        });

        // perform transaction log
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/trading/createtrans",
            Type: "post",
            Body: {
              itemType: itemType,
              item_sku_id: sku,
              sellerID: sellerID,
              buyerID: buyerID,
              created_by: buyerID,
              updated_by: buyerID,
              to_acount: to_acount,

              from_acount: fromAccount,
              transactionType: transType,
              transactionValue: transValue,
              paymentType: paymentType, //sale/gift/return
              status_id: "1",
              transactionID: transactionID
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/transaction/deleteitemtrans",
            Type: "post",
            Body: {
              id: req.body.id,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });

        // perform change of ownership
        trans.transactions.push({
          successRequest: {
            URL:
              URLS.PACK_SERVICE_URL +
              "/pack/changeowner?buyerID=" +
              buyerID +
              "&skuid=" +
              sku,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/offer/skuofferstatus?sku=" + sku + "&itemtype=" + itemType,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {

            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        // get pack api for sku
      }
    }

    let _response = await trans.createTransaction();
    console.log("createTransaction==>", _response)
    if (_response.responseCode !== 200) return res.send(_response)

    transSummary = {
      status: "Completed",
      id: transactionID?.toString()
    }
    await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
    );
    //#region for complete auction
    if (item_state.toLowerCase() === "onauction") {
      let itemskuid = sku;
      let itemid = item_id;
      let userid = buyerID;
      var _data = { itemskuid, itemid, userid };
      await _req.put(
        URLS.AUCTION_SERVICE_URL + "/auction/cancelauction",
        _data
      );
    }

    //#region check collection
    let data: any = null;
    let query = null;
    if (itemType.toLowerCase() == "asset") {
      let _get_sku_detail = await _req.get(
        URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + req.body.skuid
      );
      if (_get_sku_detail.responseData.length > 0) {
        let code = _get_sku_detail.responseData[0].code;
        let itemId = _get_sku_detail.responseData[0].id;
        query = "userid=" + req.user.user_id + "&pageno=0&pagesize=10";
        let _get_item = await _req.get(
          URLS.COLLECTION_SERVICE_URL + "/collection/getitem?itemcode=" + code
        );
        if (
          _get_item.responseCode === 200 &&
          _get_item.responseData.status_id === 1
        ) {
          let collectionId = _get_item.responseData.id;
          query += "&id=" + collectionId;
          let _check_status = await _req.get(
            URLS.COLLECTION_SERVICE_URL +
            "/collection/getusercollectionbyid?" +
            query
          );
          if (
            _check_status.responseCode === 200 &&
            _check_status.responseData?.length > 0
          ) {
            data = _check_status.responseData[0];
            if (data.description.length > 0) {
              let bool = true;
              let userCollection = data.description[0];
              const keys = Array.from(Array(30).keys());
              for await (const iterator of keys) {
                if (
                  parseInt(userCollection["item_" + (iterator + 1)]) ===
                  parseInt(itemId)
                ) {
                  bool = false;
                }
              }
              if (
                parseInt(data.description[0].user_id) ===
                parseInt(req.user.user_id) &&
                bool === true &&
                parseInt(userCollection.completion_status_id) === 1
              ) {
                let updateBody: any = {};
                updateBody.id = data.description[0].id?.toString();
                updateBody.item_num = itemId.toString();
                updateBody.item_num_sku = req.body.skuid.toString();
                await _req.post(
                  URLS.COLLECTION_SERVICE_URL + "/collection/updatecollection",
                  updateBody
                );
              } else console.log("already added", 4017);
            }
          } else {
            let body = {
              user_id: req.user.user_id.toString(),
              collection_id: _get_item.responseData.id.toString(),
              completion_date_time: "1",
              completion_status_id: "1",
              is_reward_allocation: "1",
              item_1: itemId.toString(),
              item_sku_1: req.body.skuid.toString(),
            };
            await _req.post(
              URLS.COLLECTION_SERVICE_URL + "/collection/startcollection",
              body
            );
          }
        }
      }
      //#endregion check collection
      if (collectionUserId !== undefined && collectionUserId !== "") {
        query = "userid=" + collectionUserId + "&skuid=" + sku;
        let _removeResponse: Response = await _req.get(
          URLS.COLLECTION_SERVICE_URL +
          "/collection/removeskufromcollection?" +
          query
        );
      }
    }
    //#region trending count
    query = "skuid=" + sku;
    if (itemType.toLowerCase() == "asset") {
      await _req.get(
        URLS.ASSET_SERVICE_URL +
        "/asset/increasetrendcount?" +
        query
      );
    }
    else if (itemType.toLowerCase() == "pack" || itemType.toLowerCase() == "packs") {
      await _req.get(
        URLS.PACK_SERVICE_URL +
        "/pack/increasetrendcount?" +
        query
      );
    }
    let buyer = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/userManagement/overview?userid=" +
      buyerID
    );
    if (buyer.responseCode === 200) {
      var buyerEmail = buyer.responseData[0].email;
      let transactionId = sku + buyerID
      let transaction = await _req.get(
        URLS.TRADING_SERVICE_URL +
        "/trading/getSingleTrans?userid=" +
        buyerID + "&skuid=" + sku + "&itemtype=" + itemType
      );
      if (transaction.responseCode === 200) transactionId = transaction.responseData.id

      let date = new Date().toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })

      var email = new Notification();
      email.email_body = `dummy`;
      email.email_subject = "invoice";
      email.email_to = buyerEmail;
      email.invoice = {
        "transactionId": transactionId,
        "date": date,
        "items": [{ "name": name, "price": sale_price }],
        "totalAmount": transValue,
        "discountValue": req.body.discountedPrice ? req.body.discountedPrice : "0",
        "fee": "0",
        "gift": " "
      }

      await _req.post(
        URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
        email
      );
      await paymentHelper.addNotification(buyerID, sku, sellerID, itemType, "sale")

      transSummary = {
        status: "Notified",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
    }
    //#endregion trending count
    result = new Response("", 200);
    res.send(result);
    return;
  } catch (e) {
    console.log(e);
  }
});

router.post("/acceptoffer", async (req: any, res: any, next: any) => {
  try {
    var result = null;
    var _req = new Network();

    let trans = new Transaction();
    let _paymentHelper = new PaymentHelper();
    var name
    let token: any;
    let blockChainID: any
    //offerid and token
    //sku id a jy offerid , transaction a jy gi, transaction type=sale, fromacount terraWallet,paymenttype=sal
    var buyerID = req.user.user_id.toString();
    let transactionID = buyerID + new Date().getTime()
    let _paymentMade = false;
    let transSummary: any = {
      status: "pending",
      paymentType: "terrawallet",
    }
    //create transaction summary call.
    let _transactionResponse = await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummary", transSummary
    );
    transactionID = _transactionResponse?.responseData?.id
    if (req.body?.fromacount == "creditcard") {
      let paymentHelper = new PaymentHelper()
      let amountVal = parseFloat(req.body?.transactionvalue) * 100
      let body: any = {
        amount: amountVal.toFixed(0),
        cardid: req.body?.cardid,
        orderid: transactionID
      }
      let intent = await paymentHelper.createPaymentIntent(buyerID, body)
      if (intent.responseCode == 200) {
        body.paymentintentid = intent.responseData;
        let _payment = await paymentHelper.confirmIntent(body)
        if (_payment.responseCode == 200) {
          transSummary = {
            status: "paymentDone",
            stripeId: intent.responseData,
            id: transactionID?.toString()
          }
          let _transactionUpdated = await _req.post(
            URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
          );
          if (_transactionUpdated.responseCode == 200) {
            _paymentMade = true;
          }
        }

      }
    }

    if (req.body?.fromacount == "creditcard" && _paymentMade == false) {
      transSummary = {
        status: "paymentError",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
      return res.send(new Response('', 1044));
    }

    if (req.body) {
      var offerid = req.body.offerId;
      var itemType = req.body.itemType;
      var sku;
      var item_owned;
      var serialnumber; // sku ki call ma sy get karna
      var sellerID = '';
      var item_state = "";
      var item_id;
      var fromAccount = "terraWallet";
      var transType = "sale";
      var transValue = ""; //offer price
      var paymentType = "sale"; //sale/gift/return

      let dataOffer: Response = await _req.get(
        URLS.TRADING_SERVICE_URL + "/offer/getoffer?offerId=" + offerid
      );

      if (dataOffer.responseCode == 200) {
        sku = dataOffer.responseData[0].item_sku_id.toString();
        transValue = req.body?.iscounteroffer ? dataOffer.responseData[0].counter_price.toString() : dataOffer.responseData[0].offered_price.toString();
        item_owned = dataOffer.responseData[0].item_owned_by.toString();
        sellerID = req.body?.iscounteroffer ? item_owned : req.user.user_id.toString();
        buyerID = dataOffer.responseData[0].created_by.toString();

        //#region check payment in wallet
        let paymentHelper = new PaymentHelper()
        let body = {
          ...req.body,
          amount: transValue,
          type: "offer",
          owner: req.user.user_id,
          buyer: dataOffer.responseData[0].created_by.toString(),
          itemskuid: sku,
          transactionid: transactionID?.toString()
        }
        let _callback: any = await paymentHelper.validatePendingPayment(body)
        if (_callback.responseCode !== 200) {
          let query = `skuid=${sku}&lock=${true}&userid=1`
          if (itemType === 'asset') {
            await _req.get(
              URLS.ASSET_SERVICE_URL + "/trading/lockasset?" + query
            );
          } else {
            await _req.get(
              URLS.PACK_SERVICE_URL + "/pack/lockpack?" + query
            );
          }
          return res.send(new Response('', 1045));
        }
        else {
          let _result = await paymentHelper.createWalletTransaction(body.owner, body.buyer, body.amount, "offer")
          if (_result.responseCode !== 200) {
            return res.send(new Response('', 1044));
          }
        }
        //#endregion check payment in wallet

        if (item_owned == sellerID) {
          if (itemType.toLowerCase() == "asset") {
            let dataRes: Response = await _req.get(
              URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + sku
            );

            serialnumber =
              dataRes?.responseData[0]?.skus[0]?.serial_no.toString();
            item_id = dataRes?.responseData[0]?.id.toString();
            name = dataRes?.responseData[0]?.name;
            item_state = dataRes.responseData[0].skus[0].item_state.toString();
            token = dataRes.responseData[0].skus[0].token_id;
            blockChainID = dataRes.responseData[0].skus[0]?.blockchain_id
            console.log('blcockcahinid==>', blockChainID)

          } else {
            let dataRespack: Response = await _req.get(
              URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + sku
            );
            serialnumber =
              dataRespack?.responseData[0]?.pack_sku_serial_no.toString();
            item_id = dataRespack.responseData[0]?.item_id.toString();
            name = dataRespack.responseData[0]?.item_name;
          }
        } else {
          return res.send(new Response("", 1028));
        }
      } else {
        return dataOffer;
      }
      await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        buyerID
      );

      let _usersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        buyerID
      );
      var to_acount = _usersData?.responseData[0]?.metamask_eth_account?.toString();

      if (itemType.toLowerCase() == "asset") {
        trans.transactions.push({
          successRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: true,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              console.log(event);
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: undefined,
          },
        });

        // perform transaction log
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/trading/createtrans",
            Type: "post",
            Body: {
              itemType: itemType,
              item_sku_id: sku,
              sellerID: sellerID,
              buyerID: buyerID,
              created_by: buyerID,
              updated_by: buyerID,
              to_acount: to_acount,

              from_acount: fromAccount,
              transactionType: transType,
              transactionValue: transValue,
              paymentType: paymentType, //sale/gift/return
              status_id: "1",
              transactionID: transactionID
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/transaction/deleteitemtrans",
            Type: "post",
            Body: {
              id: req.body.id,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          callback: () => {
            return _paymentHelper.transferAsset({
              to: buyerID,
              ids: [token],
              bctype: getBlockchain(blockChainID),
              from: sellerID,
              orderid: transactionID
            })
          }
        });


        // perform change of ownership
        trans.transactions.push({
          successRequest: {
            URL:
              URLS.ASSET_SERVICE_URL +
              "/trading/changeowner?buyerid=" +
              buyerID +
              "&skuid=" +
              sku +
              "&transvalue=" +
              transValue,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/offer/skuofferstatus?sku=" + sku + "&itemtype=" + itemType,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {

            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/offer/changeskuofferstatus?offerId=" + offerid + "&itemtype=" + itemType,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {

            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        })
      } else if (
        itemType.toLowerCase() == "pack" ||
        itemType.toLowerCase() == "packs"
      ) {
        trans.transactions.push({
          successRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: true,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              console.log(event);
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: undefined,
          },
        });

        // perform transaction log
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/trading/createtrans",
            Type: "post",
            Body: {
              itemType: itemType,
              item_sku_id: sku,
              sellerID: sellerID,
              buyerID: buyerID,
              created_by: buyerID,
              updated_by: buyerID,
              to_acount: to_acount,

              from_acount: fromAccount,
              transactionType: transType,
              transactionValue: transValue,
              paymentType: paymentType, //sale/gift/return
              status_id: "1",
              transactionID: transactionID
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/transaction/deleteitemtrans",
            Type: "post",
            Body: {
              id: req.body.id,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });

        // perform change of ownership
        trans.transactions.push({
          successRequest: {
            URL:
              URLS.PACK_SERVICE_URL +
              "/pack/changeowner?buyerID=" +
              buyerID +
              "&skuid=" +
              sku +
              "&transvalue=" +
              transValue,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/offer/skuofferstatus?sku=" + sku + "&itemtype=" + itemType,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {

            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/offer/changeskuofferstatus?offerId=" + offerid + "&itemtype=" + itemType,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {

            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.PACK_SERVICE_URL + "/pack/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });


        // get pack api for sku
      }

      let _response = await trans.createTransaction();
      console.log("createTransaction==>", _response)
      if (_response.responseCode !== 200) return res.send(_response)

      transSummary = {
        status: "Completed",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
      //#region for complete auction
      if (item_state.toLowerCase() === "onauction") {
        let itemskuid = sku;
        let itemid = item_id;
        let userid = buyerID;
        var _data = { itemskuid, itemid, userid };
        await _req.put(
          URLS.AUCTION_SERVICE_URL + "/auction/cancelauction",
          _data
        );
      }

      //#region check collection
      let data: any = null;
      let updateData: any = null;
      let query = null;
      let _get_sku_detail = await _req.get(
        URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + req.body.skuid
      );
      if (_get_sku_detail.responseData.length > 0) {
        let code = _get_sku_detail.responseData[0].code;
        let itemId = _get_sku_detail.responseData[0].id;
        query = "userid=" + req.user.user_id + "&pageno=0&pagesize=10";
        let _get_item = await _req.get(
          URLS.COLLECTION_SERVICE_URL + "/collection/getitem?itemcode=" + code
        );
        if (
          _get_item.responseCode === 200 &&
          _get_item.responseData.status_id === 1
        ) {
          let collectionId = _get_item.responseData.id;
          query += "&id=" + collectionId;
          let _check_status = await _req.get(
            URLS.COLLECTION_SERVICE_URL +
            "/collection/getusercollectionbyid?" +
            query
          );
          if (
            _check_status.responseCode === 200 &&
            _check_status.responseData?.length > 0
          ) {
            data = _check_status.responseData[0];
            if (data.description.length > 0) {
              let bool = true;
              let userCollection = data.description[0];
              const keys = Array.from(Array(30).keys());
              for await (const iterator of keys) {
                if (
                  parseInt(userCollection["item_" + (iterator + 1)]) ===
                  parseInt(itemId)
                ) {
                  bool = false;
                }
              }
              if (
                parseInt(data.description[0].user_id) ===
                parseInt(req.user.user_id) &&
                bool === true &&
                parseInt(userCollection.completion_status_id) === 1
              ) {
                let updateBody: any = {};
                updateBody.id = data.description[0].id?.toString();
                updateBody.item_num = itemId;
                updateBody.item_num_sku = req.body.skuid;
                await _req.post(
                  URLS.COLLECTION_SERVICE_URL + "/collection/updatecollection",
                  updateBody
                );
              }
            }
          } else {
            let body = {
              user_id: req.user.user_id.toString(),
              collection_id: _get_item.responseData.id.toString(),
              completion_date_time: "1",
              completion_status_id: "1",
              is_reward_allocation: "1",
              item_1: itemId.toString(),
              item_sku_1: req.body.skuid.toString(),
            };
            await _req.post(
              URLS.COLLECTION_SERVICE_URL + "/collection/startcollection",
              body
            );
          }
        }
      }

      if (sellerID !== undefined && sellerID !== "") {
        query = "userid=" + sellerID + "&skuid=" + sku;
        let _removeResponse: Response = await _req.get(
          URLS.COLLECTION_SERVICE_URL +
          "/collection/removeskufromcollection?" +
          query
        );
      }
      //#endregion check collection

      //#region trending count
      query = "skuid=" + sku;
      if (itemType.toLowerCase() == "asset") {
        await _req.get(
          URLS.ASSET_SERVICE_URL +
          "/asset/increasetrendcount?" +
          query
        );
      }
      else if (itemType.toLowerCase() == "pack" || itemType.toLowerCase() == "packs") {
        await _req.get(
          URLS.PACK_SERVICE_URL +
          "/pack/increasetrendcount?" +
          query
        );
      }
      let buyer = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        buyerID
      );
      if (buyer.responseCode === 200) {
        var buyerEmail = buyer?.responseData[0]?.email;
        let transactionId = sku + buyerID
        let transaction = await _req.get(
          URLS.TRADING_SERVICE_URL +
          "/trading/getSingleTrans?userid=" +
          buyerID + "&skuid=" + sku + "&itemtype=" + itemType
        );
        if (transaction.responseCode === 200) transactionId = transaction.responseData.id
        var email = new Notification();
        email.email_body = `dummy`;
        email.email_subject = "invoice";
        email.email_to = buyerEmail;
        email.invoice = {
          "transactionId": transactionId,
          "date": new Date().toDateString(),
          "items": [{ "name": name, "price": transValue }],
          "totalAmount": transValue,
          "discountValue": "0",
          "fee": "0",
          "gift": " "
        }
        await _req.post(
          URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
          email
        );
        await _paymentHelper.addNotification(buyerID, sku, sellerID, itemType, "sale")
        transSummary = {
          status: "Notified",
          id: transactionID?.toString()
        }
        await _req.post(
          URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
        );
      }
      //#endregion trending count
      result = new Response("", 200);
      res.send(result);
      return;
    }
    result = new Response("", 1029);
    res.send(result);
    return;
  } catch (e) {
    console.log(e);
  }
});

router.post("/checkout", async (req: any, res: any, next: any) => {
  try {
    var result = null;
    var _req = new Network();
    var collectionUserId = "";
    let trans = new Transaction();
    let token: any;
    let blockChainID: any
    var itemDetails = [];
    var transValue
    var itemsArray = []
    var transTax
    itemDetails = req.body.item;
    var sku
    var sellerID = "";
    var buyerID = req.user.user_id.toString();
    let transactionID = buyerID + new Date().getTime()
    let _paymentMade = false;
    let paymentHelper = new PaymentHelper()
    let _trxStatus = false;
    var itemType: any;
    var serialnumber: any;

    let isDuplicate = paymentHelper.validateDuplication(itemDetails)
    if (isDuplicate) {
      return res.send(new Response('', 1046))
    }
    let isPriceIssue = paymentHelper.validatePrice(req.body)
    if (isPriceIssue === false) {
      return res.send(new Response('', 1046))
    }

    //#region Get Buyer Data
    let _buyersData = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/userManagement/overview?userid=" +
      buyerID
    );
    //#endregion

    //#region Create Trans
    let transSummary: any = {
      status: "pending",
      paymentType: req.body?.fromacount,
    }
    let _transactionResponse = await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummary", transSummary
    );
    if (_transactionResponse.responseCode !== 200)
      return res.send(_transactionResponse);

    transactionID = _transactionResponse?.responseData?.id
    //#endregion

    //#region Create Payment
    if (req.body?.fromacount == "creditcard") {
      let amountVal = parseFloat(req.body?.item[0]?.transactionvalue) * 100
      let body: any = {
        amount: amountVal.toFixed(0),
        cardid: req.body?.cardid,
        orderid: transactionID
      }
      let intent = await paymentHelper.createPaymentIntent(buyerID, body)
      if (intent.responseCode == 200) {
        body.paymentintentid = intent.responseData;
        let _payment = await paymentHelper.confirmIntent(body)
        if (_payment.responseCode == 200) {
          transSummary = {
            status: "paymentDone",
            stripeId: intent.responseData,
            id: transactionID?.toString()
          }
          let _transactionUpdated = await _req.post(
            URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
          );
          if (_transactionUpdated.responseCode == 200) {
            _paymentMade = true;
          }
        }

      }
    }

    if (req.body?.fromacount == "creditcard" && _paymentMade == false) {
      transSummary = {
        status: "paymentError",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
      return res.send(new Response('', 1044));
    }

    if (req.body?.fromacount === "terrawallet") {
      let _amountValidation = await paymentHelper.checkWalletAmount(itemDetails[0]?.transactionvalue, buyerID)
      if (_amountValidation.responseCode != 200) {
        return res.send(new Response('', 1044));
      } else {
        let sellerIDs = null
        if (itemDetails[0]?.itemtype == "asset") {
          let dataRes: Response = await _req.get(
            URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + itemDetails[0]?.skuid
          );
          sellerIDs = dataRes.responseData[0].skus[0].owner_id;
        } else if (
          itemDetails[0]?.itemtype.toLowerCase() == "pack" ||
          itemDetails[0]?.itemtype.toLowerCase() == "packs"
        ) {
          let dataRespack: Response = await _req.get(
            URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + itemDetails[0]?.skuid
          );
          sellerIDs = dataRespack.responseData[0].pack_sku_owner_id;
        }
        let _result = await paymentHelper.createWalletTransaction(sellerIDs, buyerID, itemDetails[0]?.transactionvalue, "checkout")
        if (_result.responseCode !== 200) {
          return res.send(new Response('', 1044));
        }
      }
    }

    //#endregion

    //#region Lock Items
    for await (const element2 of itemDetails) {
      itemType = element2.itemtype; //array
      sku = element2.skuid; //array
      serialnumber = element2.serialnumber; //array
      buyerID = req.user.user_id.toString();
      let url = itemType === "asset" ? URLS.ASSET_SERVICE_URL + "/trading/lock" : URLS.PACK_SERVICE_URL + "/pack/lock"
      _req.post(url, {
        lock: true,
        skuid: sku,
        userid: buyerID,
        serialnumber: serialnumber,
      })
    }
    //#endregion

    //#region Items Processing
    for (var element of itemDetails) {
      itemType = element.itemtype; //array
      sku = element.skuid; //array
      serialnumber = element.serialnumber; //array
      buyerID = req.user.user_id.toString();
      var sale_price = "";

      var fromAccount = req.body.fromacount;
      var transType = req.body.transactiontype;
      transTax = req.body.sales_tax;
      var itemValue = element.item_value; //array
      transValue = element.transactionvalue?.toString(); //total amount array
      var paymentType = req.body.paymenttype; //sale/gift/return
      let itemState;

      trans = new Transaction();

      //#region Price Validation
      if (itemType == "asset") {
        let dataRes: Response = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + sku
        );
        sellerID = dataRes.responseData[0].skus[0].owner_id.toString();
        sale_price = dataRes.responseData[0].skus[0].sale_price.toString();
        itemState = dataRes.responseData[0].skus[0].item_state;
        token = dataRes.responseData[0].skus[0].token_id;
        blockChainID = dataRes.responseData[0]?.skus[0]?.blockchain_id

        itemsArray.push({ "name": dataRes.responseData[0].name, "price": sale_price })
        collectionUserId = sellerID;
        if (sale_price != itemValue) {
          return res.send(new Response("", 1026).compose());
        }
        if (sellerID === buyerID) {
          return res.send(new Response("", 1028).compose());
        }
        if (itemState?.toLowerCase() !== 'onsale') {
          return res.send(new Response("", 1048).compose());
        }
      } else if (
        itemType.toLowerCase() == "pack" ||
        itemType.toLowerCase() == "packs"
      ) {
        let dataRespack: Response = await _req.get(
          URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + sku
        );
        sellerID = dataRespack.responseData[0].pack_sku_owner_id.toString();
        sale_price =
          dataRespack.responseData[0].pack_sku_sale_price.toString();
        itemState = dataRespack.responseData[0]?.pack_sku_item_state;
        collectionUserId = sellerID;
        itemsArray.push({ "name": dataRespack.responseData[0].item_name, "price": sale_price })
        if (sale_price != itemValue) {
          return res.send(new Response("", 1026).compose());
        }
        if (sellerID === buyerID) {
          return res.send(new Response("", 1028).compose());
        }
        if (itemState?.toLowerCase() !== 'onsale') {
          return res.send(new Response("", 1048).compose());
        }
        // get pack api for sku
      }
      //#endregion


      //#region Per Item Processing

      let _usersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        sellerID
      );
      let to_acount = _usersData.responseData[0]?.metamask_eth_account?.toString();
      let url = itemType === "asset" ? URLS.ASSET_SERVICE_URL + "/trading/changeowner?buyerid=" : URLS.PACK_SERVICE_URL + "/pack/changeowner?buyerID="

      // perform transaction log
      trans.transactions.push({
        successRequest: {
          URL: URLS.TRADING_SERVICE_URL + "/trading/createtrans",
          Type: "post",
          Body: {
            itemType: itemType,
            item_sku_id: sku,
            sellerID: sellerID,
            buyerID: buyerID,
            created_by: buyerID,
            updated_by: buyerID,
            to_acount: to_acount,
            sales_tax: transTax,
            total_amount: transValue,
            from_acount: fromAccount,
            transactionType: transType,
            transactionValue: itemValue,
            paymentType: paymentType, //sale/gift/return
            status_id: "1",
            transactionID: transactionID
          },
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
        failureRequest: {
          URL: URLS.TRADING_SERVICE_URL + "/transaction/deleteitemtrans",
          Type: "post",
          Body: {
            id: req.body.id,
          },
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
      });
      // perform blockchain transfer
      trans.transactions.push({
        successRequest: {
          URL: "",
          Type: "",
          Body: {},
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
        failureRequest: {
          URL: "",
          Type: "",
          Body: {},
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
        callback: () => {
          return paymentHelper.transferAsset({
            to: buyerID,
            ids: [token],
            bctype: getBlockchain(blockChainID),
            from: sellerID,
            orderid: transactionID
          })
        }
      });

      // perform change of ownership
      trans.transactions.push({
        successRequest: {
          URL: url +
            buyerID +
            "&skuid=" +
            sku,
          Type: "get",
          Body: {},
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
        failureRequest: {
          URL: "",
          Type: "",
          Body: {},
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
      });

      url = itemType === "asset" ? URLS.ASSET_SERVICE_URL + "/trading/lock" : URLS.PACK_SERVICE_URL + "/pack/lock";

      trans.transactions.push({
        successRequest: {
          URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
          Type: "post",
          Body: {
            lock: false,
            skuid: sku,
            userid: buyerID,
            serialnumber: serialnumber,
          },
          func: (event: any) => {
            trans.state.data = event;
          },
        },
        failureRequest: {
          URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
          Type: "post",
          Body: {
            lock: false,
            skuid: sku,
            userid: buyerID,
            serialnumber: serialnumber,
          },
          func: (event: any) => { console.log('remove sonarlint issue') },
        },
      })

      let _response = await trans.createTransaction();
      if (_response.responseCode === 200) {

        //#region collection
        let data: any = null;
        let updateData: any = null;
        let query = null;
        if (itemType.toLowerCase() == "asset") {
          let _get_sku_detail = await _req.get(
            URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + element.skuid
          );
          if (_get_sku_detail.responseData.length > 0) {
            let code = _get_sku_detail.responseData[0].code;
            let itemId = _get_sku_detail.responseData[0].id;
            query = "userid=" + req.user.user_id + "&pageno=0&pagesize=10";
            let _get_item = await _req.get(
              URLS.COLLECTION_SERVICE_URL + "/collection/getitem?itemcode=" + code
            );
            if (
              _get_item.responseCode === 200 &&
              _get_item.responseData.status_id === 1
            ) {
              let collectionId = _get_item.responseData.id;
              query += "&id=" + collectionId;
              let _check_status = await _req.get(
                URLS.COLLECTION_SERVICE_URL +
                "/collection/getusercollectionbyid?" +
                query
              );
              if (
                _check_status.responseCode === 200 &&
                _check_status.responseData?.length > 0
              ) {
                data = _check_status.responseData[0];
                if (data.description.length > 0) {
                  let bool = true;
                  let userCollection = data.description[0];
                  const keys = Array.from(Array(30).keys());
                  for await (const iterator of keys) {
                    if (
                      parseInt(userCollection["item_" + (iterator + 1)]) ===
                      parseInt(itemId)
                    ) {
                      bool = false;
                    }
                  }
                  if (
                    parseInt(data.description[0].user_id) ===
                    parseInt(req.user.user_id) &&
                    bool === true &&
                    parseInt(userCollection.completion_status_id) === 1
                  ) {
                    let updateBody: any = {};
                    updateBody.id = data.description[0].id?.toString();
                    updateBody.item_num = itemId;
                    updateBody.item_num_sku = element.skuid;
                    await _req.post(
                      URLS.COLLECTION_SERVICE_URL + "/collection/updatecollection",
                      updateBody
                    );
                  }
                }
              } else {
                let body = {
                  user_id: req.user.user_id.toString(),
                  collection_id: _get_item.responseData.id.toString(),
                  completion_date_time: "1",
                  completion_status_id: "1",
                  is_reward_allocation: "1",
                  item_1: itemId.toString(),
                  item_sku_1: element.skuid.toString(),
                };
                data = await _req.post(
                  URLS.COLLECTION_SERVICE_URL + "/collection/startcollection",
                  body
                );
              }
            }
          }

          if (collectionUserId !== undefined && collectionUserId !== "") {
            query = "userid=" + collectionUserId + "&skuid=" + sku;
            await req.get(
              URLS.COLLECTION_SERVICE_URL +
              "/collection/removeskufromcollection?" +
              query
            );
          }
        }

        //#endregion

        //#region trending count
        query = "skuid=" + sku;
        if (itemType.toLowerCase() == "asset") {
          await _req.get(
            URLS.ASSET_SERVICE_URL +
            "/asset/increasetrendcount?" +
            query
          );
        }
        else if (itemType.toLowerCase() == "pack" || itemType.toLowerCase() == "packs") {
          await _req.get(
            URLS.PACK_SERVICE_URL +
            "/pack/increasetrendcount?" +
            query
          );
        }
        paymentHelper.addNotification(buyerID, sku, sellerID, itemType, 'sale');
        //#endregion

      }
      else {
        _trxStatus = false;
      }
    }

    //#endregion

    //#region Update Tranx Status
    transSummary = {
      status: _trxStatus ? "Completed" : "tradingError",
      id: transactionID?.toString()
    }
    await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
    );
    //#endregion

    //#region Invoice Notification
    if (_buyersData.responseCode === 200) {
      var buyerEmail = _buyersData?.responseData[0]?.email;
      let transactionId = sku + buyerID
      let transaction = await _req.get(
        URLS.TRADING_SERVICE_URL +
        "/trading/getSingleTrans?userid=" +
        buyerID + "&skuid=" + sku + "&itemtype=" + itemType
      );
      if (transaction.responseCode === 200) transactionId = transaction.responseData.id
      var email = new Notification();
      email.email_body = `dummy`;
      email.email_subject = "invoice";
      email.email_to = buyerEmail;

      let date = new Date().toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })

      email.invoice = {
        "transactionId": transactionId,
        "date": date,
        "items": itemsArray,
        "totalAmount": transValue,
        "fee": transTax,
        "discountValue": req.body.discountedPrice ? req.body.discountedPrice : "0",
        "gift": " ",
      }
      await _req.post(
        URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
        email
      );
    }
    //#endregion

    //#region Trx Status Update
    transSummary = {
      status: _trxStatus ? "Notified" : "tradingError",
      id: transactionID?.toString()
    }
    await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
    );
    //#endregion

    result = new Response("", 200);
    res.send(result);
    return;
  } catch (e) {
    console.log(e);
  }
});

router.post("/buyauction", async (req: any, res: any, next: any) => {
  try {
    var result = null;
    var _req = new Network();
    var collectionUserId = "";
    let trans = new Transaction();
    let _paymentHelper = new PaymentHelper();
    var sku
    var item_state;
    var name;
    let token: any;
    let blockChainID: any;
    var sale_price = "";
    var sellerID = "";
    var transValue: any;
    var buyerID = req.user.user_id.toString();
    let transactionID = buyerID + new Date().getTime()
    let _paymentMade = false;
    let transSummary: any = {
      status: "pending",
      paymentType: req.body?.fromacount,
    }
    //create transaction summary call.
    let _transactionResponse = await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummary", transSummary
    );
    transactionID = _transactionResponse?.responseData?.id
    if (req.body?.fromacount == "creditcard") {
      let paymentHelper = new PaymentHelper()
      let amountVal = parseFloat(req.body?.transactionvalue) * 100
      let body: any = {
        amount: amountVal.toFixed(0),
        cardid: req.body?.cardid,
        orderid: transactionID
      }
      let intent = await paymentHelper.createPaymentIntent(buyerID, body)
      if (intent.responseCode == 200) {
        body.paymentintentid = intent.responseData;
        let _payment = await paymentHelper.confirmIntent(body)
        if (_payment.responseCode == 200) {
          transSummary = {
            status: "paymentDone",
            stripeId: intent.responseData,
            id: transactionID?.toString()
          }
          let _transactionUpdated = await _req.post(
            URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
          );
          if (_transactionUpdated.responseCode == 200) {
            _paymentMade = true;
          }
        }

      }
    }

    if (req.body?.fromacount == "creditcard" && _paymentMade == false) {
      transSummary = {
        status: "paymentError",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
      return res.send(new Response('', 1044));
    }

    if (req.body) {
      var itemType = req.body.itemtype;
      sku = req.body.skuid;
      var serialnumber = req.body.serialnumber;
      buyerID = req.user.user_id.toString();
      var fromAccount = req.body.fromacount;
      var transType = req.body.transactiontype;
      transValue = req.body.transactionvalue;
      var paymentType = req.body.paymenttype; //sale/gift/return


      if (itemType.toLowerCase() == "asset") {
        let dataRes: Response = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + sku
        );
        sellerID = dataRes.responseData[0]?.skus[0]?.owner_id.toString();
        item_state = dataRes.responseData[0]?.skus[0]?.item_state.toString();
        name = dataRes.responseData[0]?.name;
        token = dataRes.responseData[0]?.skus[0]?.token_id;
        blockChainID = dataRes.responseData[0]?.skus[0]?.blockchain_id
        console.log('blcockcahinid==>', blockChainID)

        collectionUserId = sellerID;
        if (sellerID === buyerID) {
          return res.send(new Response("", 1028).compose());
        }
        let auctionData: Response = await _req.get(
          URLS.AUCTION_SERVICE_URL + "/auction/auctiondetail?itemskuid=" + sku
        );
        sale_price = auctionData.responseData[0]?.buy_price?.toString();
        if (sale_price != transValue) {
          return res.send(new Response("", 1026).compose());
        }
      }
      if (req.body?.fromacount === "terrawallet") {
        let _amountValidation = await _paymentHelper.checkWalletAmount(req.body?.transactionvalue, buyerID)
        if (_amountValidation.responseCode != 200) {
          return res.send(new Response('', 1044));
        } else {
          let _result = await _paymentHelper.createWalletTransaction(parseInt(sellerID), buyerID, req.body?.transactionvalue, "transaction")
          if (_result.responseCode !== 200) {
            return res.send(new Response('', 1044));
          }
        }
      }
      let _buyersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        buyerID
      );
      let _usersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        sellerID
      );
      var to_acount = _usersData.responseData[0]?.metamask_eth_account?.toString();

      if (itemType.toLowerCase() == "asset") {
        trans.transactions.push({
          successRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: true,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              console.log(event);
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: undefined,
          },
        });

        // perform transaction log
        trans.transactions.push({
          successRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/trading/createtrans",
            Type: "post",
            Body: {
              itemType: itemType,
              item_sku_id: sku,
              sellerID: sellerID,
              buyerID: buyerID,
              created_by: buyerID,
              updated_by: buyerID,
              to_acount: to_acount,

              from_acount: fromAccount,
              transactionType: transType,
              transactionValue: transValue,
              paymentType: paymentType, //sale/gift/return
              status_id: "1",
              transactionID: transactionID
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: URLS.TRADING_SERVICE_URL + "/transaction/deleteitemtrans",
            Type: "post",
            Body: {
              id: req.body.id,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          callback: () => {
            return _paymentHelper.transferAsset({
              to: buyerID,
              ids: [token],
              bctype: getBlockchain(blockChainID),
              from: sellerID,
              orderid: transactionID
            })
          }
        });
        // perform change of ownership
        trans.transactions.push({
          successRequest: {
            URL:
              URLS.ASSET_SERVICE_URL +
              "/trading/changeowner?buyerid=" +
              buyerID +
              "&skuid=" +
              sku,
            Type: "get",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
          failureRequest: {
            URL: "",
            Type: "",
            Body: {},
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });
        trans.transactions.push({
          successRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => {
              trans.state.data = event;
            },
          },
          failureRequest: {
            URL: URLS.ASSET_SERVICE_URL + "/trading/lock",
            Type: "post",
            Body: {
              lock: false,
              skuid: sku,
              userid: buyerID,
              serialnumber: serialnumber,
            },
            func: (event: any) => { console.log('remove sonarlint issue') },
          },
        });

      }
    }

    let _response = await trans.createTransaction();
    console.log("createTransaction==>", _response)
    if (_response.responseCode !== 200) return res.send(_response)

    transSummary = {
      status: "Completed",
      id: transactionID?.toString()
    }
    await _req.post(
      URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
    );
    //#region for complete auction
    if (item_state.toLowerCase() === "onauction") {
      let itemskuid = sku;
      await _req.get(
        URLS.AUCTION_SERVICE_URL +
        "/auction/completeauction?itemskuid=" +
        itemskuid
      );
    }

    //#region check collection
    let data: any = null;
    let query = null;
    let _get_sku_detail = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + req.body.skuid
    );
    if (itemType.toLowerCase() == "asset") {
      if (_get_sku_detail.responseData.length > 0) {
        let code = _get_sku_detail.responseData[0].code;
        let itemId = _get_sku_detail.responseData[0].id;
        query = "userid=" + req.user.user_id + "&pageno=0&pagesize=10";
        let _get_item = await _req.get(
          URLS.COLLECTION_SERVICE_URL + "/collection/getitem?itemcode=" + code
        );
        if (_get_item.responseCode === 200) {
          let _check_status = await _req.get(
            URLS.COLLECTION_SERVICE_URL +
            "/collection/getusercollections?" +
            query
          );
          if (
            _check_status.responseCode === 200 &&
            _check_status.responseData?.length > 0
          ) {
            data = _check_status.responseData[0];
            if (data.description.length > 0) {
              if (
                parseInt(data.description[0].user_id) ===
                parseInt(req.user.user_id)
              ) {
                let updateBody: any = {};
                updateBody.id = data.description[0].id?.toString();
                updateBody.item_num = itemId;
                updateBody.item_num_sku = req.body.skuid;
                await _req.post(
                  URLS.COLLECTION_SERVICE_URL + "/collection/updatecollection",
                  updateBody
                );
              } else return res.send(new Response("", 4017));
            }
          } else {
            let body = {
              user_id: req.user.user_id.toString(),
              collection_id: _get_item.responseData.id.toString(),
              completion_date_time: "1",
              completion_status_id: "1",
              is_reward_allocation: "1",
              item_1: itemId.toString(),
              item_sku_1: req.body.skuid.toString(),
            };
            await _req.post(
              URLS.COLLECTION_SERVICE_URL + "/collection/startcollection",
              body
            );
          }
        }
      }

      //#endregion check collection

      if (collectionUserId !== undefined && collectionUserId !== "") {
        query = "userid=" + collectionUserId + "&skuid=" + sku;
        await _req.get(
          URLS.COLLECTION_SERVICE_URL +
          "/collection/removeskufromcollection?" +
          query
        );
      }
    }
    //#region trending count
    query = "skuid=" + sku;
    if (itemType.toLowerCase() == "asset") {
      await _req.get(
        URLS.ASSET_SERVICE_URL +
        "/asset/increasetrendcount?" +
        query
      );
    }
    else if (itemType.toLowerCase() == "pack" || itemType.toLowerCase() == "packs") {
      await _req.get(
        URLS.PACK_SERVICE_URL +
        "/pack/increasetrendcount?" +
        query
      );
    }
    //#endregion trending count

    let buyer = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/userManagement/overview?userid=" +
      buyerID
    );
    if (buyer.responseCode === 200) {
      var buyerEmail = buyer.responseData[0].email;
      let transactionId = sku + buyerID
      let transaction = await _req.get(
        URLS.TRADING_SERVICE_URL +
        "/trading/getSingleTrans?userid=" +
        buyerID + "&skuid=" + sku + "&itemtype=" + itemType
      );
      if (transaction.responseCode === 200) transactionId = transaction.responseData.id

      let date = new Date().toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })

      var email = new Notification();
      email.email_body = `dummy`;
      email.email_subject = "invoice";
      email.email_to = buyerEmail;
      email.invoice = {
        "transactionId": transactionId,
        "date": date,
        "items": [{ "name": name, "price": sale_price }],
        "totalAmount": transValue,
        "discountValue": req.body.discountedPrice ? req.body.discountedPrice : "0",
        "fee": "0",
        "gift": " "
      }
      await _req.post(
        URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
        email
      );
      await _paymentHelper.addNotification(buyerID, sku, sellerID, itemType, "auction")

      transSummary = {
        status: "Notified",
        id: transactionID?.toString()
      }
      await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/transactionsummaryupdate", transSummary
      );
    }
    result = new Response("", 200);
    res.send(result);
    return;
  } catch (e) {
    console.log(e);
  }
});

router.post("/placeoffer", async (req: any, res: any, next: any) => {
  var result = null;
  let _data: any = {};
  let _req = new Network();
  var skuid = req.body.item_sku_id;
  var itemType = req.body.itemType;
  if (itemType.toLowerCase() == "asset") {
    let dataRes: Response = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skuid
    );

    if (dataRes?.responseData?.length === 0)
      return res.send(new Response("", 1025));

    _data = {
      item_sku_id: req.body.item_sku_id,
      created_by: req.user.user_id.toString(),
      offered_price: req.body.offered_price,
      item_owned_by: dataRes.responseData[0].skus[0].owner_id.toString(),
      item_type: itemType,
    };

    if (_data.created_by === _data.item_owned_by)
      return res.send(new Response("", 1027));
  } else {
    let dataRespack: Response = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + skuid
    );

    if (dataRespack?.responseData?.length === 0)
      return res.send(new Response("", 1025));

    _data = {
      item_sku_id: req.body.item_sku_id,
      created_by: req.user.user_id.toString(),
      offered_price: req.body.offered_price,
      item_owned_by: dataRespack.responseData[0].pack_sku_owner_id.toString(),
      item_type: itemType,
    };

    if (_data.created_by === _data.item_owned_by)
      return res.send(new Response("", 1027));
  }

  let _response: Response = await _req.post(
    URLS.TRADING_SERVICE_URL + "/offer/createoffer",
    _data
  );
  result = _response;
  if (_response.responseCode === 200) result = new Response("", 200);
  return res.send(result);

});

router.post("/useroffers", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var pageno = req.body.pageno;
  var pagesize = req.body.pagesize;
  var status = req.body.status;
  var userid = req.user.user_id.toString();
  let dataRes: Response = await _req.get(
    URLS.TRADING_SERVICE_URL +
    "/offer/offercreated?status=" +
    status +
    "&created_by=" +
    userid +
    "&pageno=" +
    pageno +
    "&pagesize=" +
    pagesize
  );

  let data: Response = await _req.get(
    URLS.TRADING_SERVICE_URL +
    "/offer/itemowned?status=" +
    status +
    "&item_owned_by=" +
    userid +
    "&pageno=" +
    pageno +
    "&pagesize=" +
    pagesize
  );
  var dataResponse = {};
  if (data && dataRes) {
    dataResponse = {
      offerCreated: dataRes,
      offerReceived: data,
    };
  }

  return res.send(dataResponse);

});

router.get("/revealpack", async (req: any, res: any, next: any) => {
  var result: any = [];
  let _req = new Network();
  let finalArray: any = [];
  var userid = req.user.user_id;
  var skuid = req.query.skuid;
  let skus = "";
  let _response: Response = await _req.get(
    URLS.PACK_SERVICE_URL +
    "/pack/revealpack?userid=" +
    userid +
    "&skuid=" +
    skuid
  );

  if (_response.responseCode === 200 && _response.responseData && _response.responseData?.rule?.length > 0) {

    //status id 2 ==> already opened 
    //status id 3 ==> already revealed but can see the items he receieved
    if (_response.responseData.data?.skus[0]?.status_id === 2 || _response.responseData.data?.skus[0]?.status_id === 3) {
      let query = "user_id=" + userid + "&pack_sku_id=" + _response.responseData.data?.skus[0].id
      let _user_asset_response: Response = await _req.get(
        URLS.PACK_SERVICE_URL + "/pack/getuserpackreveal?" +
        query
      );
      if (_user_asset_response.responseCode === 200 && _user_asset_response.responseData.length > 0) {
        const keys = Array.from(Array(10).keys());
        let items = _user_asset_response.responseData[0]
        for await (const iterator of keys) {
          if (items["item_sku_" + (iterator + 1)] !== null) {
            skus += items["item_sku_" + (iterator + 1)] + ","
          }
        }
        if (items["bonus_item"] != "") {
          skus += items["bonus_item"] + ","
        }
        skus = skus.slice(0, -1)
        let sku_response: Response = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true" + "&tv=true"
        );
        if (sku_response.responseCode === 200) {
          for await (const element of sku_response.responseData) {
            let model = new AllNFT();
            let data = model.bindFilterData(element);
            let filters = { filters: { ...data } };
            let _filtersData = await _req.post(
              URLS.ASSET_SERVICE_URL + "/asset/filters",
              filters
            );
            if (_filtersData && _filtersData.responseCode == 200) {
              let modelItem: any = new Item();
              items = _user_asset_response.responseData[0]
              modelItem.bindRedeemResponse(_filtersData.responseData);
              for await (const iterator of keys) {
                if (items["item_sku_" + (iterator + 1)] !== null && items["item_sku_" + (iterator + 1)] === modelItem?.itemSkus[0]?.itemSKUID) {
                  if (items["item_sku_" + (iterator + 1) + "_state"] === 1)
                    modelItem.openStatus = "notOpened"
                  else modelItem.openStatus = "Opened"
                }
              }
              if (items["bonus_item"] != "" && parseInt(items["bonus_item"]) === parseInt(element.item_sku_id)) {
                modelItem.isGift = "true"
                modelItem.openStatus = "opened"
              }
              result.push(modelItem);
            }
          }
          return res.send(new Response(result, 200))
        }
      }
      return res.send(new Response('', 1000))
    }
    else {
      let rule = _response.responseData.rule;
      let data = _response.responseData?.data
      for await (const iterator of rule) {
        let obj: any = {};
        const keys = Array.from(Array(30).keys());
        for await (const iterator_2 of keys) {
          if (iterator["filter_" + (iterator_2 + 1)] !== null) {
            obj["filter_" + (iterator_2 + 1)] =
              iterator["filter_" + (iterator_2 + 1)];
          }
        }
        obj.nftCount = iterator.nft_count;
        finalArray.push(obj);
      }
      console.log('fina', finalArray)
      let _asset_response: Response = await _req.post(
        URLS.ASSET_SERVICE_URL + "/asset/getrevealpackassets",
        finalArray
      );

      if (_asset_response.responseCode === 200) {
        for await (const element of _asset_response.responseData) {
          skus += element.id + ",";
          let filters = { filters: { ...element } };
          let _filtersData = await _req.post(
            URLS.ASSET_SERVICE_URL + "/asset/filters",
            filters
          );
          console.log("==", _filtersData)
          if (_filtersData && _filtersData.responseCode == 200) {
            let model: any = new Item();
            model.bindPackReveal(_filtersData.responseData);
            model.openStatus = "notOpened"
            result.push(model);
          }
        }
        let body: any = {
          pack_rule_id: _response.responseData.rule[0].id,
          user_id: userid,
          pack_item_id: data?.id,
          pack_sku_id: data?.skus[0]?.id
        }
        console.log("==", _asset_response.responseData.length)
        for (let index = 0; index < _asset_response.responseData.length; index++) {
          const element = _asset_response.responseData[index];
          body["item_" + (index + 1)] = element.item_id
          body["item_sku_" + (index + 1)] = element.id
          body["item_sku_" + (index + 1) + "_state"] = 1
        }

        let totalBonusCount = parseInt(data?.bonus_item_count);
        let revealedBonusCount = parseInt(data?.bonus_revealed_count);
        let bonusItem = data.bonus_item_1
        if (revealedBonusCount < totalBonusCount) {
          let isBonusApplicable = ((getRndInteger(1, totalBonusCount) % 2) === (skuid % 2))
          let _body = [{ code: bonusItem, nftCount: 1 }]
          if (isBonusApplicable) {
            let _reveal_response: Response = await _req.post(
              URLS.ASSET_SERVICE_URL + "/asset/getrevealpackassets",
              _body
            );
            if (_reveal_response.responseCode == 200 && _reveal_response.responseData?.length > 0) {
              let giftSku = _reveal_response.responseData[0]
              body['bonus_item'] = giftSku.id
              let filters = { filters: { ...giftSku } };
              let _filtersData = await _req.post(
                URLS.ASSET_SERVICE_URL + "/asset/filters",
                filters
              );
              if (_filtersData && _filtersData.responseCode == 200) {

                let model: any = new Item();
                model.bindPackReveal(_filtersData.responseData);
                model.openStatus = "opened"
                model.isGift = "true"
                result.push(model)
              }
              let transtype="gift"
              let _paymentHelper = new PaymentHelper()
              await _paymentHelper.claimReward(userid?.toString(), giftSku.id,transtype)
            }
          }
        }
        let _change_pack_status: Response = await _req.get(
          URLS.PACK_SERVICE_URL + "/pack/changestatus?skuid=" + skuid + "&status=" + "2"
        );
        if (_change_pack_status.responseCode === 200) {
          await _req.post(URLS.PACK_SERVICE_URL + "/pack/setuserpackreveal", body);
          return res.send(new Response(result, 200));
        }
        return res.send(new Response("", 1000));
      } else return res.send(new Response("", 1029))
    }
  }
  return res.send(_response);
});

router.get("/revealpacksbyid", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let _paymentHelper = new PaymentHelper()
  var userid = req.user.user_id;
  var skuid = req.query.skuid;
  var itemSkus = req.query.itemskus;
  const keys = Array.from(Array(10).keys());
  let _response: Response = await _req.get(
    URLS.PACK_SERVICE_URL +
    "/pack/revealpack?userid=" +
    userid +
    "&skuid=" +
    skuid
  );
  if (_response.responseCode === 200 && _response.responseData && _response.responseData?.rule?.length > 0) {
    if (_response.responseData.data.status_id === 3) return res.send(new Response('', 1031)) //already revealed
    let query = "user_id=" + userid + "&pack_sku_id=" + _response.responseData.data.skus[0].id
    let _user_asset_response: Response = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/getuserpackreveal?" +
      query
    );
    if (_user_asset_response.responseCode === 200 && _user_asset_response.responseData.length > 0) {
      let data = _user_asset_response.responseData[0]
      let skus = itemSkus.split(',')
      for await (const iterator of keys) {
        if (data["item_sku_" + (iterator + 1)] !== null) {
          if (skus.includes(data["item_sku_" + (iterator + 1)].toString())) {
            data["item_sku_" + (iterator + 1) + "_state"] = 2
          }
        }
      }
      let _user_update_response: Response = await _req.post(
        URLS.PACK_SERVICE_URL + "/pack/setuserpackrevealstatus?",
        data
      );
      if (_user_update_response.responseCode === 200) {
        let _change_owner: Response = await _req.get(
          URLS.ASSET_SERVICE_URL +
          "/trading/changeowner?buyerid=" +
          userid +
          "&skuid=" +
          itemSkus
        );
        if (_change_owner.responseCode === 200) {
          _user_asset_response = await _req.get(
            URLS.PACK_SERVICE_URL + "/pack/getuserpackreveal?" +
            query
          );
          data = _user_asset_response.responseData[0]
          let bool = true
          for await (const iterator of keys) {
            if (data["item_sku_" + (iterator + 1) + "_state"] !== null) {
              if ((data["item_sku_" + (iterator + 1) + "_state"]) === 1) {
                bool = false
              }
            }
          }
          if (bool) {
            await _req.get(
              URLS.PACK_SERVICE_URL + "/pack/changestatus?skuid=" + skuid + "&status=" + "3"
            );
          }
          //#region check collection
          skus = itemSkus.split(',')
          for await (const skuIterator of skus) {

            let _get_sku_detail = await _req.get(
              URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skuIterator
            );
            if (_get_sku_detail.responseData.length > 0) {
              let code = _get_sku_detail.responseData[0].code;
              let itemId = _get_sku_detail.responseData[0].id;
              let token = _get_sku_detail.responseData[0].skus[0].token_id;
              let blockchain = _get_sku_detail.responseData[0].skus[0]?.blockchain_id[0]?.name;
              await _paymentHelper.primaryTransfer(req.user.user_id, [token], getStringBlockchain(blockchain))
              query = "userid=" + req.user.user_id + "&pageno=0&pagesize=10";
              let _get_item = await _req.get(
                URLS.COLLECTION_SERVICE_URL + "/collection/getitem?itemcode=" + code
              );
              if (
                _get_item.responseCode === 200 &&
                _get_item.responseData.status_id === 1
              ) {
                let collectionId = _get_item.responseData.id;
                query += "&id=" + collectionId;
                let _check_status = await _req.get(
                  URLS.COLLECTION_SERVICE_URL +
                  "/collection/getusercollectionbyid?" +
                  query
                );
                if (
                  _check_status.responseCode === 200 &&
                  _check_status.responseData?.length > 0
                ) {
                  data = _check_status.responseData[0];
                  if (data.description.length > 0) {
                    bool = true;
                    let userCollection = data.description[0];
                    let keys2 = Array.from(Array(30).keys());
                    for await (const iterator of keys2) {
                      if (
                        parseInt(userCollection["item_" + (iterator + 1)]) ===
                        parseInt(itemId)
                      ) {
                        bool = false;
                      }
                    }
                    if (
                      parseInt(data.description[0].user_id) ===
                      parseInt(req.user.user_id) &&
                      bool === true &&
                      parseInt(userCollection.completion_status_id) === 1
                    ) {
                      let updateBody: any = {};
                      updateBody.id = data.description[0].id?.toString();
                      updateBody.item_num = itemId.toString();
                      updateBody.item_num_sku = skuIterator.toString();
                      await _req.post(
                        URLS.COLLECTION_SERVICE_URL + "/collection/updatecollection",
                        updateBody
                      );
                    } else console.log("already added", 4017);
                  }
                } else {
                  let body = {
                    user_id: req.user.user_id.toString(),
                    collection_id: _get_item.responseData.id.toString(),
                    completion_date_time: "1",
                    completion_status_id: "1",
                    is_reward_allocation: "1",
                    item_1: itemId.toString(),
                    item_sku_1: skuIterator.toString(),
                  };
                  await _req.post(
                    URLS.COLLECTION_SERVICE_URL + "/collection/startcollection",
                    body
                  );
                }
              }
            }
            //#endregion check collection
          }
          return res.send(new Response('', 200))
        }
      }
      return res.send(new Response('', 1000))
    }
    return res.send(new Response('', 1000))
  }
  return res.send(new Response("", 1029))
});

router.get("/reservepack", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  var packid = req.query.packid;
  let _response: Response = await _req.get(
    URLS.PACK_SERVICE_URL +
    "/pack/reservepack?userid=" +
    userid +
    "&packid=" +
    packid
  );
  return res.send(_response);

});

router.post("/counteroffer", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  let { counteroffer, offerid, isowner } = req.body
  let body = {
    counteroffer: counteroffer.toString(),
    offerid: offerid.toString(),
    userid: userid.toString(),
    isowner: isowner
  }
  let _response: Response = await _req.post(URLS.TRADING_SERVICE_URL + "/offer/counteroffer", body);
  return res.send(_response);

});

router.get("/getisliked", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  let { itemid, skuid, itemtype } = req.query
  let query = `userid=${userid}&itemid=${itemid}&skuid=${skuid}&itemtype=${itemtype}`
  let _response: Response = await _req.get(URLS.ASSET_SERVICE_URL + "/wishlist/getisliked?" + query);
  return res.send(_response);

});

router.get("/isoffered", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  let { skuid, itemtype } = req.query
  let query = `userid=${userid}&skuid=${skuid}&itemtype=${itemtype}`
  let _response: Response = await _req.get(URLS.TRADING_SERVICE_URL + "/offer/getisoffered?" + query);
  return res.send(_response);
});

router.get("/bidpercentage", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  let item_sku_id = req.query.item_sku_id;

  let auction_response: Response = await _req.get(
    URLS.AUCTION_SERVICE_URL + "/auction/bidpercentage?user_id=" + userid + "&item_sku_id=" + item_sku_id
  );
  return res.send(auction_response);
});

router.get("/getpendingpayments", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  var pageno = req.query.pageno;
  var pagesize = req.query.pagesize;
  let skus = ""
  let query = `userid=${userid}&pageno=${pageno}&pagesize=${pagesize}`
  let trading_response: Response = await _req.get(
    URLS.TRADING_SERVICE_URL + "/trading/getpendingpayments?" + query
  );
  if (trading_response.responseData.length > 0) {
    let _data = trading_response.responseData
    let model = new Notification()
    for await (const iterator of _data) {
      skus = +iterator.item_sku_id + ","
    }
    skus = skus.slice(0, -1)
    let itemData = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true"
    );

    let data = model.bindPendingPayments(trading_response.responseData)
    if (itemData.responseCode === 200 && itemData.responseData.length > 0) {
      for await (const iterator of data) {
        for await (const iterator2 of itemData.responseData) {
          if (parseInt(iterator.itemSkuID) === parseInt(iterator2.item_sku_id)) {
            iterator.item = iterator2;
          }
        }
      }
    }
    return res.send(new Response(data, 200));
  }
  return res.send(trading_response)
});

router.post("/acceptpendingpayments", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var id = req.body.id;
  let paymentHelper = new PaymentHelper()
  var userid = req.user.user_id;
  var fromacount = req.body.fromacount;
  let sku = ""
  let transValue;
  let sellerID;
  let buyerID;
  let itemType;
  let serialnumber;
  let item_id;
  let name;
  let token;
  let blockChainID
  let trans = new Transaction();
  let offerid = ""
  let type = ""
  let _amountValidation: any
  let _paymentMade: boolean = false
  let trading_response: Response = await _req.get(
    URLS.TRADING_SERVICE_URL + "/trading/getpendingpayments?userid=" + userid + "&id=" + id
  );
  if (trading_response.responseData.length > 0) {
    let _paymentData = trading_response.responseData[0]
    if (fromacount === "creditcard") {
      _paymentMade = await paymentHelper.makeStripePayment({
        ...req.body,
        transactionValue: _paymentData.pending_amount.toString()
      },
        _paymentData.transaction_id, _paymentData.buyer_id.toString())
      if (_paymentMade === false) {
        return res.send(new Response('', 1044));
      }
    }
    if (fromacount === "terrawallet") {
      _amountValidation = await paymentHelper.checkWalletAmount(_paymentData.pending_amount, _paymentData.buyer_id)
      if (_amountValidation.responseCode != 200) {
        return res.send(new Response('', 1044));
      } else {
        let _result = await paymentHelper.createWalletTransaction(_paymentData.item_owner_id, _paymentData.buyer_id, _paymentData.pending_amount, "pendingpayment")
        if (_result.responseCode !== 200) {
          return res.send(new Response('', 1044));
        }
        _paymentMade = true
      }
    }
    if (fromacount === "metamask") {
      _paymentMade = true
    }
    if (_paymentMade === true) {
      sku = _paymentData.item_sku_id.toString();
      transValue = _paymentData.pending_amount.toString()
      sellerID = _paymentData.item_owner_id.toString();
      buyerID = _paymentData.buyer_id.toString();
      itemType = _paymentData.item_type;
      offerid = _paymentData.offer_id;
      type = _paymentData.type;

      if (itemType.toLowerCase() == "asset") {
        let dataRes: Response = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + sku
        );
        serialnumber =
          dataRes?.responseData[0]?.skus[0]?.serial_no.toString();
        item_id = dataRes?.responseData[0]?.id.toString();
        name = dataRes?.responseData[0]?.name;
        token = dataRes.responseData[0].skus[0].token_id;
        blockChainID = dataRes.responseData[0].skus[0].blockchain_id
        console.log('blcockcahinid==>', blockChainID)

      } else {
        let dataRespack: Response = await _req.get(
          URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + sku
        );
        serialnumber =
          dataRespack?.responseData[0]?.pack_sku_serial_no.toString();
        item_id = dataRespack.responseData[0]?.item_id.toString();
      }
      let _usersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        buyerID
      );
      var to_account = _usersData?.responseData[0]?.metamask_eth_account?.toString();
      await paymentHelper.updateTransaction({
        itemType,
        trans,
        sku,
        buyerID,
        serialnumber,
        to_account,
        fromAccount: "terraWallet",
        transType: "sale",
        paymentType: "sale",
        transValue,
        req,
        offerid: type == 'offer' ? offerid : null,
        auctionid: type == 'offer' ? null : offerid,
        sellerID,
        token,
        transactionID: _paymentData.transaction_id,
        blockChainID
      })
      let _response = await trans.createTransaction();
      if (_response.responseCode !== 200) return res.send(_response)
      await paymentHelper.completeTransaction(_paymentData.transaction_id)
      if (type.toLowerCase() === "auction") {
        paymentHelper.cancelAuction(sku, item_id, sellerID)
      }
      await paymentHelper.checkCollection(req, sellerID, sku)

      //#region trending collection
      let query = "skuid=" + sku;
      await paymentHelper.increaseTrendCount(query, itemType)
      //#endregion trending collection
      let buyerEmail = _usersData?.responseData[0]?.email;
      await paymentHelper.sendEmail(buyerEmail, sku, buyerID, itemType, transValue, name)
      await paymentHelper.notifyTransaction(_paymentData.transaction_id)
      await paymentHelper.updatePendingPayment([req.body.id], "Completed")
      await paymentHelper.unlockAsset(itemType, sku)
      return res.send(new Response("", 200))
    }
    return res.send(_amountValidation)
  }
  return res.send(trading_response)
});

router.post("/addpromocode", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var user_id = null;
  let token = req.get('authorization')
  let tokenArray = token.split(" ");
  let obj1: any = decodeJwtToken(tokenArray[1])
  let items = req.body.items;
  let promoCode = req.body.promocode;
  let obj: any = {}
  let itemIDS: any = []
  let skus: string = ""
  let finalResult: any = []
  for await (const iterator of items) {
    skus += iterator?.itemSkus[0]?.itemSKUID + ","
  }
  skus = skus.slice(0, -1)
  let sku_response: Response = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true"
  );
  if (obj1 !== 6023) {
    user_id = obj1.user_id
    if (sku_response.responseCode == 200) {
      let _criteria: Response = await _req.get(
        URLS.CAMPAIGN_SERVICE_URL + `/admin/campaign/getmarketcriteria?promo_code=${promoCode}&user_id=${user_id}`
      );
      if (_criteria.responseCode == 200) {
        let criteria: any = _criteria.responseData[0]
        if (criteria.brand) obj.filter_1 = criteria.brand
        if (criteria.rarity) obj.filter_2 = criteria.rarity
        if (criteria.series) obj.filter_7 = criteria.series
        if (criteria.artist) obj.filter_9 = criteria.artist
        if (criteria.publisher) obj.filter_11 = criteria.publisher
        if (criteria.edition) obj.filter_3 = criteria.edition
        if (criteria.type) obj.type = criteria.type
        if (criteria.set) obj.filter_4 = criteria.set
        if (criteria.category) obj.filter_6 = criteria.category
        if (criteria.item_id) obj.item_id = criteria.item_id
        let body = [{ ...obj }]
        let _items: Response = await _req.post(
          URLS.ASSET_SERVICE_URL + "/asset/getcampaignassets", body
        );
        if (_items.responseCode == 200 && _items.responseData.length > 0) {
          itemIDS = [...new Set(_items.responseData.map((item: any) => item.id))];
        }
        for await (const iterator of sku_response.responseData) {
          for await (const iterator2 of itemIDS) {
            let obj2: any = {}
            if (iterator.item_id == iterator2) {
              obj2.itemID = iterator.item_id
              obj2.itemSkuID = iterator.item_sku_id
              obj2.name = iterator.item_name
              obj2.salePrice = iterator.item_sku_sale_price
              obj2.discount = criteria.discount
              obj2.serialNumber = iterator.item_sku_serial_no
              iterator.discountedPrice = parseFloat(iterator.item_sku_sale_price) - criteria.discount
              finalResult.push(obj2)
            }
          }
        }
        return res.send(new Response(finalResult, 200))
      }
      return res.send(new Response("", 1025))
    }
  }
  return res.send('', 6023)
});

router.post("/addredeemcode", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let redeemcode = req.body.redeemcode;
  let userid = req.user.user_id;
  let obj: any = {}
  let itemIDS: any = []
  let finalResult: any = []
  let _criteria: Response = await _req.get(
    URLS.CAMPAIGN_SERVICE_URL + `/admin/campaign/getmarketcriteria?promo_code=${redeemcode}&user_id=${userid}`
  );
  if (_criteria.responseCode == 200) {
    let criteria: any = _criteria.responseData[0]
    let _userRedeemed: Response = await _req.get(
      URLS.CAMPAIGN_SERVICE_URL + `/campaign/getuserredeemed?userid=${userid}&campaignid=${criteria.campaign_id}&campaigndetailid=${criteria.campaign_detail_id}`
    );
    if (_userRedeemed.responseCode === 200) {
      return res.send(new Response(finalResult, 1047))
    }
    if (criteria.brand) obj.filter_1 = criteria.brand
    if (criteria.rarity) obj.filter_2 = criteria.rarity
    if (criteria.series) obj.filter_7 = criteria.series
    if (criteria.artist) obj.filter_9 = criteria.artist
    if (criteria.publisher) obj.filter_11 = criteria.publisher
    if (criteria.edition) obj.filter_3 = criteria.edition
    if (criteria.type) obj.type = criteria.type
    if (criteria.set) obj.filter_4 = criteria.set
    if (criteria.category) obj.filter_6 = criteria.category
    if (criteria.item_id) obj.item_id = criteria.item_id
    obj.isRedeem = true
    let body = [{ ...obj }]
    let _items: Response = await _req.post(
      URLS.ASSET_SERVICE_URL + "/asset/getcampaignassets", body
    );
    if (_items.responseCode == 200 && _items.responseData.length > 0) {
      itemIDS = [...new Set(_items.responseData.map((item: any) => item.itemskuid))];
    }
    if (itemIDS.length > 0) {
      let sku_response: Response = await _req.get(
        URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + itemIDS[0] + "&raw=true" + "&tv=true"
      );
      if (sku_response.responseCode === 200 && sku_response.responseData?.length > 0) {
        let _paymentHelper = new PaymentHelper()
        let transtype="redeemed"
        let token = sku_response.responseData[0].item_sku_token_id
        let blockchain = sku_response.responseData[0].blockchain_id[0]?.name;
        await _paymentHelper.claimReward(req.user.user_id?.toString(), itemIDS[0],transtype)
        await _paymentHelper.primaryTransfer(req.user.user_id, [token], getStringBlockchain(blockchain))
        let allnft = new AllNFT();
        let filter = allnft.bindFilterData(sku_response.responseData[0]);
        let filters = { filters: { ...filter } };

        let _filtersData = await _req.post(
          URLS.ASSET_SERVICE_URL + "/asset/filters",
          filters
        );
        if (_filtersData && _filtersData.responseCode == 200) {
          let model = new Item()
          model.bindRedeemResponse(_filtersData.responseData)
          finalResult.push(model)
        }
      }
      let bodys = {
        userid: userid,
        campaignid: criteria.campaign_id,
        campaigndetailid: criteria.campaign_detail_id,
        redeemcode: redeemcode
      }
      await _req.post(
        URLS.CAMPAIGN_SERVICE_URL + `/campaign/userredeemed`, bodys);
      return res.send(new Response(finalResult, 200))
    }
    return res.send(new Response(finalResult, 2000))
  }
  return res.send(new Response("", 1025))
});


router.get("/getopenessitems", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userid = req.user.user_id;
  let status = req.query.status.split(",");
  let pageno = req.query.pageno;
  let pagesize = req.query.pagesize;
  let statuses = ""
  let result: any = []
  status.forEach((element: any) => {
    if (element === "close") element = 0
    if (element === "open") element = 1
    statuses += element + ","
  });
  statuses = statuses.slice(0, -1)

  let _assets_response: Response = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/getopenessitems?userid=" + userid + "&status=" + statuses + "&pageno=" + pageno + "&pagesize=" + pagesize
  );
  if (_assets_response.responseCode == 200 && _assets_response.responseData?.length > 0) {
    _assets_response.responseData.forEach((element: any) => {

      let model = new AllNFT()
      model.bindOpenResponse(element)
      result.push(model)
    });
    return res.send(new Response(result, 200))

  }
  return res.send(_assets_response)
});

router.post("/openess", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userid = req.user.user_id;
  let skuid = req.body.skuids
  let open = req.body.export
  let body = {
    "skuid": skuid,
    "lock": open,
    "userid": userid
  }
  let _assets_response: Response = await _req.post(
    URLS.ASSET_SERVICE_URL + "/asset/lockassetforopen", body);
  return res.send(_assets_response)
});
export = router;
