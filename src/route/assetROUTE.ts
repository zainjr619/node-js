import express from "express"
import { Item } from "../models/item";
import { Response } from "../models/response";
import AssetService from "../services/assetService";

var router = express.Router();

router.get("/all", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateAllNFT(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAssetsSummary(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/userall", async (req: any, res: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateAllNFT(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getUserAssetsSummary(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/list", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateAllNFT(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAssetsSummary(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/itemid", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let validationResult = _item.validateItemId(req.query);
  if (validationResult.responseCode == 200) {

    let obj = new AssetService();
    var data = await obj.getItemByID(req.query);
    result = data;

  }
  else
    result = validationResult;

  res.send(result);
});

router.get("/itemcode", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateCode(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getItemByCode(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/itemslug", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let validationResult = _item.validateSlug(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    result = await obj.getItemBySlug(req.query);

    result = new Response(result, 200);
    res.send(result);
    return;
  }
  return res.send(validationResult);

});

// we can improve performance of this endpoint
router.get("/itemskus", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateSKU(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAssetskus(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});
router.get("/itemskusfilters", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateSKU(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getSkusWithFilters(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

// we can improve performance of this endpoint
router.get("/releasedmonth", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let validationResult = _item.validateReleasedMonth(req.query);
  if (validationResult.responseCode == 200) {

    let obj = new AssetService();
    var data = await obj.getReleasedMonth(req.query);
    result = data;

  }
  else
    result = validationResult;

  res.send(result);
});

// we can improve performance of this endpoint
router.get("/auctionskus", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateAuctionSKU(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAuctionSkus(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/getusertrades", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateAuctionSKU(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getTradeSkus(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/collectible", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateCollectible(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getCollectibles(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/avatars", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();

  let obj = new AssetService();
  let data = await obj.getAvatars(req.query);
  return res.send(data);

});

router.get("/artwork", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateArtWork(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getArtWork(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});
router.get("/artworkgallery", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateArtWorkGallery(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getArtGalleryWork(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});
router.get("/getavatar", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateAvatar(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAvatar(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/comics", async (req: any, res: any, next: any) => {
  try {

    var result = null;

    var _item = new Item();
    let validationResult = _item.validateComics(req.query);
    if (validationResult.responseCode == 200) {
      let obj = new AssetService();
      let data = await obj.getComics(req.query);

      result = new Response(data, 200);
      res.send(result);
      return;
    }
    return res.send(validationResult);
  } catch (error) {
    return res.send(new Response('Internal Server Error', 500))
  }

});

router.get("/collectibleitem", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateCollectibleItem(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getCollectibleItem(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.get("/allskus", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateSKUS(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAllSkus(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});
router.get("/getallitemsskus", async (req: any, res: any, next: any) => {

  var result = null;

  var _item = new Item();
  let validationResult = _item.validateItemSKUS(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAllitemSkus(req.query);

    result = data
    res.send(result);
    return;
  }

  return res.send(validationResult);

});

router.post("/filters", async (req: any, res: any, next: any) => {

  var result = null;

  var model = new Item();
  let validationResult = model.validateFilter(req.body);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getFilters(req.body.filters);

    result = new Response(data, 200);
    res.send(result);
    return;
  }

  return res.send(validationResult);

});


router.get("/itemskusbyslug", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let validationResult = _item.validatePaginationSlug(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    result = await obj.getallassetskusbyslug(req.query);

    result = new Response(result, 200);
    res.send(result);
    return;
  }
  return res.send(validationResult);

});

router.get("/skudetail", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let obj = new AssetService();
  result = await obj.getSkuDetail(req.query);

  result = new Response(result, 200);
  return res.send(result);

});

router.get("/generatecollectionreward", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let obj = new AssetService();
  result = await obj.generateReward(req.query);

  return res.send(result);

});

router.post("/getrevealpackassets", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.getRevealPackAssets(req.body);

  return res.send(result);

});

router.post("/checkuserasset", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.checkUserAsset(req.body);

  return res.send(result);

});


router.get("/increasetrendcount", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.increaseTrendCount(req.query);

  return res.send(result);

});


router.get("/changestatus", async (req: any, res: any, next: any) => {

  var result = null;
  let objitem = new AssetService();
  result = await objitem.execute(() => objitem.changeStatus(req.query));

  res.send(result);
});

router.get("/getrecommendeditems", async (req: any, res: any, next: any) => {

  var result = null;
  let objitem = new AssetService();
  var _item = new Item();
  let validationResult = _item.validateRecommendedItems(req.query);
  if (validationResult.responseCode == 200) {

    result = await objitem.execute(() => objitem.getRecommendedItems(req.query));

    return res.send(result);
  }
  return res.send(validationResult)
});


router.get("/getuserbrands", async (req: any, res: any, next: any) => {

  var result = null;
  let objitem = new AssetService();

  result = await objitem.execute(() => objitem.getUserBrands(req.query));

  return res.send(result);
});

router.get("/artworkbyartist", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let validationResult = _item.validateArtWorkForArtist(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getArtWorkForArtist(req.query);

    result = new Response(data, 200);
    res.send(result);
    return;
  }
  return res.send(validationResult);

});

router.get("/comicredirect", async (req: any, res: any, next: any) => {

  var _item = new Item();
  let validationResult = _item.validateComicRedirect(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getRedirectAccess(req.query);

    res.send(data);
    return;
  }
  return res.send(validationResult);

});

router.get("/itemdetailbytokenid", async (req: any, res: any, next: any) => {

  var _item = new Item();
  let validationResult = _item.validateItemDetailByTokenId(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getItemDetailByTokenID(req.query);
    res.send(data);
    return;
  }
  return res.send(validationResult);

});

router.get("/assetsforcampaign", async (req: any, res: any, next: any) => {

  var _item = new Item();
  let validationResult = _item.validateCampaignAssets(req.query);
  if (validationResult.responseCode == 200) {
    let obj = new AssetService();
    let data = await obj.getAssetForCampaigns(req.query);

    res.send(data);
    return;
  }
  return res.send(validationResult);

});

router.post("/getcampaignassets", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.getCampaignAssets(req.body);

  return res.send(result);

});

router.get("/mintingassets", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.getMintingAssets(req.body);

  return res.send(result);

});

router.get("/updatemintingassets", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.updateMintingAsset(req.query);

  return res.send(result);

});

router.get("/insertmintedassets", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.insertMintingAsset(req.query);

  return res.send(result);

});

router.post("/updateminting", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.updateMinting(req.body);

  return res.send(result);

});


router.get("/getopenessitems", async (req: any, res: any, next: any) => {

  var result = null;
  var _item = new Item();
  let validationResult = _item.validateReleasedMonth(req.query);
  if (validationResult.responseCode == 200) {

    let obj = new AssetService();
    result = await obj.getoPenessItems(req.query);
    
    return res.send(result);
  }
  return res.send(validationResult);

})

router.post("/lockassetforopen", async (req: any, res: any, next: any) => {

  var result = null;
  let obj = new AssetService();
  result = await obj.lockAssetForPendingOpeness(req.body);

  return res.send(result);

})

export = router;