import { Offer } from "../entities/offer";
import { PackItemSkuTrans } from "../entities/packItemSkuTrans";
import AppService from "./appService";
import { OfferInterface } from "./interfaces/offerInterface";
import { QueryRunner, getManager, getConnection } from "typeorm";
import { Response } from "../models/response";
import { ItemSkuTrans } from "../entities/itemSkuTrans";
import { OfferHistory } from "../entities/offerHistory";
import { Stripe } from "../entities/stripe";
import { Transaction } from "../entities/transaction";
import { PendingPayments } from "../entities/pendingPayments";
import { ACTIVE, COMPLETED } from "../constants";

const entityManager = getManager();

export default class OfferService extends AppService implements OfferInterface {
  createOffer = async (body: Offer) => {
    const offerExist = await getConnection()
      .createQueryBuilder()
      .select("id")
      .from(Offer, "offer")
      .where("offer.item_sku_id = :item_sku_id", {
        item_sku_id: body.item_sku_id,
      })
      .andWhere("offer.created_by = :created_by", {
        created_by: body.created_by,
      })
      .andWhere("offer.item_type = :item_type", {
        item_type: body.item_type
      })
      .andWhere("offer.status = :status", {
        status: 1
      })
      .execute();

    if (!offerExist.length) {
      let obj = new Offer();
      obj.item_sku_id = body.item_sku_id;
      obj.item_owned_by = body.item_owned_by;
      obj.created_by = body.created_by;
      obj.offered_price = body.offered_price;
      obj.item_type = body.item_type;


      let result = await obj.validate(obj);
      if (result) {
        var data = await obj.save();
        let orderHistory = new OfferHistory()
        orderHistory.user_id = body.created_by.toString()
        orderHistory.item_type = body.item_type
        orderHistory.offer_id = data.id
        orderHistory.offered_price = data.offered_price
        await orderHistory.save();
        return new Response(data, 200).compose();
      }
    }
    return new Response("", 8010).compose();
  };

  updateOffer = async (body: Offer, id: number) => {
    const offers = await Offer.findOneOrFail(id);
    if (offers) {
      var result = await getConnection()
        .createQueryBuilder()
        .update(Offer)
        .set({ offered_price: body.offered_price })
        .where("id = :id", { id: id })
        .execute();
      if (result) {
        return new Response(result, 200).compose();
      }
    }

    return new Response("", 8000).compose();
  };
  getOffer = async (params: any) => {
    var pageNo = 0;
    if (params.pageno) {
      pageNo = params.pageno;
    }
    var pageSize = 10;
    if (params.pagesize) {
      pageSize = params.pagesize;
    }
    let data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.status = :status", { status: params.status })
      .take(pageSize)
      .skip(pageSize * pageNo)
      .getMany();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };
  getUserGifts = async (params: any) => {
    let userId = params.userid
    let transType=params.trans_type;
    let data = await getConnection()
      .createQueryBuilder(ItemSkuTrans, "sku")
      .select("sku")
      .where("sku.to_user_id = :to_user_id", { to_user_id: userId })
      .andWhere("sku.paymentType = :paymentType", { paymentType:transType })
      .getMany();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };


  getOneOffer = async (params: any) => {
    var id = params.offerId;

    let data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.id = :id", { id: id })
      .getOne();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };
  getItemOffer = async (params: any) => {
    var pageNo = 0;
    if (params.pageno) {
      pageNo = params.pageno;
    }
    var pageSize = 10;
    if (params.pagesize) {
      pageSize = params.pagesize;
    }
    let data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.status = :status", { status: params.status })
      .andWhere("offer.item_sku_id=:item_sku_id", {
        item_sku_id: params.item_sku_id,
      })
      .take(pageSize)
      .skip(pageSize * pageNo)
      .getMany();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };
  getOnwerOffer = async (params: any) => {
    var pageNo = 0;
    if (params.pageno) {
      pageNo = params.pageno;
    }
    var pageSize = 10;
    if (params.pagesize) {
      pageSize = params.pagesize;
    }
    let data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.status = :status", { status: params.status })
      .andWhere("offer.item_owned_by=:item_owned_by", {
        item_owned_by: params.item_owned_by,
      })
      .take(pageSize)
      .skip(pageSize * pageNo)
      .getMany();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };

