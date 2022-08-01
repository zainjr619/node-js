import { Response } from "./response";
import { User } from "./user";
import { Brand } from "./brand";
import { ItemSku } from "./item_sku";
import { Filter } from "./filter";
import { Blockchain } from "./blockchain";
import { Rarity } from "./rarity";
import { Curation } from "./curation";
import { Category } from "./category";
import { Artist } from "./artist";
import { Variation } from "./variation";
import { Publisher } from "./publisher";
import { Edition } from "./edition";
import { Series } from "./series";
import { Set } from "./set";
import { Auction } from "./auction";
import { AllNFT } from "./allnft";
import { Collection } from "./collection";

export class Item {
  itemID: number;
  code: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  skuNumber: string;
  serialNumber: string;
  brand: Brand;
  totalSKUCount: number;
  itemType: string;
  itemLogoType: string;
  rarity: Rarity;
  ownedBy: User;
  itemSkus: ItemSku[];
  thumbnail_url: string;
  IP: number;
  IPLogo: string;
  generation: string;
  blockchain: Blockchain;
  createdby: number;
  buyPrice: string;
  itemSkuId: number;
  reservePrice: string;
  startPrice: string;
  category: Category;
  curation: Curation;
  artist: Artist;
  variation: Variation;
  publisher: Publisher;
  series: Series;
  edition: Edition;
  set: Set;
  isListed: string;
  count: number;
  auction: Auction;
  auctions: [];
  offers: [];
  isLiked: boolean;
  isBuyed: boolean;
  filter_1: Filter;
  filter_2: Filter;
  filter_3: Filter;
  filter_4: Filter;
  filter_5: Filter;
  filter_6: Filter;
  filter_7: Filter;
  filter_8: Filter;
  filter_9: Filter;
  filter_10: Filter;
  filter_11: Filter;
  filter_12: Filter;
  filter_13: Filter;
  filter_14: Filter;
  filter_15: Filter;
  filter_16: Filter;
  filter_17: Filter;
  filter_18: Filter;
  filter_19: Filter;
  filter_20: Filter;
  filter_21: Filter;
  filter_22: Filter;
  filter_23: Filter;
  filter_24: Filter;
  filter_25: Filter;
  filter_26: Filter;
  filter_27: Filter;
  filter_28: Filter;
  filter_29: Filter;
  filter_30: Filter;
  fromuserid: string;
  touserid: string;
  offerid: string;
  trans_value: string;
  status_id: any;
  total_amount: any;
  sales_tax: any;
  from_acount: any;
  to_acount: any;
  created_at: any;
  displayName: any;
  refernce: any;
  skuOwner:any;
  updatedAt:any;
  largeimage:any;
  auctionorder:any;

  validateSKU(params: any) {
    var itemid = params.itemid;
    var sortby = params.sortby;

    //#region filterBy Parameter Validation

    if (!itemid || itemid == "" || itemid.trim() === "") {
      return new Response("", 1021).compose();
    }

    if (!sortby || sortby == "") {
      return new Response("", 1006).compose();
    }

    //#endregion

    return new Response("", 200).compose();
  }
  validateSubFilter(priceRange:any,sortBy:any){
    //#region priceRange Parameter Validation
    if(priceRange)
    {
        var list = priceRange.split(',');
        if(list.length != 2)
        {
            return new Response('',1003).compose();   
        }
    
        var startPrice = list[0];
        var endPrice = list[1];
        if(startPrice == '' || isNaN(startPrice))
            return new Response('',1004).compose();
        if(endPrice == '' || isNaN(endPrice))
            return new Response('',1004).compose(); 

        if(parseFloat(startPrice) > parseFloat(endPrice))
            return new Response('',1005).compose(); 
        }
    
    //#endregion
    //#region sortBy Parameter Validation
   
    if(!sortBy || sortBy == '')
    {
        return new Response('',1006).compose(); 
    }

    if (!Object.values(['pricelowtohigh','pricehightolow']).includes(sortBy)) {
       return new Response('',1007).compose(); 
   }

   return new Response('',200).compose();

}

validateFilter(params:any)
{
   var filterBy = params.filterby;
   var priceRange = params.pricerange;
   var sortBy = params.sortby;

   var pageSize = params.pagesize;
   var pageNo = params.pageno;


   //#region filterBy Parameter Validation

   if(!filterBy || filterBy == '')
   {
       return new Response('',1001).compose(); 
   }
   var filters = filterBy.split(',');
   for (const element of filters) {
       if (!Object.values(['trending','soldout','onsale','onauction']).includes(element.tolowercase())) {
           return new Response('Provided filter is not supported',1002).compose(); 
       }
   }

   //#endregion       

  
    

    //#region pageSize Parameter Validation
   
    if(!pageSize || pageSize == '' || isNaN(pageSize))
    {
        return new Response('',1008).compose(); 
    }
    if(parseInt(pageSize) < 1 )
    {
        return new Response('',1009).compose(); 
    }

    //#endregion

    //#region pageNo Parameter Validation
   
    if(!pageNo || pageNo == '' || isNaN(pageNo))
    {
        return new Response('',1010).compose(); 
    }
    if(parseInt(pageNo) < 0 )
    {
        return new Response('',1011).compose(); 
    }
    //#endregion

   return (this.validateSubFilter(priceRange,sortBy)); 
   
}

