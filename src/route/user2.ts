import express from "express";
import { Response } from "../models/response";
import Network from "../utils/network";
import { User } from "../models/user";
import config from "tk-api-common/src/modules/config";
import { Notification } from "../models/notification";
import { decodeJwtToken } from "../utils/jwt";
import URLS from "tv-micro-services-common/build/urls";
import { DEACTIVE } from "../constants";
import StripeService from "../services/stripeService";
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to attempt 5 login requests per `window` per hour
  message:new Response(
    'Too many attempts from this IP, please try again after an hour',500),
  standardHeaders: true,
  legacyHeaders: false, 
})

var router = express.Router();
var websiteURL = process.env.WEBSITE_URL || config.get("websiteURL");

router.post("/login", loginLimiter, async (req: any, res: any, next: any) => {
  var result = null;
  var data: any = {};
  var model = new User();
  let _req = new Network();
  var userManagementData:any;

  var validationResult = model.validateLogin(req.body);

  if (validationResult.responseCode == 200) {
     validationResult = model.validateLoginEmailFilter(req.body);
    if (validationResult.responseCode === 200) {
      let userData = {
        email: req.body.userName,
      };
       userManagementData = await _req.post(
        URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuserexist",
        userData
      );
    } else {
      // get bidding details from auction-microservice
      var _data = req.body;
       userManagementData = await _req.post(
        URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuser",
        _data
      );
    }

    if (userManagementData.responseCode === 200) {
      data = userManagementData.responseData;
      if (data.stripeCustomerId == null) {
        let stripe = new StripeService();
        let stripeID:any= await stripe.createStripeUser({ email: data.email });
        let body = {
          stripecustomerid: stripeID.id,
          userid: data.id.toString(),
        };
        await _req.post(
          URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/setstripeid",
          body
        );
      }
      var _resData = userManagementData.responseData;
      var _authenticateBody = { ..._resData, password: req.body.password };
      if (_resData?.isActive === false) {
        data = new Response("", 1017);
        return res.send(data);
      } else if (_resData?.userStatus === DEACTIVE) {
        data = new Response("", 1041);
        return res.send(data);
      } else {
        let _authenticateData: Response = await _req.post(
          URLS.AUTH_SERVICE_URL + "/validate/authenticate",
          _authenticateBody
        );
        if (_authenticateData.responseCode === 200) {
          if (userManagementData.responseData.tfa_flag === true) {
            var digits = "0123456789";
            let OTP = "";
            for (let i = 0; i < 4; i++) {
              OTP += digits[Math.floor(Math.random() * 10)];
            }
            let getOtpAttempts: Response = await _req.get(
              URLS.AUTH_SERVICE_URL +
              "/validate/getotpattempts?userid=" +
              userManagementData.responseData.id
            );
            let attempt = getOtpAttempts.responseData.otp_attempts;
            let time = getOtpAttempts.responseData.updated_at;
            time = new Date(time);
            time.setDate(time.getDate() + 1);
            let currentDate: any = new Date()
            var hours = Math.abs(time - currentDate) / 36e5;
            if (attempt >= 3) {
              return res.send(new Response(hours, 1050));
            } else {
              attempt = attempt + 1;
              let body = {
                otp: OTP,
                userid: userManagementData.responseData.id.toString(),
              };
              let otpData: Response = await _req.post(
                URLS.AUTH_SERVICE_URL + "/validate/createotp",
                body
              );
              if (otpData.responseCode === 200) {
                await _req.get(
                  URLS.AUTH_SERVICE_URL +
                  "/validate/otpattempts?userid=" +
                  userManagementData.responseData.id +
                  "&attempts=" +
                  attempt
                );
                var emailData = {
                  email_body: `${OTP}`,
                  email_subject: "OTP Verification",
                  email_to: userManagementData.responseData.email,
                  firstname: userManagementData.responseData.firstName,
                  lastname: userManagementData.responseData.lastName
                };
                /** send emai to user */
                  await _req.post(
                  URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
                  emailData
                );
                return res.send(
                  new Response(userManagementData.responseData, 1040)
                );
              }
            }
          }
          let userModal = new User();
          userModal.bindData({
            ..._authenticateData.responseData.user,
            ..._authenticateData.responseData,
            ..._resData,
          });
          data = userModal;
        } else {
          return res.send(_authenticateData);
        }
      }
    } else {
      return res.send(userManagementData);
    }

    result = new Response(data, 200);
    res.send(result?.compose());
    return;
  } else {
    result = validationResult;
  }

  return res.send(result);
});
router.post("/resendotp", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var model = new User();
  var userManagementData:any;
  var validationResult = model.validateLoginEmailFilter(req.body);
  if (validationResult.responseCode === 200) {
    let userData = {
      email: req.body.userName,
    };
      userManagementData = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuserexist",
      userData
    );
  } else {
    // get bidding details from auction-microservice
    var _data = req.body;
      userManagementData = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuser",
      _data
    );
  }
  if (userManagementData.responseCode === 200) {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 4; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    let getOtpAttempts: Response = await _req.get(
      URLS.AUTH_SERVICE_URL +
      "/validate/getotpattempts?userid=" +
      userManagementData.responseData.id
    );
    let attempt = getOtpAttempts.responseData.otp_attempts;
    let time = getOtpAttempts.responseData.updated_at;
    time = new Date(time);
    time.setDate(time.getDate() + 1);
    let currentDate: any = new Date()
    var hours = Math.abs(time - currentDate) / 36e5;
    if (attempt >= 3) {
      return res.send(new Response(hours, 1050));
    } else {
      attempt = attempt + 1;
      let body = {
        otp: OTP,
        userid: userManagementData.responseData.id.toString(),
      };
      let otpData: Response = await _req.post(
        URLS.AUTH_SERVICE_URL + "/validate/createotp",
        body
      );
      if (otpData.responseCode === 200) {
        await _req.get(
          URLS.AUTH_SERVICE_URL +
          "/validate/otpattempts?userid=" +
          userManagementData.responseData.id +
          "&attempts=" +
          attempt
        );
        var emailData = {
          email_body: `${OTP}`,
          email_subject: "OTP Verification",
          email_to: userManagementData.responseData.email,
          firstname: userManagementData.responseData.firstName,
          lastname: userManagementData.responseData.lastName
        };
        /** send emai to user */
          await _req.post(
          URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
          emailData
        );
        return res.send(
          new Response(userManagementData.responseData, 1040)
        );
      }
    }
  } else
    return res.send(userManagementData)
      ;
});
router.get("/resetotpattempts", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let userIds = "";

  let otpData: Response = await _req.get(
    URLS.AUTH_SERVICE_URL + "/validate/getdisabledotpusers"
  );
  if (otpData.responseCode === 200 && otpData.responseData.length > 0) {
    for (const iterator of otpData.responseData) {
      userIds += iterator.user_id + ",";
    }
    userIds = userIds?.slice(0, -1);
    let resetdData = await _req.get(
      URLS.AUTH_SERVICE_URL +
      "/validate/otpattempts?userid=" +
      userIds +
      "&attempts=0",
    );
    return res.send(resetdData)
  }
  else
    return res.send(otpData)

});

