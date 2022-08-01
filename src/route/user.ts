import express from "express";
import { Response } from "../../models/response";
import Network from "../../utils/network";
import URLS from "tv-micro-services-common/build/urls";
import { AllNFT } from "../../models/allnft";
import { Pack } from "../../models/pack";
import { Collection } from "../../models/collection";
import { UserProfile } from "../../models/userprofile";
import { Item } from "../../models/item";
import { Offer } from "../../models/offer";
import { ItemOffer } from "../../models/itemoffers";
import { User } from "../../models/user";
import { Auction } from "../../models/auction";
import { Transaction } from "../../models/transaction";
import { Itemdetail } from "../../models/itemdetail";
import { Activity } from "../../models/activity";
import { Rarity } from "../../models/rarity";
import { Notification } from "../../models/notification";
import config from "tk-api-common/src/modules/config";
import StripeService from "../../services/stripeService";
import countries from "../../utils/countriesWiseVat";
import PaymentHelper from "../../services/paymentHelper";
import { getBlockchain } from "../../utils/helper";
import { ADMIN_USER_ID } from "../../constants";
var router = express.Router();
var websiteURL = process.env.WEBSITE_URL || config.get("websiteURL");

router.get("/allnfts", async (req: any, res: any, next: any) => {
  var result = null;
  let userObj = req.user;
  let finalResult: any = [];
  let finalArray = [];
  var model = new AllNFT();
  let skus = "";
  let innerQuery = "";
  var validationResult = model.validateFilter(req.query);
  if (validationResult.responseCode == 200) {
    var startPrice = "";
    var endPrice = "";
    if (req.query.pricerange) {
      var list = req.query.pricerange.split(",");

      startPrice = list[0];
      endPrice = list[1];
    }
    var query = "filterby=" + req.query.filterby;
    if (userObj) query += "&userid=" + userObj.user_id;
    if (startPrice) query += "&startprice=" + startPrice;
    if (endPrice) query += "&endprice=" + endPrice;
    query += "&sortby=" + req.query.sortby;
    query += "&pagesize=" + req.query.pagesize;
    query += "&pageno=" + req.query.pageno;
    let sort = "";
    if (req.query.sortby === "pricehightolow") sort = "desc";
    else sort = "asc";

    let _req = new Network();
    let data = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/userall?" + query
    );
    result = data;

    if (data.responseCode === 200 && data.responseData.length > 0) {
      data = data.responseData;
      var assets = data.filter(
        (x: { item_type: string }) => x.item_type == "item"
      );

      for (const iterator of assets) {
        skus += iterator.item_sku_id + ",";
      }
      skus = skus?.slice(0, -1); //remove last ','
      innerQuery = "skus=" + skus;
      innerQuery += "&raw=true";
      let data_assets = await _req.get(
        URLS.ASSET_SERVICE_URL + "/asset/itemskus?" + innerQuery
      );

      result = data_assets;
      if (data_assets.responseCode === 200) {
        finalResult = data_assets.responseData;
      }
    }
    skus = "";
    var packs = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/userall?" + query
    );
    if (packs.responseCode === 200 && packs.responseData.length > 0) {
      packs = packs.responseData;

      for (const iterator of packs) {
        skus += iterator.pack_item_sku_id + ",";
      }
      skus = skus.slice(0, -1); //remove last ','
      innerQuery = "skus=" + skus;
      let data_packs = await _req.get(
        URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?" + innerQuery
      );

      if (
        data_packs.responseCode === 200 &&
        data_packs.responseData.length > 0
      ) {
        finalResult.push(...data_packs.responseData);

        finalResult.sort((a: { price: string }, b: { price: string }) => {
          if (sort === "asc") {
            return parseInt(a.price) - parseInt(b.price);
          } else {
            return parseInt(b.price) - parseInt(a.price);
          }
        });
      }
    }

    for await (const iterator of finalResult) {
      data = model.bindFilterData(iterator);
      let filters = { filters: { ...data } };
      let _filtersData = await _req.post(
        URLS.ASSET_SERVICE_URL + "/asset/filters",
        filters
      );
      if (_filtersData && _filtersData.responseCode == 200) {
        data = _filtersData.responseData;
        finalArray.push(data);
      }
    }

    let modelData = model.bindItemsResponse(finalArray, true);
    finalResult = modelData;
    result = new Response(finalResult, 200);
    return res.send(result?.compose());
  }
  return res.send(validationResult);
});

router.get("/packs", async (req: any, res: any, next: any) => {
  var result: any = [];
  var allPacks: any = [];
  var pagesize = req.query.pagesize;
  var pageno = req.query.pageno;
  var userid = req.user.user_id;
  var filters = req.query.filterby?.split(",");
  let _req = new Network();
  var model;
  if (filters.includes("reserved")) {
    filters.filter((i: string) => i != "reserved");

    let reserveData: Response = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/userreservedpacks?userid=" + userid
    );

    let ids = "";
    if (
      reserveData.responseCode === 200 &&
      reserveData.responseData.length > 0
    ) {
      allPacks = allPacks.concat([...reserveData.responseData])
      for await (const iterator of reserveData.responseData) {
        ids += iterator.pack_item_id + ",";
      }
      ids = ids.slice(0, -1);

      let packDetail: Response = await _req.get(
        URLS.PACK_SERVICE_URL + "/pack/packbyid?id=" + ids
      );
      if (
        packDetail.responseCode === 200 &&
        packDetail.responseData.length > 0
      ) {
        let data = packDetail.responseData;
        for await (const iterator of data) {
          let _data = await _req.get(
            URLS.ASSET_SERVICE_URL + "/config/brand?id=" + iterator.brand
          );
          if (_data && _data.responseCode == 200) {
            iterator.filter_1 = _data.responseData;
          }
          model = new Pack();
          result.push(model.bindSinglePackResponse(iterator));
        }
      }
    }
  }
  if (filters.includes("trending")) {
    filters.filter((i: string) => i != "trending");
    let status = "1,2";
    if (filters.includes("revealed")) {
      status += ",3";
      filters = filters.filter((i: string) => i != "revealed");
    }
    let data = await _req.get(
      URLS.PACK_SERVICE_URL +
      "/pack/checkpacks?pagesize=" +
      pagesize +
      "&user_id=" +
      userid +
      "&pageno=" +
      pageno +
      "&status=" +
      status
    );

    if (data.responseCode == 200) {
      allPacks.concat([...data.responseData])
      for await (const element of data.responseData) {
        let _data = await _req.get(
          URLS.ASSET_SERVICE_URL + "/config/brand?id=" + element.brand
        );
        if (_data && _data.responseCode == 200) {
          element.filter_1 = _data.responseData;
        }

        model = new Pack();
        result.push(model.bindSinglePackResponse(element));
      }
    }
  }

  if (filters.includes("revealed")) {
    filters.filter((i: string) => i != "revealed");
    let status = "3";
    let data = await _req.get(
      URLS.PACK_SERVICE_URL +
      "/pack/checkpacks?pagesize=" +
      pagesize +
      "&user_id=" +
      userid +
      "&pageno=" +
      pageno +
      "&status=" +
      status
    );

    if (data.responseCode == 200) {
      for await (const element of data.responseData) {
        let _data = await _req.get(
          URLS.ASSET_SERVICE_URL + "/config/brand?id=" + element.brand
        );
        if (_data && _data.responseCode == 200) {
          element.filter_1 = _data.responseData;
        }

        model = new Pack();
        result.push(model.bindSinglePackResponse(element));
      }
    }
  }
  return res.send(new Response(result, 200));
});

