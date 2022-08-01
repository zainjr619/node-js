import { Response } from "./response";
import { Item } from "./item";
import { Rarity } from "./rarity";
import { Brand } from "./brand";
import { Blockchain } from "./blockchain";
import { ItemSku } from "./item_sku";
import { getCollectionStatus } from "../utils/helper";

export class Collection {
  collectionID: number;
  name: string;
  description: string;
  brand: Brand;
  items: Item[];
  rewards: Item[];
  rarity: Rarity;
  totalTime: Date;
  remainingTime: Date;
  ip: string;
  ipLogo: string;
  status: string;
  slug: string;
  image: string;
  totalCollectionCount: string;
  userCollectionCount: string;
  completionDateTime: string;
  totalRewards: string;
  collectedRewards: string;
  sliderImage: string;
  itemType: string;
  totalPrice: string;
  collectionState: string;
  isLiked: boolean;
  status_id: any;
  art_collection_name: any;
  discountPercent: number;
  discountAmount: number;
  discountedPrice: number;

  validateFilter(params: any) {
    return new Response([], 200).compose();
  }

  validateSlug(params: any) {
    return new Response("", 200).compose();
  }

  bindCollectionResponse(params: any) {
    let cols: any = [];

    for (const element of params.responseData) {
      if (element.item_reward_1 && element.item_reward_1 != "") {
        let _coll = new Collection();
        _coll.collectionID = element.id;
        _coll.name = element.name;
        _coll.slug = element.slug;
        _coll.image = element.image;
        _coll.sliderImage = element.image2;
        _coll.totalTime = element.expiry;
        _coll.totalCollectionCount = element.collectionCount;
        _coll.userCollectionCount = element.userCollectionCount;
        _coll.isLiked = element.isLiked;
        let completion_id = 1;
        if (element.userCollection && element.userCollection.length > 0) {
          completion_id = element?.userCollection[0]?.completion_status_id;
          _coll.completionDateTime =
            element.userCollection[0].completion_date_time;
        }

        _coll.status = getCollectionStatus(completion_id)

        _coll.rewards = [];
        _coll.rewards.push(this._fillItem(element.item_reward_1));

        if (element.brand) {
          _coll.brand = new Brand();
          _coll.brand.logo = element.brand.image;
        }

        _coll.ip = element.ip;

        cols.push(_coll);
        _coll.items = [];

        //#region bind collection items
        //#endregion
      }
    }

    return cols;
  }

  bindSingleCollectionResponse(params: any) {
    let element = params.responseData;

    let _coll = new Collection();
    _coll.collectionID = element.id;
    _coll.name = element?.name;
    _coll.slug = element?.slug;
    _coll.image = element?.image;
    _coll.totalTime = element?.expiry;
    _coll.status = element?.status_id;
    _coll.totalCollectionCount = element?.collectionCount;
    _coll.userCollectionCount = element?.userCollectionCount;
    _coll.totalRewards = element?.to_be_rewarded_user_count;
    _coll.collectedRewards = element?.rewarded_user_count;
    if (element.userCollection && element?.userCollection.length > 0) {
      _coll.status = element?.userCollection[0]?.completion_status_id;
      _coll.completionDateTime = element?.userCollection[0]?.completion_date_time;
    }
    _coll.description = element?.description;
    _coll.discountPercent = element?.percentage_discount ? element?.percentage_discount : 20;
    _coll.discountAmount = ((params?.totalPrice / 100) * _coll?.discountPercent);
    _coll.discountedPrice = params?.totalPrice - _coll?.discountAmount

    _coll.rewards = [];
    _coll.rewards.push(this._fillItem(element.item_reward_1));

    if (element.brand) {
      _coll.brand = new Brand();
      _coll.brand.logo = element.brand.image;
    }

    _coll.ip = element.ip;

    _coll.items = [];

    //#region bind collection items
    element.dummy_item_1.forEach((element_1: any) => {
      _coll.items.push(this._fillItem(element_1));
    });
    //#endregion

    return _coll;
  }
  bindSingleCollectionDetailResponse(params: any) {
    let element = params.responseData;

    let _coll = new Collection();
    _coll.collectionID = element.id;
    _coll.name = element.name;
    _coll.slug = element.slug;
    _coll.image = element.image;
    _coll.totalTime = element.expiry;
    _coll.status = element.status_id;
    _coll.totalCollectionCount = element.collectionCount;
    _coll.userCollectionCount = element.userCollectionCount;
    _coll.totalRewards = element?.to_be_rewarded_user_count;
    _coll.collectedRewards = element?.rewarded_user_count;
    if (element.userCollection && element.userCollection.length > 0) {
      _coll.status = element.userCollection[0].completion_status_id;
      _coll.completionDateTime = element.userCollection[0].completion_date_time;
    }
    _coll.description = element.description;
    _coll.discountPercent = element?.percentage_discount ? element?.percentage_discount : 20;
    _coll.discountAmount = ((params?.totalPrice / 100) * _coll?.discountPercent);
    _coll.discountedPrice = params?.totalPrice - _coll?.discountAmount

    _coll.rewards = [];
    _coll.rewards.push(this._fillItem(element.item_reward_1));

    if (element.brand) {
      _coll.brand = new Brand();
      _coll.brand.logo = element.brand.image;
    }

    _coll.ip = element.ip;

    _coll.items = [];

    //#region bind collection items
    element.dummy_item_1.forEach((element_1: any) => {
      _coll.items.push(this._fillAssetItem(element_1));
    });
    //#endregion

    return _coll;
  }
  