router.post("/validateotp", async (req: any, res: any, next: any) => {
  var result = null;
  let email = req.body.email;
  let otp = req.body.otp;
  let _req = new Network();
  let userData = {
    email: email,
  };

  let userManagementData: Response = await _req.post(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuserexist",
    userData
  );

  let data = {
    userid: userManagementData.responseData.id.toString(),
    otp: otp,
    email: email,
  };
  let _response: Response = await _req.post(
    URLS.AUTH_SERVICE_URL + "/validate/compareotp",
    data
  );
  if (_response.responseCode === 200) {
    let userModal = new User();
    userModal.bindData({
      user_id: userManagementData.responseData.id,
      ..._response.responseData,
    });

    result = userModal;
    let user_id = userManagementData.responseData.id;
    let attempt = 0;
    await _req.get(
      URLS.USER_MANAGEMENT_SERVICE_URL +
      "/userManagement/loginattempts?userid=" +
      user_id +
      "&attempts=" +
      attempt
    );
    await _req.get(
      URLS.AUTH_SERVICE_URL +
      "/validate/otpattempts?userid=" +
      user_id +
      "&attempts=" +
      attempt
    );
    return res.send(new Response(result, 200));
  } else {
    let user_id = userManagementData.responseData.id;
    let loginAttempts = userManagementData.responseData.loginAttempts;
    loginAttempts = loginAttempts + 1;

    if (
      loginAttempts > 2 &&
      userManagementData.responseData.tfa_flag === true
    ) {
      let deactivateData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/deactivestatus?userid=" +
        user_id
      );
      if (deactivateData.responseCode === 200) {
        let emailData = {
          email_body: "User deactivated due to invalid attempts",
          email_subject: "Deactivated",
          email_to: userManagementData.responseData.email,
          firstname: userManagementData.responseData.firstName,
          lastname: userManagementData.responseData.lastName
        };
        /** send emai to user */
        await _req.post(
          URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
          emailData
        );
        result = new Response("user deactivated", 1041);
        return res.send(result);
      }
    } else if (userManagementData.responseData.tfa_flag === true) {
      await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/loginattempts?userid=" +
        user_id +
        "&attempts=" +
        loginAttempts
      );
    }
    _response.responseData = {};
    _response.responseData.loginAttempts = loginAttempts;
    return res.send(_response);
  }
});