router.get("/collections", async (req: any, res: any, next: any) => {
  var result = null;
  const keys = Array.from(Array(30).keys());

  var model = new Collection();
  var validationResult = model.validateFilter(req.query);
  if (validationResult.responseCode == 200) {
    var query = "filterby=" + req.query.filterby;

    if (req.query.pagesize) query += "&pagesize=" + req.query.pagesize;
    if (req.query.pageno) query += "&pageno=" + req.query.pageno;
    if (req.query.brand) query += "&brand=" + req.query.brand;
    if (req.user) query += "&userid=" + req.user.user_id;

    let _req = new Network();
    let data = await _req.get(
      URLS.COLLECTION_SERVICE_URL + "/collection/userall?" + query
    );
    if (data && data.responseCode == 200) {
      _req = new Network();

      for await (const element of data.responseData) {
        if (element.item_reward_1 && element.item_reward_1 != "") {
          let _data = await _req.get(
            URLS.ASSET_SERVICE_URL +
            "/asset/itemcode?code=" +
            element.item_reward_1
          );

          if (_data && _data.responseCode == 200) {
            element.item_reward_1 = _data.responseData[0];
          }

          _data = await _req.get(
            URLS.ASSET_SERVICE_URL + "/config/brand?id=" + element.brand
          );
          if (_data && _data.responseCode == 200) {
            element.brand = _data.responseData[0];
          }
        }
      }

      //#region check total collections and user collections
      for await (const iterator of data.responseData) {
        let collectionCount: any = Object.keys(iterator).find((i: any) => {
          if (i.includes("item") && iterator[i] === null) {
            return i;
          }
        });
        collectionCount = collectionCount?.charAt(collectionCount.length - 1);
        iterator.collectionCount = parseInt(collectionCount) - 1;

        for await (const iterator_2 of iterator.userCollection) {
          let sum = 0;
          for (const element of keys) {
            let key: any = "item_" + (element + 1);
            if (iterator_2[key] !== null) {
              sum += 1;
            }
          }
          iterator.userCollectionCount = sum;
        }
      }
      //#endregion check total collections and user collections

      let _collectibleList = model.bindCollectionResponse(data);
      result = new Response(_collectibleList, 200);
      res.send(result);
      return;
    }

    res.send(data);
    return;
  }

  return res.send(validationResult);
});
//
router.get("/overview", async (req: any, res: any, next: any) => {
  try {
    var result = null;
    var skus = "";
    var packSkus = "";
    var userQuery;
    var highestBids: [] = [];
    var _user_data: any;
    var data_assets: any;
    var model = new UserProfile();
    var validationResult = model.validateFilter(req.query);
    if (validationResult.responseCode == 200) {
      var _userProfile = new UserProfile();

      var userID = req.user.user_id;
      let _req = new Network();

      // get profile data from user-microservice
      //#region getUserProfile
      var query = "userid=" + userID;

      let data: any = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?" +
        query +
        "&self=true"
      );

      var resModel = new Response(data.responseData, data.responseCode);
      if (resModel.responseCode == 200 && resModel.responseData.length > 0) {
        let _paymentHelper = new PaymentHelper();
        let balance = await _paymentHelper.getWalletAmount(userID);
        _userProfile.user = new User();
        _userProfile.user.walletAmount = `$${balance}`;
        _userProfile.user.image = data.responseData[0].thumbnail_url;
        _userProfile.user.displayName = data.responseData[0].displayName;
        _userProfile.user.userName = data.responseData[0].userName;
        _userProfile.user.prestigeLevel = "Bronze";
      }

      //#endregion

      // get bidding details from auction-microservice
      //#region getUserAuctions

      data = await _req.get(
        URLS.AUCTION_SERVICE_URL + "/auction/getuseractivity?" + query
      );
      resModel = new Response(data.responseData, data.responseCode);
      let userIds = "";

      if (resModel.validateResponse()) {
        if (data.responseData.myAuctions) {
          data.responseData.myAuctions.forEach((element: any) => {
            let _auc = new Auction();
            _auc.bindUserAuctionsResponse(element);
            _userProfile.receivedAuctions.push(_auc);
            if (!skus.includes(_auc.item.itemSkus[0].itemSKUID.toString())) {
              skus += _auc.item.itemSkus[0].itemSKUID + ",";
            }
            element.items.forEach((user: { user_id: string }) => {
              userIds += user.user_id + ",";
            });
          });
        }

        if (data.responseData.biddedAuctions) {
          data.responseData.biddedAuctions.forEach((element: any) => {
            let _auc = new Auction();
            _auc.bindUserAuctionsResponse(element);
            _userProfile.sentAuctions.push(_auc);
            if (!skus.includes(_auc.item.itemSkus[0].itemSKUID.toString())) {
              skus += _auc.item.itemSkus[0].itemSKUID + ",";
            }
            element.items.forEach((user: { user_id: string }) => {
              userIds += user.user_id + ",";
            });
          });
        }
        userIds = userIds.slice(0, -1);
        userQuery = "userid=" + userIds;
        _user_data = await _req.get(
          URLS.USER_MANAGEMENT_SERVICE_URL +
          "/userManagement/overview?" +
          userQuery
        );
        if (skus[skus.length - 1] === ",") {
          skus = skus.slice(0, -1);
        }
        let _temp_data = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true"
        );
        let highestBidQuery = "itemskuid=" + skus;
        let highest_bids = await _req.get(
          URLS.AUCTION_SERVICE_URL + "/auction/auctionhighestbidder?" + highestBidQuery
        );
        if (highest_bids.responseData.length > 0) {
          highestBids = highest_bids.responseData;
        }

        let _resModel = new Response(
          _temp_data.responseData,
          _temp_data.responseCode
        );
        if (_resModel.validateResponse()) {
          _resModel.responseData.forEach((asset_item: any) => {
            let _item = new Item();
            _item.bindOfferResponse(asset_item);

            _userProfile.receivedAuctions.forEach((element: Auction) => {
              if (element.item.itemID == _item.itemID) {
                element.item = _item;
              }
              element.bids.forEach((bids) => {
                _user_data.responseData.forEach((user: any) => {
                  if (bids.bidder.userID === user.id) {
                    bids.bidder.displayName = user.displayName;
                  }
                  if (bids.bidder.userID === userID) {
                    bids.bidder.displayName = _userProfile.user.displayName;
                  }
                });
              });
              highestBids.forEach((bidder: any) => {
                if (bidder.item_sku_id === element?.item?.itemSkus[0]?.itemSKUID) {
                  element.topBid = bidder.bidprice
                }
              });
            });
            _userProfile.sentAuctions.forEach((elements: Auction) => {
              if (elements.item.itemID == _item.itemID) {
                elements.item = _item;
              }
              elements.bids.forEach((bid) => {
                _user_data.responseData.forEach((users: any) => {
                  if (bid.bidder.userID === users.id) {
                    bid.bidder.displayName = users.displayName;
                  }
                  if (bid.bidder.userID === userID) {
                    bid.bidder.displayName = _userProfile.user.displayName;
                  }
                });
              });
              highestBids.forEach((bidders: any) => {
                if (bidders.item_sku_id === elements?.item?.itemSkus[0]?.itemSKUID) {
                  elements.topBid = bidders.bidprice
                }
              });
            });
          });
        }
      }
      //#endregion

      // get offer details from offer-microservice
      //#region
      data = await _req.get(
        URLS.TRADING_SERVICE_URL + "/offer/getuseractivity?" + query + "&history=true"
      );
      resModel = new Response(data.responseData, data.responseCode);
      if (resModel.validateResponse()) {
        skus = "";
        packSkus = "";
        _userProfile.itemOfferReceived = [];
        _userProfile.itemOfferSent = [];
        _userProfile.itemOfferCountered = [];

        data.responseData.offersReceived.forEach((element: any) => {
          let _foundObj = _userProfile.itemOfferReceived.find(
            (x) => x.item.itemSkus[0].itemSKUID == element.item_sku_id
          );
          if (!_foundObj) {
            let _offer = new Offer();
            _offer.bindUserOffersResponse(element);
            _offer.itemType = element.item_type;

            let _itemOffer = new ItemOffer();
            _itemOffer.offers = [];
            _itemOffer.offers.push(_offer);

            _itemOffer.item = _offer.item;
            _itemOffer.history = _offer.history
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.itemOwnedBy.userID + ",";
            else userIds += _offer.itemOwnedBy.userID + ",";
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.offeredBy.userID + ",";
            else userIds += _offer.offeredBy.userID + ",";
            if (element.item_type === "asset") {
              skus += _offer.item.itemSkus[0].itemSKUID + ",";
            } else packSkus += _offer.item.itemSkus[0].itemSKUID + ",";
            _offer.item = new Item();
            _userProfile.itemOfferReceived.push(_itemOffer);
          } else {
            let _offer = new Offer();
            _offer.bindUserOffersResponse(element);
            _offer.itemType = element.item_type;
            if (element.item_type === _foundObj.offers[0].itemType) {
              _foundObj.offers.push(_offer);
            } else {
              let _itemOffer = new ItemOffer();
              _itemOffer.offers = [];
              _itemOffer.offers.push(_offer);

              _itemOffer.item = _offer.item;
              if (element.item_type === "asset") {
                skus += _offer.item.itemSkus[0].itemSKUID + ",";
              } else packSkus += _offer.item.itemSkus[0].itemSKUID + ",";
              _offer.item = new Item();
              _userProfile.itemOfferReceived.push(_itemOffer);
            }
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.itemOwnedBy.userID + ",";
            else userIds += _offer.itemOwnedBy.userID + ",";
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.offeredBy.userID + ",";
            else userIds += _offer.offeredBy.userID + ",";
          }
        });
        if (skus[skus.length - 1] === ",") {
          skus = skus.slice(0, -1);
        }
        let _temp_data = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true"
        );
        let _temp_pack_data = await _req.get(
          URLS.PACK_SERVICE_URL +
          "/pack/checkallpackskus?skus=" +
          packSkus +
          "&raw=true"
        );
        let _resPackModel = new Response(
          _temp_pack_data.responseData,
          _temp_pack_data.responseCode
        );
        let _resModel = new Response(
          _temp_data.responseData,
          _temp_data.responseCode
        );
        if (_resModel.validateResponse()) {
          _resModel.responseData.forEach((asset_item: any) => {
            let _item = new Item();
            _item.bindOfferResponse(asset_item);

            _userProfile.itemOfferReceived.forEach((element: ItemOffer) => {
              if (
                element.item.itemSkus[0].itemSKUID ===
                _item.itemSkus[0].itemSKUID &&
                element.offers[0].itemType === "asset"
              ) {
                element.item = _item;
              }
            });
          });
        }
        if (_resPackModel.validateResponse()) {
          _resPackModel.responseData.forEach((asset_item: any) => {
            let _item = new Item();
            _item.bindOfferPackResponse(asset_item);
            _userProfile.itemOfferReceived.forEach((element: ItemOffer) => {
              if (
                element.item.itemSkus[0].itemSKUID ==
                _item.itemSkus[0].itemSKUID &&
                element.offers[0].itemType === "packs"
              ) {
                element.item = _item;
              }
            });
          });
        }

        skus = "";
        packSkus = "";
        data.responseData.offersSent.forEach((element: any) => {
          let _foundObj = _userProfile.itemOfferSent.find(
            (x) => x.item.itemSkus[0].itemSKUID == element.item_sku_id
          );
          if (!_foundObj) {
            let _offer = new Offer();
            _offer.bindUserOffersResponse(element);
            _offer.itemType = element.item_type;

            let _itemOffer = new ItemOffer();
            _itemOffer.offers = [];
            _itemOffer.offers.push(_offer);

            _itemOffer.item = _offer.item;
            _itemOffer.history = _offer.history
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.itemOwnedBy.userID + ",";
            else userIds += _offer.itemOwnedBy.userID + ",";
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.offeredBy.userID + ",";
            else userIds += _offer.offeredBy.userID + ",";
            if (element.item_type === "asset") {
              skus += _offer.item.itemSkus[0].itemSKUID + ",";
            } else packSkus += _offer.item.itemSkus[0].itemSKUID + ",";
            _offer.item = new Item();
            _userProfile.itemOfferSent.push(_itemOffer);
          } else {
            let _offer = new Offer();
            _offer.bindUserOffersResponse(element);
            _offer.itemType = element.item_type;
            if (element.item_type === _foundObj.offers[0].itemType) {
              _foundObj.offers.push(_offer);
            } else {
              let _itemOffer = new ItemOffer();
              _itemOffer.offers = [];
              _itemOffer.offers.push(_offer);

              _itemOffer.item = _offer.item;
              if (element.item_type === "asset") {
                skus += _offer.item.itemSkus[0].itemSKUID + ",";
              } else packSkus += _offer.item.itemSkus[0].itemSKUID + ",";
              _offer.item = new Item();
              _userProfile.itemOfferSent.push(_itemOffer);
            }
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.itemOwnedBy.userID + ",";
            else userIds += _offer.itemOwnedBy.userID + ",";
            if (userIds.length > 0 && userIds[userIds.length - 1] !== ",")
              userIds += "," + _offer.offeredBy.userID + ",";
            else userIds += _offer.offeredBy.userID + ",";
          }
        });

        userIds = userIds.slice(0, -1);
        userQuery = "userid=" + userIds;
        _user_data = await _req.get(
          URLS.USER_MANAGEMENT_SERVICE_URL +
          "/userManagement/overview?" +
          userQuery
        );
        if (skus[skus.length - 1] === ",") {
          skus = skus.slice(0, -1);
        }
        _temp_data = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true"
        );
        _temp_pack_data = await _req.get(
          URLS.PACK_SERVICE_URL +
          "/pack/checkallpackskus?skus=" +
          packSkus +
          "&raw=true"
        );
        _resPackModel = new Response(
          _temp_pack_data.responseData,
          _temp_pack_data.responseCode
        );
        _resModel = new Response(
          _temp_data.responseData,
          _temp_data.responseCode
        );
        if (_resModel.validateResponse()) {
          _resModel.responseData.forEach((asset_item: any) => {
            let _item = new Item();
            _item.bindOfferResponse(asset_item);

            _userProfile.itemOfferSent.forEach((element: ItemOffer) => {
              if (
                element.item.itemSkus[0].itemSKUID ==
                _item.itemSkus[0].itemSKUID &&
                element.offers[0].itemType === "asset"
              ) {
                element.item = _item;
              }
              _user_data.responseData.forEach((user: any) => {
                element.offers.forEach((offer) => {
                  if (offer.itemOwnedBy.userID === user.id) {
                    offer.itemOwnedBy.displayName = user.displayName;
                    offer.itemOwnedBy.userName = user.userName;
                  }
                  if (offer.itemOwnedBy.userID === userID) {
                    offer.itemOwnedBy.displayName = _userProfile.user.displayName;
                    offer.itemOwnedBy.userName = _userProfile.user.userName;
                  }
                  if (offer.offeredBy.userID === user.id) {
                    offer.offeredBy.displayName = user.displayName;
                    offer.offeredBy.userName = user.userName;
                  }
                  if (offer.offeredBy.userID === userID) {
                    offer.offeredBy.displayName = _userProfile.user.displayName;
                    offer.offeredBy.userName = _userProfile.user.userName;
                  }
                  offer?.history?.forEach(history => {
                    if (history.ownedBy === user.id) {
                      history.ownedBy = {}
                      history.ownedBy.displayName = user.displayName;
                    }
                  });
                });
              });
            });
          });
        }
        if (_resPackModel.validateResponse()) {
          _resPackModel.responseData.forEach((asset_item: any) => {
            let _item = new Item();
            _item.bindOfferPackResponse(asset_item);
            _userProfile.itemOfferSent.forEach((element: ItemOffer) => {
              if (
                element.item.itemSkus[0].itemSKUID ==
                _item.itemSkus[0].itemSKUID &&
                element.offers[0].itemType === "packs"
              ) {
                element.item = _item;
              }
              
              _user_data.responseData.forEach((user: any) => {
                element.offers.forEach((offer) => {
                  if (offer.itemOwnedBy.userID === user.id) {
                    offer.itemOwnedBy.displayName = user.displayName;
                  }
                  if (offer.offeredBy.userID === user.id) {
                    offer.offeredBy.displayName = user.displayName;
                    offer.offeredBy.userName = user.userName;
                  }
                  if (offer.itemOwnedBy.userID === userID) {
                    offer.itemOwnedBy.displayName = _userProfile.user.displayName;
                    offer.itemOwnedBy.userName = _userProfile.user.userName;
                  }
                  if (offer.offeredBy.userID === userID) {
                    offer.offeredBy.displayName = _userProfile.user.displayName;
                    offer.offeredBy.userName = _userProfile.user.userName;
                  }
                  offer?.history?.forEach(history => {
                    if (history.ownedBy === user.id) {
                      history.ownedBy = {}
                      history.ownedBy.displayName = user.displayName;
                    }
                  });
                });
              });
            });
          });
        }
        _userProfile.itemOfferSent.forEach((element: ItemOffer) => {
          if (
            element?.offers?.length > 0 &&
            element?.offers[0]?.counterOffer !== null
          ) {
            _userProfile.itemOfferCountered.push(element);
          }
        });
        _userProfile.itemOfferReceived.forEach((element: ItemOffer) => {
          _user_data.responseData.forEach((user: any) => {
            element.offers.forEach((offer) => {
              if (offer.itemOwnedBy.userID === user.id) {
                offer.itemOwnedBy.displayName = user.displayName;
              }
              if (offer.itemOwnedBy.userID === userID) {
                offer.itemOwnedBy.displayName = _userProfile.user.displayName;
              }
              if (offer.offeredBy.userID === user.id) {
                offer.offeredBy.displayName = user.displayName;
                offer.offeredBy.userName = user.userName;
              }
              if (offer.offeredBy.userID === userID) {
                offer.offeredBy.displayName = _userProfile.user.displayName;
                offer.offeredBy.userName = _userProfile.user.userName;
              }
              offer?.history?.forEach(history => {
                if (history.ownedBy === user.id) {
                  history.ownedBy = {}
                  history.ownedBy.displayName = user.displayName;
                }
              });
            });
          });
        });
      }
      _userProfile.soldTransactions = [];
      _userProfile.purchasedTransactions = [];
      let _responseTransaction: Response = await _req.get(
        URLS.TRADING_SERVICE_URL +
        "/trading/getUserTransactions?userid=" +
        userID
      );
      skus = "";
      packSkus = "";
      if (_responseTransaction.responseCode === 200) {
        for await (const iterator of _responseTransaction.responseData) {
          if (iterator.item_type === "asset") {
            skus += iterator.item_sku_id + ",";
          } else {
            packSkus += iterator.item_sku_id + ",";
          }
        }
        skus = skus.slice(0, -1);
        packSkus = packSkus.slice(0, -1);

        query = "skus=" + skus;
        query += "&raw=true";
        data_assets = await _req.get(
          URLS.ASSET_SERVICE_URL + "/asset/itemskus?" + query
        );
      }
      for await (const element of _responseTransaction.responseData) {
        for await (const item of data_assets.responseData) {
          if (element.item_sku_id === item.item_sku_id) {
            element.item = item;
            let _item: any = new Item();
            _item.bindTransactionResponse(element);
            if (_item.fromuserid === userID)
              _userProfile.soldTransactions.push(_item);
            else _userProfile.purchasedTransactions.push(_item);
          }
        }
      }

      var _pack_data = await _req.get(
        URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + packSkus
      );
      _responseTransaction.responseData.forEach((element: any) => {
        _pack_data.responseData.forEach((item: any) => {
          if (element.item_sku_id === item.pack_sku_id) {
            element.item = item;
            let _item: any = new Item();
            _item.bindTransactionResponse(element);
            if (_item.fromuserid === userID)
              _userProfile.soldTransactions.push(_item);
            else _userProfile.purchasedTransactions.push(_item);
          }
        });
      });
      var userids: any = "";
      if (_responseTransaction.responseCode === 200) {
        for await (const iterator of _responseTransaction.responseData) {
          userids += iterator.to_user_id + ",";
          userids += iterator.from_user_id + ",";
        }
        userids = userids.slice(0, -1);
        query = "userid=" + userids;
        _user_data = await _req.get(
          URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/overview?" + query
        );
        _user_data.responseData.forEach((element: any) => {
          _userProfile.soldTransactions.forEach((item: any) => {
            if (element.id === item.touserid) {
              item.user = element.displayName;
            }
            if (item.touserid === userID) {
              item.user = _userProfile.user.displayName;
            }
          });
        });
        _user_data.responseData.forEach((element: any) => {
          _userProfile.purchasedTransactions.forEach((items: any) => {
            if (element.id === items.touserid) {
              items.user = element.displayName;
            }
            if (items.touserid === userID) {
              items.user = _userProfile.user.displayName;
            }
          });
        });
        var preOwner: any = "";

        for await (const iterator of _responseTransaction.responseData) {
          preOwner += iterator.from_user_id + ",";
        }
        preOwner = preOwner.slice(0, -1);
        query = "userid=" + preOwner;

        var pre_user_data = await _req.get(
          URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/overview?" + query
        );
        pre_user_data.responseData.forEach((element: any) => {
          _userProfile.soldTransactions.forEach((item: any) => {
            if (element.id === item.fromuserid) {
              item.previousOwner = element.displayName;
            }
            if (userID === item.fromuserid) {
              item.previousOwner = _userProfile.user.displayName;
            }
          });
        });
        pre_user_data.responseData.forEach((element: any) => {
          _userProfile.purchasedTransactions.forEach((items: any) => {
            if (element.id === items.fromuserid) {
              items.previousOwner = element.displayName;
            }
            if (userID === items.fromuserid) {
              items.previousOwner = _userProfile.user.displayName;
            }
          });
        });
      }

      result = new Response(_userProfile, 200);

      res.send(result?.compose());
      return;
    }

    res.send(validationResult);
    return;
  } catch (e) {
    res.send(e);
    return;
  }
});

