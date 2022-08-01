import { Asset } from "../entities/assets";
import { AssetSku } from "../entities/assetSku";
import { AssetSummary } from "../entities/assetSummary";
import AppService from "./appService";
import { AssetInterface } from "./interfaces/assetsInterface";
import { QueryRunner, getManager, getConnection } from "typeorm";
import { readHierarchyFilter, ReadQueryResult, writeHierarchyFilter, writeQueryResult } from "../utils/redis";
import { Response } from "../models/response";
import { OWNER_ID, TERRA_OWNER } from "../constants";
import { ItemMinting } from "../entities/assetsMinting";
var crypto = require('crypto');

const entityManager = getManager();
let _ownerId = 20;

export default class AssetService extends AppService implements AssetInterface {
  async getAssetsSummary(params: any): Promise<{}> {
    var filterBy = params.filterby;
    var startPrice = params.startprice;
    var endPrice = params.endprice;
    var sortBy = params.sortby;

    var pageSize = params.pagesize;
    var pageNo = params.pageno;

    if (sortBy == "pricelowtohigh") sortBy = " CAST(price as UNSIGNED) ASC"
    if (sortBy == "pricehightolow") sortBy = " CAST(price as UNSIGNED) DESC";
    if (sortBy == "newest") sortBy = " id DESC";
    if (sortBy == "oldest") sortBy = " id ASC";

    filterBy = filterBy.toLowerCase();

    let demoString = "";
    var filters: any = filterBy.split(",");
    let res = [];
    let _auctionData = [];
    let _soldoutData = [];
    let _data = [];
    var _query=undefined;
    var hash=undefined;
    if (filters.includes("trending")) {
      filters = filters.filter((item: string) => item != "trending");
      if (filters.length === 0) {

        _query = `   
        SELECT item_summary.* FROM item_summary 
        WHERE item_summary.item_state in ('onauction')
        ORDER BY CAST(trend_count as unsigned) DESC, ${sortBy} 
        LIMIT ${pageNo * pageSize},${pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_nftAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_nftAll", hash, _auctionData);
        }

        _query = `
        Select is2.*,isk.trend_count as inner_trend_count from  
        (Select iq.* from item 
          inner join(
          SELECT item_id ,Max(trend_count) as trend_count,MIN(price) as sale_price from item_summary is3 
         where item_state in ('onsale') 
         group by item_id
         ORDER by trend_count DESC 
          ) iq
         on item.id=iq.item_id AND item.is_listed=1 AND item.is_resellable=1
         ) isk
        INNER join item_summary is2 
        on isk.item_id = is2.item_id AND isk.sale_price = is2.price
        where item_state in ('onsale')
        group by item_id
        Order by CAST(inner_trend_count as unsigned) DESC, ${sortBy}
        LIMIT ${pageNo * pageSize},${pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        que_res = await ReadQueryResult("_nftAll", hash);
        if (que_res.responseCode === 200) {
          _data = que_res.responseData;
        } else {
          _data = await entityManager.query(_query)
          writeQueryResult("_nftAll", hash, _data);
        }

      } else {
        if (filters.includes("onauction")) {
          filters = filters.filter((item: string) => item != "onauction");

          _auctionData = await entityManager.query(`   
      SELECT item_summary.* FROM item_summary 
      WHERE item_summary.item_state in ('onauction')
      ORDER BY CAST(trend_count as unsigned) DESC, ${sortBy} 
      LIMIT ${pageNo * pageSize},${pageSize}
      `);
        }

        if (filters.includes("soldout")) {
          filters = filters.filter((item: string) => item != "soldout");

          _soldoutData = await entityManager.query(`   
      SELECT item_summary.*,COUNT(DISTINCT item_summary.owner_id) AS user_count FROM item_summary 
      WHERE item_summary.item_state in ('purchased') AND item_summary.owner_id!=1
      GROUP BY item_id   
      ORDER BY CAST(trend_count as unsigned) DESC, ${sortBy} 
      LIMIT ${pageNo * pageSize},${pageSize}
      `);
        }

        if (filters.length > 0) {
          for (let element of filters) {
            if (element == "soldout") element = "purchased";
            demoString += "'" + element + "',";
          }
          demoString = demoString.slice(0, -1);

          _data = await entityManager.query(`
          Select is2.*,isk.trend_count as inner_trend_count from  
      ( SELECT item_id ,Max(trend_count) as trend_count,MIN(price) as sale_price from item_summary is3 
        where item_state in ('onsale') and price between ${startPrice} and ${endPrice}
        group by item_id
        ORDER by trend_count DESC,${sortBy} ) isk
        INNER join item_summary is2 
        on isk.item_id = is2.item_id AND isk.sale_price = is2.price
        where item_state in ('onsale')
        group by item_id
        Order by CAST(inner_trend_count as unsigned) DESC,${sortBy}
        LIMIT ${pageNo * pageSize},${pageSize}
        `);
        }
      }
    }
    else {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _query = `   
        SELECT item_summary.* FROM item_summary 
        WHERE item_summary.item_state in ('onauction')
        ORDER BY${sortBy} 
        LIMIT ${pageNo * pageSize},${pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_nftAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_nftAll", hash, _auctionData);
        }

      }
      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _query = `   
        SELECT item_summary.*,COUNT(DISTINCT item_summary.owner_id) AS user_count FROM item_summary 
        WHERE item_summary.item_state in ('purchased') 
        GROUP BY item_id   
        ORDER BY${sortBy} 
        LIMIT ${pageNo * pageSize},${pageSize}
        `;

       hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_nftAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_nftAll", hash, _soldoutData);
        }

      }
      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        _query = `
        Select is2.* from  
        ( Select iq.* from item 
          inner join(
          SELECT item_id ,Min(price) as sale_price from item_summary is3 
                    where item_state in (${demoString}) and price between ${startPrice} and ${endPrice}
                    group by item_id
              ) iq
              on item.id=iq.item_id AND item.is_listed=1 AND item.is_resellable=1 ) isk
          INNER join item_summary is2 
          on isk.item_id = is2.item_id AND isk.sale_price = is2.price
          where item_state in (${demoString})
          group by item_id 
          ORDER BY${sortBy}
          LIMIT ${pageNo * pageSize},${pageSize}
          `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_nftAll", hash);
        if (que_res.responseCode === 200) {
          _data = que_res.responseData;
        } else {
          _data = await entityManager.query(_query)
          writeQueryResult("_nftAll", hash, _data);
        }

      }
    }
    if (filterBy.toLowerCase() == "trending") {
      // for trending we will query another table to get the trending
      // assets and then we will query this table.
    }

    res = [..._soldoutData, ..._auctionData, ..._data];

    return res;
  }

  async getUserAssetsSummary(params: any): Promise<{}> {
    var filterBy = params.filterby;
    var startPrice = params.startprice;
    var endPrice = params.endprice;
    var sortBy = params.sortby;
    var userId = params.userid;

    var pageSize = params.pagesize;
    var pageNo = params.pageno;

    sortBy = sortBy == "lowtohigh" ? "ASC" : "DESC";
    filterBy = filterBy.toLowerCase();

    let demoString = "";
    var filters: any = filterBy.split(",");
    let res = [];
    let _auctionData = [];
    let _data = [];

    if (filters.length > 0) {
      for (let element of filters) {
        if (element == "soldout") element = "purchased";
        demoString += "'" + element + "',";
      }
      demoString = demoString.slice(0, -1);
      _auctionData = await entityManager.query(`   
      SELECT item_summary.* FROM item_summary 
      WHERE item_summary.item_state in (${demoString}) AND owner_id=${userId} and price between ${startPrice} and ${endPrice}
      ORDER BY item_summary.updated_at ${sortBy} 
      LIMIT ${pageNo * pageSize},${pageSize}
      `);
    }

    if (filterBy.toLowerCase() == "trending") {
      // for trending we will query another table to get the trending
      // assets and then we will query this table.
    }

    res = [..._auctionData];

    return res;
  }

  async getAssetskus(params: any): Promise<{}> {
    var skus = params.skus.split(",");
    var filterBy = params.filter_by;
    console.log(params)
    let data = [];
    let isListed = params.tv ? '(0,1)' : '(1)'

    if (filterBy?.toLowerCase() === "primary") {
      if (params.raw) {
        data = await getConnection()
          .createQueryBuilder(Asset, "item")
          .select("item")
          .innerJoinAndSelect("item.skus", "item_sku")
          .where("item_sku.id in ( :param1 )", { param1: skus })
          .andWhere("item_sku.owner_id = :owner_id", { owner_id: TERRA_OWNER })
          .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed}`)
          .getRawMany();
      } else {
        data = await getConnection()
          .createQueryBuilder(Asset, "item")
          .select("item")
          .innerJoinAndSelect("item.skus", "item_sku")
          .where("item_sku.id in ( :param1 )", { param1: skus })
          .andWhere("item_sku.owner_id = :owner_id", { owner_id: TERRA_OWNER })
          .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed}`)
          .getMany();
      }
    } else if (filterBy?.toLowerCase() === "secondary") {
      if (params.raw) {
        data = await getConnection()
          .createQueryBuilder(Asset, "item")
          .select("item")
          .innerJoinAndSelect("item.skus", "item_sku")
          .where("item_sku.id in ( :param1 )", { param1: skus })
          .andWhere("item_sku.owner_id != :owner_id", { owner_id: TERRA_OWNER })
          .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed}`)
          .getRawMany();
      } else {
        data = await getConnection()
          .createQueryBuilder(Asset, "item")
          .select("item")
          .innerJoinAndSelect("item.skus", "item_sku")
          .where("item_sku.id in ( :param1 )", { param1: skus })
          .andWhere("item_sku.owner_id != :owner_id", { owner_id: TERRA_OWNER })
          .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed}`)
          .getMany();
      }

    } else {
      if (params.raw) {
        data = await getConnection()
          .createQueryBuilder(Asset, "item")
          .select("item")
          .innerJoinAndSelect("item.skus", "item_sku")
          .where("item_sku.id in ( :param1 )", { param1: skus })
          .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed}`)
          .getRawMany();
      } else {
        data = await getConnection()
          .createQueryBuilder(Asset, "item")
          .select("item")
          .innerJoinAndSelect("item.skus", "item_sku")
          .where("item_sku.id in ( :param1 )", { param1: skus })
          .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed}`)
          .getMany();
      }




    }

    for await (const iterator of data) {
      let res = [];
      if (
        (iterator.skus && iterator?.skus[0]?.item_state === "purchased") ||
        iterator.item_sku_item_state
      ) {
        let iID = iterator.id ? iterator.id : iterator.item_id;
        let count = await entityManager.query(`   
        CALL GET_DISTINCT_OWNERS(${iID});`);
        count = count[0]
        iterator.user_count = count[0]?.user_count;
      }
      for (let index = 1; index <= 30; index++) {
        if (iterator["filter_" + index] !== undefined) {
          let filter: any = iterator["filter_" + index];

          if (filter && filter.toString().trim() !== "") {
            let fil_1 = await readHierarchyFilter("filter_" + index, filter);
            if (fil_1.responseCode === 200) {
              res = fil_1.responseData;
            } else {
              res = await entityManager.query(
                `CALL GET_HIERARCHY(${parseInt(filter)})`
              );
              res = res[0]
              writeHierarchyFilter("filter_" + index, filter, res);
            }
            iterator["filter_" + index] = res;
          }
        }
      }

      if (iterator.blockchain_id) {
        let blockchain_data = await readHierarchyFilter(
          "blockchain_data",
          iterator.id
        );
        if (blockchain_data.responseCode !== 200) {
          res = blockchain_data.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
          );
          res = res[0]
          writeHierarchyFilter("blockchain_data", iterator.id, res);
        }
      }
      iterator.blockchain_id = res;
    }

    return data;
  }
  async getSkusWithFilters(params: any): Promise<{}> {
    var skus = params.skus.split(",");
    var rarity = params?.rarity?.split(",");
    let demoString = ''
    var keyword = params?.keyword;
    if (rarity) {
      for (let element of rarity) {
        demoString += "'" + element + "',";
      }
      demoString = demoString.slice(0, -1);
      var rarityData = await entityManager.query(`SELECT * FROM hierarchy where name in (${demoString}) AND category_name="rarity"`)
    }
    let data = [];
    let isListed = params.tv ? '(0,1)' : '(1)'
    let rarity_id = '';
    if (rarityData) {
      for (let element of rarityData) {
        rarity_id += "'" + element.id + "',";
      }
      rarity_id = rarity_id.slice(0, -1);
    }
    let query = '';
    let rarityquery = '';
    if (keyword) {
      query = `AND item.name like ("%${keyword}%")`
    }
    if (rarity_id) {
      rarityquery = `AND item.filter_2 in (${rarity_id})`
    }
    if (params.raw) {
      data = await getConnection()
        .createQueryBuilder(Asset, "item")
        .select("item")
        .innerJoinAndSelect("item.skus", "item_sku")
        .where("item_sku.id in ( :param1 )", { param1: skus })
        .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed} ${rarityquery} ${query}`)
        .getRawMany();
    } else {
      data = await getConnection()
        .createQueryBuilder(Asset, "item")
        .select("item")
        .innerJoinAndSelect("item.skus", "item_sku")
        .where("item_sku.id in ( :param1 )", { param1: skus })
        .andWhere(`item.is_resellable=1 AND item.is_listed in ${isListed} ${rarityquery} ${query}`)
        .getMany();
    }

    for await (const iterator of data) {
      let res = [];
      if (
        (iterator.skus && iterator?.skus[0]?.item_state === "purchased") ||
        iterator.item_sku_item_state
      ) {
        let iID = iterator.id ? iterator.id : iterator.item_id;
        let count = await entityManager.query(`   
        CALL GET_DISTINCT_OWNERS(${iID});`);
        count = count[0]
        iterator.user_count = count[0]?.user_count;
      }
      for (let index = 1; index <= 30; index++) {
        if (iterator["filter_" + index] !== undefined) {
          let filter: any = iterator["filter_" + index];

          if (filter && filter.toString().trim() !== "") {
            let fil_1 = await readHierarchyFilter("filter_" + index, filter);
            if (fil_1.responseCode === 200) {
              res = fil_1.responseData;
            } else {
              res = await entityManager.query(
                `CALL GET_HIERARCHY(${parseInt(filter)})`
              );
              res = res[0]
              writeHierarchyFilter("filter_" + index, filter, res);
            }
            iterator["filter_" + index] = res;
          }
        }
      }

      if (iterator.blockchain_id) {
        let blockchain_data = await readHierarchyFilter(
          "blockchain_data",
          iterator.id
        );
        if (blockchain_data.responseCode !== 200) {
          res = blockchain_data.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
          );
          res = res[0]
          writeHierarchyFilter("blockchain_data", iterator.id, res);
        }
      }
      iterator.blockchain_id = res;
    }

    return data;
  }

  async getAuctionSkus(params: any): Promise<{}> {
    var userid = params.userid;
    let data: any = [];
    data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .where("item_sku.owner_id = :userid", { userid: userid })
      .andWhere("item_sku.item_state = 'onauction'")
      .getRawMany();
    return data;
  }

  async getTradeSkus(params: any): Promise<{}> {
    var userid = params.userid;
    let data: any = [];
    data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .where("item_sku.owner_id = :userid", { userid: userid })
      .andWhere("item_sku.item_state = 'onsale'")
      .getRawMany();
    return data;
  }
  async getAssetsku(params: any): Promise<{}> {
    var sku = params.skuid;
    let data = {};

    data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .where("item_sku.id in ( :param1 )", { param1: sku })
      .getMany();

    return data;
  }
  async getAvatar(params: any): Promise<{}> {
    var release = params.is_resellable;
    var url = params.thumbnail_url;
    let data = {};

    data = await getConnection()
      .createQueryBuilder(Asset, "item")
      .select("item")
      .where("item.is_resellable = :is_resellable ", { is_resellable: release })
      .andWhere("item.thumbnail_url = :thumbnail_url ", { thumbnail_url: url })
      .getMany();

    return data;
  }

  async getItemByID(params: any): Promise<{}> {
    let _itemID = params.id.split(",");

    let data = {};

    data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .cache(10000)
      .where("item.id in ( :param1 )", { param1: _itemID })
      .getMany();

    return data;
  }

  async getItemByCode(params: any): Promise<{}> {
    let _itemCode = params.code;

    let demoString = "";
    var filters: any = _itemCode.split(",");
    for (let element of filters) {
      if (element == "soldout") element = "purchased";
      demoString += "'" + element + "',";
    }
    demoString += "1";
    let data = [];

    data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .where(`item.code in ( ${demoString} )`)
      .cache(10000)
      .getMany();

    if (data.length > 0) {
      let iterator: any = data[0];
      let res = [];

      for (let index = 1; index <= 30; index++) {
        let filter: any = iterator["filter_" + index];
        if (filter && filter.toString().trim() !== "") {
          let fil_1 = await readHierarchyFilter("filter_" + index, filter);
          if (fil_1.responseCode === 200) {
            res = fil_1.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(filter)})`
            );
            res = res[0]
            writeHierarchyFilter("filter_" + index, filter, res);
          }
          iterator["filter_" + index] = res;
        }
      }
    }

    return data;
  }

  async getItemBySlug(params: any): Promise<{}> {
    let _itemSlug = params.slug;
    let _itemState = params.state;
    let _itemSerial = params.serial;

    let data = [];

    data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .cache(10000)
      .where("item.slug in ( :param1 )", { param1: _itemSlug })
      .getMany();
    if (data.length > 0) {
      let iterator: any = data[0];
      let res = [];
      let _where = "";
      if (_itemState) _where = " and item_state = '" + _itemState + "'";
      if (_itemSerial) _where = " and serial_no = '" + _itemSerial + "'";

      let count = await entityManager.query(`   
      CALL GET_DISTINCT_OWNERS(${iterator.id});`);
      count = count[0]
      iterator.user_count = count[0]?.user_count;
      res = await entityManager.query(
        `
      SELECT * from item_sku is2 where item_id = ` +
        iterator.id +
        _where +
        ` order by cast(sale_price as unsigned), cast(sku_code as signed)  Asc limit 0,1`
      );

      if (res.length > 0) {
        Object.assign(iterator, { ...res[0], created_by: iterator.created_by });
      }
      if (iterator.blockchain_id) {
        let blockchain_data = await readHierarchyFilter(
          "blockchain_data",
          iterator.id
        );
        if (blockchain_data.responseCode === 200) {
          res = blockchain_data.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
          );
          res = res[0]
          writeHierarchyFilter("blockchain_data", iterator.id, res);
        }
      }
      iterator.blockchain_id = res;
      for (let index = 1; index <= 30; index++) {
        let filter: any = iterator["filter_" + index];
        if (filter && filter.toString().trim() !== "") {
          let fil_1 = await readHierarchyFilter("filter_" + index, filter);
          if (fil_1.responseCode === 200) {
            res = fil_1.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(filter)})`
            );
            res = res[0]
            writeHierarchyFilter("filter_" + index, filter, res);
          }
          res[0].id = parseInt(filter)
          iterator["filter_" + index] = res;
        }
      }
    }
    return data;
  }

  async getCollectibles(params: any): Promise<{}> {
    let _brand = params.brand; // check filter_1 value
    let _rarity = params.rarity; // check filter_2 value
    let _set = params.set; // check filter_4 value
    let _edition = params.edition; // check filter_3 value
    let _series = params.series; // check filter_7 value
    let _category = params.category; // check filter_5 value
    let _type = params.type; // check item_type column
    let filter = params.filter;



    let _priceStart = params.startprice;
    let _priceEnd = params.endprice;

    let _sortBy = params.sortby?.toLowerCase();
    let _filterBy = params.filterby?.toLowerCase();

    let _pageSize = parseInt(params.pagesize);
    let _pageNo = parseInt(params.pageno);
    var _query=undefined;
    var hash=undefined;




    let data = [];
    let _where = "AND 1=1";

    if (_brand) _where += " AND filter_1 in (" + _brand + ")";

    if (_rarity) _where += " AND filter_2 in ( " + _rarity + ")";

    if (_edition) _where += " AND filter_3 in ( " + _edition + ")";

    if (_set) _where += " AND filter_4 in ( " + _set + ")";

    if (_category) _where += " AND filter_5 in ( " + _category + ")";

    if (_series) _where += " AND filter_7 in ( " + _series + ")";

    if (_type)
      _where += " AND item_type = '" + _type.toLowerCase().trim() + "'";

    if (_priceStart) _where += " AND sale_price >= " + parseFloat(_priceStart);

    if (_priceEnd) _where += " AND sale_price <= " + parseFloat(_priceEnd);

    let sort = "";
    let innerSort = "";
    let onSaleSort = "";
    if (_sortBy === "pricehightolow") {
      onSaleSort = "order by CAST(sale_price as unsigned) DESC"
      sort = "order by CAST(sale_price as unsigned) DESC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) DESC"
    }
    if (_sortBy === "pricelowtohigh") {
      onSaleSort = "order by CAST(sale_price as unsigned) ASC"
      sort = "order by CAST(sale_price as unsigned) ASC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) ASC"
    }
    if (_sortBy === "atoz") {
      onSaleSort = "order by name ASC"
      sort = "order by name ASC"
      innerSort = "order by name ASC"
    }
    if (_sortBy === "ztoa") {
      onSaleSort = "order by name DESC"
      sort = "order by name DESC"
      innerSort = "order by name DESC"
    }
    if (_sortBy === "newest") {
      sort = "order by i.id DESC"
      onSaleSort = "order by item.id DESC"
      innerSort = "order by i.id DESC"
    }
    if (_sortBy === "oldest") {
      sort = "order by i.id ASC"
      onSaleSort = "order by item.id ASC"
      innerSort = "order by i.id ASC"
    }


    let demoString = "";
    let _auctionData = "";
    let _soldoutData = "";
    var filters: any = _filterBy.split(",");
    if (filter?.toLowerCase() === "primary") {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('onauction') ) isk 
        inner join item i 
        on isk.item_id = i.id and
        i.filter_17 = 167  
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id=${_ownerId}
        ${_where}  
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, _auctionData);
        }
      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('purchased') AND owner_id!=${_ownerId}) isk 
        inner join item i 
        on isk.item_id = i.id and
        i.filter_17 = 167  
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id=${_ownerId}
        ${_where}  
        GROUP BY item_id   
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, _soldoutData);
        }
      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

       _query = `
      SELECT * from
      (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
      inner join item_sku isk
      on i.id=isk.item_id 
      WHERE item_state in (${demoString}) and is_resellable=1  AND i.is_listed=1
      AND i.filter_17 = 167  
      ${_where}  
      group by i.id
      ${innerSort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}) item
      inner join item_sku sku 
      on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1 AND sku.owner_id=${_ownerId}
      group by item.id 
      ${onSaleSort}`;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          data = que_res.responseData;
        } else {
          data = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, data);
        }

      }
    }
    else if (filter?.toLowerCase() === "secondary") {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('onauction') ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17 = 167  
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id<>${_ownerId}
        ${_where}  
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, _auctionData);
        }
      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('purchased') AND owner_id!=${_ownerId}) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17 = 167   
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id<>${_ownerId}
        ${_where}  
        GROUP BY item_id   
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, _soldoutData);
        }
      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        _query = `
      SELECT * from
      (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i 
      inner join item_sku isk
      on i.id=isk.item_id 
      WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
      AND  i.filter_17 = 167 
      ${_where}  
      group by i.id
      ${innerSort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}) item
      inner join item_sku sku 
      on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1 AND sku.owner_id<>${_ownerId}
      group by item.id 
      ${onSaleSort}`;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          data = que_res.responseData;
        } else {
          data = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, data);
        }

      }

    }
    else {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _query = `   
      SELECT i.*,isk.* from
      ( SELECT * from item_sku is2 
      where item_state in ('onauction') ) isk 
      inner join item i 
      on isk.item_id = i.id 
      AND i.filter_17 = 167  
      and i.is_resellable=1 AND i.is_listed=1
      ${_where}  
      ${sort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}
      `;

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, _auctionData);
        }
      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _query = `   
      SELECT i.*,isk.* from
      ( SELECT * from item_sku is2 
      where item_state in ('purchased') AND owner_id!=${_ownerId}) isk 
      inner join item i 
      on isk.item_id = i.id 
      AND i.filter_17 = 167  
      and i.is_resellable=1 AND i.is_listed=1
      ${_where}  
      GROUP BY item_id   
      ${sort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}
      `;
        

        hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, _soldoutData);
        }
      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        _query = `
    SELECT * from
    (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i 
    inner join item_sku isk
    on i.id=isk.item_id 
    WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
    AND  i.filter_17 = 167 
    ${_where}  
    group by i.id
    ${innerSort}
    LIMIT ${_pageNo * _pageSize},${_pageSize}) item
    inner join item_sku sku 
    on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1
    group by item.id 
    ${onSaleSort}`;

         hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_collectibleAll", hash);
        if (que_res.responseCode === 200) {
          data = que_res.responseData;
        } else {
          data = await entityManager.query(_query)
          writeQueryResult("_collectibleAll", hash, data);
        }

      }
    }

    data = [..._soldoutData, ..._auctionData, ...data];

    if (data) {
      for await (const iterator of data) {
        let res = [];
        if (iterator.item_state === "purchased") {
          res = await entityManager.query(
            `CALL GET_DISTINCT_OWNERS(${iterator.item_id});`
          );
          res = res[0]
          iterator.user_count = res[0]?.user_count;
        }

        //#region filter_1
        let fil_1 = await readHierarchyFilter("filter_1", iterator.filter_1);
        if (fil_1.responseCode === 200) {
          res = fil_1.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_HIERARCHY(${parseInt(iterator.filter_1)})`
          );
          res = res[0]
          writeHierarchyFilter("filter_1", iterator.filter_1, res);
        }
        iterator.filter_1 = res;
        //#endregion

        //#region filter_2

        let fil_2 = await readHierarchyFilter("filter_2", iterator.filter_2);
        if (fil_2.responseCode === 200) {
          res = fil_2.responseData;
        } else {
          if (iterator.filter_2 != null) {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(iterator.filter_2)})`
            );
            res = res[0]
            writeHierarchyFilter("filter_2", iterator.filter_2, res);
          }
          else res = []
        }
        iterator.filter_2 = res;
        //#endregion

        //#region blockchaindata
        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode === 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }

          iterator.blockchain_id = res;
        } else iterator.blockchain_id = {};
        //#endregion
      }
    }

    return data;
  }

  async getArtWork(params: any): Promise<{}> {
    let _curation = params.curation; // check filter_8 value
    let _artist = params.artist; // check filter_9 value

    let _priceStart = params.startprice;
    let _priceEnd = params.endprice;

    let _collection = params.collection; // check filter_12 value
    let _sortBy = params.sortby?.toLowerCase();
    let _filterBy = params.filterby?.toLowerCase();

    let _pageSize = parseInt(params.pagesize);
    let _pageNo = parseInt(params.pageno);

    let filter = params.filter;


    let data = [];
    let _where = "AND 1=1";

    if (_curation) _where += " AND filter_8 = " + parseInt(_curation);

    if (_artist) _where += " AND filter_9 = " + parseInt(_artist);

    if (_collection) _where += " AND filter_12 = " + parseInt(_collection);

    if (_priceStart) _where += " AND sale_price >= " + parseFloat(_priceStart);

    if (_priceEnd) _where += " AND sale_price <= " + parseFloat(_priceEnd);

    let sort = "";
    let innerSort = "";
    let onSaleSort = "";
    if (_sortBy === "pricehightolow") {
      onSaleSort = "order by CAST(sale_price as unsigned) DESC"
      sort = "order by CAST(sale_price as unsigned) DESC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) DESC"
    }
    if (_sortBy === "pricelowtohigh") {
      onSaleSort = "order by CAST(sale_price as unsigned) ASC"
      sort = "order by CAST(sale_price as unsigned) ASC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) ASC"
    }
    if (_sortBy === "atoz") {
      onSaleSort = "order by name ASC"
      sort = "order by name ASC"
      innerSort = "order by name ASC"
    }
    if (_sortBy === "ztoa") {
      onSaleSort = "order by name DESC"
      sort = "order by name DESC"
      innerSort = "order by name DESC"
    }
    if (_sortBy === "newest") {
      sort = "order by i.id DESC"
      onSaleSort = "order by item.id DESC"
      innerSort = "order by i.id DESC"
    }
    if (_sortBy === "oldest") {
      sort = "order by i.id ASC"
      onSaleSort = "order by item.id ASC"
      innerSort = "order by i.id ASC"
    }

    let demoString = "";
    let _auctionData = ""
    let _soldoutData = ""
    var filters: any = _filterBy.split(",");
    if (filter?.toLowerCase() === "primary") {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        var _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('onauction') ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=168
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id=${_ownerId}
        ${_where}  
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;


        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, _auctionData);
        }

      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        var _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('purchased') AND owner_id!=${_ownerId} ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=168
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id=${_ownerId}
        ${_where}  
        GROUP BY item_id   
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;


        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, _soldoutData);
        }

      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        var _query = `SELECT * from
        (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
        inner join item_sku isk
        on i.id=isk.item_id 
        WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
        AND i.filter_17=168
        ${_where}  
        group by i.id
        ${innerSort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}) item
        inner join item_sku sku 
        on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1 AND sku.owner_id=${_ownerId}
        group by item.id 
        ${onSaleSort}`;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          data = que_res.responseData;
        } else {
          data = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, data);
        }


      }

    } else if (filter?.toLowerCase() === "secondary") {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        var _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('onauction') ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=168
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id<>${_ownerId}
        ${_where}  
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, _auctionData);
        }

      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        var _query = `   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('purchased') AND owner_id!=${_ownerId} ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=168 
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id<>${_ownerId}
        ${_where}  
        GROUP BY item_id   
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, _soldoutData);
        }

      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        var _query = `SELECT * from
        (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
        inner join item_sku isk
        on i.id=isk.item_id 
        WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
        AND i.filter_17=168
        ${_where}  
        group by i.id
        ${innerSort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}) item
        inner join item_sku sku 
        on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1 AND sku.owner_id<>${_ownerId}
        group by item.id 
        ${onSaleSort}`;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          data = que_res.responseData;
        } else {
          data = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, data);
        }


      }


    }

    else {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        var _query = `   
      SELECT i.*,isk.* from
      ( SELECT * from item_sku is2 
      where item_state in ('onauction') ) isk 
      inner join item i 
      on isk.item_id = i.id 
      AND i.filter_17=168
       and i.is_resellable=1 AND i.is_listed=1
      ${_where}  
      ${sort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}
      `;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          _auctionData = que_res.responseData;
        } else {
          _auctionData = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, _auctionData);
        }

      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        var _query = `   
      SELECT i.*,isk.* from
      ( SELECT * from item_sku is2 
      where item_state in ('purchased') AND owner_id!=${_ownerId} ) isk 
      inner join item i 
      on isk.item_id = i.id 
      AND i.filter_17=168
      and i.is_resellable=1 AND i.is_listed=1
      ${_where}  
      GROUP BY item_id   
      ${sort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}
      `;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          _soldoutData = que_res.responseData;
        } else {
          _soldoutData = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, _soldoutData);
        }

      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        var _query = `SELECT * from
      (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
      inner join item_sku isk
      on i.id=isk.item_id 
      WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
      AND i.filter_17=168
      ${_where}  
      group by i.id
      ${innerSort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}) item
      inner join item_sku sku 
      on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1
      group by item.id 
      ${onSaleSort}`;

        var hash = crypto.createHash('md5').update(_query).digest('hex');

        let que_res = await ReadQueryResult("_artworkAll", hash);
        if (que_res.responseCode === 200) {
          data = que_res.responseData;
        } else {
          data = await entityManager.query(_query)
          writeQueryResult("_artworkAll", hash, data);
        }


      }
    }

    data = [..._soldoutData, ..._auctionData, ...data];

    if (data) {
      for await (const iterator of data) {
        let res = [];
        if (iterator.item_state === "purchased") {
          res = await entityManager.query(
            `CALL GET_DISTINCT_OWNERS(${iterator.item_id});`
          );
          res = res[0]

          iterator.user_count = res[0]?.user_count;
        }
        //#region filter_8
        let fil_8 = await readHierarchyFilter("filter_8", iterator.filter_8);
        if (fil_8.responseCode === 200) {
          res = fil_8.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_HIERARCHY(${iterator.filter_8})`
          );
          res = res[0]
          writeHierarchyFilter("filter_8", iterator.filter_8, res);
        }
        iterator.filter_8 = res;
        //#endregion

        //#region filter_2
        let fil_2 = await readHierarchyFilter("filter_2", iterator.filter_2);
        if (fil_2.responseCode === 200) {
          res = fil_2.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_HIERARCHY(${iterator.filter_2})`
          );
          res = res[0]
          writeHierarchyFilter("filter_2", iterator.filter_2, res);
        }
        iterator.filter_2 = res;
        //#endregion

        //#region blockchaindata
        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode === 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }

          iterator.blockchain_id = res;
        } else iterator.blockchain_id = {};
        //#endregion
      }
    }

    return data;
  }

  async getArtGalleryWork(params: any): Promise<{}> {
    let _artist = params.artist_id; // check filter_9 value
    let action = params.action;
    let lobby = params.lobby.toLowerCase();

    if (lobby.includes("live")) {
      lobby = "Live";
    }

    let _collection = params.art_collection_id; // check filter_12 value
    let _sortBy = params.sort_type?.toLowerCase();
    let sorting = params.sorting?.toLowerCase();

    let _pageSize = parseInt(params.limit);
    let _pageNo = parseInt(params.page);

    let data = [];
    let _where = "AND 1=1";

    if (_artist) _where += " AND filter_9 = " + parseInt(_artist);

    if (_collection) _where += " AND filter_12 = " + parseInt(_collection);

    if (lobby) _where += " AND lobby_type = " + `"${lobby}"`;


    let sort = "";
    let innerSort = "";
    if (_sortBy === "desc") {
      sort = "order by oldid DESC";
    } else {
      sort = "order by oldid ASC";
    }
    let _auctionData = "";
    let _soldoutData = "";

    _auctionData = await entityManager.query(`   
  SELECT i.*,isk.* from
  ( SELECT *,id as oldid from item_sku is2 
  where item_state in ('onauction') ) isk 
  inner join item i 
  on isk.item_id = i.id 
  inner join hierarchy h
  on i.filter_9 = h.id and h.parent_id = 2 and i.is_resellable=1 AND i.is_listed=1
  ${_where}  
  ${sort}
  LIMIT ${_pageNo * _pageSize},${_pageSize}
  `);

    _soldoutData = await entityManager.query(`   
  SELECT i.*,isk.* from
  ( SELECT *,id as oldid  from item_sku is2 
  where item_state in ('purchased') ) isk 
  inner join item i 
  on isk.item_id = i.id 
  inner join hierarchy h
  on i.filter_9 = h.id and h.parent_id = 2 and i.is_resellable=1 AND i.is_listed=1
  ${_where}  
  GROUP BY item_id   
  ${sort}
  LIMIT ${_pageNo * _pageSize},${_pageSize}
  `);

    data = await entityManager.query(`
SELECT * from
(SELECT Min(isk.sale_price) sku_price,isk.id as oldid ,i.* FROM item i
inner join hierarchy h
on i.filter_9 = h.id and h.parent_id = 2
inner join item_sku isk
on i.id=isk.item_id 
WHERE item_state in ('onSale') and is_resellable=1 AND i.is_listed=1
${_where}  
group by i.id
LIMIT ${_pageNo * _pageSize},${_pageSize}) item
inner join item_sku sku 
on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in ('onSale') and is_resellable=1 AND sku.is_listed=1
group by item.id 
${sort}
`);

    data = [..._soldoutData, ..._auctionData, ...data];
    if (data) {
      for await (const iterator of data) {
        let res = [];
        for (let index = 1; index <= 30; index++) {
          if (iterator["filter_" + index] !== undefined) {
            let filter: any = iterator["filter_" + index];

            if (filter && filter.toString().trim() !== "") {
              let fil_1 = await readHierarchyFilter("filter_" + index, filter);
              if (fil_1.responseCode === 200) {
                res = fil_1.responseData;
              } else {
                res = await entityManager.query(
                  `CALL GET_HIERARCHY(${parseInt(filter)})`
                );
                res = res[0]
                writeHierarchyFilter("filter_" + index, filter, res);
              }
              iterator["filter_" + index] = res;
            }
          }
        }
      }
    }

    return data;
  }

  async getComics(params: any): Promise<{}> {
    let _publisher = params.publisher; // check filter_8 value
    let _artist = params.artist; // check filter_9 value

    let _priceStart = params.startprice;
    let _priceEnd = params.endprice;

    let _category = params.category; // check filter_12 value
    let _sortBy = params.sortby?.toLowerCase();
    let _filterBy = params.filterby?.toLowerCase();

    let _pageSize = parseInt(params.pagesize);
    let _pageNo = parseInt(params.pageno);
    let filter = params.filter;

    let data = [];
    let _where = "AND 1=1";

    if (_publisher) _where += " AND filter_11 = " + parseInt(_publisher);

    if (_artist) _where += " AND filter_9 = " + parseInt(_artist);

    if (_category) _where += " AND filter_5 = " + parseInt(_category);

    if (_priceStart) _where += " AND sale_price >= " + parseFloat(_priceStart);

    if (_priceEnd) _where += " AND sale_price <= " + parseFloat(_priceEnd);

    let sort = "";
    let innerSort = "";
    let onSaleSort = "";
    if (_sortBy === "pricehightolow") {
      onSaleSort = "order by CAST(sale_price as unsigned) DESC"
      sort = "order by CAST(sale_price as unsigned) DESC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) DESC"
    }
    if (_sortBy === "pricelowtohigh") {
      onSaleSort = "order by CAST(sale_price as unsigned) ASC"
      sort = "order by CAST(sale_price as unsigned) ASC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) ASC"
    }
    if (_sortBy === "atoz") {
      onSaleSort = "order by name ASC"
      sort = "order by name ASC"
      innerSort = "order by name ASC"
    }
    if (_sortBy === "ztoa") {
      onSaleSort = "order by name DESC"
      sort = "order by name DESC"
      innerSort = "order by name DESC"
    }
    if (_sortBy === "newest") {
      sort = "order by i.id DESC"
      onSaleSort = "order by item.id DESC"
      innerSort = "order by i.id DESC"
    }
    if (_sortBy === "oldest") {
      sort = "order by i.id ASC"
      onSaleSort = "order by item.id ASC"
      innerSort = "order by i.id ASC"
    }
    let demoString = "";
    let _auctionData = "";
    let _soldoutData = "";
    var filters: any = _filterBy.split(",");
    if (filter?.toLowerCase() === "primary") {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _auctionData = await entityManager.query(`   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('onauction') ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=752
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id=${_ownerId}
        ${_where}  
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `);
      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _soldoutData = await entityManager.query(`   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('purchased') AND owner_id!=${_ownerId}) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=752
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id=${_ownerId}      
          ${_where}  
        GROUP BY item_id   
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `);
      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        data = await entityManager.query(`
        SELECT * from
        (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
        inner join item_sku isk
        on i.id=isk.item_id 
        WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
        AND i.filter_17=752
        ${_where}  
        group by i.id
        ${innerSort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}) item
        inner join item_sku sku 
        on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1 AND sku.owner_id=${_ownerId}
        group by item.id 
        ${onSaleSort}
        `);
      }
    }
    else if (filter?.toLowerCase() === "secondary") {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _auctionData = await entityManager.query(`   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('onauction') ) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=752
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id<>${_ownerId}
        ${_where}  
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `);
      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _soldoutData = await entityManager.query(`   
        SELECT i.*,isk.* from
        ( SELECT * from item_sku is2 
        where item_state in ('purchased') AND owner_id!=${_ownerId}) isk 
        inner join item i 
        on isk.item_id = i.id 
        AND i.filter_17=752
        and i.is_resellable=1 AND i.is_listed=1 AND isk.owner_id<>1
        ${_where}  
        GROUP BY item_id   
        ${sort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}
        `);
      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        data = await entityManager.query(`
        SELECT * from
        (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
        inner join item_sku isk
        on i.id=isk.item_id 
        WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
        AND i.filter_17=752
        ${_where}  
        group by i.id
        ${innerSort}
        LIMIT ${_pageNo * _pageSize},${_pageSize}) item
        inner join item_sku sku 
        on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1 AND sku.owner_id<>${_ownerId}
        group by item.id 
        ${onSaleSort}
        `);
      }
    }
    else {
      if (filters.includes("onauction")) {
        filters = filters.filter((item: string) => item != "onauction");

        _auctionData = await entityManager.query(`   
      SELECT i.*,isk.* from
      ( SELECT * from item_sku is2 
      where item_state in ('onauction') ) isk 
      inner join item i 
      on isk.item_id = i.id 
      AND i.filter_17=752
      and i.is_resellable=1 AND i.is_listed=1
      ${_where}  
      ${sort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}
      `);
      }

      if (filters.includes("soldout")) {
        filters = filters.filter((item: string) => item != "soldout");

        _soldoutData = await entityManager.query(`   
      SELECT i.*,isk.* from
      ( SELECT * from item_sku is2 
      where item_state in ('purchased') AND owner_id!=${_ownerId}) isk 
      inner join item i 
      on isk.item_id = i.id 
      AND i.filter_17=752
      and i.is_resellable=1 AND i.is_listed=1
      ${_where}  
      GROUP BY item_id   
      ${sort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}
      `);
      }

      if (filters.length > 0) {
        for (let element of filters) {
          if (element == "soldout") element = "purchased";
          demoString += "'" + element + "',";
        }
        demoString = demoString.slice(0, -1);

        filters = filters.toString();

        data = await entityManager.query(`
      SELECT * from
      (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
      inner join item_sku isk
      on i.id=isk.item_id 
      WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1
      AND i.filter_17=752
      ${_where}  
      group by i.id
      ${innerSort}
      LIMIT ${_pageNo * _pageSize},${_pageSize}) item
      inner join item_sku sku 
      on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1
      group by item.id 
      ${onSaleSort}
      `);
      }
    }

    data = [..._soldoutData, ..._auctionData, ...data];

    if (data) {
      for await (const iterator of data) {
        console.log(iterator);
        let res = [];
        if (iterator.item_state === "purchased") {
          res = await entityManager.query(
            `CALL GET_DISTINCT_OWNERS(${iterator.item_id});`
          );
          res = res[0]
          iterator.user_count = res[0]?.user_count;
        }
        //#region filter_11
        let fil_11 = await readHierarchyFilter("filter_11", iterator.filter_11);
        if (fil_11.responseCode === 200) {
          res = fil_11.responseData;
        } else {
          if (iterator.filter_11 != null) {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(iterator.filter_11)})`
            );

            res = res[0]
            writeHierarchyFilter("filter_11", iterator.filter_11, res);
          }
          else res = []
        }
        iterator.filter_11 = res;
        //#endregion

        //#region filter_2
        let fil_2 = await readHierarchyFilter("filter_2", iterator.filter_2);
        if (fil_2.responseCode === 200) {
          res = fil_2.responseData;
        } else {
          if (iterator.filter_2 != null) {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(iterator.filter_2)})`
            );
            res = res[0]
            writeHierarchyFilter("filter_2", iterator.filter_2, res);
          }
          else res = []
        }
        iterator.filter_2 = res;
        //#endregion

        //#region blockchaindata
        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode === 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }

          iterator.blockchain_id = res;
        } else iterator.blockchain_id = {};
        //#endregion
      }
    }

    return data;
  }
  async getAllSkus(params: any): Promise<{}> {
    var item_id = params.itemid;
    var _sortBy = params.sortby;
    var _filters = params.filterby.split(",");
    let sort: any = "ASC";
    let page = params.pageno;
    let pageSize = params.pagesize;
    let data = {};
    let demoString = "";
    if (_sortBy === "serialhightolow") sort = "DESC";
    else sort = "ASC";
    if (_filters.length > 0) {
      for (let element of _filters) {
        if (element == "soldout") element = "purchased";
        demoString += "'" + element + "',";
      }
    }
    demoString = demoString.slice(0, -1);

    data = await getConnection()
      .getRepository(AssetSku)
      .createQueryBuilder("item_sku")
      .where("item_sku.item_id in ( :param1 )", { param1: item_id })
      .andWhere(`item_sku.item_state in (${demoString})`)
      .orderBy("id", sort)
      .take(pageSize)
      .skip(page * pageSize)
      .getMany();

    return data;
  }
  async getAllitemSkus(params: any): Promise<{}> {
    var item_id = params.itemid.split(",");
    let data = {};

    data = await getConnection()
      .createQueryBuilder(AssetSku, "item_sku")
      .select("item_sku")
      .where("item_sku.item_id in ( :param1 )", { param1: item_id })
      .getRawMany();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 2000).compose();
  }

  async getCollectibleItem(params: any): Promise<{}> {
    let _code = params.code; // check filter_1 value
    let _codes = _code.split(",");

    let data = [];
    let _where = "";

    _code = "";
    _codes.forEach((item: string) => {
      _code += "'" + item + "',";
    });
    _code += "'1'";
    _where += "code in (" + _code + ")";

    let sort = "ORDER BY sale_price ASC";

    data = await entityManager.query(`
    SELECT * from item where code in (${_code})`);

    if (data) {
      for await (const iterator of data) {
        let res = [];

        //#region filter_1
        let fil_1 = await readHierarchyFilter("filter_1", iterator.filter_1);
        if (fil_1.responseCode === 200) {
          res = fil_1.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_HIERARCHY(${parseInt(iterator.filter_1)})`
          );
          res = res[0]
          writeHierarchyFilter("filter_1", iterator.filter_1, res);
        }
        iterator.filter_1 = res;
        //#endregion

        //#region filter_2
        let fil_2 = await readHierarchyFilter("filter_2", iterator.filter_2);
        if (fil_2.responseCode === 200) {
          res = fil_2.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_HIERARCHY(${parseInt(iterator.filter_2)})`
          );
          res = res[0]
          writeHierarchyFilter("filter_2", iterator.filter_2, res);
        }
        iterator.filter_2 = res;
        //#endregion

        //#region item_skus

        res = await entityManager.query(
          `SELECT * from item_sku is2 where item_id = ${iterator.id} 
            order by ( case when item_state = 'onSale' then 1
            when item_state = 'onAuction' then 2
            when item_state = 'purchased' then 3
            else 1
            end),sale_price Asc
            LIMIT 0,1`
        );
        console.log(res)
    

        if (res.length>0) {
          Object.assign(iterator, res[0]);
        }
        
        //#endregion

        //#region blockchaindata
        let blockchain_data = await readHierarchyFilter(
          "blockchain_data",
          iterator.id
        );
        if (blockchain_data.responseCode === 200) {
          res = blockchain_data.responseData;
        } else {
          if(iterator?.blockchain_id){
          res = await entityManager.query(
            `CALL GET_BLOCKCHAIN(${iterator?.blockchain_id})`
          );
          res = res[0]
          writeHierarchyFilter("blockchain_data", iterator?.id, res);
          }  
        }

        iterator.blockchain_id = res;
        //#endregion
      }
    }

    return data;
  }

  async getFilters(params: any): Promise<{}> {
    let res = [];
    for (let index = 1; index <= 30; index++) {
      if (params["filter_" + index] !== undefined) {
        let filter: any = params["filter_" + index];
        if (filter && filter.toString().trim() !== "") {
          let fil_1 = await readHierarchyFilter("filter_" + index, filter);
          if (fil_1.responseCode === 200) {
            res = fil_1.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(filter)})`
            );
            res = res[0]
            writeHierarchyFilter("filter_" + index, filter, res);
          }
          params["filter_" + index] = res;
        }
      }
    }
    if (params.blockchain_id) {
      let blockchain_data = await readHierarchyFilter(
        "blockchain_data",
        params.blockchain_id
      );
      if (blockchain_data.responseCode === 200) {
        res = blockchain_data.responseData;
      } else {
        res = await entityManager.query(
          `CALL GET_BLOCKCHAIN(${params.blockchain_id})`
        );
        res = res[0]
        writeHierarchyFilter("blockchain_data", params.blockchain_id, res);
      }

      params.blockchain_id = res;
    }
    return params;
  }

  dynamicSort(property: any, sort: any) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a: any, b: any) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      if (sort == "desc") {
        var result =
          a[property] > b[property] ? -1 : a[property] < b[property] ? 1 : 0;
        return result * sortOrder;
      }
      if (sort == "asc") {
        result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
      }
    };
  }

  async lockAsset(body: any, queryRunner: QueryRunner): Promise<{}> {
    var id = body.skuid;
    var serial = body.serialnumber;
    var is_locked = body.lock;
    var userid = body.userid;
    let data = await getConnection()
      .createQueryBuilder(AssetSku, "asset_sku")
      .select("asset_sku")
      .where("asset_sku.id = :id and asset_sku.serial_no = :serial ", {
        id: id,
        serial: serial,
      })
      .getOne();
    if (
      data?.item_state.toLowerCase() === "onsale" ||
      data?.item_state.toLowerCase() === "onauction" ||
      data?.item_state.toLowerCase() === "purchased" ||
      is_locked === false
    ) {
      var resData = await getConnection()
        .createQueryBuilder(AssetSku, "item_sku")
        .update("item_sku")
        .set({ is_locked: is_locked, updated_by: userid })
        .andWhere({ id: id })
        .execute();

      if (resData) {
        let dataResponse = await getConnection()
          .createQueryBuilder(AssetSku, "asset_sku")
          .select("asset_sku")
          .where("asset_sku.id = :id", { id: id })
          .getOne();

        return new Response(dataResponse, 200);
      } else return new Response("", 2000).compose();
    }

    return new Response("", 2000).compose();
  }
  async changeOnwerId(params: any): Promise<{}> {
    var id = params.skuid.split(",");
    var owner_id = params.buyerid;
    var transValue = params?.transvalue;
    let data = await getConnection()
      .createQueryBuilder(AssetSku, "asset_sku")
      .select("asset_sku")
      .where("asset_sku.id in (:id)", { id: id })
      .getOne();
    if (data) {
      let setQuery1: any = { owner_id: owner_id, item_state: "purchased", updated_at: new Date().toISOString() };
      let setQuery2: any = { owner_id: owner_id, item_state: "purchased", updated_at: new Date().toISOString() };
      if (transValue) {
        setQuery1.sale_price = transValue;
        setQuery1.price = transValue;
        setQuery2.price = transValue;
      }

      await getConnection()
        .createQueryBuilder()
        .update(AssetSku)
        .set(setQuery1)
        .where("id in (:id) ", { id: id })
        .execute();

      var resData = await getConnection()
        .createQueryBuilder()
        .update(AssetSummary)
        .set(setQuery2)
        .where("item_sku_id in (:id )", { id: id })
        .execute();

      if (resData) return new Response(resData, 200);
      else return new Response("", 2000).compose();
    }

    return new Response("", 2000).compose();
  }

  async setSKUTrade(body: any): Promise<{}> {
    var itemState = body.item_state;
    var skuid = body.item_sku_id;
    var userId = body.userid;
    var itemId = body.item_id;
    var salePrice = body.sale_price;

    var resData = await getConnection().createQueryBuilder().update(AssetSku);
    if (body.isAdmin) {
      resData
        .set({ item_state: itemState })
        .where("id = :id and item_id = :item_id", { id: skuid, item_id: itemId })
        .execute()
      let summaryData = await getConnection()
        .createQueryBuilder()
        .update(AssetSummary)
        .set({ item_state: itemState })
        .where("item_sku_id = :id and item_id = :item_id", {
          id: skuid,
          item_id: itemId,
        })
        .execute();
      if (summaryData) return new Response(skuid, 200);
      else return new Response("", 2000).compose();
    }
    if (itemState.toLowerCase() == "onauction") {
      resData.set({ item_state: itemState });

      let summaryData = await getConnection()
        .createQueryBuilder()
        .update(AssetSummary)
        .set({ item_state: itemState })
        .where("item_sku_id = :id and item_id = :item_id", {
          id: skuid,
          item_id: itemId,
        })
        .andWhere("owner_id=:owner_id", { owner_id: userId })
        .execute();
    } else {
      resData.set({ item_state: itemState, sale_price: salePrice });
      await getConnection()
        .createQueryBuilder()
        .update(AssetSummary)
        .set({ item_state: itemState, price: salePrice })
        .where("item_sku_id = :id and item_id = :item_id", {
          id: skuid,
          item_id: itemId,
        })
        .andWhere("owner_id=:owner_id", { owner_id: userId })
        .execute();
    }
    resData
      .where("id = :id and item_id = :item_id", { id: skuid, item_id: itemId })
      .andWhere("owner_id=:owner_id", { owner_id: userId })
      .execute();

    if (resData) return new Response(skuid, 200);
    else return new Response("", 2000).compose();
  }

  async getallassetskusbyslug(params: any): Promise<{}> {
    var slug = params.slug;
    var pagesize = params.pagesize;
    var pageno = params.pageno;
    var _sortBy = params.sortby;
    let demoString=''
    var filterby=params?.filterby?.toLowerCase()?.split(',');
    console.log(filterby)
    let sort: any = 'ASC';
    if (_sortBy === "serialhightolow") sort = 'DESC';
    else sort = "ASC";
    let data: any = {};
    if(filterby?.length>0){
      for (let element of filterby) {
        if (element == "soldout") element = "purchased";
        demoString += "'" + element + "',";
      }   
      demoString = demoString.slice(0, -1);
      data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .select(
        `item.id,item.code,item.name,item.slug,item.count,item.thumbnail_url,
      item.filter_1,item.filter_2,item.filter_3,item.filter_4,item.filter_5,item.filter_6,
      item.generation,item_sku.id,item_sku.sku_code,item_sku.blockchain_id,item_sku.serial_no,
        item_sku.item_state
      `
      )
      .where(`item_sku.item_state in (${demoString})`)
      .andWhere(`item.slug = :param1 ORDER BY item_sku.id ${sort} limit ${pageno * pagesize}, ${pagesize}`, {
        param1: slug,
      })
      .getRawMany();
    }else{
      data = await getConnection()
      .getRepository(Asset)
      .createQueryBuilder("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .select(
        `item.id,item.code,item.name,item.slug,item.count,item.thumbnail_url,
      item.filter_1,item.filter_2,item.filter_3,item.filter_4,item.filter_5,item.filter_6,
      item.generation,item_sku.id,item_sku.sku_code,item_sku.blockchain_id,item_sku.serial_no,
        item_sku.item_state
      `
      )
      .where(`item.slug = :param1 ORDER BY item_sku.id ${sort} limit ${pageno * pagesize}, ${pagesize}`, {
        param1: slug,
      })
      .getRawMany();
    }

    for await (const iterator of data) {
      let res = [];
      if (iterator.blockchain_id) {
        let blockchain_data = await readHierarchyFilter(
          "blockchain_data",
          iterator.id
        );

        if (blockchain_data.responseCode == 200) {
          res = blockchain_data.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
          );
          res = res[0]
          writeHierarchyFilter("blockchain_data", iterator.id, res);
          console.log(res);
        }
      }
      iterator.blockchain_id = res;

      for (let index = 1; index <= 30; index++) {
        let filter: string = iterator["filter_" + index];

        if (
          filter &&
          filter.toString().trim() !== "" &&
          !isNaN(parseInt(filter)) &&
          filter != null
        ) {
          res = [];
          let fil_1 = await readHierarchyFilter("filter_" + index, filter);
          if (fil_1.responseCode === 200) {
            res = fil_1.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_HIERARCHY(${parseInt(filter)})`
            );
            res = res[0]
            writeHierarchyFilter("filter_" + index, filter, res);
          }
          iterator["filter_" + index] = res;
        }
        data[0]["filter_" + index] = res;
      }
    }

    return data;
  }

  async cancelSKUTrade(body: any, queryRunner: QueryRunner): Promise<{}> {
    var itemState = body.item_state;
    var skuid = body.item_sku_id;
    var userId = body.userid;
    var itemId = body.item_id;

    var assetData: any = await getConnection()
      .createQueryBuilder(AssetSku, "asset")
      .select("asset")
      .where("asset.id=:id", { id: skuid })
      .getOne();

    var getPrice = assetData.price;

    var resData = await getConnection()
      .createQueryBuilder()
      .update(AssetSku)
      .set({ item_state: itemState, sale_price: getPrice })
      .where("id = :id and item_id = :item_id", { id: skuid, item_id: itemId })
      .andWhere("owner_id=:owner_id", { owner_id: userId })
      .execute();

    if (resData) {
      await getConnection()
        .createQueryBuilder()
        .update(AssetSummary)
        .set({ item_state: itemState })
        .where("item_sku_id = :item_sku_id", { item_sku_id: skuid })
        .execute();

      let res = await getConnection()
        .createQueryBuilder()
        .update(AssetSku)
        .set({ item_state: itemState, sale_price: getPrice })
        .where("id = :id", { id: skuid })
        .execute();
      if (res) {
        return new Response(skuid, 200);
      } else return new Response("", 2000).compose();
    } else return new Response("", 2000).compose();
  }

  async getSkuDetail(params: any): Promise<{}> {
    var skus = params.skuid.split(",");

    let data = await getConnection()
      .createQueryBuilder(AssetSku, "item")
      .select("item")
      .where("item.id in ( :param1 )", { param1: skus })
      .getRawMany();
    return data;
  }

  async generateReward(params: any): Promise<{}> {
    var code = params.itemcode;
    let data = await getConnection()
      .createQueryBuilder(Asset, "item")
      .select("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .where("item.code in ( :param1 )", { param1: code })
      .andWhere("item_sku.owner_id = :owner_id", { owner_id: OWNER_ID })
      .getRawOne();
    if (data) return new Response(data, 200);
    return new Response("", 2000);
  }

  async getAvatars(params: any): Promise<{}> {
    let data = await entityManager.query(
      `SELECT id,name,thumbnail_url,description FROM item where is_resellable=0`
    );

    if (data) {
      return new Response(data, 200);
    }
    return new Response("", 2000);
  }

  async getRevealPackAssets(params: any): Promise<{}> {
    let data: any = {};
    let finalArray: any = [];
    for await (const element of params) {
      let query: any = "";
      let keys = Object.keys(element);

      for (let index = 0; index < keys.length; index++) {
        if (keys[index] !== "nftCount" || keys[index] == "code")
          query += ` AND i.${keys[index]}="${element[keys[index]]}"`;
      }

      //is listed 0 (hidden items) and rand() added to get random items.
      data = await entityManager.query(
        ` SELECT * FROM item i
      inner join item_sku is2
      on i.id=is2.item_id AND is2.item_state="purchased" AND is2.owner_id=${_ownerId}
      where i.is_resellable=1 AND i.is_listed=0${query} 
      ORDER by RAND()
      LIMIT ${element.nftCount};
      `
      );
      if (data?.length > 0) {
        finalArray.push(...data);
      }
    }

    if (finalArray?.length > 0) {
      return new Response(finalArray, 200);
    }
    return new Response("", 2000);
  }

  async checkUserAsset(params: any): Promise<{}> {
    var code = params.code;
    var userID = params.userid;
    let data = await getConnection()
      .createQueryBuilder(Asset, "item")
      .select("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .where("item.code in ( :param1 )", { param1: code })
      .andWhere("item_sku.owner_id = :owner_id", { owner_id: userID })
      .getRawMany();
    if (data) return new Response(data, 200);
    return new Response("", 2000);
  }

  async increaseTrendCount(params: any): Promise<{}> {
    var id = params.skuid.split(",");
    var itemID = [];
    var resData: any = await getConnection()
      .createQueryBuilder(AssetSummary, "item")
      .select("item.item_id")
      .distinct(true)
      .where("item.item_sku_id in ( :param1 )", { param1: id })
      .getRawMany();

    for await (const iterator of resData) {
      itemID.push(iterator.item_item_id);
    }
    await getConnection()
      .createQueryBuilder()
      .update(Asset)
      .set({ trend_count: () => "trend_count + 1" })
      .where("id in (:id )", { id: itemID })
      .execute();

    resData = await getConnection()
      .createQueryBuilder()
      .update(AssetSummary)
      .set({ trend_count: () => "trend_count + 1" })
      .where("item_sku_id in (:id )", { id: id })
      .execute();

    if (resData) return new Response(itemID, 200);
    else return new Response("", 2000).compose();
  }

  async changeStatus(params: any): Promise<{}> {
    var id = params.skuid.split(",");
    let data = await getConnection()
      .createQueryBuilder(AssetSku, "asset_sku")
      .select("asset_sku")
      .where("asset_sku.id in (:id)", { id: id })
      .getOne();
    if (data) {
      let setQuery1: any = { item_state: "purchased" };
      await getConnection()
        .createQueryBuilder()
        .update(AssetSku)
        .set(setQuery1)
        .where("id in (:id) ", { id: id })
        .execute();

      var resData = await getConnection()
        .createQueryBuilder()
        .update(AssetSummary)
        .set(setQuery1)
        .where("item_sku_id in (:id )", { id: id })
        .execute();

      if (resData) return new Response(resData, 200);
      else return new Response("", 2000).compose();
    }

    return new Response("", 2000).compose();
  }

  async getRecommendedItems(params: any): Promise<{}> {
    let userID = params.userid;
    let pageNo = params.pageno;
    let pageSize = params.pagesize;
    let data: any;

    data = await entityManager.query(
      `SELECT * from item i2
      INNER JOIN(
      SELECT filter_1,Count(filter_1) as brand_count from item i
            inner JOIN(
            SELECT DISTINCT(item_summary.item_id) as item_id FROM item_summary 
                  WHERE owner_id=${userID}
                  ORDER BY price
                ) iss
                on i.id=iss.item_id
                GROUP by filter_1
                ORDER by brand_count DESC
         )i3
         on i3.filter_1=i2.filter_1
         where is_listed=1
                   ORDER by brand_count DESC
          LIMIT ${pageNo * pageSize},${pageSize}
          `
    );

    if (data) {
      for await (const iterator of data) {
        let count = await entityManager.query(`   
        CALL GET_DISTINCT_OWNERS(${iterator.id});`);
        count = count[0]
        iterator.user_count = count[0]?.user_count;

        let res = await entityManager.query(
          `
        SELECT * from item_sku is2 where item_id = ` +
          iterator.id +
          ` order by cast(sale_price as unsigned)  ASC limit 0,1`
        );

        if (res.length > 0) {
          Object.assign(iterator, {
            ...res[0],
            created_by: iterator.created_by,
          });
        }
        for (let index = 1; index <= 30; index++) {
          if (iterator["filter_" + index] !== undefined) {
            let filter: any = iterator["filter_" + index];

            if (filter && filter.toString().trim() !== "") {
              let fil_1 = await readHierarchyFilter("filter_" + index, filter);
              if (fil_1.responseCode === 200) {
                res = fil_1.responseData;
              } else {
                res = await entityManager.query(
                  `CALL GET_HIERARCHY(${parseInt(filter)})`
                );
                res = res[0]
                writeHierarchyFilter("filter_" + index, filter, res);
              }
              iterator["filter_" + index] = res;
            }
          }
        }

        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode === 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }
        }
        iterator.blockchain_id = res;
      }
      return new Response(data, 200).compose();
    }
    return new Response("", 2000).compose();
  }

  async getUserBrands(params: any): Promise<{}> {
    let userID = params.userid;
    let data: any;

    data = await entityManager.query(
      `SELECT filter_1,Count(filter_1) as brand_count from item i
      inner JOIN(
      SELECT DISTINCT(item_summary.item_id) as item_id FROM item_summary 
            WHERE owner_id=${userID}
            ORDER BY price
          ) iss
          on i.id=iss.item_id
          GROUP by filter_1
          ORDER by brand_count DESC;`
    );

    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();
  }
  async getReleasedMonth(params: any): Promise<{}> {
    let data: any;
    let skudata: any;
    var pageno = params.pageno;
    var pageSize = params.pagesize;
    data = await entityManager.query(
      `SELECT * from item where DATEDIFF(CURDATE(),created_at )<=30 AND is_listed=1 AND is_resellable=1 limit ${pageno},${pageSize}`
    );

    if (data) {
      for (const iterator of data) {
        let count = await entityManager.query(`   
        CALL GET_DISTINCT_OWNERS(${iterator.id});`);
        count = count[0]
        iterator.user_count = count[0]?.user_count;

        let res = await entityManager.query(
          `
          SELECT * from item_sku is2 where item_id = ` +
          iterator.id +
          ` AND item_state="onSale" order by cast(sale_price as unsigned)  ASC limit 0,1`
        );

        if (res.length > 0) {
          Object.assign(iterator, {
            ...res[0],
            created_by: iterator.created_by,
          });
        }
        for (let index = 1; index <= 30; index++) {
          if (iterator["filter_" + index] !== undefined) {
            let filter: any = iterator["filter_" + index];

            if (filter && filter.toString().trim() !== "") {
              let fil_1 = await readHierarchyFilter("filter_" + index, filter);
              if (fil_1.responseCode === 200) {
                res = fil_1.responseData;
              } else {
                res = await entityManager.query(
                  `CALL GET_HIERARCHY(${parseInt(filter)})`
                );
                res = res[0]
                writeHierarchyFilter("filter_" + index, filter, res);
              }
              iterator["filter_" + index] = res;
            }
          }
        }

        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode === 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }
        }
        iterator.blockchain_id = res;
      }
    }

    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();
  }

  async getArtWorkForArtist(params: any): Promise<{}> {
    let _sortBy = params.sortby?.toLowerCase();
    let _filterBy = params.filterby?.toLowerCase();

    let _pageSize = parseInt(params.pagesize);
    let _pageNo = parseInt(params.pageno);
    let _artistID = parseInt(params.artistid);

    let data = [];
    let finalResult: any = {};
    let _where = "AND 1=1";

    let innerSort = "";
    let onSaleSort = "";
    if (_sortBy === "pricehightolow") {
      onSaleSort = "order by CAST(sale_price as unsigned) DESC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) DESC"
    }
    if (_sortBy === "pricelowtohigh") {
      onSaleSort = "order by CAST(sale_price as unsigned) ASC"
      innerSort = "order by CAST(Min(sale_price) as unsigned) ASC"
    }
    if (_sortBy === "atoz") {
      onSaleSort = "order by name ASC"
      innerSort = "order by name ASC"
    }
    if (_sortBy === "ztoa") {
      onSaleSort = "order by name DESC"
      innerSort = "order by name DESC"
    }
    if (_sortBy === "newest") {
      onSaleSort = "order by item.id DESC"
      innerSort = "order by i.id DESC"
    }
    if (_sortBy === "oldest") {
      onSaleSort = "order by item.id ASC"
      innerSort = "order by i.id ASC"
    }

    let demoString = "";
    var filters: any = _filterBy.split(",");

    if (filters.length > 0) {
      for (let element of filters) {
        if (element == "soldout") element = "purchased";
        demoString += "'" + element + "',";
      }
      demoString = demoString.slice(0, -1);

      filters = filters.toString();

      data = await entityManager.query(`
    SELECT * from
    (SELECT Min(isk.sale_price) sku_price ,i.* FROM item i
    inner join item_sku isk
    on i.id=isk.item_id 
    WHERE item_state in (${demoString}) and is_resellable=1 AND i.is_listed=1 AND i.filter_9 = ${_artistID}
    ${_where}  
    group by i.id
    ${innerSort}
    LIMIT ${_pageNo * _pageSize},${_pageSize}) item
    inner join item_sku sku 
    on item.id=sku.item_id and item.sku_price=sku.sale_price and item_state in (${demoString}) and is_resellable=1 AND sku.is_listed=1
    group by item.id 
    ${onSaleSort}
    `)
    }

    if (data) {
      let count = await entityManager.query(`SELECT Count(*) as count from item i where i.filter_9=${_artistID};`)
      if (count) {
        finalResult.count = count[0]?.count;
      }
      for await (const iterator of data) {
        let res = [];
        //#region filter_8
        let fil_9 = await readHierarchyFilter("filter_8", iterator.filter_9);
        if (fil_9.responseCode === 200) {
          res = fil_9.responseData;
        } else {
          res = await entityManager.query(
            `
          SELECT id,category_name,name,image,description,tag from hierarchy h where h.id = ` +
            iterator.filter_9
          );
          writeHierarchyFilter("filter_9", iterator.filter_9, res);
        }
        iterator.filter_9 = res;
        //#endregion

        //#region filter_2
        let fil_2 = await readHierarchyFilter("filter_2", iterator.filter_2);
        if (fil_2.responseCode === 200) {
          res = fil_2.responseData;
        } else {
          res = await entityManager.query(
            `CALL GET_HIERARCHY(${parseInt(iterator.filter_2)})`
          );
          res = res[0]
          writeHierarchyFilter("filter_2", iterator.filter_2, res);
        }
        iterator.filter_2 = res;
        //#endregion

        //#region blockchaindata
        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode === 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }

          iterator.blockchain_id = res;
        } else iterator.blockchain_id = {};
        //#endregion
      }
    }
    finalResult.data = data;
    return finalResult;
  }

  async getRedirectAccess(params: any): Promise<{}> {
    let tokenID = params.tokenID
    let data: any;

    data = await entityManager.query(
      `Select code,item_id, owner_id from item ii
      inner join
      (Select item_id, owner_id from item_sku
            INNER join
            (
            SELECT item_id  as itemID FROM item_sku
            where token_id=${tokenID}
             ) iss
                on item_sku.item_id=iss.itemID) si
                on ii.id = si.item_id;`
    );

    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();
  }

  async getAssetForCampaigns(params: any): Promise<{}> {

    let _brand = params.brand; // check filter_1 value
    let _rarity = params.rarity; // check filter_2 value
    let _set = params.set; // check filter_4 value
    let _edition = params.edition; // check filter_3 value
    let _series = params.series; // check filter_7 value
    let _category = params.category; // check filter_5 value
    let _type = params.type; // check item_type column
    let _itemID = params.itemid; // check item_type column
    let _codeType = params.code_type; // check item_type column
    let _artist = params.artist; // check arist column
    let _publisher = params.publisher; // check publisher column
    let _curation = params.curation; // check curation column
    let _collection = params.collection; // check collection column

    let _where = "where 1=1"
    let _data = []
    let state = 'onsale';
    if (_codeType === "redeem") state = 'purchased'

    if (_brand) _where += " AND item.filter_1 in (" + _brand + ")";

    if (_rarity) _where += " AND item.filter_2 in ( " + _rarity + ")";

    if (_edition) _where += " AND item.filter_3 in ( " + _edition + ")";

    if (_set) _where += " AND item.filter_4 in ( " + _set + ")";

    if (_category) _where += " AND item.filter_5 in ( " + _category + ")";

    if (_series) _where += " AND item.filter_7 in ( " + _series + ")";

    if (_artist) _where += " AND item.filter_9 in ( " + _artist + ")";

    if (_publisher) _where += " AND item.filter_11 in ( " + _publisher + ")";

    if (_curation) _where += " AND item.filter_8 in ( " + _curation + ")";

    if (_collection) _where += " AND item.filter_15 in ( " + _collection + ")";

    if (_type) _where += " AND item.item_type = '" + _type.toLowerCase().trim() + "'";

    if (_itemID) _where += " AND item.id = '" + _itemID + "'";

    if (_itemID) _where += " AND item.id = '" + _itemID + "'";

    if (_itemID) _where += " AND item.id = '" + _itemID + "'";

    if (_itemID) _where += " AND item.id = '" + _itemID + "'";

    if (_type?.toLowerCase() === "all") {
      _where = ""
    }

    _data = await entityManager.query(`   
    SELECT * FROM item
    inner join
    (Select * from item_sku 
    where item_sku.owner_id=${_ownerId} AND item_sku.item_state="${state}"
    Group by item_sku.item_id) i
    on i.item_id= item.id ${_where};
    `);

    return new Response(_data, 200).compose();
  }

  async getCampaignAssets(params: any): Promise<{}> {
    let data: any = {};
    let finalArray: any = [];
    let state = "onsale"
    for await (let element of params) {
      let query: any = "";
      let keys = Object.keys(element);
      if (element.isRedeem) state = "purchased"
      for (let index = 0; index < keys.length; index++) {
        if (keys[index] === 'isRedeem' || keys[index] === 'type') {
        }
        else if (keys[index] === 'item_id') {
          element['id'] = element[keys[index]]
          keys[index] = "id"
          query += ` AND i.${keys[index]}="${element[keys[index]]}"`;
        }
        else {
          query += ` AND i.${keys[index]}="${element[keys[index]]}"`;
        }
      }
      if (element?.type?.toLowerCase() === 'all') {
        query =""
      }
      else if (element?.type?.toLowerCase() === 'artwork') {
        query = `AND i.filter_9!="" `
      }
      else if (element?.type?.toLowerCase() === 'comic') {
        query = `AND i.filter_11!="" `
      }
      else {
        query = `AND i.filter_1!="" AND i.nft_type Not in ('Artwork','Comics')`
      }

      if (element?.item_id !== undefined) {
        query = ` AND i.id=${element.item_id}`
      }
      console.log(query)
      data = await entityManager.query(
        `SELECT i.id,is2.id as itemskuid FROM item i
      inner join item_sku is2
      on i.id=is2.item_id AND is2.item_state="${state}" AND is2.owner_id=${_ownerId}
      where i.is_resellable in (0,1)${query}
      `
      );
      if (data?.length > 0) {
        finalArray.push(...data);
      }
    }

    if (finalArray?.length > 0) {
      return new Response(finalArray, 200);
    }
    return new Response("", 2000);
  }

  async lockAssetForPendingPayments(body: any, queryRunner: QueryRunner): Promise<{}> {
    var skus = body.skuid.split(",");
    var is_locked = body.lock == "true" ? true : false;
    var userid = body.userid;

    var resData = await getConnection()
      .createQueryBuilder(AssetSku, "item_sku")
      .update("item_sku")
      .set({ is_locked: is_locked, updated_by: userid })
      .where("id in ( :skus )", { skus })
      .execute();
    if (resData) return new Response("", 200).compose();
    return new Response("", 2000).compose();
  }

  async getMintingAssets(body: any): Promise<{}> {

    let data = await getConnection()
      .getRepository(AssetSku)
      .createQueryBuilder("item_sku")
      .select([`item_sku.token_id`, `item_sku.blockchain_id`])
      .where(`item_sku.is_minted=0`)
      .limit(40)
      .getMany();
    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();

  }

  async getItemDetailByTokenID(params: any): Promise<{}> {
    let token_ID = params.tokenID
    let data = await entityManager.query(`
      SELECT sku.token_id, sku.serial_no, i.code from item_sku as sku inner join item i on (i.id = sku.item_id) 
      where sku.token_id = ${token_ID}`);
    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();
  }


  async updateMintingAsset(params: any): Promise<{}> {
    var tokens = params.tokens.split(",");

    var data = await getConnection()
      .createQueryBuilder(AssetSku, "item_sku")
      .update("item_sku")
      .set({ is_minted: true })
      .where(`item_sku.token_id in ( :tokens )`, { tokens })
      .execute();
    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();

  }

  async insertMintingAsset(params: any): Promise<{}> {
    let min = new ItemMinting();
    min.transaction_hash = params.blockchainaddress
    min.status = params.status;
    min.token_ids = params.tokens
    min.created_at = new Date()
    min.save()
    if (min) return new Response(min, 200).compose();
    return new Response("", 2000).compose();
  }

  async updateMinting(params: any): Promise<{}> {
    var tokens = params.address;

    var data = await getConnection()
      .createQueryBuilder(ItemMinting, "item_minting")
      .update("item_minting")
      .set({ status: 2, updated_at: new Date() })
      .where(`item_minting.transaction_hash in ( :tokens )`, { tokens })
      .execute();
    if (data) return new Response(data, 200).compose();
    return new Response("", 2000).compose();
  }

  async getoPenessItems(params: any): Promise<{}> {
    var userid = params.userid;
    var pageNo = params.pageno ? parseInt(params.pageno) : 0;
    var pageSize = params.pagesize ? parseInt(params.pagesize) : 10;
    var status = params.status.split(",")
    let state;
    if (status.includes('0')) state = "('purchased')"
    if (status.includes('1')) state = "('open')"
    if (status?.length > 0) state = "('purchased','open')"

    let data = await getConnection()
      .createQueryBuilder(Asset, "item")
      .select("item")
      .innerJoinAndSelect("item.skus", "item_sku")
      .where("item_sku.owner_id = :userid", { userid })
      .andWhere(`item_sku.is_locked in (${status}) AND item_sku.is_listed = ${1} AND item_sku.item_state in ${state}`)
      .limit(pageSize)
      .offset(pageNo)
      .getRawMany();
    if (data) {

      for await (const iterator of data) {
        let res = [];
        for (let index = 1; index <= 30; index++) {
          if (iterator["item_filter_" + index] !== undefined) {
            let filter: any = iterator["item_filter_" + index];

            if (filter && filter.toString().trim() !== "") {
              let fil_1 = await readHierarchyFilter("filter_" + index, filter);
              if (fil_1.responseCode === 200) {
                res = fil_1.responseData;
              } else {
                res = await entityManager.query(
                  `CALL GET_HIERARCHY(${parseInt(filter)})`
                );
                res = res[0]
                writeHierarchyFilter("filter_" + index, filter, res);
              }
              iterator["item_filter_" + index] = res;
            }
          }
        }

        if (iterator.blockchain_id) {
          let blockchain_data = await readHierarchyFilter(
            "blockchain_data",
            iterator.id
          );
          if (blockchain_data.responseCode !== 200) {
            res = blockchain_data.responseData;
          } else {
            res = await entityManager.query(
              `CALL GET_BLOCKCHAIN(${iterator.blockchain_id})`
            );
            res = res[0]
            writeHierarchyFilter("blockchain_data", iterator.id, res);
          }
        }
        iterator.blockchain_id = res;
      }
      return new Response(data, 200).compose();
    }
    return new Response("", 2000).compose();
  }

  async lockAssetForPendingOpeness(body: any): Promise<{}> {
    var skus = body.skuid;
    var is_locked = body.lock;
    var state = body.lock ? "open" : "purchased";
    var userid = body.userid;

    await getConnection()
      .createQueryBuilder(AssetSku, "item_sku")
      .update("item_sku")
      .set({ is_locked: is_locked, item_state: state })
      .where("id in ( :skus )", { skus })
      .andWhere(`owner_id = ${userid}`)
      .execute();
    var resData = await getConnection()
      .createQueryBuilder(AssetSummary, "item_summary")
      .update("item_summary")
      .set({ item_state: state })
      .where("item_sku_id in ( :skus )", { skus })
      .andWhere(`owner_id = ${userid}`)
      .execute();
    if (resData) return new Response("", 200).compose();
    return new Response("", 2000).compose();
  }
}