  getCreatorOffers = async (params: any) => {
    var pageNo = 0;
    if (params.pageno) {
      pageNo = params.pageno;
    }
    var pageSize = 10;
    if (params.pagesize) {
      pageSize = params.pagesize;
    }
    let data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.status = :status", { status: params.status })
      .andWhere("offer.created_by=:created_by", {
        created_by: params.created_by,
      })
      .take(pageSize)
      .skip(pageSize * pageNo)
      .getMany();
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };

  deleteTrans = async (params: any) => {
    var id = params.id;
    var data = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(PackItemSkuTrans)
      .where("id = :id", { id: id })
      .execute();
    if (data) {
      return new Response(data, 200).compose();
    }
    return new Response("", 8000).compose();
  };
  createTrans = async (body: any, queryRunner: QueryRunner) => {
    let obj = new ItemSkuTrans();
    obj.item_sku_id = body.item_sku_id;
    obj.from_user_id = body.sellerID;
    obj.created_by = body.buyerID;
    obj.updated_by = body.buyerID;
    obj.to_acount = body.to_acount;
    obj.to_user_id = body.buyerID;
    obj.from_acount = body.from_acount;
    obj.trans_type = body.transactionType;
    obj.trans_value = body.transactionValue;
    obj.paymentType = body.paymentType;
    obj.status_id = body.status_id;
    obj.sales_tax = body.sales_tax;
    obj.total_amount = body.total_amount;
    obj.item_type = body.itemType;
    obj.transaction_id = body.transactionID;
    let result = await obj.validate(obj);
    if (result) {
      var resData = await obj.save();
      return new Response(resData, 200).compose();
    }

    return new Response("", 8000).compose();
  };

  deleteItemTrans = async (params: any) => {
    let id = params.id;
    let data = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(ItemSkuTrans)
      .where("id = :id", { id: id })
      .execute();
    if (data) {
      return new Response(data, 200).compose();
    }
    return new Response("", 8000).compose();
  };
  async getOffersForUser(params: any): Promise<{}> {
    let userID = params.userid;
    let history = params?.history;

    let data = [];
    let statuses = [ACTIVE, COMPLETED]

    data = await getConnection()
      .getRepository(Offer)
      .createQueryBuilder("offer")
      .where("offer.item_owned_by = :id ", { id: userID })
      .andWhere("offer.status in ( :statuses ) ", { statuses })
      .orderBy("CAST(offer.offered_price as unsigned)", "DESC")
      .addOrderBy("offer.id", "DESC")
      .getMany();
    if (data && history) {
      for await (const iterator of data) {
        let _history = await entityManager.query(`SELECT * FROM item_offer_history where offer_id=${iterator.id} AND status=1 order by id DESC`)
        if (_history)
          iterator.history = _history
      }
    }

    return data;
  }
  getOffersByUser = async (params: any) => {
    let userID = params.userid;
    let history = params?.history;

    let data = [];
    let statuses = [ACTIVE, COMPLETED]

    data = await getConnection()
      .getRepository(Offer)
      .createQueryBuilder("offer")
      .where("offer.created_by = :id ", { id: userID })
      .andWhere("offer.status in ( :statuses ) ", { statuses })
      .orderBy("CAST(offer.offered_price as unsigned)", "DESC")
      .addOrderBy("offer.id", "DESC")
      .getMany();

    if (data && history) {
      for await (const iterator of data) {
        let _history = await entityManager.query(`SELECT * FROM item_offer_history where offer_id=${iterator.id} AND status=1 order by id DESC`)
        if (_history)
          iterator.history = _history
      }
    }
    return data;
  };