router.get("/auctions", async (req: any, res: any, next: any) => {
  var result = null;

  var model = new Auction();
  var validationResult = model.validateFilter(req.query);
  if (validationResult.responseCode == 200) {
    let pageno = 0;
    let pagesize = 10;
    let filterby = "inprogress";
    if (req.query.pageno) {
      pageno = req.query.pageno;
    }
    if (req.query.pagesize) {
      pagesize = req.query.pagesize;
    }
    if (req.query.filterby) {
      filterby = req.query.filterby;
    }
    if (req.query.isAdmin) {
      req.user.user_id = 1;
    }

    var query = "userid=" + req.user.user_id;
    query += "&pageno=" + pageno;
    query += "&pagesize=" + pagesize;
    query += "&filterby=" + filterby;

    let _req = new Network();
    let data = await _req.get(
      URLS.AUCTION_SERVICE_URL +
      "/auction/getuserauctionsandhighestbid?" +
      query
    );
    if (data && data.responseCode == 200) {
      _req = new Network();

      for await (const element of data.responseData) {
        if (element.item_id && element.item_id != "") {
          let _data = await _req.get(
            URLS.ASSET_SERVICE_URL +
            "/asset/itemskus?skus=" +
            element.item_sku_id
          );

          if (_data && _data.responseCode == 200) {
            element.item_id = _data.responseData[0];
          }
        }
      }

      let _auctionList: Auction[] = [];
      data.responseData.forEach((auctionItem: any) => {
        var _model = new Auction();
        _model.bindUserAuctionsandBidsResponse(auctionItem);
        _auctionList.push(_model);
      });

      result = new Response(_auctionList, 200);
      res.send(result);
      return;
    }

    res.send(data);
    return;
  }

  return res.send(validationResult);
});
router.get("/auctionsandallbids", async (req: any, res: any, next: any) => {
  var result = null;

  var model = new Auction();
  var validationResult = model.validateFilter(req.query);
  if (validationResult.responseCode == 200) {
    let pageno = 0;
    let pagesize = 10;
    let filterby = "inprogress";
    let innerQuery = ""
    if (req.query.pageno) {
      pageno = req.query.pageno;
    }
    if (req.query.pagesize) {
      pagesize = req.query.pagesize;
    }
    if (req.query.filterby) {
      filterby = req.query.filterby;
    }
    if (req.query.isAdmin) {
      req.user.user_id = 20;
      innerQuery = "&tv=true"
    }

    var query = "userid=" + req.user.user_id;
    query += "&pageno=" + pageno;
    query += "&pagesize=" + pagesize;
    query += "&filterby=" + filterby;

    let _req = new Network();
    let data = await _req.get(
      URLS.AUCTION_SERVICE_URL +
      "/auction/getuserauctionsandallbid?" +
      query
    );
    if (data && data.responseCode == 200) {
      _req = new Network();

      for await (const element of data.responseData) {
        if (element.item_id && element.item_id != "") {
          let _data = await _req.get(
            URLS.ASSET_SERVICE_URL +
            "/asset/itemskus?skus=" +
            element.item_sku_id + innerQuery
          );

          if (_data && _data.responseCode == 200) {
            element.item_id = _data.responseData[0];
          }
        }
      }

      let _auctionList: Auction[] = [];
      data.responseData.forEach((auctionItem: any) => {
        var _model = new Auction();
        _model.bindUserAuctionsandAllBidsResponse(auctionItem);
        _auctionList.push(_model);
      });

      result = new Response(_auctionList, 200);
      res.send(result);
      return;
    }

    res.send(data);
    return;
  }

  return res.send(validationResult);
});