  bindItemsResponse(element: any) {
    this.itemID = element.id;
    this.code = element.code;
    this.name = element.name;
    this.slug = element.slug;
    this.description = element.description;
    this.thumbnail_url = element.thumbnail_url;
    this.image = element.image;
    this.totalSKUCount = element.count;
      
    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);
    this.blockchain = new Blockchain();

    if (element?.blockchain_id?.length > 0) {
      this.blockchain.name = element.blockchain_id[0].name;
      this.blockchain.logo = element.blockchain_id[0].image;
    }

    this.itemSkus = [];
    element?.skus?.forEach((ele: any) => {
      let _item_sku = new ItemSku();
      _item_sku.itemSKUID = ele.id;
      _item_sku.skuNumber = ele.sku_code;
      _item_sku.salePrice = ele.sale_price;
      _item_sku.price = ele.price;
      _item_sku.serialNumber = ele.serial_no;
      _item_sku.itemState = ele?.item_state;
      _item_sku.tokenID = ele?.token_id
      _item_sku.itemType = "asset"
      let _user = new User();
      if (ele?.owner?.country)
        delete ele.owner.country;
      if (ele?.owner?.dateOfBirth)
        delete ele.owner.dateOfBirth;
      if (ele?.owner?.gender)
        delete ele.owner.gender;
      if (ele?.owner?.phoneNumber)
        delete ele.owner.phoneNumber;
      if (ele?.owner?.thumbnail_url)
        delete ele.owner.thumbnail_url;
      if (ele?.owner?.userName)
        delete ele.owner.userName;
      _user.bindData(ele?.owner);
      _item_sku.ownedBy = _user;

      this.itemSkus.push(_item_sku);
    });
  }

  bindItemsMonthResponse(element: any) {
    this.itemID = element.id;
    this.code = element.code;
    this.name = element.name;
    this.slug = element.slug;
    this.description = element.description;
    this.thumbnail_url = element.thumbnail_url;
    this.image = element.image;
    this.totalSKUCount = element.count;

  
    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);

      
    this.blockchain = new Blockchain();

    if (element?.blockchain_id?.length > 0) {
      this.blockchain.name = element.blockchain_id[0].name;
      this.blockchain.logo = element.blockchain_id[0].image;
    }

    this.itemSkus = [];
    let _item_sku = new ItemSku();
    _item_sku.itemSKUID = element.id;
    _item_sku.skuNumber = element.sku_code;
    _item_sku.salePrice = element.sale_price;
    _item_sku.price = element.price;
    _item_sku.serialNumber = element.serial_no;
    _item_sku.itemState = element?.item_state;
    _item_sku.tokenID = element?.token_id
    _item_sku.itemType = "asset"
    let _user = new User();
    if (element?.owner?.country)
      delete element.owner.country;
    if (element?.owner?.dateOfBirth)
      delete element.owner.dateOfBirth;
    if (element?.owner?.gender)
      delete element.owner.gender;
    if (element?.owner?.phoneNumber)
      delete element.owner.phoneNumber;
    if (element?.owner?.thumbnail_url)
      delete element.owner.thumbnail_url;
    if (element?.owner?.userName)
      delete element.owner.userName;
    _user.bindData(element?.owner);
    _item_sku.ownedBy = _user;

    this.itemSkus.push(_item_sku);
  }



  bindOfferResponse(element: any) {
    this.itemID = element.item_id;
    this.code = element.item_code;
    this.name = element.item_name;
    this.slug = element.item_slug;
    this.description = element.item_description;
    this.thumbnail_url = element.item_thumbnail_url;
    this.image = element.item_image;
    this.totalSKUCount = element.item_count;
    this.itemType = element.item_type;

    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);
    this.blockchain = new Blockchain();

    if (element?.blockchain_id?.length > 0) {
      if(element.item_blockchain_id){
      this.blockchain.name = element.item_blockchain_id[0].name;
      this.blockchain.logo = element.item_blockchain_id[0].image;
      }
      else{
        this.blockchain.name = element.blockchain_id[0].name;
        this.blockchain.logo = element.blockchain_id[0].image;
        
      }
    }

    this.itemSkus = [];
    let _item_sku: any = {};
    if (element.item_sku_sku_code) {
      _item_sku.skuNumber = element.item_sku_sku_code;
      _item_sku.salePrice = element.item_sku_sale_price;
      _item_sku.price = element.item_sku_price;
      _item_sku.serialNumber = element.item_sku_serial_no;
      _item_sku.itemSKUID = element.item_sku_id
      _item_sku.item_state = element?.item_sku_item_state
      _item_sku.isLocked = element?.item_sku_is_locked
      _item_sku.itemType = "asset"
    }

    this.itemSkus.push(_item_sku);
  }

  bindTransactionResponse(element: any) {
    this.createdby = element.created_by;
    this.fromuserid = element.from_user_id;
    this.created_at = element.created_at;
    this.touserid = element.to_user_id;
    this.itemSkuId = element.item_sku_id;
    this.refernce = element.id;
    this.from_acount = element.from_acount;
    this.to_acount = element.to_acount;
    this.trans_value = element.trans_value;
    this.status_id = element.status_id;
    this.total_amount = element.total_amount;
    this.itemType = element.item_type;
    this.sales_tax = element.sales_tax;

    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);
   
    this.blockchain = new Blockchain();

    if (element?.blockchain_id?.length > 0) {
      this.blockchain.name = element.item_blockchain_id[0].name;
      this.blockchain.logo = element.item_blockchain_id[0].image;
    }

    this.itemSkus = [];
    let _item_sku: any = {};


    if (element.item && element.item.item_sku_id) {

      _item_sku.skuNumber = element.item.item_sku_sku_code;
      _item_sku.salePrice = element.item_sku_sale_price;
      _item_sku.price = element.item.item_sku_price;
      _item_sku.serialNumber = element.item.item_sku_serial_no;
      _item_sku.itemSKUID = element.item.item_sku_id
      _item_sku.item_state = element?.item.item_sku_item_state;
      _item_sku.item_thumbnail_url = element?.item.item_thumbnail_url;
      _item_sku.item_type_logo = element.item.item_item_type_logo;
      _item_sku.itemType = element.item.item_item_type;
      _item_sku.item_name = element.item.item_name;
      _item_sku.totalSKUCount = element.item.item_count;
      _item_sku.item_slug=element.item.item_slug
    }
    else if (element.item && element.item.pack_sku_id) {

      _item_sku.skuNumber = element.item.pack_sku_sku_code;
      _item_sku.salePrice = element.pack_sku_sale_price;
      _item_sku.price = element.item.pack_sku_price;
      _item_sku.serialNumber = element.item.pack_sku_serial_no;
      _item_sku.itemSKUID = element.item.pack_sku_id
      _item_sku.item_state = element?.item.pack_sku_item_state;
      _item_sku.item_thumbnail_url = element?.item.item_image;
      _item_sku.item_name = element.item.item_name;
      _item_sku.totalSKUCount = element.item.item_count;
      _item_sku.item_slug=element.item.item_slug;


    }

    this.itemSkus.push(_item_sku);
  }

  bindOfferPackResponse(element: any) {
    this.itemID = element.item_id;
    this.code = element.item_code;
    this.name = element.item_name;
    this.slug = element.item_slug;
    this.description = element.item_description;
    this.thumbnail_url = element.item_image; //no thumbnail url in packs
    this.image = element.item_image;
    this.totalSKUCount = element.item_count;
    this.itemType = 'packs';
    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);

    this.blockchain = new Blockchain();

    if (element?.blockchain_id?.length > 0) {
      this.blockchain.name = element.item_blockchain_id[0].name;
      this.blockchain.logo = element.item_blockchain_id[0].image;
    }

    this.itemSkus = [];
    let _item_sku: any = {};
    if (element.pack_sku_sku_code) {
      _item_sku.skuNumber = element.pack_sku_sku_code;
      _item_sku.salePrice = element.pack_sku_sale_price;
      _item_sku.price = element.pack_sku_price;
      _item_sku.serialNumber = element.pack_sku_serial_no;
      _item_sku.itemSKUID = element.pack_sku_id
      _item_sku.item_state = element?.pack_sku_item_state
      _item_sku.isLocked = element?.pack_sku_is_locked
      _item_sku.itemType = "packs"
    }

    this.itemSkus.push(_item_sku);
  }

  bindRedeemResponse(element: any) {
    this.itemID = element.item_id;
    this.code = element.item_code;
    this.name = element.item_name;
    this.slug = element.item_slug;
    this.description = element.item_description;
    this.thumbnail_url = element.item_thumbnail_url;
    this.image = element.item_image ? element.item_image : element.item_thumbnail_url;
    this.totalSKUCount = element.item_count;
    this.IP = element?.item_ip;
    this.IPLogo = element?.item_ip_logo;
    this.itemLogoType = element?.item_item_type_logo

   
    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);
    this.blockchain = new Blockchain();

    if (Array.isArray(element.blockchain_id) && element?.blockchain_id?.length > 0) {
      this.blockchain.name = element.blockchain_id[0].name;
      this.blockchain.logo = element.blockchain_id[0].image;
    }

    this.itemSkus = [];
    let _item_sku: any = {};
    if (element.item_sku_sku_code) {
      _item_sku.skuNumber = element.item_sku_sku_code;
      _item_sku.salePrice = element.item_sku_sale_price;
      _item_sku.price = element.item_sku_price;
      _item_sku.serialNumber = element.item_sku_serial_no;
      _item_sku.itemSKUID = element.item_sku_id
      _item_sku.item_state = element?.item_sku_item_state
      _item_sku.itemType = "asset"
    }

    this.itemSkus.push(_item_sku);
  }

  bindSalesResponse(data: any) {
    let result: any = []
    data.forEach((element: any) => {
      let _coll = new AllNFT()
      _coll.assetID = element.item_id;
      _coll.code = element.item_code;
      _coll.name = element.item_name;
      _coll.slug = element.item_slug;
      _coll.generation = element.item_generation
      _coll.description = element.item_description;
      _coll.image = element.item_large_image;
      _coll.thumbnail_url = element.item_thumbnail_url ? element.item_thumbnail_url : element.item_image; //confirm from tl
      _coll.totalSKUCount = element.item_count;
      _coll.is_resellable = element.item_is_resellable
      _coll.launch_date = element.item_public_launch_date
      _coll.itemSkus = []; //itemSkus
      _coll.brand = new Brand();
      _coll.brand.bind(element.filter_1);
      _coll.rarity = new Rarity();
      _coll.rarity.bind(element.filter_2);
      _coll.edition = new Edition();
      _coll.edition.bind(element.filter_3);
      _coll.set = new Set();
      _coll.set.bind(element.filter_4);
      _coll.category = new Category();
      _coll.category.bind(element.filter_5);
      _coll.series = new Series();
      _coll.series.bind(element.filter_7);
      _coll.curation = new Curation();
      _coll.curation.bind(element.filter_8);
      _coll.artist = new Artist();
      _coll.artist.bind(element.filter_9);
      _coll.variation = new Variation();
      _coll.variation.bind(element.filter_10);
      _coll.publisher = new Publisher();
      _coll.publisher.bind(element.filter_11);
      _coll.blockchain = new Blockchain();
      console.log()
      if (element?.blockchain_id?.length > 0) {
        _coll.blockchain.name = element.blockchain_id[0].name;
        _coll.blockchain.logo = element.blockchain_id[0].image;
      }
      let _item_sku: any = {};
      if (element.item_sku_sku_code) {
        _item_sku.skuNumber = element.item_sku_sku_code;
        _item_sku.salePrice = element.item_sku_sale_price;
        _item_sku.price = element.item_sku_price;
        _item_sku.serialNumber = element.item_sku_serial_no;
        _item_sku.packSKUID = element.item_sku_id
        _item_sku.item_state = element?.item_sku_item_state
        _coll.item_state = element?.item_sku_item_state
        _coll.itemType = "asset"
      }
      else {

        _item_sku.skuNumber = element.pack_sku_sku_code;
        _item_sku.salePrice = element.pack_sku_sale_price;
        _item_sku.price = element.pack_sku_price;
        _item_sku.serialNumber = element.pack_sku_serial_no;
        _item_sku.packSKUID = element.pack_sku_id
        _item_sku.item_state = element?.pack_sku_item_state
        _coll.item_state = element?.pack_sku_item_state
        _coll.itemType = "packs"
      }
      _coll.itemSkus.push(_item_sku)
      if (element?.item_reward_1 && element.item_reward_1 != '') {
        let _collection = new Collection();
        _collection.collectionID = element.id;
        _collection.name = element.name;
        _collection.slug = element.slug;
        _collection.image = element.thumb_image;
        _collection.totalTime = element.expiry;
        _collection.status = element.status_id;

        _collection.brand = new Brand();
        _collection.brand.logo = element.image;

        _collection.ip = element.ip;
        _coll.collection = _collection
      }
      result.push(_coll)
    });
    return result
  }
  bindItemQueueResponse(array: any) {
    let _colls: any = []
    array.forEach((element: any) => {
      let _col = new Item()
      _col.itemID = element.id;
      _col.code = element.code;
      _col.name = element.name;
      _col.slug = element.slug;
      _col.description = element.description;
      _col.image = element.image;
      _col.totalSKUCount = element.count;
      _col.thumbnail_url = element.thumbnail_url;
      _col.itemSkus = [];
      _col.brand = new Brand();
      _col.brand.bind(element.filter_1);
      _col.rarity = new Rarity();
      _col.rarity.bind(element.filter_2);
      _col.edition = new Edition();
      _col.edition.bind(element.filter_3);
      _col.set = new Set();
      _col.set.bind(element.filter_4);
      _col.category = new Category();
      _col.category.bind(element.filter_5);
      _col.series = new Series();
      _col.series.bind(element.filter_7);
      _col.curation = new Curation();
      _col.curation.bind(element.filter_8);
      _col.artist = new Artist();
      _col.artist.bind(element.filter_9);
      _col.variation = new Variation();
      _col.variation.bind(element.filter_10);
      _col.publisher = new Publisher();
      _col.publisher.bind(element.filter_11);
     
      _col.blockchain = new Blockchain();
      console.log()
      if (element?.blockchain_id?.length > 0) {
        _col.blockchain.name = element.blockchain_id[0].name;
        _col.blockchain.logo = element.blockchain_id[0].image;
      }
      element.skus.forEach((ele: any) => {
        let _item_sku = new ItemSku();
        _item_sku.itemSKUID = ele.id;
        _item_sku.skuNumber = ele.sku_code;
        _item_sku.salePrice = ele.sale_price;
        _item_sku.price = ele.price;
        _item_sku.serialNumber = ele.serial_no;
        _item_sku.itemState = ele?.item_state;
        _item_sku.tokenID = ele?.token_id
        let _user = new User();
        if (ele?.owner?.country)
          delete ele.owner.country;
        if (ele?.owner?.dateOfBirth)
          delete ele.owner.dateOfBirth;
        if (ele?.owner?.gender)
          delete ele.owner.gender;
        if (ele?.owner?.phoneNumber)
          delete ele.owner.phoneNumber;
        if (ele?.owner?.thumbnail_url)
          delete ele.owner.thumbnail_url;
        if (ele?.owner?.userName)
          delete ele.owner.userName;
        _user.bindData(ele?.owner);
        _item_sku.ownedBy = _user;

        _col.itemSkus.push(_item_sku);
      });
      _colls.push(_col)
    });
    return _colls
  }
  bindFilterData(data: any) {
    let _col: any = { ...data };
    _col.filter_1 = data.item_filter_1;
    _col.filter_2 = data.item_filter_2;
    _col.filter_3 = data.item_filter_3;
    _col.filter_4 = data.item_filter_4;
    _col.filter_5 = data.item_filter_5;
    _col.filter_6 = data.item_filter_6;
    _col.filter_7 = data.item_filter_7;
    _col.filter_8 = data.item_filter_8;
    _col.filter_9 = data.item_filter_9;
    _col.filter_10 = data.item_filter_10;
    _col.filter_11 = data.item_filter_11;
    _col.filter_12 = data.item_filter_21;
    _col.filter_13 = data.item_filter_13;
    _col.filter_14 = data.item_filter_14;
    _col.filter_15 = data.item_filter_15;
    _col.filter_16 = data.item_filter_16;
    _col.filter_17 = data.item_filter_17;
    _col.filter_18 = data.item_filter_18;
    _col.filter_19 = data.item_filter_19;
    _col.filter_21 = data.item_filter_21;
    _col.filter_22 = data.item_filter_22;
    _col.filter_23 = data.item_filter_23;
    _col.filter_24 = data.item_filter_24;
    _col.filter_25 = data.item_filter_25;
    _col.filter_26 = data.item_filter_26;
    _col.filter_27 = data.item_filter_27;
    _col.filter_28 = data.item_filter_28;
    _col.filter_29 = data.item_filter_29;
    _col.filter_30 = data.item_filter_30;
    if (data.item_sku_blockchain_id)
      _col.blockchain_id = data.item_sku_blockchain_id;
    else _col.blockchain_id = data.pack_sku_blockchain_id;
    return _col;
  }
  bindPackReveal = (element: any) => {
    this.itemID = element.item_id;
    this.code = element.code;
    this.name = element.name;
    this.slug = element.slug;
    this.description = element.description;
    this.thumbnail_url = element.thumbnail_url;
    this.image = element.image;
    this.totalSKUCount = element.count;
    this.IP = element?.ip;
    this.IPLogo = element?.ip_logo;
    this.itemLogoType = element?.item_type_logo

    this.brand = new Brand();
    this.brand.bind(element.filter_1);
    this.rarity = new Rarity();
    this.rarity.bind(element.filter_2);
    this.edition = new Edition();
    this.edition.bind(element.filter_3);
    this.set = new Set();
    this.set.bind(element.filter_4);
    this.category = new Category();
    this.category.bind(element.filter_5);
    this.series = new Series();
    this.series.bind(element.filter_7);
    this.curation = new Curation();
    this.curation.bind(element.filter_8);
    this.artist = new Artist();
    this.artist.bind(element.filter_9);
    this.variation = new Variation();
    this.variation.bind(element.filter_10);
    this.publisher = new Publisher();
    this.publisher.bind(element.filter_11);
    this.blockchain = new Blockchain();

    if (Array.isArray(element.blockchain_id) && element?.blockchain_id?.length > 0) {
      this.blockchain.name = element.blockchain_id[0].name;
      this.blockchain.logo = element.blockchain_id[0].image;
    }

    this.itemSkus = [];
    let _item_sku: any = {};
    if (element.sku_code) {
      _item_sku.skuNumber = element.sku_code;
      _item_sku.salePrice = element.sale_price;
      _item_sku.price = element.price;
      _item_sku.serialNumber = element.serial_no;
      _item_sku.itemSKUID = element.id
      _item_sku.item_state = element?.item_state
      _item_sku.itemType = "asset"
    }

    this.itemSkus.push(_item_sku);
  }

  bindAuctionLanding = (params: any) => {
    let auctions: any = [];
    

    for (const element of params) {
      var _item = new Item();
      _item.code = element.item_code;
      _item.itemID = element.item_id;
      _item.name = element.item_name;
      _item.slug = element.item_slug;
      _item.description = element.item_description;
      _item.image = element.item_image;
      _item.totalSKUCount = element.item_count;
      _item.updatedAt=element.item_updated_at;
      _item.largeimage=element.item_large_image;

      _item.isListed = element.item_is_listed;
      _item.count = element.item_count;
      _item.thumbnail_url = element.item_large_image
      _item.auctionorder=element.item_order_id
      let auc: any = []
      let _aucItem: any = {}
      element.auc.forEach((elementAuc: any) => {
        _aucItem = new Auction()
        _aucItem.auctionId= elementAuc.id;
        _aucItem.createdBy = elementAuc.created_by;
        _aucItem.buyNowPrice = elementAuc.buy_price;
        _aucItem.itemSkuId = elementAuc.item_sku_id;
        _aucItem.reservePrice = elementAuc.reserve_price;
        _aucItem.startPrice = elementAuc.start_price;
        _aucItem.itemId = elementAuc.item_id;
        _aucItem.expiry = elementAuc.expiry
        _aucItem.topBid = element.topBid
        _aucItem.auctionimage=elementAuc.image;
        _aucItem.orderId=elementAuc.order_id;
        _aucItem.createdAt=elementAuc.created_at

        auc.push(_aucItem);
      });
      _item.auctions = auc
      _item.brand = new Brand();
      _item.brand.bind(element.filter_1);
      _item.rarity = new Rarity();
      _item.rarity.bind(element.filter_2);
      _item.edition = new Edition();
      _item.edition.bind(element.filter_3);
      _item.set = new Set();
      _item.set.bind(element.filter_4);
      _item.category = new Category();
      _item.category.bind(element.filter_5);
      _item.series = new Series();
      _item.series.bind(element.filter_7);
      _item.curation = new Curation();
      _item.curation.bind(element.filter_8);
      _item.artist = new Artist();
      _item.artist.bind(element.filter_9);
      _item.variation = new Variation();
      _item.variation.bind(element.filter_10);
      _item.publisher = new Publisher();
      _item.publisher.bind(element.filter_11);
      _item.blockchain = new Blockchain();
      if (element?.blockchain_id?.length > 0) {
        _item.blockchain.name = element.blockchain_id[0].name;
        _item.blockchain.logo = element.blockchain_id[0].image;
      }
      
      _item.itemSkus = [];
      let _item_sku: any = {};
      if (element.item_sku_sku_code) {
        _item_sku.skuNumber = element.item_sku_sku_code;
        _item_sku.salePrice = element.item_sku_sale_price;
        _item_sku.price = element.item_sku_price;
        _item_sku.serialNumber = element.item_sku_serial_no;
        _item_sku.itemSKUID = element.item_sku_id
        _item_sku.item_state = element?.item_sku_item_state
        _item_sku.itemType = "asset"
      }

      _item.itemSkus.push(_item_sku);
      auctions.push(_item);
    }
    return auctions;
  }
}