router.post("/signup", async (req: any, res: any, next: any) => {
  var result: any = null;

  var model = new User();
  console.log("websiteURL", websiteURL);
  var validationResult = model.validateRegistration(req.body);
  if (validationResult.responseCode == 200) {
    // get bidding details from auction-microservice
    var _data = req.body;

    let _req = new Network();
    let data: Response = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/user",
      _data
    );

    /** if user created successfully */
    if (data.responseCode === 200) {
      var _resData = { id: data.responseData.id, password: req.body.password };

      let _authenticateData: Response = await _req.post(
        URLS.AUTH_SERVICE_URL + "/validate/createPassword",
        _resData
      );

      /** if password creation failed */
      if (_authenticateData.responseCode !== 200) {
        return res.send("Handle remove user here");
      } else if (_authenticateData.responseCode === 200) {
        /** password created successfully */
        /** get jwt token */
        var jwt_token =
          _authenticateData.responseData?.jwt_token !== undefined
            ? _authenticateData.responseData.jwt_token
            : undefined;
        /** if jwt token created */
        if (jwt_token) {
          /** Make email template */
          /** Send email  */
          var emailData = {
            email_body: `${websiteURL}/select-avatar/${jwt_token}`,
            email_subject: "Welcome to Terra Virtua",
            email_to: _data.email,
            firstname: req.body.firstName,
            lastname: req.body.lastName

          };
          console.log(emailData)
          /** send emai to user */
          let notifRes: Response = await _req.post(
            URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
            emailData
          );
          /** if email send successfully */
          if (notifRes.responseCode !== 200) {
            return res.send(notifRes);
          }
        }
      }
    }
    result = data;
    res.send(result);
    return;
  } else {
    result = validationResult;
  }

  return res.send(result);
});

router.get("/resendemail", async (req: any, res: any, next: any) => {
  var result: any = null;

  // get bidding details from auction-microservice
  var email = req.query.email;
  var _data = {
    email: email,
  };

  let _req = new Network();
  let data: Response = await _req.post(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuserexist",
    _data
  );
  var userid = data.responseData.id;
  let _authenticateData: Response = await _req.get(
    URLS.AUTH_SERVICE_URL + "/validate/checktoken?userid=" + userid
  );
  var jwt = _authenticateData.responseData.activation_token;

  /** Send email  */
  var emailData = {
    email_body: `${websiteURL}/select-avatar/${jwt}`,
    email_subject: "Welcome to Terra Virtua",
    email_to: email,
    firstname: data.responseData.firstName,
    lastname: data.responseData.lastName
  };
  /** send emai to user */
  let notifRes: Response = await _req.post(
    URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
    emailData
  );
  /** if email send successfully */
  if (notifRes.responseCode !== 200) {
    return res.send(notifRes);
  }

  return res.send(notifRes);
});

router.post("/forgotpassword", async (req: any, res: any, next: any) => {
  var result = null;
  var data: any = {};
  var model = new User();

  var validationResult = model.validateForgotPass(req.body);
  if (validationResult.responseCode == 200) {
    var _data = req.body;

    let _req = new Network();
    let userManagementData: Response = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuserexist",
      _data
    );
    if (userManagementData.responseCode === 200) {
      var _resData = userManagementData.responseData;
      data = userManagementData.responseData;
      if (_resData?.isActive === false) {
        data = new Response("", 1017);
        return res.send(data);
      } else if (_resData?.userStatus === DEACTIVE) {
        data = new Response("", 1041);
        return res.send(data);
      } else {
        let _authenticateData: Response = await _req.post(
          URLS.AUTH_SERVICE_URL + "/validate/forgotpassword",
          _resData
        );
        if (_authenticateData.responseCode !== 200) {
          return res.send("Handle remove user here");
        }
        data = _authenticateData.responseData;
        var email = new Notification();
        email.email_body = `${websiteURL}/user/reset/${data.jwt_token}`;
        email.email_subject = "Change password";
        email.email_to = req.body.email;
        email.firstname=userManagementData.responseData.firstName
        email.lastname=userManagementData.responseData.lastName
        let _notificationData: Response = await _req.post(
          URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
          email
        );
        if (_notificationData.responseCode === 200) {
          data = "Success";
        } else return res.send(_notificationData);
      }
    } else {
      return res.send(userManagementData);
    }
    result = new Response(data, 200);
    res.send(result?.compose());
    return;
  } else {
    result = validationResult;
  }

  return res.send(result);
});