router.post("/updateoverviewuser", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var _data = req.body;
  var id = req.user.user_id;
  let _response: Response = await _req.put(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/userupdate?id=" + id,
    _data
  );
  result = _response;
  return res.send(result);
});

router.post("/changePassword", async (req: any, res: any, next: any) => {
  var result = null;
  let _data = {
    password: req.body.password,
    newPassword: req.body.confirm_password,
    id: req.user.user_id,
    jwt_token: req.user.token,
  };
  let _req = new Network();
  let _response: Response = await _req.post(
    URLS.AUTH_SERVICE_URL + "/validate/changePassword",
    _data
  );
  result = _response;
  return res.send(result);
});

router.get("/overviewuser", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var userid = req.user.user_id;
  let _response: Response = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL +
    "/userManagement/overview?userid=" +
    userid +
    "&self=true"
  );
  if (_response.responseCode == 200 && _response.responseData.length > 0) {
    let _data = _response.responseData[0];
    let _paymentHelper = new PaymentHelper();
    let balance: any = await _paymentHelper.getWalletAmount(_data.id);
    _data.balance = balance;
    delete _data.stripe_customer_id;
  }
  return res.send(_response);
});

router.post("/linkmetamask", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  let metamask_wallet = req.body.metamaskwallet;
  let userid = req.user.user_id?.toString();
  let ethereum_account = req.body.ethereumaccount;
  let body = { metamask_wallet, userid, ethereum_account };
  let _response: Response = await _req.post(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/addmetamask",
    body
  );
  result = _response;

  return res.send(result);
});