  changeStatus = async (body: any) => {
    var Id = body.id;
    var type = body.item_type;
    if (type.toLowerCase() === "asset") {
      let res = await getConnection()
        .createQueryBuilder()
        .update(ItemSkuTrans)
        .set({ status_id: 2 })
        .where("id = :id", { id: Id })
        .execute();
      if (res) {
        return new Response(res, 200);
      } else return new Response("", 2000).compose();
    } else {
      let res = await getConnection()
        .createQueryBuilder()
        .update(PackItemSkuTrans)
        .set({ status_id: 2 })
        .where("id = :id", { id: Id })
        .execute();
      if (res) {
        return new Response(res, 200);
      } else return new Response("", 2000).compose();
    }
  };
  changeOfferStatus = async (param: any) => {
    var Id = param?.offerId?.split(",");
    let status = 2;
    let res = {}
    if (param.sku) {
      res = await getConnection()
        .createQueryBuilder()
        .update(Offer)
        .set({ status })
        .where("item_sku_id in (:params)", { params: param.sku })
        .execute();
    }
    else {
      res = await getConnection()
        .createQueryBuilder()
        .update(Offer)
        .set({ status: 3 })
        .where("id in (:params)", { params: Id })
        .execute();
    }
    if (res) {
      return new Response(res, 200);
    } else return new Response("", 2000).compose();
  };
  changeSkuOfferStatus = async (param: any) => {
    var Id = param?.offerId?.split(",");
    var itemType = param.itemtype;
    let status = 2;
    let res = {}
    if (param.sku) {
      res = await getConnection()
        .createQueryBuilder()
        .update(Offer)
        .set({ status })
        .where("item_sku_id in (:params)", { params: param.sku })
        .andWhere("item_type =:item_type", { item_type: itemType })
        .execute();
    }
    else {
      res = await getConnection()
        .createQueryBuilder()
        .update(Offer)
        .set({ status })
        .where("id in (:params)", { params: Id })
        .andWhere("item_type =:item_type", { item_type: itemType })
        .execute();
    }
    if (res) {
      return new Response(res, 200);
    } else return new Response("", 2000).compose();
  };
  changeSkuOffers = async (param: any) => {
    var itemType = param.itemtype;
    console.log(param)
    let status = 3;
    let res = {}
    res = await getConnection()
      .createQueryBuilder()
      .update(Offer)
      .set({ status })
      .where("item_sku_id in (:params)", { params: param.sku })
      .andWhere("item_type =:item_type", { item_type: itemType })
      .execute();

    if (res) {
      return new Response(res, 200);
    } else return new Response("", 2000).compose();
  };
  getActiveOffer = async (params: any) => {
    let data = await entityManager.query(`SELECT * FROM item_offer where created_at >= NOW() - INTERVAL 1 DAY AND status=1`)
    if (data) {
      return new Response(data, 200);
    }

    return new Response("", 8000).compose();
  };