router.post("/validateresettoken", async (req: any, res: any, next: any) => {
  var result = null;
  var model = new User();

  var validationResult = model.validateResetToken(req.body);
  if (validationResult.responseCode == 200) {
    var _data = req.body;

    let _req = new Network();
    let _response: Response = await _req.post(
      URLS.AUTH_SERVICE_URL + "/validate/validateresettoken",
      _data
    );
    result = _response;
  } else {
    result = validationResult;
  }

  return res.send(result);
});

router.post("/resetpassword", async (req: any, res: any, next: any) => {
  var result = null;
  var model = new User();

  var validationResult = model.validateResetPassword(req.body);
  if (validationResult.responseCode == 200) {
    var _data = req.body;

    let _req = new Network();
    let _response: Response = await _req.post(
      URLS.AUTH_SERVICE_URL + "/validate/resetpassword",
      _data
    );
    result = _response;
    if (result.responseCode === 200) {
      let id = result.responseData?.user_id;
      let _usersData = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/overview?userid=" +
        id
      );
      if (_usersData.responseCode === 200) {
        let user = _usersData?.responseData[0];
        var email = new Notification();
        email.email_body = `dummy`;
        email.email_subject = "Reset password";
        email.email_to = user.email;
        email.firstname=_usersData.responseData.firstName
        email.lastname=_usersData.responseData.lastName
        await _req.post(
          URLS.NOTIFICATION_SERVICE_URL + "/notification/saveemail",
          email
        );
      }
    }
  } else {
    result = validationResult;
  }

  return res.send(result);
});

router.post("/checkusername", async (req: any, res: any, next: any) => {
  var result = null;
  var model = new User();

  var validationResult = model.validateUserName(req.body);
  if (validationResult.responseCode == 200) {
    let _data = req.body;
    let _req = new Network();
    let _response: Response = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuser",
      _data
    );
    result = _response;
  } else {
    result = validationResult;
  }

  return res.send(result);
});

router.post("/checkemail", async (req: any, res: any, next: any) => {
  var result = null;
  var model = new User();

  var validationResult = model.validateCheckEmail(req.body);
  if (validationResult.responseCode == 200) {
    let _data = req.body;
    let _req = new Network();
    let _response: Response = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/checkuserexist",
      _data
    );
    result = _response;
  } else {
    result = validationResult;
  }

  return res.send(result);
});

router.post("/validate", async (req: any, res: any, next: any) => {
  var result = null;
  let _data = req.body;
  let _req = new Network();
  let _response: Response = await _req.post(
    URLS.AUTH_SERVICE_URL + "/validate/validate",
    _data
  );
  result = _response;
  if (_response.responseCode === 200) result = new Response("", 200);
  return res.send(result);
});

router.post("/loginmetamask", async (req: any, res: any, next: any) => {
  var result = null;
  let _req = new Network();
  let body = { metamask_wallet: req.body.metamaskwallet };
  let _response: Response = await _req.post(
    URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/validate?userid=",
    body
  );
  result = _response;
  if (result.responseCode === 200) {
    let email = _response.responseData.email;
    let user_id = _response.responseData.id;
    let _authenticateBody = { user_id, email };
    let _authenticateData: Response = await _req.post(
      URLS.AUTH_SERVICE_URL + "/validate/authenticatemetamask",
      _authenticateBody
    );
    if (_authenticateData.responseCode === 200) {
      let userModal = new User();
      userModal.jwt_token = _authenticateData.responseData.jwt_token;
      userModal.refresh_token = _authenticateData.responseData.refresh_token;
      userModal.user_id = _authenticateData.responseData.user.id;
      result = new Response(userModal, 200);
    } else return res.send(_authenticateData);
  }

  return res.send(result);
});