router.post("/updateavatar", async (req: any, res: any, next: any) => {
  let userid = req.user.user_id?.toString();
  const body = {
    id: userid,
    thumbnail_url: req.body.thumbnail_url,
  };
  /** validation of query params, need to add model for validation */
  let _req = new Network();
  let data = await _req.put(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/usermanagement/updateavatar",
    body
  );
  if (data.responseCode === 200) {
    let authRes = await _req.post(
      URLS.AUTH_SERVICE_URL + "/validate/updateuserauth",
      { id: userid }
    );
    if (authRes.responseCode === 200) {
      return res.send(new Response(data.responseData.thumbnail_url, 200));
    } else {
      return res.send(authRes);
    }
  }
  return res.send(data);
});

router.get("/useroverveiwdetials", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let _paymentHelper = new PaymentHelper();
  let userid = req.user.user_id?.toString();
  let _response: Response = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL +
    "/userManagement/overview?userid=" +
    userid
  );

  if (_response.responseCode === 200) {
    const countr = countries?.countryWiseVat;
    countr.forEach(country => {
      if (country.name === _response.responseData[0]["country"]) {
        _response.responseData[0]["vat"] = country.fee;
      }
    });
    let balance = await _paymentHelper.getWalletAmount(userid);
    _response.responseData[0].walletAmount = balance;
  }

  res.send(_response);
});

router.get("/getTransactions", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userid = req.user.user_id?.toString();
  let data: any = [];
  let packData: any = [];
  let finalData: any = [];
  var assetitemtype: any;
  var packitemtype: any;
  let tradingQuery = "userid=" + userid;
  if (req.query.pageno) tradingQuery += "&pageno=" + req.query.pageno;
  if (req.query.filterby) tradingQuery += "&filterby=" + req.query.filterby;
  if (req.query.pagesize) tradingQuery += "&pagesize=" + req.query.pagesize;
  if (req.query.startdate) tradingQuery += "&startdate=" + req.query.startdate;
  if (req.query.enddate) tradingQuery += "&enddate=" + req.query.enddate;

  let _response: Response = await _req.get(
    URLS.TRADING_SERVICE_URL + "/trading/getTransactions?" + tradingQuery
  );
  let skus = "";
  let packSkus = "";
  let query = "";
  if (_response.responseCode === 200 && _response.responseData.length > 0) {
    for await (const iterator of _response.responseData) {
      let model = new Transaction();
      model.bind(iterator);

      if (iterator.item_type === "asset") {
        assetitemtype = iterator.item_type;
        data.push(model);
        skus += iterator.item_sku_id + ",";
      } else {
        packData.push(model);
        packSkus += iterator.item_sku_id + ",";
        packitemtype = iterator.item_type;
      }
    }
    skus = skus?.slice(0, -1);
    packSkus = packSkus?.slice(0, -1);
    query = "skus=" + skus;
    query += "&raw=true";
    query += "&tv=true";
    let data_assets = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/itemskus?" + query
    );
    for await (const iterator of data_assets.responseData) {
      data.forEach((element: any) => {
        if (iterator.item_sku_id === element.itemSKUID) {
          element.totalSKUCount = iterator.item_count;
          element.image = iterator.item_thumbnail_url;
          element.serialNumber = iterator.item_sku_serial_no;
          element.skuNumber = iterator.item_sku_sku_code;
          element.name = iterator.item_name;
          element.itemtype = assetitemtype;

        }
      });
    }

    let pack_data = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + packSkus
    );
    for await (const iterator of pack_data.responseData) {
      packData.forEach((element: any) => {
        if (iterator.pack_sku_id === element.itemSKUID) {
          element.totalSKUCount = iterator.item_count;
          element.image = iterator.item_image;
          element.serialNumber = iterator.pack_sku_serial_no;
          element.skuNumber = iterator.pack_sku_sku_code;
          element.name = iterator.item_name;
          element.itemtype = packitemtype;
        }
      });
    }
    finalData = [...data, ...packData];


    return res.send(new Response(finalData, 200));
  }
  return res.send(_response);
});
//discuusion?
router.post("/redeemcollection", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let model = new Item();
  let _paymentHelper = new PaymentHelper()
  let userid = req.user.user_id?.toString();
  let data: any = [];
  let body = {
    userid: userid,
    id: req.body.id,
  };
  let _response: Response = await _req.post(
    URLS.COLLECTION_SERVICE_URL + "/collection/redeemcollection",
    body
  );
  if (_response.responseCode === 200) {
    let code = _response.responseData;
    let _reward_response: Response = await _req.get(
      URLS.ASSET_SERVICE_URL +
      "/asset/generatecollectionreward?itemcode=" +
      code
    );
    if (_reward_response.responseCode === 200) {
      let sku = _reward_response.responseData;
      let _change_owner: Response = await _req.get(
        URLS.ASSET_SERVICE_URL +
        "/trading/changeowner?buyerid=" +
        userid +
        "&skuid=" +
        sku.item_sku_id
      );
      if (_change_owner.responseCode === 200) {
        let createBody = {
          itemType: "asset",
          item_sku_id: sku.item_sku_id.toString(),
          sellerID: ADMIN_USER_ID.toString(),
          buyerID: userid,
          created_by: userid,
          updated_by: userid,
          to_acount: userid,
          from_acount: ADMIN_USER_ID.toString(),
          transactionType: "redeemed",
          transactionValue: "0",
          paymentType: "redeemed", //sale/gift/return
          status_id: "2",
        };
        await _req.post(
          URLS.TRADING_SERVICE_URL + "/trading/createtrans",
          createBody
        );
        await _paymentHelper.primaryTransfer(req.user.user_id, [sku.item_sku_token_id], getBlockchain(sku.item_sku_blockchain_id))
        let allnft = new AllNFT();
        let filter = allnft.bindFilterData(sku);
        let filters = { filters: { ...filter } };

        let _filtersData = await _req.post(
          URLS.ASSET_SERVICE_URL + "/asset/filters",
          filters
        );
        if (_filtersData && _filtersData.responseCode == 200) {
          data = _filtersData.responseData;
          model.bindRedeemResponse(data);
          return res.send(new Response(model, 200));
        }
      }
    }
    return res.send(new Response("", 1030));
  }
  return res.send(_response);
});
router.post("/addwishlist", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var id = req.user.user_id?.toString();
  let reqData = {};
  reqData = {
    user_id: id,
    item_sku_id: req.body.item_sku_id?.toString(),
    item_id: req.body.item_id?.toString(),
    item_type: req.body.item_type?.toString(),
    status_id: "1",
  };
  let data = await _req.post(
    URLS.ASSET_SERVICE_URL + "/wishlist/addwishlist",
    reqData
  );
  result = data;
  return res.send(result);
});
router.get("/deletewishlist", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var id = req.user.user_id.toString();
  var item_id = req.query.item_id;
  var item_type = req.query.item_type;
  let data = await _req.get(
    URLS.ASSET_SERVICE_URL +
    "/wishlist/deletewishlist?user_id=" +
    id +
    "&item_id=" +
    item_id +
    "&item_type=" +
    item_type
  );

  result = data;
  return res.send(result);
});