  getTrans = async (params: any) => {
    var userID = params.userid;
    var filterBy = params.filterby.split(",");
    let page = params.pageno;
    let pageSize = params.pagesize;
    var endDate = new Date(new Date()).toISOString();
    var startDate = "2011-12-14"; //random date for infinite data
    let data: any = [];
    let demoString = [];
    let query = ""


    if (filterBy.length > 0) {
      for (let element of filterBy) {
        demoString.push(element?.toLowerCase());
        if (element === "gift") {
          query = "AND item.paymentType='gift'"
        }
        if (element === "redeemed") {
          query = "AND item.paymentType='redeemed'"
        }

      }
    }
    if (params.startdate) {
      startDate = params.startdate;
    }
    if (params.enddate) {
      endDate = params.enddate;
    }

    if (demoString.length > 1) {
      data = await getConnection()
        .createQueryBuilder(ItemSkuTrans, "item")
        .select("item")
        .where(
          "(item.from_user_id in ( :param1 ) OR item.to_user_id in ( :param1 ))",
          { param1: userID }
        )
        .andWhere(`item.created_at BETWEEN '${startDate}' AND '${endDate}' ${query}`)
        .orderBy("item.id", "DESC")
        .take(pageSize)
        .skip(page * pageSize)
        .getMany();

      if (data) {
        return new Response(data, 200);
      } return new Response("", 2000).compose();
    }
    if (demoString[0] === "soldout") {
      data = await getConnection()
        .createQueryBuilder(ItemSkuTrans, "item")
        .select("item")
        .where(`item.from_user_id in ( :param1 )`, { param1: userID })
        .andWhere("item.paymentType = :paymentType", { paymentType: "sale" })
        .orderBy("item.id", "DESC")
        .take(pageSize)
        .skip(page * pageSize)
        .getMany();
    } else if (demoString[0] === "purchased") {
      data = await getConnection()
        .createQueryBuilder(ItemSkuTrans, "item")
        .select("item")
        .where(`item.to_user_id in ( :param1 )`, { param1: userID })
        .andWhere("item.paymentType = :paymentType", { paymentType: "sale" })
        .orderBy("item.id", "DESC")
        .take(pageSize)
        .skip(page * pageSize)
        .getMany();
    }
    else if (demoString[0] === "gift") {
      data = await getConnection()
        .createQueryBuilder(ItemSkuTrans, "item")
        .select("item")
        .where(
          "(item.from_user_id in ( :param1 ) OR item.to_user_id in ( :param1 ))",
          { param1: userID }
        )
        .andWhere(`item.created_at BETWEEN '${startDate}' AND '${endDate}' ${query}`)
        .orderBy("item.id", "DESC")
        .take(pageSize)
        .skip(page * pageSize)
        .getMany();

    }
    else if (demoString[0] === "redeemed") {
      data = await getConnection()
        .createQueryBuilder(ItemSkuTrans, "item")
        .select("item")
        .where(
          "(item.from_user_id in ( :param1 ) OR item.to_user_id in ( :param1 ))",
          { param1: userID }
        )
        .andWhere(`item.created_at BETWEEN '${startDate}' AND '${endDate}' ${query}`)
        .orderBy("item.id", "DESC")
        .take(pageSize)
        .skip(page * pageSize)
        .getMany();

    }
    if (data) {
      return new Response(data, 200);
    } return new Response("", 2000).compose();
  };
  getUserTransactions = async (params: any) => {
    var userID = params.userid;
    let data: any = [];
    data = await getConnection()
      .createQueryBuilder(ItemSkuTrans, "item")
      .select("item")
      .where(
        "(item.from_user_id in ( :param1 ) OR item.to_user_id in ( :param1 ))",
        { param1: userID }
      )
      .orderBy("created_at", "DESC")

      .getMany();

    if (data) {
      return new Response(data, 200);
    } else return new Response("", 2000).compose();
  };

  async getSingleOffer(params: any): Promise<{}> {
    var offerId = params.offerId;

    let data = {};

    data = await getConnection()
      .getRepository(Offer)
      .createQueryBuilder("offer")
      .where("offer.id = :id ", { id: offerId })
      .getMany();

    return data;
  }

  getSingleTrans = async (params: any) => {
    var userID = params.userid;
    var skuid = params.skuid;
    var itemType = params.itemtype;
    let data: any = [];
    data = await getConnection()
      .createQueryBuilder(ItemSkuTrans, "item")
      .select("item.id")
      .where(
        "item.to_user_id in ( :userID ) AND item.item_sku_id = (:skuid) AND item_type=(:itemType)",
        { userID, skuid, itemType }
      )
      .getOne();

    if (data) {
      return new Response(data, 200);
    } else return new Response("", 2000).compose();
  };

  counterOffer = async (params: any) => {
    var userID = params.userid;
    var offerID = params.offerid;
    var counterOffer = params.counteroffer;
    var isCounter = params.isowner;
    let data: any = [];
    data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.id in ( :offerID ) AND offer.status=1", { offerID })
      .getOne();

    if (data) {
      if (parseFloat(data.offered_price) >= parseFloat(counterOffer) && isCounter) return new Response("", 8032).compose();
      if (parseFloat(data.counter_offer) <= parseFloat(counterOffer) && !isCounter) return new Response("", 8035).compose();
      let obj: Offer = data
      if (isCounter) {
        obj.counter_price = counterOffer
        obj.updated_at = new Date()
      }
      else obj.offered_price = counterOffer
      obj.updated_by = userID
      obj.save()
      let orderHistory = new OfferHistory()
      orderHistory.user_id = userID
      orderHistory.item_type = data.item_type
      orderHistory.offer_id = data.id
      orderHistory.offered_price = counterOffer
      await orderHistory.save();
      return new Response(obj, 200);
    } else return new Response("", 2000).compose();
  };