export const bindAuctionResponse = (params: any) => {
  let auctions: any = [];

  for (const element of params) {
    var _item = new Item();
    _item.code = element.code;
    _item.itemID = element.id;
    _item.name = element.name;
    _item.slug = element.slug;
    _item.description = element.description;
    _item.image = element.image;
    _item.totalSKUCount = element.count;

    _item.isListed = element.is_listed;
    _item.count = element.count;
    _item.thumbnail_url = element.large_image
    let auc: any = []
    let _aucItem: any = {}
    element.auc.forEach((elementAuc: any) => {
      _aucItem = new Auction()
      _aucItem.createdBy = elementAuc.created_by;
      _aucItem.buyNowPrice = elementAuc.buy_price;
      _aucItem.itemSkuId = elementAuc.item_sku_id;
      _aucItem.reservePrice = elementAuc.reserve_price;
      _aucItem.startPrice = elementAuc.start_price;
      _aucItem.itemId = elementAuc.item_id;


      auc.push(_aucItem);
    });
    _item.auctions = auc
    _item.brand = new Brand();
      _item.brand.bind(element.filter_1);
      _item.rarity = new Rarity();
      _item.rarity.bind(element.filter_2);
      _item.edition = new Edition();
      _item.edition.bind(element.filter_3);
      _item.set = new Set();
      _item.set.bind(element.filter_4);
      _item.category = new Category();
      _item.category.bind(element.filter_5);
      _item.series = new Series();
      _item.series.bind(element.filter_7);
      _item.curation = new Curation();
      _item.curation.bind(element.filter_8);
      _item.artist = new Artist();
      _item.artist.bind(element.filter_9);
      _item.variation = new Variation();
      _item.variation.bind(element.filter_10);
      _item.publisher = new Publisher();
      _item.publisher.bind(element.filter_11);
    auctions.push(_item);
  }
  return auctions;
}