router.get("/recentactivity", async (req: any, res: any, next: any) => {
  var filter_by = req.query.filterby;
  let finalArray: any = [];
  let newArray: any = [];
  var userID = req.user.user_id;
  let _req = new Network();
  var item_skus = "";
  var pack_skus = "";

  var query = "userid=" + userID;
  let data: any;
  if (filter_by?.includes("mybids")) {
    data = await _req.get(
      URLS.AUCTION_SERVICE_URL + "/auction/getuseractivity?" + query
    );
    if (
      data.responseCode === 200 &&
      data.responseData.biddedAuctions.length > 0
    ) {
      let biddedAuctions = data.responseData.biddedAuctions;
      for await (const iterator of biddedAuctions) {
        if (iterator.type === "asset") item_skus += iterator.item_sku_id + ",";
        else pack_skus += iterator.item_sku_id + ",";
        for await (const iterator2 of iterator?.items) {
          let model = new Activity();
          model.bindAuction(iterator, iterator2);
          finalArray.push(model);
        }
      }
    }
  }

  if (filter_by?.includes("offerreceived")) {
    data = await _req.get(
      URLS.TRADING_SERVICE_URL + "/offer/getofferactivity?" + query
    );
    if (
      data.responseCode === 200 &&
      data.responseData.offersReceived.length > 0
    ) {
      let biddedAuctions = data.responseData.offersReceived;

      for await (const iterator of biddedAuctions) {
        if (iterator.item_type === "asset")
          item_skus += iterator.item_sku_id + ",";
        else pack_skus += iterator.item_sku_id + ",";
        let model = new Activity();
        model.bindOffer(iterator);
        model.type = "recieved"
        finalArray.push(model);
      }
    }
  }
  if (filter_by?.includes("offersent")) {
    data = await _req.get(
      URLS.TRADING_SERVICE_URL + "/offer/getofferactivity?" + query
    );
    if (
      data.responseCode === 200 &&
      data.responseData?.offersSent?.length > 0
    ) {
      let offersSent = data.responseData.offersSent;

      for await (const iterator of offersSent) {
        if (iterator.item_type === "asset")
          item_skus += iterator.item_sku_id + ",";
        else pack_skus += iterator.item_sku_id + ",";
        let model = new Activity();
        model.bindOffer(iterator);
        model.type = "sent"
        finalArray.push(model);
      }
    }
  }

  if (filter_by?.includes("pendingpayments")) {
    query = `userid=${userID}&pageno=${0}&pagesize=${100}`
    data = await _req.get(
      URLS.TRADING_SERVICE_URL + "/trading/getpendingpayments?" + query
    );
    if (data.responseCode === 200 && data.responseData.length > 0) {
      let payments = data.responseData

      for await (const iterator of payments) {
        item_skus += iterator.item_sku_id + ",";
        let model = new Activity()
        model.bindPendingPayments(iterator)
        finalArray.push(model)
      }
    }
  }

  item_skus = item_skus?.slice(0, -1);
  pack_skus = pack_skus?.slice(0, -1);

  if (finalArray.length > 0) {
    let itemData = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + item_skus + "&raw=true"
    );
    let userIDS = "";
    if (itemData.responseCode === 200 && itemData.responseData.length > 0) {
      for await (const iterator of finalArray) {
        for await (const iterator2 of itemData.responseData) {
          if (
            parseInt(iterator.itemSKUID) === parseInt(iterator2.item_sku_id)
          ) {
            let dummyData: any = {};
            dummyData.item = {};
            let _foundObj = newArray.find(
              (x: any) =>
                parseInt(x.item.itemSKUID) === parseInt(iterator.itemSKUID) &&
                iterator?.activityType !== "bid"
            );
            if (!_foundObj) {
              dummyData.item.serialNumber = iterator2.item_sku_serial_no;
              dummyData.item.name = iterator2.item_name;
              dummyData.item.itemSKUID = iterator2.item_sku_id;
              dummyData.item.itemPrice = iterator2.item_sku_sale_price;
              dummyData.item.image = iterator2.item_thumbnail_url;
              dummyData.item.totalSKUCount = iterator2.item_count;
              dummyData.item.skuNumber = iterator2.item_sku_sku_code;
              dummyData.item.itemType = "asset";
              dummyData.item.ownedBy = iterator.ownedBy
                ? iterator.ownedBy
                : iterator2.item_sku_owner_id;
              dummyData.item.isLocked = iterator2.item_sku_is_locked
              dummyData.item.rarity = new Rarity();
              let model = new AllNFT();
              data = model.bindFilterData(iterator2);
              let filters = { filters: { ...data } };
              let _filtersData = await _req.post(
                URLS.ASSET_SERVICE_URL + "/asset/filters",
                filters
              );
              if (_filtersData && _filtersData.responseCode == 200) {
                data = _filtersData.responseData;
                if (data.filter_2 && data.filter_2.length > 0) {
                  dummyData.item.rarity.name = data.filter_2[0].name;
                  dummyData.item.rarity.logo = data.filter_2[0].image;
                }
              }
              dummyData.item.offers = [];
              dummyData.item.offers.push(iterator);
              newArray.push(dummyData);
              userIDS += dummyData.item.ownedBy + ",";
              if (iterator?.history !== undefined)
                for await (const element of iterator?.history) {
                  userIDS += element.ownedBy + ",";
                }
            } else {
              _foundObj.item.offers.push(iterator);
              userIDS += _foundObj.item.ownedBy + ",";
              if (iterator?.history !== undefined)
                for await (const element of iterator?.history) {
                  userIDS += element.ownedBy + ",";
                }
            }
          }
        }
      }
    }
    let packData = await _req.get(
      URLS.PACK_SERVICE_URL +
      "/pack/checkallpackskus?skus=" +
      pack_skus +
      "&raw=true"
    );
    if (packData.responseCode === 200 && packData.responseData.length > 0) {
      for await (const iterator of finalArray) {
        for await (const iterator2 of packData.responseData) {
          if (
            parseInt(iterator.itemSKUID) === parseInt(iterator2.pack_sku_id)
          ) {
            let dummyData: any = {};
            dummyData.item = {};
            let _foundObj = newArray.find(
              (x: any) =>
                parseInt(x.item.itemSKUID) === parseInt(iterator.itemSKUID) &&
                iterator?.activityType !== "bid"
            );
            if (!_foundObj) {
              dummyData.item.serialNumber = iterator2.pack_sku_serial_no;
              dummyData.item.name = iterator2.item_name;
              dummyData.item.itemSKUID = iterator2.pack_sku_id;
              dummyData.item.itemPrice = iterator2.pack_sku_sale_price;
              dummyData.item.image = iterator2.item_image;
              dummyData.item.totalSKUCount = iterator2.item_count;
              dummyData.item.skuNumber = iterator2.pack_sku_sku_code;
              dummyData.item.itemType = "pack";
              dummyData.item.ownedBy = iterator.ownedBy
                ? iterator.ownedBy
                : iterator2.pack_sku_owner_id;
              dummyData.item.isLocked = iterator2?.pack_sku_is_locked
              dummyData.item.offers = [];
              dummyData.item.offers.push(iterator);
              newArray.push(dummyData);
              userIDS += dummyData.item.ownedBy + ",";
              if (iterator?.history !== undefined)
                for await (const element of iterator.history) {
                  userIDS += element.ownedBy + ",";
                }
            } else {
              _foundObj.item.offers.push(iterator);
              userIDS += _foundObj.item.ownedBy + ",";
              if (iterator?.history !== undefined)
                for await (const element of iterator.history) {
                  userIDS += element.ownedBy + ",";
                }
            }
          }
        }
      }
    }
    userIDS = userIDS.slice(0, -1);
    let _user_data = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/userManagement/overview?userid=" +
      userIDS
    );
    if (_user_data.responseCode === 200) {
      for await (const iterator of newArray) {
        for await (const iterator2 of _user_data.responseData) {
          if (parseInt(iterator?.item?.ownedBy) === parseInt(iterator2.id)) {
            let model = new Activity();
            let user = model.bindUser(iterator2);
            iterator.item.ownedBy = user;
          }
          for await (const element of iterator?.item?.offers) {
            if (parseInt(element?.ownedBy) === parseInt(iterator2.id)) {
              let model = new Activity();
              let user = model.bindUser(iterator2);
              element.ownedBy = user;
            }
            if (element?.history !== undefined)
              for await (const element2 of element?.history) {
                if (parseInt(element2?.ownedBy) === parseInt(iterator2.id)) {
                  let model = new Activity();
                  let user = model.bindUser(iterator2);
                  element2.ownedBy = user;
                  element2.ownedBy.self = false
                  if (req.user.user_id === parseInt(iterator2.id)) {
                    element2.ownedBy.self = true
                  }
                }
              }
          }
        }
      }
    }
  }
  return res.send(new Response(newArray, 200));
});