  async getOfferActivitiesForUser(params: any): Promise<{}> {
    var userID = params.userid;
    let status = 1
    let data = [];
    data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.item_owned_by = :id ", { id: userID })
      .andWhere("offer.status = :status", { status })
      .orderBy("offer.id", "DESC")
      .getMany();
    if (data) {
      for await (const iterator of data) {
        let history = await entityManager.query(`SELECT * FROM item_offer_history where offer_id=${iterator.id} AND status=1 order by id DESC`)
        if (history)
          iterator.history = history
      }
    }
    return data;
  }

  getHighestPrice = async (params: any) => {
    var sku_id = params.skuId;
    let data = await entityManager.query(`SELECT * FROM item_sku_trans where trans_value=(SELECT MAX(trans_value) FROM item_sku_trans where item_sku_id=${sku_id});
    `)
    if (data) {
      return new Response(data, 200);
    }
    else return new Response("", 8000).compose();
  }

  getTradingHistory = async (params: any) => {
    var id = params.skuid;
    if (params.type)
      var type = params.type;
    else type = "asset"
    let data = []
    data = await getConnection()
      .createQueryBuilder(ItemSkuTrans, "item")
      .select("item")
      .where("item.item_sku_id = :id ", { id })
      .andWhere("item.item_type = :type", { type })
      .orderBy("item.created_at", "DESC")
      .getMany();

    if (data) {
      return new Response(data, 200);
    }
    else return new Response("", 8000).compose();
  }

  getIsOffered = async (params: any) => {
    var item_sku_id = params.skuid;
    var created_by = params.userid;
    var item_type = params.itemtype;
    var status = '1';
    let query: any = { item_sku_id, created_by, item_type, status }
    let data = await Offer.count({ where: query })
    if (data) {
      return new Response(data, 200);
    }
    else return new Response("", 8000).compose();
  }