router.post(
  "/validateactivationtoken",
  async (req: any, res: any, next: any) => {
    let _data = req.body;
    let _req = new Network();
    let _response: Response = await _req.post(
      URLS.AUTH_SERVICE_URL + "/validate/validateactivationtoken",
      _data
    );

    res.send(_response);
  }
);

router.post("/deactivestatususer", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var token = req.body.jwt_token;
  if (token !== undefined) {
    let obj: any = decodeJwtToken(token);
    if (obj !== 6023) {
      let _response: Response = await _req.get(
        URLS.USER_MANAGEMENT_SERVICE_URL +
        "/userManagement/deactivestatus?userid=" +
        obj.user_id
      );
      _response = await _req.get(
        URLS.AUTH_SERVICE_URL + "/validate/updateToken?jwt_token=" + token
      );
      return res.send(new Response("", 200));
    }
    return res.send(new Response("", 1023));
  }
  return res.send(new Response("", 1023));
});
router.post("/refreshtoken", async (req: any, res: any, next: any) => {
  let _req = new Network();
  var token = req.body.refreshtoken;
  let body = {
    refresh_token: token,
  };
  let _response = await _req.post(
    URLS.AUTH_SERVICE_URL + "/validate/refreshjwt",
    body
  );
  if (_response.jwt_token) return res.send(new Response(_response, 200));
  return res.send(_response);
});

router.get("/avatars", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let query = "";
  Object.keys(req.query).forEach((element) => {
    query = query + `&${element}=${req.query[element]}`;
  });
  let splitQuery = query.substring(1);
  let data = await _req.get(
    URLS.ASSET_SERVICE_URL + "/asset/avatars?" + splitQuery
  );
  return res.send(data);
});

router.get("/getnewsfeed", async (req: any, res: any, next: any) => {
  let _req = new Network();

  let data = await _req.get(URLS.CONFIG_SERVICE_URL + "/configs/getnews");
  return res.send(data);
});
router.get("/getallfaqs", async (req: any, res: any, next: any) => {
  let data: any = [];
  let _req = new Network();
  data = await _req.get(
    URLS.CONFIG_SERVICE_URL +
    `/configs/getallfaqs?category_id=${req.query.category_id}`
  );
  res.send(data);
});
router.get("/getfaqscategories", async (req: any, res: any, next: any) => {
  let data: any = [];
  let _req = new Network();
  data = await _req.get(URLS.CONFIG_SERVICE_URL + "/configs/getfaqscategories");
  res.send(data);
});

router.post("/confirmintent", async (req: any, res: any, next: any) => {
  try {
    let _req = new Network();
    let id = req.body.paymentintentid;
    let _get_trading = await _req.get(
      URLS.TRADING_SERVICE_URL +
      "/trading/getstripeintent?paymentintentid=" +
      id
    );
    if (_get_trading.responseCode == 200) {
      let cardID = _get_trading.responseData.card_id;

      let stripe = new StripeService();
      let intent = await stripe.confirmPaymentIntent(id, cardID);
      let body = {
        orderid: req.body.orderid,
        paymentintentid: id,
        status: "Completed",
        receipt: intent?.charges?.data[0]?.receipt_url,
      };
      let _trading = await _req.post(
        URLS.TRADING_SERVICE_URL + "/trading/updatestripe",
        body
      );
      if (_trading.responseCode == 200) {
        return res.send(new Response(intent?.charges.data[0].receipt_url, 200));
      }
      return res.send(_trading);
    }
    return res.send(_get_trading);
  } catch (error: any) {
    return res.send(new Response(error.message, 400));
  }
});

router.post("/addnotification", async (req: any, res: any, next: any) => {
  let _req = new Network();
  let _body = req.body;
  let data = await _req.post(
    URLS.NOTIFICATION_SERVICE_URL + "/notification/addnotification",
    _body
  );
  return res.send(data);
});
router.post("/changetfaflag", async (req: any, res: any, next: any) => {
  var userid = null;
  let token = req.body.token;
  let status = req.body.status;
  let obj: any = decodeJwtToken(token);
  if (obj !== 6023) {
    userid = obj.user_id
    let data = {
      userid: userid,
      status: status,
    };
    let _req = new Network();
    let _user_data = await _req.post(
      URLS.USER_MANAGEMENT_SERVICE_URL + "/userManagement/tfaflag",
      data
    );
    return res.send(_user_data)
  }
  return res.send('', 6023)
});

export = router;