router.get("/getwishlist", async (req: any, res: any, next: any) => {
  var result = null;
  var finalArray = [];
  let _req = new Network();
  var id = req.user.user_id?.toString();
  var item_type = req.query.item_type.split(",");
  let pageSize = req.query.pagesize;
  let pageNo = req.query.pageno;
  let data = await _req.get(
    URLS.ASSET_SERVICE_URL +
    "/wishlist/getwishlist?user_id=" +
    id +
    "&item_type=" +
    item_type +
    "&pageno=" +
    pageNo +
    "&pagesize=" +
    pageSize
  );
  var itemskus = "",
    packItemSkus = "";
  var collectionsku = "";
  if (data.responseCode === 200) {
    for await (const iterator of data.responseData) {
      if (iterator.item_type === "item") {
        itemskus += iterator.item_sku_id + ",";
      } else if (iterator.item_type === "collection") {
        collectionsku += iterator.item_id + ",";
      } else {
        packItemSkus += iterator.item_sku_id + ",";
      }
    }
  }
  collectionsku = collectionsku.slice(0, -1);
  itemskus = itemskus.slice(0, -1);
  packItemSkus = packItemSkus.slice(0, -1);

  let dataAsset = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + itemskus
  );

  if (dataAsset) {
    for await (const iterator of dataAsset.responseData) {
      let model = new Item();
      model.bindItemsResponse(iterator);
      model.itemType = "asset";
      finalArray.push(model);
    }
  }
  let pack_data = await _req.get(
    URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + packItemSkus
  );
  if (pack_data) {
    let models = new AllNFT();
    let packResponse = models.bindItemsResponse(pack_data.responseData);
    packResponse.itemType = "pack";

    for await (const element of pack_data.responseData) {
      let _brand_data = await _req.get(
        URLS.ASSET_SERVICE_URL + "/config/brand?id=" + element.item_brand
      );
      if (_brand_data && _brand_data.responseCode == 200) {
        element.filter_1 = _brand_data.responseData;
      }
    }
  }
  let model2 = new AllNFT();
  let packResponses = model2.bindItemsResponse(pack_data.responseData);
  finalArray.push(...packResponses);

  let dataCollecction = await _req.get(
    URLS.COLLECTION_SERVICE_URL + "/collection/itemid?id=" + collectionsku
  );
  if (dataCollecction) {
    for await (const iterator of dataCollecction.responseData) {
      let model3 = new Collection();
      let collectionResponse =
        model3.bindSingleCollectionwishlistResponse(iterator);
      collectionResponse.itemType = "collection";
      finalArray.push(collectionResponse);
    }
  }

  result = finalArray;
  return res.send(new Response(result, 200));
});

router.get("/allassets", async (req: any, res: any, next: any) => {
  var result = null;
  var allAssetData = []
  let user = req.user;
  let finalResult: any = [];
  let finalArray = [];
  var model = new AllNFT();
  var validationResult = model.validateFilter(req.query);
  if (validationResult.responseCode == 200) {
    var startPrice = "";
    var endPrice = "";
    if (req.query.pricerange) {
      var list = req.query.pricerange.split(",");

      startPrice = list[0];
      endPrice = list[1];
    }
    var query = "filterby=" + req.query.filterby;
    if (user) query += "&userid=" + user.user_id;
    if (startPrice) query += "&startprice=" + startPrice;
    if (endPrice) query += "&endprice=" + endPrice;
    query += "&sortby=" + req.query.sortby;
    query += "&pagesize=" + req.query.pagesize;
    query += "&pageno=" + req.query.pageno;

    let _req = new Network();
    let data = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/userall?" + query
    );


    result = data;

    if (data.responseCode === 200) {
      data = data.responseData;
      allAssetData = [...data]
      var assets = data.filter(
        (x: { item_type: string }) => x.item_type == "item"
      );

      let skus = "";
      let skusArray = [];

      for (const iterator of assets) {
        skus += iterator.item_sku_id + ",";
      }
      let transType="";
      if (req.query.filterby.includes("gift")) {
        transType="gift";
        let giftData = await _req.get(
          URLS.TRADING_SERVICE_URL + "/trading/getgifts?userid=" + user.user_id +"&trans_type="+ transType
        );
        for (const iterator of giftData.responseData) {
          skus += iterator.item_sku_id + ",";
          skusArray.push(iterator.item_sku_id)
        }
      }
      if (req.query.filterby.includes("redeemed")) {
        transType="redeemed";
        let giftData = await _req.get(
          URLS.TRADING_SERVICE_URL + "/trading/getgifts?userid=" + user.user_id + "&trans_type="+ transType
        );
        for (const iterator of giftData.responseData) {
          skus += iterator.item_sku_id + ",";
          skusArray.push(iterator.item_sku_id)
        }
      }
      skus = skus?.slice(0, -1); //remove last ','
      query = "skus=" + skus;
      query += "&raw=true";
      query += "&tv=true";
      if (req.query?.rarity) {
        query += "&rarity=" + req.query?.rarity;
      }
      if (req.query?.keyword) {
        query += "&keyword=" + req.query?.keyword;
      }
      let data_assets = await _req.get(
        URLS.ASSET_SERVICE_URL + "/asset/itemskusfilters?" + query
      );


      result = data_assets;
      if (data_assets.responseCode === 200) {
        finalResult = data_assets.responseData;
        finalResult.filter((item: any) => item.item_sku_owner_id !== user.user_id)
      }
      for await (const iterator of finalResult) {
        for (const iterator2 of skusArray) {
          if (iterator2 === iterator.item_sku_id) {
            iterator.type = "gift";
          }
        }
        data = model.bindFilterData(iterator);
        let filters = { filters: { ...data } };
        let _filtersData = await _req.post(
          URLS.ASSET_SERVICE_URL + "/asset/filters",
          filters
        );
        if (_filtersData && _filtersData.responseCode == 200) {
          data = _filtersData.responseData;
          finalArray.push(data);
        }
      }


      let modelData = model.bindItemsResponse(finalArray, true);
      finalResult = modelData;

      for (let i = 0; i < finalResult.length; i++) {
        let sku_id = finalResult[i].skus[0].packSKUID
        let item = allAssetData.filter((a) => a.item_sku_id === sku_id)[0]
        finalResult[i]['updated_at'] = item?.updated_at || null
      }

      result = new Response(finalResult, 200);
      res.send(result?.compose());
      return;
    }
    res.send(result);
    return;
  }
  return res.send(validationResult);
});

router.get("/recommendeditems", async (req: any, res: any, next: any) => {
  var result = [];
  let user = req.user;

  var query = "userid=" + user.user_id;
  query += "&pagesize=" + req.query.pagesize;
  query += "&pageno=" + req.query.pageno;

  let _req = new Network();
  let data = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/getrecommendeditems?" + query
  );
  if (data.responseCode === 200 && data.responseData.length > 0) {
    for await (const iterator of data.responseData) {
      let model = new Itemdetail();
      model.bindItemskusResponse(iterator);
      result.push(model);
    }
    return res.send(new Response(result, 200));
  }
  return res.send(data);
});

router.get("/recommendedcollections", async (req: any, res: any, next: any) => {
  var result: any = [];
  let user = req.user;
  let model = new Collection();
  var query = "userid=" + user.user_id;
  query += "&pagesize=" + req.query.pagesize;
  query += "&pageno=" + req.query.pageno;

  let _req = new Network();
  let data = await _req.get(
    URLS.COLLECTION_SERVICE_URL +
    "/collection/getuserrecommendedcollections?" +
    query
  );
  if (data.responseCode === 200 && data.responseData.length > 0) {
    if (data && data.responseCode == 200) {
      for await (const element of data.responseData) {
        if (element.item_reward_1 && element.item_reward_1 != "") {
          let _data = await _req.get(
            URLS.ASSET_SERVICE_URL +
            "/asset/itemcode?code=" +
            element.item_reward_1
          );

          if (_data && _data.responseCode == 200) {
            element.item_reward_1 = _data.responseData[0];
          }

          _data = await _req.get(
            URLS.ASSET_SERVICE_URL + "/config/brand?id=" + element.brand
          );
          if (_data && _data.responseCode == 200) {
            if (_data.responseData.length > 0)
              element.brand = _data.responseData[0];
            else element.brand = {};
          }
        }
      }

      let _collectibleList = model.bindCollectionResponse(data);
      result = new Response(_collectibleList, 200);
      res.send(result);
      return;
    }
  }
  return res.send(data);
});

router.get("/privateuser", async (req: any, res: any, next: any) => {
  var result = null;
  let userid = req.user.user_id?.toString();
  let status = req.query.status;
  let _req = new Network();
  let _user_data = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL +
    "/userManagement/privateuser?userid=" +
    userid +
    "&status=" +
    status
  );
  result = _user_data;
  return res.send(result);
});


router.post("/tfaflag", async (req: any, res: any, next: any) => {
  let userid = req.user.user_id?.toString();
  let _req = new Network();
  var result = null;
  let _usersData = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL +
    "/userManagement/overview?userid=" +
    userid
  );
  if (_usersData.responseCode === 200) {
    let user = _usersData?.responseData[0];
    let tftFlag = user.tfa_flag;
    let token = req.get('authorization')
    if (token !== undefined) {
      let tokenArray = token.split(" ");
      var email = {
        email_body: `${websiteURL}/2f-authentication/${tokenArray[1]}/${tftFlag}`,
        email_subject: "2FA",
        email_to: user.email,
        firstname: user.firstName,
        lastname: user.lastName
      }
      await _req.post(
        URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
        email
      );
    }
  }
  result = _usersData;
  return res.send(result);
})