  bindSingleCollectionwishlistResponse(params: any) {
    let element = params;

    let _coll = new Collection();
    _coll.collectionID = element.id;
    _coll.name = element.name;
    _coll.slug = element.slug;
    _coll.image = element.image;
    _coll.totalTime = element.expiry;
    _coll.status = element.status_id;
    _coll.status_id = element.status_id;
    _coll.totalCollectionCount = element.collectionCount;
    _coll.userCollectionCount = element.userCollectionCount;
    _coll.totalRewards = element?.to_be_rewarded_user_count;
    _coll.collectedRewards = element?.rewarded_user_count;
    if (element.userCollection && element.userCollection.length > 0) {
      _coll.status = element.userCollection[0].completion_status_id;
      _coll.completionDateTime = element.userCollection[0].completion_date_time;
    }
    _coll.description = element.description;

    _coll.rewards = [];
    _coll.rewards.push(this._fillItem(element.item_reward_1));

    if (element.brand) {
      _coll.brand = new Brand();
      _coll.brand.logo = element.brand.image;
    }

    return _coll;
  }

  _fillItem(params: any) {
    let element = params;
    let asset = new Item();

    asset.itemID = element.item_id;
    asset.code = element.code;
    asset.name = element.name;
    asset.slug = element.slug;
    asset.thumbnail_url = element.thumbnail_url;
    asset.IPLogo = element.ip_logo;
    asset.generation = element.generation;
    asset.totalSKUCount = element.count;

    if (element.filter_1 && element.filter_1.length > 0) {
      asset.brand = new Brand();
      asset.brand.name = element.filter_1[0].name;
      asset.brand.logo = element.filter_1[0].image;
      asset.brand.category = element.filter_1[0].category_name;
    }

    if (element.filter_2 && element.filter_2.length > 0) {
      asset.rarity = new Rarity();
      asset.rarity.name = element.filter_2[0].name;
      asset.rarity.logo = element.filter_2[0].image;
    }

    if (element.blockchain_id) {
      asset.blockchain = new Blockchain();
      asset.blockchain.name = element?.blockchain_id[0]?.name;
      asset.blockchain.logo = element?.blockchain_id[0]?.image;
    }

    asset.itemType = "asset";
    asset.itemLogoType = params.item_type_logo;

    asset.itemSkus = [];
    if (element.serial_no) {
      var _sku = new ItemSku();
      _sku.itemSKUID = element.id;
      _sku.serialNumber = element.serial_no;
      _sku.salePrice = element.sale_price;
      _sku.itemState = element.item_state;
      _sku.skuNumber = element.sku_code;

      asset.itemSkus.push(_sku);
    }
    return asset;
  }
  _fillAssetItem(params: any) {
    let element = params;
    let asset = new Item();

    asset.itemID = element.item_id;
    asset.code = element.code;
    asset.name = element.name;
    asset.slug = element.slug;
    asset.thumbnail_url = element.thumbnail_url;
    asset.IPLogo = element.ip_logo;
    asset.generation = element.generation;
    asset.totalSKUCount = element.count;

    if (element.filter_1 && element.filter_1.length > 0) {
      asset.brand = new Brand();
      asset.brand.name = element.filter_1[0].name;
      asset.brand.logo = element.filter_1[0].image;
      asset.brand.category = element.filter_1[0].category_name;
    }

    if (element.filter_2 && element.filter_2.length > 0) {
      asset.rarity = new Rarity();
      asset.rarity.name = element.filter_2[0].name;
      asset.rarity.logo = element.filter_2[0].image;
    }

    if (element.blockchain_id) {
      asset.blockchain = new Blockchain();
      asset.blockchain.name = element.blockchain_id[0].name;
      asset.blockchain.logo = element.blockchain_id[0].image;
    }

    asset.itemType = "asset";
    asset.itemLogoType = params.item_type_logo;

     asset.itemSkus = [];
    return asset;
  }
  /*Get Admin Collection Validation */
  validateAdimGetCollection(params: any) {
    var pageSize = params.pagesize;
    var pageNo = params.pageno;
    var filterBy = params.filterby;
    /*PageSize Validation */
    if (
      !pageSize ||
      pageSize == "" ||
      isNaN(pageSize) ||
      pageSize.trim() == ""
    ) {
      return new Response("", 1008).compose();
    }
    if (parseInt(pageSize) < 1) {
      return new Response("", 1009).compose();
    }
    //pageNo Validation
    if (!pageNo || pageNo == "" || isNaN(pageNo) || pageNo.trim() == "") {
      return new Response("", 1010).compose();
    }
    if (parseInt(pageNo) < 0) {
      return new Response("", 1011).compose();
    }
    /*FilterBy Validation */
    if (!filterBy || filterBy == "") {
      return new Response("", 1001).compose();
    }
    var filters = filterBy.split(",");
    for (const element of filters) {
      if (
        !Object.values([
          "all", "completed", "firstX", "timebased", "rewards"
        ]).includes(element.toLowerCase())
      ) {
        return new Response("", 1002).compose();
      }
    }

    return new Response("", 200).compose();
  }
  /*Admin Collection Reward Binding*/
  _rewardItem(params: any) {
    let element = params;
    let asset = new Item();
    if (element !== undefined) {
      asset.itemID = element.item_id;
      asset.code = element.code;
      asset.name = element.name;
      asset.slug = element.slug;
      asset.thumbnail_url = element.thumbnail_url;
      asset.IPLogo = element.ip_logo;
      asset.generation = element.generation;
      asset.totalSKUCount = element.count;

      if (element.filter_1 && element.filter_1.length > 0) {
        asset.brand = new Brand();
        asset.brand.name = element.filter_1[0].name;
        asset.brand.logo = element.filter_1[0].image;
        asset.brand.category = element.filter_1[0].category_name;
      }

      if (element.filter_2 && element.filter_2.length > 0) {
        asset.rarity = new Rarity();
        asset.rarity.name = element.filter_2[0].name;
        asset.rarity.logo = element.filter_2[0].image;
      }

      if (element.blockchain_id) {
        asset.blockchain = new Blockchain();
        asset.blockchain.name = element.blockchain_id[0].name;
        asset.blockchain.logo = element.blockchain_id[0].image;
      }

      asset.itemType = "asset";
      asset.itemLogoType = params.item_type_logo;

      asset.itemSkus = [];
      if (element.serial_no) {
        var _sku = new ItemSku();
        _sku.itemSKUID = element.id;
        _sku.serialNumber = element.serial_no;
        _sku.salePrice = element.sale_price;
        _sku.itemState = element.item_state;
        _sku.skuNumber = element.sku_code;

        asset.itemSkus.push(_sku);
      }
      return asset;
    }
    else return ""
  }
  /*Get Admin Collection Response Binding */
  bindResponseForAdminCollection(params: any) {
    let element = params
    let _col = new Collection()
    _col.collectionID = element.id
    _col.slug = element.slug
    _col.name = element.name
    _col.image = element.image
    _col.description = element.description
    _col.brand = element.brand
    _col.ip = element.ip
    _col.status_id = element.status_id
    _col.rewards = [];
    let rewardData: any = this._rewardItem(element.item_reward_1)
    if (rewardData !== "") {
      _col.rewards.push(rewardData)

    }
    return _col
  }
  validateAdminCollectionSlug(params: any) {
    let slug = params.slug
    /*FilterBy Validation */
    if (!slug || slug == "") {
      return new Response("", 1018).compose();
    }
    return new Response("", 200).compose();
  }
  /*Get Admin Collection Validation */
  validateAdimSearchCollection(params: any) {
    var query = params.query
    var filterBy = params.filterby;
    /*Query validation */
    if (!query || query == "") {
      return new Response("", 1042).compose();
    }
    /*FilterBy Validation */
    if (!filterBy || filterBy == "") {
      return new Response("", 1001).compose();
    }
    var filters = filterBy.split(",");
    for (const element of filters) {
      if (
        !Object.values([
          "all", "completed", "firstX", "timebased", "rewards"
        ]).includes(element.toLowerCase())
      ) {
        return new Response("", 1002).compose();
      }
    }

    return new Response("", 200).compose();
  }
}