  setupIntent = async (params: any) => {
    let query: any = {
      stripe_user_id: params.customer,
      user_id: params.userid,
      client_secret: params.clientsecret,
      payment_intent_id: params.paymentintentid,
      amount: params.amount,
      created_at: new Date(),
      card_id: params.payment_method
    }
    let insertion = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Stripe)
      .values(query)
      .execute()
    if (insertion) {
      return new Response("", 200)
    }
    return new Response("", 8000)
  }

  updateStripe = async (body: any) => {

    var result = await getConnection()
      .createQueryBuilder()
      .update(Stripe)
      .set({ status: body.status, order_id: body.orderid, reason: body.receipt })
      .where("payment_intent_id = :payment_intent_id", { payment_intent_id: body.paymentintentid })
      .execute();
    if (result) {
      return new Response(result, 200).compose();
    }

  };

  getStripeData = async (body: any) => {
    let data = await getConnection()
      .createQueryBuilder(Stripe, "item")
      .select("item")
      .where("item.payment_intent_id = :id ", { id: body.paymentintentid })
      .getOne();
    if (data) return new Response(data, 200)
    return new Response('', 8000)
  };
  CreateTransactionSummary = async (body: any) => {
    const user = new Transaction();
    user.payment_type = body.paymentType;
    user.stripe_id = body.stripeId;
    user.status = body.status;

    const result = await user.validate(user);
    if (result === true) {
      let data = await user.save();
      if (data) {
        return new Response(data, 200);
      }
    }
    return new Response("", 2000).compose();
  };
  updateTransactionSummary = async (body: any) => {
    let status = body.status;
    let stripe_id = body.stripeId;
    let address = body.address;
    let id = body.id
    let query: any = {};
    if (address) {
      query.blockchain_address = address
      await getConnection()
        .createQueryBuilder()
        .update(ItemSkuTrans)
        .set({ blockchain_address: address, status_id: 2 })
        .where("transaction_id in (:params)", { params: id })
        .execute();
    }
    if (stripe_id) {
      query.stripe_id = stripe_id
      query.status = status
      query.updated_at = new Date()

    } else {
      query.status = status
    }

    let res = await getConnection()
      .createQueryBuilder()
      .update(Transaction)
      .set(query)
      .where("id in (:params)", { params: id })
      .execute();
    if (res) {
      return new Response(res, 200);
    } else return new Response("", 2000).compose();
  };

  addPendingPayment = async (body: any) => {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 1);

    let query = {
      actual_amount: body.actualamount,
      pending_amount: body.pendingamount,
      buyer_id: body.buyerid,
      item_owner_id: body.itemownerid,
      transaction_id: body.transactionid,
      type: body.type,
      item_sku_id: body.itemskuid,
      item_type: body.itemtype,
      offer_id: body.offerid,
      created_at: new Date(),
      expiry: expiry
    }

    let insertion = await getConnection()
      .createQueryBuilder()
      .insert()
      .into(PendingPayments)
      .values(query)
      .execute()
    if (insertion) {
      return new Response("", 200)
    }
    return new Response("", 8000)
  }

  getPendingPayment = async (params: any) => {
    let userid = params.userid
    let id = params.id
    let pageNo = params.pageno ? params.pageno : 1
    let pageSize = params.pagesize ? params.pagesize : 10
    let data = [];
    if (params.id) {
      data = await getConnection()
        .createQueryBuilder(PendingPayments, "item")
        .select("item")
        .where("item.id = :id ", { id })
        .getMany();
    }
    else {
      data = await getConnection()
        .createQueryBuilder(PendingPayments, "item")
        .select("item")
        .where("item.buyer_id = :id ", { id: userid })
        .andWhere(`item.status != "Completed"`)
        .take(pageSize)
        .skip(pageSize * pageNo)
        .getMany();
    }
    if (data) return new Response(data, 200)
    return new Response('', 8000)
  }

  updatePendingPayment = async (params: any) => {
    let status = params.status;
    let filter = params.filter;
    let id = params.id;
    let query: any = {}
    if (status) query.status = status
    if (filter) query.filter = filter
    var result = await getConnection()
      .createQueryBuilder()
      .update(PendingPayments)
      .set(query)
      .where("id in (:id)", { id })
      .execute();
    if (result) {
      return new Response(result, 200).compose();
    }
  }

  getExpiredPayments = async (params: any) => {
    let startDate = params.startdate
    let endDate = params.enddate

    let data = [];
    data = await getConnection()
      .createQueryBuilder(PendingPayments, "item")
      .select("item")
      .where(`item.status = "pending"`)
      .andWhere(`item.expiry BETWEEN '${startDate}' AND '${endDate}'`)
      .getMany();

    if (data) return new Response(data, 200)
    return new Response('', 8000)
  }
  getExpiredOffers = async (_params: any) => {
    let expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - 1);
    let exp = expiryDate.toISOString().split("T")[0]
    let data = [];
    data = await getConnection()
      .createQueryBuilder(Offer, "item")
      .select("item.id")
      .where(`item.status = 1`)
      .andWhere(`item.created_at < '${exp}'`)
      .getMany();

    if (data) return new Response(data, 200)
    return new Response('', 8000)
  }

  updateStatus = async (body: any) => {
    let status = body.status;
    let address = body.address;
    let res: any = {};
    res = await getConnection()
      .createQueryBuilder()
      .update(ItemSkuTrans)
      .set({ status_id: status })
      .where("blockchain_address in (:params)", { params: address })
      .execute();
    if (res) {
      return new Response(res, 200);
    } else return new Response("", 8000).compose();
  }

  async getOfferSentActivitiesForUser(params: any): Promise<{}> {
    var userID = params.userid;
    let data = [];
    data = await getConnection()
      .createQueryBuilder(Offer, "offer")
      .select("offer")
      .where("offer.created_by = :id ", { id: userID })
      .andWhere("offer.status = :status", { status: 1 })
      .orderBy("offer.id", "DESC")
      .getMany();
    if (data) {
      for await (const iterator of data) {
        let history = await entityManager.query(`SELECT * FROM item_offer_history where offer_id=${iterator.id} AND status=1 order by id DESC`)
        if (history)
          iterator.history = history
      }
    }
    return data;
  }
}