router.get("/deactivate", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  var userid = req.user.user_id;
  var email = new Notification();
  let token = req.get("authorization");
  if (token === undefined) return res.send(new Response("", 1023));
  let tokenArray = token.split(" ");
  if (tokenArray.length !== 2) return res.send(new Response("", 1023));
  let jwtToken = tokenArray[1];

  let _usersData = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL +
    "/userManagement/overview?userid=" +
    userid
  );
  if (_usersData.responseCode === 200) {
    let user = _usersData?.responseData[0];
    email.email_body = `${websiteURL}/user/deactivate/${jwtToken}`;
    email.email_subject = "Deactivate";
    email.email_to = user.email;
    let _notificationData: Response = await _req.post(
      URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
      email
    );

    result = _notificationData;
  }
  return res.send(result);
});

router.post("/activeuser", async (req: any, res: any, next: any) => {
  let userid = req.user.user_id?.toString();

  let _req = new Network();
  let data = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL +
    "/usermanagement/active" +
    "?userid=" +
    userid
  );
  if (data.responseCode === 200) {
    let authRes = await _req.post(
      URLS.AUTH_SERVICE_URL + "/validate/updateuserauth",
      { id: userid }
    );
    if (authRes.responseCode === 200) {
      return res.send(new Response(data.responseData.thumbnail_url, 200));
    } else {
      return res.send(authRes);
    }
  }
  return res.send(data);
});

router.get("/getcards", async (req: any, res: any, next: any) => {
  try {
    let userid = req.user.user_id?.toString();
    let _req = new Network();
    let data = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/usermanagement/overview" +
      "?userid=" +
      userid
    );
    if (data.responseCode === 200) {
      let stripeID = data.responseData[0]?.stripe_customer_id;
      let stripe = new StripeService();
      let cards = await stripe.getCards(stripeID, "card");
      return res.send(new Response(cards, 200));
    }
    return res.send(data);
  } catch (error: any) {
    return res.send(new Response(error.message, 400));
  }
});

router.post("/addcard", async (req: any, res: any, next: any) => {
  try {
    let userid = req.user.user_id?.toString();
    let cardID = req.body.cardid;
    let _req = new Network();
    let data = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/usermanagement/overview" +
      "?userid=" +
      userid
    );
    if (data.responseCode === 200) {
      let stripeID = data.responseData[0]?.stripe_customer_id;
      let stripe = new StripeService();
      let cards = await stripe.addCard(cardID, stripeID);
      return res.send(new Response(cards, 200));
    }
    return res.send(data);
  } catch (error: any) {
    return res.send(new Response(error.message, 400));
  }
});

router.post("/createpaymentintent", async (req: any, res: any, next: any) => {
  try {
    let userid = req.user.user_id?.toString();
    let _req = new Network();
    let { amount, cardid } = req.body;
    let data = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/usermanagement/overview" +
      "?userid=" +
      userid
    );
    if (data.responseCode === 200) {
      let customer = data.responseData[0]?.stripe_customer_id;
      let body: any = {
        amount,
        currency: "USD",
        payment_method_types: ["card"],
        payment_method: cardid,
        customer,
        userid,
      };
      let stripe = new StripeService();
      let cards = await stripe.createPaymentIntent(body);
      body.paymentintentid = cards.id;
      body.clientsecret = cards.client_secret;
      let _trading = await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/setupintent",
        body
      );
      if (_trading.responseCode == 200) {
        return res.send(new Response(cards.id, 200));
      }
      return res.send(_trading);
    }
    return res.send(data);
  } catch (error: any) {
    return res.send(new Response(error.message, 400));
  }
});

router.post("/deletecard", async (req: any, res: any, next: any) => {
  try {
    let userid = req.user.user_id?.toString();
    let cardID = req.body.cardid;
    let _req = new Network();
    let data = await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/usermanagement/overview" +
      "?userid=" +
      userid
    );
    if (data.responseCode === 200) {
      let stripeID = data.responseData[0]?.stripe_customer_id;
      let stripe = new StripeService();
      let cards = await stripe.getCards(stripeID, "card");
      if (cards) {
        const filteredCard = cards.filter((x) => x.id === cardID);
        if (filteredCard.length > 0) {
          await stripe.deleteCard(cardID);
          return res.send(new Response("", 200));
        }
        return res.send(new Response("", 1025));
      }
    }
    return res.send(data);
  } catch (error: any) {
    return res.send(new Response(error.message, 400));
  }
});

router.get("/getusernotifications", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userid = req.user.user_id?.toString();
  let skus = ""
  let packSkus = ""
  let data = await _req.get(
    URLS.NOTIFICATION_SERVICE_URL +
    "/notification/getusernotifications?userid=" + userid
  );
  if (data.responseCode == 200 && data.responseData.length > 0) {
    let notifications = data.responseData
    for await (const iterator of notifications) {
      let query = iterator.me_message.split("&")
      let skuid = query[0]?.split('sku=')[1]
      let type = query[3]?.split('type=')[1]
      iterator.skuid = skuid
      iterator.itemtype = type
      if (type === "asset")
        skus += skuid + ","
      else packSkus += skuid + ","
    }
    skus = skus.slice(0, -1)
    packSkus = packSkus.slice(0, -1)
    let itemData = await _req.get(
      URLS.ASSET_SERVICE_URL + "/asset/itemskus?skus=" + skus + "&raw=true"
    );
    let items = itemData.responseData
    for await (const iterator of items) {
      for await (const iterator2 of notifications) {
        if (parseInt(iterator.item_sku_id) === parseInt(iterator2.skuid)) {
          iterator2.item = iterator
        }
      }
    }
    let packData = await _req.get(
      URLS.PACK_SERVICE_URL + "/pack/checkallpackskus?skus=" + packSkus + "&raw=true"
    );
    let packs = packData.responseData
    for await (const iterator of packs) {
      for await (const iterator2 of notifications) {
        if (parseInt(iterator.pack_sku_id) === parseInt(iterator2.skuid)) {
          iterator2.pack = iterator
        }
      }
    }
    let model = new Notification()
    data = model.bindNotifications(notifications)
  }
  return res.send(data)
});

router.get("/markasread", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userid = req.user.user_id?.toString();
  let data = await _req.get(
    URLS.NOTIFICATION_SERVICE_URL +
    "/notification/markasread?userid=" + userid
  );
  return res.send(data)
});

router.get("/marksingleasread", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userid = req.user.user_id?.toString();
  let id = req.query.id;
  let data = await _req.get(
    URLS.NOTIFICATION_SERVICE_URL +
    "/notification/marksingleasread?userid=" + userid + "&id=" + id
  );
  return res.send(data)
});



router.post("/addfunds", async (req: any, res: any, next: any) => {
  let _paymentHelper = new PaymentHelper()
  let userid = req.user.user_id?.toString();
  let amount = req.body.amount;
  let cardid = req.body.cardid;
  let amountVal = parseFloat(amount) * 100
  let body: any = {
    amount: amountVal.toFixed(0),
    cardid: cardid,
    orderid: "addfunds"
  }
  let intent = await _paymentHelper.createPaymentIntent(userid, body)
  if (intent.responseCode == 200) {
    body.paymentintentid = intent.responseData;
    let _payment = await _paymentHelper.confirmIntent(body)
    if (_payment.responseCode == 200) {
      let _response = await _paymentHelper.addWalletFunds(parseInt(userid), { card_token: _payment.responseData.id }, "buyer")
      if (_response.status == 200) {
        return res.send(new Response('', 200))
      }
      return res.send(new Response(_response.data, 1025))
    }
  }
  return res.send(intent)
});

router.get("/isblockchainlinked", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  let userid = req.user.user_id?.toString();
  let _response: Response = await _req.get(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/isblockchainlinked?userid=" + userid);
  if (_response.responseCode == 200) result = new Response(true, 200)
  else result = new Response(false, 1025)
  return res.send(result);
});

router.post("/linkethereum", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  let _paymentHelper = new PaymentHelper()
  let userid = req.user.user_id?.toString();
  let acc = await _paymentHelper.createBlockChainAccount()
  if (acc.responseCode === 200) {
    let body = { privkey: acc.responseData.encrypted_private_key, userid, pucblickey: acc.responseData.publicKey };
    let _response: Response = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/linkethereum", body);
    if (_response.responseCode == 200) result = new Response(acc.responseData.privateKey, 200)
    return res.send(result);
  }
  return res.send(acc)

});
export = router;
