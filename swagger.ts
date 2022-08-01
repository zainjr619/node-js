import URLS from 'tv-micro-services-common/build/urls';
let domain = URLS.BUSINESS_SERVICE_URL && URLS.BUSINESS_SERVICE_URL.replace('https://', '');
let host = domain && domain.replace('/api/v1', '');
 host="localhost:3003"
export = {
  "swagger": "2.0",
  "info": {
    "version": "1.0.0",
    "title": "Terra Virtua API Gateway - Aggregation Service",
    "description": "Tera-Virtua, marketplace micro-service",
    "license": {
      "name": "MIT",
      "url": "https://opensource.org/licenses/MIT"
    }
  },
  "host": host,
  "basePath": "/api/v1",
  "schemes": ["http", "https"],
  "consumes": ["application/json"],
  "produces": ["application/json"],
  "securityDefinitions": {
    "ApiKeyAuth": {
      "type": "apiKey",
      "in": "headers",
      "name": "authorization"
    }
  },
  "paths": {
    "/user/login": {
      "post": {
        "summary": "Login user",
        "tags": [
          "Users"
        ],
        "description": "Login user in system",
        "parameters": [
          {
            "name": "user",
            "in": "body",
            "description": "Login user",
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/User"
            }
          },
          "401": {
            "description": "Login details are not valid!!"
          },
          "404": {
            "description": "Email is not registered!"
          },
          "500": {
            "description": "User login failed!!"
          }
        }
      }
    },
    "/user/resendotp": {
      "post": {
        "summary": "resendotp user",
        "tags": [
          "Users"
        ],
        "description": "resendotp user in system",
        "parameters": [
          {
            "name": "user",
            "in": "body",
            "description": "resendotp user",
            "schema": {
              "$ref": "#/definitions/resendotp"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/resendotp"
            }
          }
        }
      }
    },
    "/user/getnewsfeed": {
      "get": {
        "summary": "Get Sample Staff",
        "produces": ["application/json"],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/user/resetotpattempts": {
      "get": {
        "summary": "Get Sample Staff",
        "produces": ["application/json"],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/user/tfaflag": {
      "post": {
        "summary": "update tfa flag user against id",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": " Showing staff",
            "schema": {
              "$ref": "#/definitions/tfa"
            }
          },

        ],


        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          },

        }
      }
    },
    "/user/validateotp": {
      "post": {
        "summary": "Validate otp",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": " Showing staff",
            "schema": {
              "$ref": "#/definitions/otp"
            }
          },

        ],


        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          },

        }
      }
    },
    "/user/resendemail": {
      "get": {
        "summary": "Resend email",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "email",
            "in": "query",
            "description": " enter mail"
          }
        ],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/loginmetamask": {
      "post": {
        "summary": "Login user with metamask",
        "tags": [
          "Users"
        ],
        "description": "Login user in system",
        "parameters": [
          {
            "name": "metamaskwallet",
            "in": "body",
            "description": "Login user",
            "schema": {
              "$ref": "#/definitions/UserMetamask"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/User"
            }
          },
          "401": {
            "description": "Login details are not valid!!"
          },
          "404": {
            "description": "Email is not registered!"
          },
          "500": {
            "description": "User login failed!!"
          }
        }
      }
    },
    "/user/useroverveiwdetials": {
      "get": {
        "summary": "Get multiple Staff against id",
        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/linkmetamask": {
      "post": {
        "summary": "Link user with metamask",
        "tags": [
          "Users"
        ],
        "description": "Link user in system",
        "parameters": [
          {
            "name": "metamaskwallet",
            "in": "body",
            "description": "Link metamask",
            "schema": {
              "$ref": "#/definitions/UserMetamask"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/User"
            }
          },
          "401": {
            "description": "Login details are not valid!!"
          },
          "404": {
            "description": "Email is not registered!"
          },
          "500": {
            "description": "User login failed!!"
          }
        }
      }
    },
    "/user/signup": {
      "post": {
        "summary": "Register user",
        "tags": [
          "Users"
        ],
        "description": "Register user in system",
        "parameters": [
          {
            "name": "user",
            "in": "body",
            "description": "Register user",
            "schema": {
              "$ref": "#/definitions/UserRegister"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Register Success",
            "schema": {
              "$ref": "#/definitions/UserRegister"
            }
          },
          "401": {
            "description": "Register details are not valid!!"
          },
          "404": {
            "description": "Email is not registered!"
          },
          "500": {
            "description": "User login failed!!"
          }
        }
      }
    },
    "/mobileapp/sign-up": {
      "post": {
        "summary": "Register user",
        "tags": [
          "Mobile Api"
        ],
        "description": "Register user in system",
        "parameters": [
          {
            "name": "user",
            "in": "body",
            "description": "Register user",
            "schema": {
              "$ref": "#/definitions/UserMobileRegister"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "An email has been sent to your Email address to verify your account",
          },
          "405": {
            "description": "Password validations"
          },
          "400": {
            "description": "Email and username is not registered!"
          },
          "500": {
            "description": "Internal Server Error."
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue."
          }
        }
      }
    },
    "/mobileapp/login": {
      "post": {
        "summary": "Login api for TVMA",
        "tags": [
          "Mobile Api"
        ],
        "description": "It will take username and password as input.",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "TVMA Login user",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUser"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support.!"
          },
          "404": {
            "description": "User not found.!"
          },
          "405": {
            "description": "username is required!"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue.!"
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },

    "/mobileapp/home": {
      "get": {
        "summary": "Home for TVMA",
        "tags": [
          "Mobile Api"
        ],
        "description": "Home for TVMA",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Home Success",
          },
          "500": {
            "description": "Internal Server Error.!"
          },

        },
      }
    },
    "/mobileapp/profile": {
      "get": {
        "summary": " User For TVMA",
        "tags": [
          "Mobile Api"
        ],
        "description": " user  profile in TVMA",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support!,  The incoming token is invalid,  User session has been revoked, Authorization header missing."

          },
          "500": {
            "description": "Internal Server Error.!"
          },

        },
      }
    },
    "/mobileapp/my-avatars": {
      "post": {
        "summary": "user will receive all his assets either won or bought and if access token is missing then default avatars will be shown",
        "tags": [
          "Mobile Api"
        ],
        "description": "user will receive all his assets either won or bought and if access token is missing then default avatars will be shown",
        "parameters": [
          {
            "name": "limit",
            "description": "limit",
            "type": "string"

          },
          {
            "name": "page",
            "description": "page",
            "type": "string"

          },
          {
            "name": "sort_type",
            "description": "sort_type",
            "type": "string"

          },
          {
            "name": "sorting",
            "description": "sorting",
            "type": "string"

          },
          {
            "name": "nft_type_code",
            "description": "nft_type_code",
            "type": "string"

          },
          {
            "name": "is_tradable",
            "description": "is_tradable",
            "type": "string"
          },
          {
            "name": "nft_type_id",
            "description": "nft_type_id",
            "type": "string"
          },
          {
            "name": "brand_id",
            "description": "brand_id",
            "type": "string"
          },
          {
            "name": "edition_id",
            "description": "edition_id",
            "type": "string"
          },
          {
            "name": "category_id",
            "description": "category_id",
            "type": "string"
          },
          {
            "name": "type_id",
            "description": "type_id",
            "type": "string"
          },
          {
            "name": "variation_id",
            "description": "variation_id",
            "type": "string"
          },
          {
            "name": "series_id",
            "description": "series_id",
            "type": "string"
          },
          {
            "name": "artist_id",
            "description": "artist_id",
            "type": "string"
          },
          {
            "name": "art_collection_id",
            "description": "art_collection_id",
            "type": "string"
          },
          {
            "name": "rarity_id",
            "description": "rarity_id",
            "type": "string"
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "500": {
            "description": "Internal Server Error.!"
          }
        },
      },
    },

    "/mobileapp/user-feedback": {
      "post": {
        "summary": "Create Feedback",
        "parameters": [
          {
            "name": "name",
            "in": "body",
            "description": "Add  a user",
            "schema": {
              "$ref": "#/definitions/addfeedback"
            }

          }

        ],
        "tags": ["Mobile Api"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/UserManagement"
            }
          }
        }
      }
    },
    "/mobileapp/email-available": {
      "get": {
        "summary": "Check email is available for user",
        "parameters": [
          {
            "name": "email",
            "in": "query",
            "description": "email available for user",
          }
        ],
        "tags": ["Mobile Api"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/tv-app-response"
            }
          }
        }
      }
    },

    "/mobileapp/username-available": {
      "get": {
        "summary": "Check user name is available for user",
        "parameters": [
          {
            "name": "username",
            "in": "query",
            "description": "username available for user",
          }
        ],
        "tags": ["Mobile Api"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/tv-app-response"
            }
          }
        }
      }
    },

    // "/mobileapp/reset-password": {
    //   "post": {
    //     "summary": "Reset user password",
    //     "tags": [
    //       "Mobile Api"
    //     ],
    //     "description": "Reset user password",
    //     "parameters": [
    //       {
    //         "name": "user",
    //         "in": "body",
    //         "description": "Reset user password",
    //         "schema": {
    //           "$ref": "#/definitions/resetpassword"
    //         }
    //       }
    //     ],
    //     "produces": [
    //       "application/json"
    //     ],
    //     "responses": {
    //       "200": {
    //         "description": "Password reset successfully.",
    //       },
    //       "405": {
    //         "description": "Password validations"
    //       },
    //       "400": {
    //         "description": "Code is invalid or expired."
    //       },
    //       "500": {
    //         "description": "Internal Server Error."
    //       },
    //       "428": {
    //         "description": "It seems you are using an older version of Terra Virtua, please update the app to continue."
    //       }
    //     }
    //   }
    // },
    "/user/overview": {
      "get": {
        "summary": "User Dashboard",
        "tags": ["Users"],
        "description": "Get user dashboard",
        "parameters": [
          {
            "name": "userid",
            "in": "query",
            "description": "userid of a user"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User Dashboard",
            "schema": {
              "$ref": "#/definitions/User"
            }
          }
        }
      }
    },
    "/user/privateuser": {
      "get": {
        "summary": "User Dashboard",
        "tags": ["Users"],
        "description": "Get user dashboard",
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "description": "status of a user"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User Dashboard",
          }
        }
      }
    },
    "/user/recentactivity": {
      "get": {
        "summary": "Add wishlist",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "(offerreceived,mybids,pendingpayments)",
          }
        ],
        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/addwishlist": {
      "post": {
        "summary": "Add wishlist",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter data to add in wishlist",
            "schema": {
              "$ref": "#/definitions/wishlist"
            }
          }
        ],
        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/deletewishlist": {
      "get": {
        "summary": "Get items in wish list",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "item_id",
            "in": "query",
            "description": "enter item_id"

          },
          {
            "name": "item_type",
            "in": "query",
            "description": "enter item_type"

          },
        ],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/getwishlist": {
      "get": {
        "summary": "Get items in wish list",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "item_type",
            "in": "query",
            "description": "enter item_type"

          },
          {
            "name": "pageno",
            "in": "query",
            "description": "enter item_type"

          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "enter item_type"

          },
        ],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/forgotpassword": {
      "post": {
        "summary": "Forgot password",
        "tags": [
          "Users"
        ],
        "description": "Forgot password",
        "parameters": [
          {
            "name": "email",
            "in": "body",
            "description": "email of a user",
            "schema": {
              "$ref": "#/definitions/ForgotPassword"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "User Dashboard",
            "schema": {
              "$ref": "#/definitions/ForgotPassword"
            }
          }
        }
      }
    },

    // "/mobileapp/forgot-password": {
    //   "post": {
    //     "summary": "Forgot password",
    //     "tags": [
    //       "Mobile Api"
    //     ],
    //     "description": "Forgot password",
    //     "parameters": [
    //       {
    //         "name": "email",
    //         "in": "body",
    //         "description": "username of a user",
    //         "schema": {
    //           "$ref": "#/definitions/ForgotMobilePassword"
    //         }
    //       }
    //     ],
    //     "produces": [
    //       "application/json"
    //     ],
    //     "responses": {
    //       "200": {
    //         "description": "User Dashboard",
    //         "schema": {
    //           "$ref": "#/definitions/ForgotPassword"
    //         }
    //       }
    //     }
    //   }
    // },
    "/user/validateresettoken": {
      "post": {
        "summary": "Validate reset jwt token",
        "tags": [
          "Users"
        ],
        "description": "Validate reset jwt token",
        "parameters": [
          {
            "name": "email",
            "in": "body",
            "description": "email of a user",
            "schema": {
              "$ref": "#/definitions/ResetJwt"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "User Dashboard",
            "schema": {
              "$ref": "#/definitions/ResetJwt"
            }
          }
        }
      }
    },
    "/user/resetpassword": {
      "post": {
        "summary": "reset password",
        "tags": [
          "Users"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "passwords",
            "in": "body",
            "description": "passwords",
            "schema": {
              "$ref": "#/definitions/ResetPassword"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/ResetPassword"
            }
          }
        }
      }
    },
    "/user/checkusername": {
      "post": {
        "summary": "check if username already exist",
        "tags": [
          "Users"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "userName",
            "in": "body",
            "description": "userName",
            "schema": {
              "$ref": "#/definitions/Username"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/Username"
            }
          }
        }
      }
    },
    "/user/checkemail": {
      "post": {
        "summary": "check if email already exist",
        "tags": [
          "Users"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "email",
            "in": "body",
            "description": "email",
            "schema": {
              "$ref": "#/definitions/UserEmail"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/UserEmail"
            }
          }
        }
      }
    },
    "/user/validate": {
      "post": {
        "summary": "check jwt_token",
        "tags": [
          "Users"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "jwt_token",
            "in": "body",
            "description": "jwt_token",
            "schema": {
              "$ref": "#/definitions/Validate"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/Validate"
            }
          }
        }
      }
    },
    "/user/changepassword": {
      "post": {
        "summary": "check jwt_token",
        "tags": [
          "Users"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "passwords",
            "in": "body",
            "description": "passwords",
            "schema": {
              "$ref": "#/definitions/ChangePassword"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/Validate"
            }
          }
        }
      }
    },
    "/mobileapp/change-password": {
      "post": {
        "summary": "check jwt_token",
        "tags": [
          "Mobile Api"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "passwords",
            "in": "body",
            "description": "passwords",
            "schema": {
              "$ref": "#/definitions/ChangeMobilePassword"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/Validate"
            }
          }
        }
      }
    },
    "/mobileapp/disable": {
      "post": {
        "summary": "disable user status",
        "tags": [
          "Mobile Api"
        ],
        "produces": ["application/json"],

        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          }
        }
      }
    },
    "/mobileapp/refresh-token": {
      "post": {
        "summary": "Refresh Token Api For TVMA ",
        "tags": [
          "Mobile Api"
        ],
        "description": "It will take refreshToken as input and will return accessToken , expiry of access Token as output",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "Refresh Token For TVMA",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryRefreshToken"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Refresh Token success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "405": {
            "description": "refresh token should NOT be shorter than 1 character"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue."
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },
    "/user/overviewuser": {
      "get": {
        "summary": "Get multiple Staff against id",
        "parameters": [
          {
            "name": "userid",
            "in": "query",
            "description": " Showing staff enter userid comma separated",
          }
        ],
        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/overview"
            }
          }
        }
      }
    },
    "/user/updateoverviewuser": {
      "post": {
        "summary": "Update User but username and email can't be updated",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "update a user"
          },
          {
            "name": "name",
            "in": "body",
            "description": "update a user"
          }
        ],
        "tags": ["Users"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/UserManagement"
            }
          }
        }
      }
    },
    "/user/deactivestatususer": {
      "get": {
        "summary": " deactivate user status",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "userid",
            "in": "query",
            "description": " Showing user active or not"
          }
        ],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/checkActive"
            }
          }
        }
      }
    },
    "/user/allnfts": {
      "get": {
        "summary": "Get all nfts",
        "tags": ["Users"],
        "description": "Get all nfts",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Offer Item Details"
          }
        }
      }
    },
    "/user/packs": {
      "get": {
        "summary": "Get user packs",
        "tags": ["Users"],
        "description": "Get packs",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,latest)"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "brand",
            "in": "query",
            "description": "brand filter - multiple brand separated by comma"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Packs User"
          }
        }
      }
    },
    "/user/collections": {
      "get": {
        "summary": "Get collections",
        "tags": ["Users"],
        "description": "Get collections for marketplace",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,latest)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "brand",
            "in": "query",
            "description": "brand filter - multiple brands separated by comma"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "collections Marketplace"
          }
        }
      }
    },
    "/user/auctions": {
      "get": {
        "summary": "Get auctions",
        "tags": ["Users"],
        "description": "Get auctions for user",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (inprogress,completed)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Auctions data for user dashboard"
          }
        }
      }
    },
    "/user/auctionsandallbids": {
      "get": {
        "summary": "Get auctions",
        "tags": ["Users"],
        "description": "Get auctions for user",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (inprogress,completed)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Auctions data for user dashboard"
          }
        }
      }
    },
    "/admin/login": {
      "post": {
        "summary": "Login for admin",
        "tags": [
          "Admin"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "email",
            "in": "body",
            "description": "email and password of admin",
            "schema": {
              "$ref": "#/definitions/adminlogin"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/adminlogin"
            }
          }
        }
      }
    },
    "/admin/validate": {
      "post": {
        "summary": "Validate jwttoken for Admin",
        "tags": [
          "Admin"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "jwttoken",
            "in": "body",
            "description": "jwttoken of admin",
            "schema": {
              "$ref": "#/definitions/adminvalidate"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/adminvalidate"
            }
          }
        }
      }
    },
    "/admin/resetpassword": {
      "post": {
        "summary": "Send email",
        "tags": [
          "Admin"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "email",
            "in": "body",
            "description": "email of admin",
            "schema": {
              "$ref": "#/definitions/adminemail"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/adminemail"
            }
          }
        }
      }
    },
    "/admin/changepassword": {
      "post": {
        "summary": "changepassword",
        "tags": [
          "Admin"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "password",
            "in": "body",
            "description": "change password of admin",
            "schema": {
              "$ref": "#/definitions/changepassword"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/changepassword"
            }
          }
        }
      }
    },
    "/admin/updateorderid": {
      "post": {
        "summary": "update orderid",
        "tags": [
          "Admin"
        ],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "password",
            "in": "body",
            "description": "update orderid",
            "schema": {
              "$ref": "#/definitions/orderid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/getusertransactions": {
      "get": {
        "summary": "get user transaction",
        "parameters": [
          {
            "name": "user_id",
            "in": "query",
            "description": "Enter id to get transactions"
          }
        ],
        "produces": ["application/json"],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/cancelbid": {
      "get": {
        "summary": "Change bid status",
        "parameters": [
          {
            "name": "bid_id",
            "in": "query",
            "description": "Enter id to change status"
          }
        ],
        "produces": ["application/json"],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/collectiondetails": {
      "get": {
        "summary": "Get complete details of collection",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "Enter collectionid to get details"
          }
        ],
        "produces": ["application/json"],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/canceloffer": {
      "get": {
        "summary": "Change offer status",
        "parameters": [
          {
            "name": "offerId",
            "in": "query",
            "description": "Enter id to change status"
          }
        ],
        "produces": ["application/json"],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/releasedinmonth": {
      "get": {
        "summary": "Get item released in months",
        "parameters": [
          {
            "name": "pageno",
            "in": "query",
            "description": "Elements to skips"
          },
          {

            "name": "pagesize",
            "in": "query",
            "description": "total item to pull"

          }
        ],
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/marketplace/bidpercentage": {
      "get": {
        "summary": "Change bid status",
        "parameters": [
          {
            "name": "user_id",
            "in": "query",
            "description": "Enter user_id"
          },
          {
            "name": "item_sku_id",
            "in": "query",
            "description": "Enter item_sku_id"
          }
        ],
        "produces": ["application/json"],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/collectibles": {
      "get": {
        "summary": "Get Collectibles",
        "tags": ["Marketplace"],
        "description": "Get collectible assets",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "brand",
            "in": "query",
            "description": "brand filter - multiple brands separated by comma"
          },
          {
            "name": "rarity",
            "in": "query",
            "description": "rarity filter"
          },
          {
            "name": "rarity",
            "in": "query",
            "description": "rarity filter"
          },
          {
            "name": "set",
            "in": "query",
            "description": "set filter"
          },
          {
            "name": "color",
            "in": "query",
            "description": "color filter"
          },
          {
            "name": "edition",
            "in": "query",
            "description": "edition filter"
          },
          {
            "name": "series",
            "in": "query",
            "description": "series filter"
          },
          {
            "name": "category",
            "in": "query",
            "description": "category filter"
          },
          {
            "name": "type",
            "in": "query",
            "description": "type filter"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Collectible Marketplace"
            // "schema": {
            //   "$ref": "#/definitions/User"
            // }
          }
        }
      }
    },
    "/marketplace/trading": {
      "post": {
        "summary": "create transactions",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter field to create a trade ",
            "schema": {
              "$ref": "#/definitions/trans"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/buyauction": {
      "post": {
        "summary": "create transactions",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter field to create a trade ",
            "schema": {
              "$ref": "#/definitions/trans"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/acceptoffer": {
      "post": {
        "summary": "Accept offers",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter field to accept offer ",
            "schema": {
              "$ref": "#/definitions/acceptoffer"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/checkout": {
      "post": {
        "summary": "create transactions",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter field to create a trade ",
            "schema": {
              "$ref": "#/definitions/checkout"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/settrade": {
      "post": {
        "summary": "set element for trading - onsale OR on auction",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter data to enable trading ",
            "schema": {
              "$ref": "#/definitions/trade"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/canceltrade": {
      "post": {
        "summary": "cancel element for trading",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter data to enable trading ",
            "schema": {
              "$ref": "#/definitions/trade"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/useroffers": {
      "post": {
        "summary": "Offers of a user",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Enter data to get offers ",
            "schema": {
              "$ref": "#/definitions/Offersall"
            }
          }
        ],
        "tags": ["Trading"],

        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/placeoffer": {
      "post": {
        "summary": "It creates a offer",
        "tags": ["Trading"],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Placing a offer",
            "schema": {
              "$ref": "#/definitions/placeoffer"
            }

          }

        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/marketplace/placebid": {
      "post": {
        "summary": "It creates a bid",
        "tags": ["Trading"],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Placing a bid",
            "schema": {
              "$ref": "#/definitions/placebid"
            }

          }

        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/placebid"
            }
          }
        }
      }
    },
    "/marketplace/createauction": {
      "post": {
        "summary": "Create a new auction for the specified item",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Create an auction",
            "schema": {
              "$ref": "#/definitions/auction"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/auction"
            }
          }
        }
      }
    },
    "/marketplace/inprogress": {
      "get": {
        "summary": "Get inprogress Collection",
        "parameters": [
          {
            "name": "pageno",
            "in": "query",
            "description": "Elements to skips"
          },
          {

            "name": "pagesize",
            "in": "query",
            "description": "total item to pull"

          }
        ],
        "produces": ["application/json"],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/checkcollection"
            }
          }
        }
      }
    },
    "/marketplace/completed": {
      "get": {
        "summary": "Get completed Collection",
        "parameters": [
          {
            "name": "pageno",
            "in": "query",
            "description": "Elements to skips"
          },
          {

            "name": "pagesize",
            "in": "query",
            "description": "total item to pull"

          }
        ],
        "produces": ["application/json"],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/checkcollection"
            }
          }
        }
      }
    },
    "/marketplace/listauctions": {
      "get": {
        "summary": "It returns the auctions of the user",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "ID of user who is making auctions on different auction items"
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/userid"
            }
          }
        }
      }
    },
    "/marketplace/cancelauction": {
      "post": {
        "summary": "It cancels the auctions created by the user",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "ID of user who is making auctions on different auction items",
            "schema": {
              "$ref": "#/definitions/cancelauction"
            }
          },
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/cancelauction"
            }
          }
        }
      }
    },
    "/marketplace/canceluserallauctions": {
      "post": {
        "summary": "It cancels all the auction made from the user",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/auctionsqueue": {
      "get": {
        "summary": "get all user auctions in queue",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/salesqueue": {
      "get": {
        "summary": "get all user sales in queue",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/cancelauctionsqueue": {
      "get": {
        "summary": "Cancel all user auctions in queue",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/cancelsalesqueue": {
      "get": {
        "summary": "Cancel all user sales in queue",
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/artwork": {
      "get": {
        "summary": "Get artwork",
        "tags": ["Marketplace"],
        "description": "Get artwork assets",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "filter",
            "in": "query",
            "description": "filterby (secondary,primary)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "curation",
            "in": "query",
            "description": "curation filter - multiple curation separated by comma"
          },
          {
            "name": "artist",
            "in": "query",
            "description": "artist filter - multiple artist separated by comma"
          },
          {
            "name": "collection",
            "in": "query",
            "description": "collection filter - multiple artist separated by comma"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      }
    },
    "/marketplace/comics": {
      "get": {
        "summary": "Get comics",
        "tags": ["Marketplace"],
        "description": "Get comics assets",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "filter",
            "in": "query",
            "description": "filterby (secondary,primary)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "publisher",
            "in": "query",
            "description": "publisher filter - multiple publisher separated by comma"
          },
          {
            "name": "artist",
            "in": "query",
            "description": "artist filter - multiple artist separated by comma"
          },
          {
            "name": "category",
            "in": "query",
            "description": "category filter - multiple artist separated by comma"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "comics Marketplace"
          }
        }
      }
    },
    "/marketplace/collections": {
      "get": {
        "summary": "Get collections",
        "tags": ["Marketplace"],
        "description": "Get collections for marketplace",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,latest)"
          },
          {
            "name": "filter",
            "in": "query",
            "description": "filterby (secondary,primary)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "brand",
            "in": "query",
            "description": "brand filter - multiple brands separated by comma"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "collections Marketplace"
          }
        }
      }
    },
    "/marketplace/itemdetail": {
      "get": {
        "summary": "Get item by slug",
        "tags": ["Marketplace"],
        "description": "Get item for marketplace",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug"
          },
          {
            "name": "type",
            "in": "query",
            "description": "type (onsale,onauction)"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "collections Marketplace"
          }
        }
      }
    },
    "/marketplace/packdetail": {
      "get": {
        "summary": "Get pack by slug",
        "tags": ["Marketplace"],
        "description": "Get pack for marketplace",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug"
          },
          {
            "name": "type",
            "in": "query",
            "description": "type (onsale)"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "collections Marketplace"
          }
        }
      }
    },
    "/config/artworkfilters": {
      "get": {
        "summary": "Get artwork filters",
        "tags": ["Filters"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/config/comicsfilters": {
      "get": {
        "summary": "Get comics filters",
        "tags": ["Filters"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/config/collectiblefilters": {
      "get": {
        "summary": "Get collectible filters",
        "tags": ["Filters"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/config/packfilters": {
      "get": {
        "summary": "Get pack filters",
        "tags": ["Filters"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/config/collectionfilters": {
      "get": {
        "summary": "Get collection filters",
        "tags": ["Filters"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/marketplace/packs": {
      "get": {
        "summary": "Get packs",
        "tags": ["Marketplace"],
        "description": "Get packs",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,latest)"
          },
          {
            "name": "filter",
            "in": "query",
            "description": "filterby (primary,secondary)"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "brand",
            "in": "query",
            "description": "brand filter - multiple brand separated by comma"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Packs Marketplace"
          }
        }
      }
    },
    "/marketplace/collection": {
      "get": {
        "summary": "Get single collection",
        "tags": ["Marketplace"],
        "description": "Get collection for the provided slug",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug - must be string"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Collection Item Details"
          }
        }
      }
    },
    "/marketplace/itemskus": {
      "get": {
        "summary": "Get skus  of an item",
        "tags": ["Marketplace"],
        "description": "Get skus for the provided itemid",
        "parameters": [
          {
            "name": "itemid",
            "in": "query",
            "description": "itemid"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby (seriallowtohigh,serialhightolow)"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (onsale,onauction,purchased)"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Offer Item Details"
          }
        }
      }
    },
    "/marketplace/packskus": {
      "get": {
        "summary": "Get skus of a pack",
        "tags": ["Marketplace"],
        "description": "Get skus for the provided packid",
        "parameters": [
          {
            "name": "packitemid",
            "in": "query",
            "description": "packitemid"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby (seriallowtohigh,serialhightolow)"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (onsale,onauction,purchased)"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Offer Item Details"
          }
        }
      }
    },
    "/marketplace/all": {
      "get": {
        "summary": "Get all nfts",
        "tags": ["Marketplace"],
        "description": "Get all nfts",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "filter",
            "in": "query",
            "description": "filterby (primary,secondary)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Offer Item Details"
          }
        }
      }
    },
    "/marketplace/itemskusbyslug": {
      "get": {
        "summary": "Get all skus for an item",
        "tags": ["Marketplace"],
        "description": "Get all skus",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug of an item"
          },
          {
            "name": "type",
            "in": "query",
            "description": "type of item (collection,pack, asset)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total skus to fetch"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Item Details with skus"
          }
        }
      }
    },
    "/marketplace/getauctionbysku": {
      "get": {
        "summary": "Get auction of sku",
        "tags": ["Marketplace"],
        "description": "Get auction of skus",
        "parameters": [
          {
            "name": "serialnumber",
            "in": "query",
            "description": "serialnumber of an item"
          },
          {
            "name": "skunumber",
            "in": "query",
            "description": "skunumber"
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Get auction of sku"
          }
        }
      }
    },
    "/user/getTransactions": {
      "get": {
        "summary": "Get transactions for user",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby"
          },
          {
            "name": "startdate",
            "in": "query",
            "description": "startdate"
          },
          {
            "name": "enddate",
            "in": "query",
            "description": "enddate"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
        ],
        "produces": ["application/json"],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/redeemcollection": {
      "post": {
        "summary": "redeem collection against id ",
        "parameters": [
          {
            "name": "id",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/redeemcollection"
            }
          }
        ],
        "tags": ["Users"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/marketplace/revealpack": {
      "get": {
        "summary": "reveval pack",
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "skuid",
            "in": "query",
            "description": "pack skuid"

          },
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/revealpackbyid": {
      "get": {
        "summary": "reveval pack one by one",
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "skuid",
            "in": "query",
            "description": "pack skuid"

          },
          {
            "name": "itemSkus",
            "in": "query",
            "description": "itemSkus like this (1,2,3)"

          },
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/pack/reservepack": {
      "get": {
        "summary": "reserve pack",
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "packid",
            "in": "query",
            "description": "packid"
          },
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/user/allassets": {
      "get": {
        "summary": "Get all assets",
        "tags": ["Users"],
        "description": "Get all assets",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "rarity",
            "in": "query",
            "description": "rarity"
          },
          {
            "name": "keyword",
            "in": "query",
            "description": "keyword for search"
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Offer Item Details"
          }
        }
      }
    },
    "/marketplace/collectionslider": {
      "get": {
        "summary": "Get collections slider",
        "tags": ["Marketplace"],
        "description": "Get collections slider for marketplace",
        "parameters": [
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull (optional)"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number  (optional)"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "collections Marketplace"
          }
        }
      }
    },
    "/user/recommendeditems": {
      "get": {
        "summary": "Get user recommended items",
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/user/recommendedcollections": {
      "get": {
        "summary": "Get user recommended collections",
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/createasset": {
      "post": {
        "summary": "creating an asset",
        "parameters": [
          {
            "name": "name",
            "in": "formData",
            "description": "name",
            "type": "string"

          },
          {
            "name": "code",
            "in": "formData",
            "description": "code",
            "type": "string"

          },
          {
            "name": "slug",
            "in": "formData",
            "description": "slug",
            "type": "string"

          },
          {
            "name": "itemType",
            "in": "formData",
            "description": "itemType",
            "type": "string"
          },
          {
            "name": "price",
            "in": "formData",
            "description": "price",
            "type": "string"
          },
          {
            "name": "ip",
            "in": "formData",
            "description": "ip",
            "type": "string"
          },
          {
            "name": "description",
            "in": "formData",
            "description": "description",
            "type": "string"
          },
          {
            "name": "mintCount",
            "in": "formData",
            "description": "mintCount",
            "type": "number"
          },
          {
            "name": "nftType",
            "in": "formData",
            "description": "nftType",
            "type": "string"
          },

          {
            "name": "category",
            "in": "formData",
            "description": "category",
            "type": "string"
          },
          {
            "name": "totalCount",
            "in": "formData",
            "description": "totalCount",
            "type": "number"
          },
          {
            "name": "brand_id",
            "in": "formData",
            "description": "brand_id",
            "type": "number"
          },
          {
            "name": "variation_id",
            "in": "formData",
            "description": "variation_id",
            "type": "number"
          },
          {
            "name": "edition_id",
            "in": "formData",
            "description": "edition_id",
            "type": "number"
          },
          {
            "name": "rarity_id",
            "in": "formData",
            "description": "rarity_id",
            "type": "number"
          },
          {
            "name": "type",
            "in": "formData",
            "description": "type",
            "type": "string"
          },
          {
            "name": "statusType",
            "in": "formData",
            "description": "statusType Either True or False",
            "type": "string"
          },
          {
            "name": "set_id",
            "in": "formData",
            "description": "set_id",
            "type": "number"
          },
          {
            "name": "series_id",
            "in": "formData",
            "description": "series_id",
            "type": "number"
          },
          {
            "name": "DCL_Type",
            "in": "formData",
            "description": "DCL_Type",
            "type": "string"
          },
          {
            "name": "Lobby_Type",
            "in": "formData",
            "description": "Lobby_Type",
            "type": "string"
          },
          {
            "name": "itemListed",
            "in": "formData",
            "description": "Item Listed",
            "type": "string"
          },
          {
            "name": "s3Filename",
            "in": "formData",
            "description": "s3Filename",
            "type": "string"
          },
          {
            "name": "youtube_link",
            "in": "formData",
            "description": "Youtube Link",
            "type": "string"
          },
          {
            "name": "webg_url",
            "in": "formData",
            "description": "webg_url",
            "type": "string"
          },
          {
            "name": "thumbnail_url",
            "in": "formData",
            "description": "thumbnail_url",
            "type": "file"
          },

          {
            "name": "large_image",
            "in": "formData",
            "description": "large_image",
            "type": "file"
          },
        ],
        "produces": ["multipart/form-data"],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "multipart/form-data",
          }
        }
      }
    },
    "/admin/getasset": {
      "get": {
        "summary": "Get Asset For Assest Management",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "type",
            "in": "query",
            "description": "type"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby"
          }
        ],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/admin/countasset": {
      "get": {
        "summary": "Get count of assets",
        "tags": ["Admin"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/admin/getassetskus": {
      "get": {
        "summary": "Get Asset For Assest Management",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "id of the asset"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby"
          },
        ],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/marketplace/counteroffer": {
      "post": {
        "summary": "counter offer on specified counter to its offerer",
        "description": "Place counter offer to user",
        "tags": ["Trading"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "offers json",
            "schema": {
              "$ref": "#/definitions/counteroffer"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Offers Success",
            "schema": {
              "$ref": "#/definitions/counteroffer"
            }
          }
        }
      }
    },
    "/marketplace/getisliked": {
      "get": {
        "summary": "get if item is liked",
        "description": "check if item is liked",
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "itemtype",
            "in": "query",
            "description": "itemtype",
          },
          {
            "name": "itemid",
            "in": "query",
            "description": "itemid",
          },
          {
            "name": "skuid",
            "in": "query",
            "description": "skuid",
          },
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Offers Success",
          }
        }
      }
    },
    "/admin/categories": {
      "get": {
        "summary": "Get Categories List",
        "description": "Fetch all list of catgeores",
        "tags": ["Admin"],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "List fetched",
            "schema": {
              "$ref": "#/definitions/categories"
            }

          }
        }
      }
    },
    "/admin/searchasset": {
      "get": {
        "summary": "Get Asset For Assest Management",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "search",
            "in": "query",
            "description": "name of the asset"
          },
          {
            "name": "assettype",
            "in": "query",
            "description": "type of asset"
          },

        ],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/admin/getassetdetails": {
      "get": {
        "summary": "Get Asset For Assest Management",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug of the asset"
          },

        ],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/admin/getcollection": {
      "get": {
        "summary": "Get collections",
        "tags": ["Admin-Collection-Management"],
        "description": "Get collections for Admin",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (all,completed,timebased,firstX,rewards)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Admin Collections"
          }
        }
      }
    },
    "/admin/searchcollection": {
      "get": {
        "summary": "Search Collection",
        "tags": ["Admin-Collection-Management"],
        "description": "Search collections for Admin",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (all,completed,timebased,firstX,rewards)"
          },
          {
            "name": "query",
            "in": "query",
            "description": "name of collection"
          },


        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/artworkgallery/login": {
      "post": {
        "summary": "Login api for Artwork Gallery user",
        "tags": [
          "Arwork Gallery"
        ],
        "description": "It will take username and password as input.",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "Artwork Gallery Login user",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUser"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support.!"
          },
          "404": {
            "description": "User not found.!"
          },
          "405": {
            "description": "username is required!"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue.!"
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },
    "/fancave/login": {
      "post": {
        "summary": "Login api for Fancave Gallery user",
        "tags": [
          "Fancave Gallery"
        ],
        "description": "It will take username and password as input.",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "Fancave Login user",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUser"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support.!"
          },
          "404": {
            "description": "User not found.!"
          },
          "405": {
            "description": "username is required!"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue.!"
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },
    "/fancave/lookups": {
      "post": {
        "summary": "Lookups for Fancave ",
        "tags": [
          "Fancave Gallery"
        ],
        "description": "It will take action and code as input.",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "inputs for lookups",
            "schema": {
              "$ref": "#/definitions/lookups"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "lookups Success",
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },
    "/artworkgallery/login/facebook": {
      "post": {
        "summary": "Login api for artwork gallery user",
        "tags": [
          "Arwork Gallery"
        ],
        "description": "It will take token.",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "artworkgallery Login user",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryFb"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support.!"
          },
          "404": {
            "description": "User not found.!"
          },
          "405": {
            "description": "username is required!"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue.!"
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },
    "/mobileapp/logout": {
      "post": {
        "summary": " User Logout",
        "tags": [
          "Mobile Api"
        ],
        "description": "Logout",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Logout Success",

          },
          "403": {
            "description": "The incoming token is invalid,  User session has been revoked, Authorization header missing."

          },
          "500": {
            "description": "Internal Server Error.!"
          },

        },
      }
    },
    "/artworkgallery/profile": {
      "get": {
        "summary": " User For Artwork Gallery",
        "tags": [
          "Arwork Gallery"
        ],
        "description": " user  profile in artwork gallery",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support!,  The incoming token is invalid,  User session has been revoked, Authorization header missing."

          },
          "500": {
            "description": "Internal Server Error.!"
          },

        },
      }
    },
    "/artworkgallery/vr-social-logins/facebook": {
      "get": {
        "summary": " Generate fb token for artwork gallery",
        "tags": [
          "Arwork Gallery"
        ],
        "parameters": [
          {
            "name": "action",
            "in": "query",
            "description": "action for fb-token ",
          }
        ],
        "description": " user  profile in artwork gallery",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
          },
          "500": {
            "description": "Internal Server Error.!"
          },

        },
      }
    },
    "/fancave/profile": {
      "get": {
        "summary": " User For Fancave Gallery",
        "tags": [
          "Fancave Gallery"
        ],
        "description": " user  profile in fancave gallery",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Login Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support!,  The incoming token is invalid,  User session has been revoked, Authorization header missing."

          },
          "500": {
            "description": "Internal Server Error.!"
          },

        },
      }
    },
    "/artworkgallery/items": {
      "post": {
        "summary": "Get artwork",
        "tags": [
          "Arwork Gallery"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "Enter Body",
            "schema": {
              "$ref": "#/definitions/artworkgallery"
            }

          },

        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          },
          "500": {
            "description": "Internal Server Error.!"
          },

        }
      }
    },
    "/artworkgallery/wishlists": {
      "post": {
        "summary": "Wishlists api to handle user's wishlist",
        "tags": [
          "Arwork Gallery"
        ],
        "description": "It will handle get users's wishlist , saveWishlist , removeWishlist, removeAll wishlist items of a user with different actions",
        "parameters": [
          {
            "name": "ArworkGallery Wishlist",
            "in": "body",
            "description": "Get Wishlist For Artwork Gallery",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryGetWishlist"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Wishlist Success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io"
          },
          "403": {
            "description": "Your account is not confirmed yet. Please check your email or contact support.!, " +
              "The incoming token is invalid.!, User session has been revoked.!, Authorization header missing.!"
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },

    "/artworkgallery/refresh-token": {
      "post": {
        "summary": "Refresh Token Api For Artwork Gallery ",
        "tags": [
          "Arwork Gallery"
        ],
        "description": "It will take refreshToken as input and will return accessToken , expiry of access Token as output",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "Refresh Token For Artwork Gallery",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryRefreshToken"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Refresh Token success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "405": {
            "description": "refresh token should NOT be shorter than 1 character"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue."
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },
    "/fancave/refresh-token": {
      "post": {
        "summary": "Refresh Token Api For Fancave ",
        "tags": [
          "Fancave Gallery"
        ],
        "description": "It will take refreshToken as input and will return accessToken , expiry of access Token as output",
        "parameters": [
          {
            "name": "Body",
            "in": "body",
            "description": "Refresh Token For Fancave Gallery",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryRefreshToken"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Refresh Token success",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "401": {
            "description": "User is disabled. Please contact at support@terravirtua.io!"
          },
          "405": {
            "description": "refresh token should NOT be shorter than 1 character"
          },
          "428": {
            "description": "It seems you are using an older version of Terra Virtua, please update the app to continue."
          },

          "500": {
            "description": "Internal Server Error.!"
          }
        },
      }
    },

    "/admin/deletecollection": {
      "put": {
        "summary": "Delete Collection",
        "tags": ["Admin-Collection-Management"],
        "description": "Update collections Status for Admin",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "Slug For Updation"
          },
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/fancave/my-avatars": {
      "post": {
        "summary": "user will receive all his assets either won or bought and if access token is missing then default avatars will be shown",
        "tags": [
          "Fancave Gallery"
        ],
        "description": "user will receive all his assets either won or bought and if access token is missing then default avatars will be shown",
        "parameters": [
          {
            "name": "limit",
            "description": "limit",
            "type": "string"

          },
          {
            "name": "page",
            "description": "page",
            "type": "string"

          },
          {
            "name": "sort_type",
            "description": "sort_type",
            "type": "string"

          },
          {
            "name": "sorting",
            "description": "sorting",
            "type": "string"

          },
          {
            "name": "nft_type_code",
            "description": "nft_type_code",
            "type": "string"

          },
          {
            "name": "is_tradable",
            "description": "is_tradable",
            "type": "string"
          },
          {
            "name": "nft_type_id",
            "description": "nft_type_id",
            "type": "string"
          },
          {
            "name": "brand_id",
            "description": "brand_id",
            "type": "string"
          },
          {
            "name": "edition_id",
            "description": "edition_id",
            "type": "string"
          },
          {
            "name": "category_id",
            "description": "category_id",
            "type": "string"
          },
          {
            "name": "type_id",
            "description": "type_id",
            "type": "string"
          },
          {
            "name": "variation_id",
            "description": "variation_id",
            "type": "string"
          },
          {
            "name": "series_id",
            "description": "series_id",
            "type": "string"
          },
          {
            "name": "artist_id",
            "description": "artist_id",
            "type": "string"
          },
          {
            "name": "art_collection_id",
            "description": "art_collection_id",
            "type": "string"
          },
          {
            "name": "rarity_id",
            "description": "rarity_id",
            "type": "string"
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success.",
            "schema": {
              "$ref": "#/definitions/ArworkGalleryUserResponse"
            }
          },
          "500": {
            "description": "Internal Server Error.!"
          }
        },
      },
    },
    "/user/refreshtoken": {
      "post": {
        "summary": "refresh token",
        "parameters": [
          {
            "name": "refreshtoken",
            "in": "body",
            "description": "refresh token",
            "schema": {
              "$ref": "#/definitions/refreshtoken"
            }
          },
        ],
        "produces": ["application/json"],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/getcollectionstats": {
      "get": {
        "summary": "Collection Stats",
        "tags": ["Admin-Collection-Management"],
        "description": "Collections Stats for Admin",
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/createcollection": {
      "post": {
        "summary": "creating a collection",
        "parameters": [
          {
            "name": "code",
            "in": "formData",
            "description": "code",
            "type": "string"

          },
          {
            "name": "collection_group",
            "in": "formData",
            "description": "collection_group",
            "type": "string"

          },
          {
            "name": "slug",
            "in": "formData",
            "description": "slug",
            "type": "string"

          },
          {
            "name": "name",
            "in": "formData",
            "description": "name",
            "type": "string"
          },
          {
            "name": "description",
            "in": "formData",
            "description": "description",
            "type": "string"
          },
          {
            "name": "to_be_rewarded_user_count",
            "in": "formData",
            "description": "to_be_rewarded_user_count",
            "type": "number"
          },
          {
            "name": "rewarded_user_count",
            "in": "formData",
            "description": "rewarded_user_count",
            "type": "number"
          },
          {
            "name": "item_1",
            "in": "formData",
            "description": "item_1",
            "type": "string"
          },
          {
            "name": "item_2",
            "in": "formData",
            "description": "item_2",
            "type": "string"
          },
          {
            "name": "item_3",
            "in": "formData",
            "description": "item_3",
            "type": "string"
          },
          {
            "name": "item_4",
            "in": "formData",
            "description": "item_4",
            "type": "string"
          },
          {
            "name": "item_5",
            "in": "formData",
            "description": "item_5",
            "type": "string"
          },
          {
            "name": "item_6",
            "in": "formData",
            "description": "item_6",
            "type": "string"
          },
          {
            "name": "item_7",
            "in": "formData",
            "description": "item_7",
            "type": "string"
          },
          {
            "name": "item_8",
            "in": "formData",
            "description": "item_8",
            "type": "string"
          },
          {
            "name": "item_9",
            "in": "formData",
            "description": "item_9",
            "type": "string"
          },
          {
            "name": "item_10",
            "in": "formData",
            "description": "item_10",
            "type": "string"
          },
          {
            "name": "item_11",
            "in": "formData",
            "description": "item_11",
            "type": "string"
          },
          {
            "name": "item_reward_1",
            "in": "formData",
            "description": "item_1",
            "type": "string"
          },
          {
            "name": "item_reward_2",
            "in": "formData",
            "description": "item_2",
            "type": "string"
          },
          {
            "name": "item_reward_3",
            "in": "formData",
            "description": "item_3",
            "type": "string"
          },
          {
            "name": "brand",
            "in": "formData",
            "description": "brand",
            "type": "string"
          },
          {
            "name": "ip",
            "in": "formData",
            "description": "ip",
            "type": "string"
          },
          {
            "name": "trend_count",
            "in": "formData",
            "description": "trend_count",
            "type": "number"
          },
          {
            "name": "time_based_reward",
            "in": "formData",
            "description": "time_based_reward",
            "type": "boolean"
          },
          {
            "name": "first_x_reward",
            "in": "formData",
            "description": "first_x_reward",
            "type": "boolean"
          },
          {
            "name": "rule_1",
            "in": "formData",
            "description": "rule_1",
            "type": "boolean"
          },
          {
            "name": "rule_2",
            "in": "formData",
            "description": "rule_2",
            "type": "boolean"
          },
          {
            "name": "rule_3",
            "in": "formData",
            "description": "rule_3",
            "type": "boolean"
          },
          {
            "name": "rule_4",
            "in": "formData",
            "description": "rule_4",
            "type": "boolean"
          },

          {
            "name": "image",
            "in": "formData",
            "description": "image",
            "type": "file"
          },

          {
            "name": "image2",
            "in": "formData",
            "description": "image2",
            "type": "file"
          },
          {
            "name": "expiry",
            "in": "formData",
            "description": "expiry",
            "type": "number"
          },
        ],
        "produces": ["multipart/form-data"],
        "tags": ["Admin-Collection-Management"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "multipart/form-data",
          }
        }
      }
    },
    "/admin/getsinglecollectionstats": {
      "get": {
        "summary": "single stat for  Collection",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "description": "name of collection"
          },
        ],
        "produces": ["application/json"],
        "tags": ["Admin-Collection-Management"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/searchingcollection": {
      "get": {
        "summary": "single stat for  Collection",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug of collection"
          },
          {
            "name": "name",
            "in": "query",
            "description": "name of user"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (progress,completed,reward)"
          },

        ],
        "produces": ["application/json"],
        "tags": ["Admin-Collection-Management"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/getusercollection": {
      "get": {
        "summary": "single stat for  Collection",
        "parameters": [
          {
            "name": "slug",
            "in": "query",
            "description": "slug of collection"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (progress,completed,reward)"
          },

        ],
        "produces": ["application/json"],
        "tags": ["Admin-Collection-Management"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/asset-bulk-upload": {
      "post": {
        "summary": "creating a collection",
        "parameters": [
          {
            "name": "file",
            "in": "formData",
            "description": "file",
            "type": "file"

          },

        ],
        "produces": ["multipart/form-data"],
        "tags": ["Admin-Collection-Management"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "multipart/form-data",
          }
        }
      }
    },
    "/marketplace/tradinghistory": {
      "get": {
        "summary": "Get trading history of item sku",
        "description": "Get trading history of item sku.",
        "tags": ["Trading"],
        "parameters": [
          {
            "name": "skuid",
            "in": "query",
            "description": "SKU ID"
          },
          {
            "name": "itemtype",
            "in": "query",
            "description": "itemtype"
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success",
          }
        }
      }
    },
    "/admin/deleteitemsku": {
      "put": {
        "summary": "Delete Item Skus",
        "tags": [
          "Admin"
        ],
        "description": "Delete item skus on the basis of serial number",
        "parameters": [
          {
            "name": "serialno",
            "in": "body",
            "description": "Serial Number of Item Sku",
            "schema": {
              "$ref": "#/definitions/deleteItemSku"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/marketplace/isoffered": {
      "get": {
        "summary": "Get if offer placed on an item",
        "description": "Get if offer placed on an item.",
        "tags": ["Marketplace"],
        "parameters": [
          {
            "name": "skuid",
            "in": "query",
            "description": "SKU ID"
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Offers Success",
          }
        }
      }
    },
    "/admin/publishitemsku": {
      "put": {
        "summary": "publish Item Skus",
        "tags": [
          "Admin"
        ],
        "description": "publish item skus on the basis of serial number",
        "parameters": [
          {
            "name": "serialno",
            "in": "body",
            "description": "Serial Number of Item Sku",
            "schema": {
              "$ref": "#/definitions/deleteItemSku"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/admin/unpublishitemsku": {
      "put": {
        "summary": "unpublish Item Skus",
        "tags": [
          "Admin"
        ],
        "description": "unpublish item skus on the basis of serial number",
        "parameters": [
          {
            "name": "serialno",
            "in": "body",
            "description": "Serial Number of Item Sku",
            "schema": {
              "$ref": "#/definitions/deleteItemSku"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/staff/getstaffmodules": {
      "get": {
        "summary": "Get Modules of the user management",
        "produces": [
          "application/json"
        ],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/staff/addnewroles": {
      "post": {
        "summary": "addnewroles",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "name for the role",
            "schema": {
              "$ref": "#/definitions/addnewrole"
            }

          },


        ],
        "produces": ["application/json"],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/addnewrole"
            }
          }
        }
      }
    },
    "/staff/getallroles": {
      "get": {
        "summary": "Get Roles of the user management",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          }
        ],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/staff/updateroles": {
      "put": {
        "summary": "updateroles",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "name for the role",
            "schema": {
              "$ref": "#/definitions/updaterole"
            }

          },


        ],
        "produces": ["application/json"],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/updaterole"
            }
          }
        }
      }
    },
    "/staff/getstaffroles": {
      "get": {
        "summary": "Get Roles of the staff management",
        "produces": [
          "application/json"
        ],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/staff/addnewstaffmember": {
      "post": {
        "summary": "addnewstaffmember",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "addnewstaffmember ",
            "schema": {
              "$ref": "#/definitions/addnewstaffmember"
            }

          },


        ],
        "produces": ["application/json"],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/addnewstaffmember"
            }
          }
        }
      }
    },
    "/staff/viewstaffmember": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby"
          }
        ],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/staff/deactivatestaff": {
      "put": {
        "summary": "deactivatestaff",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "name for the deactivatestaff",
            "schema": {
              "$ref": "#/definitions/deactivatestaffmember"
            }

          },


        ],
        "produces": ["application/json"],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/deactivatestaffmember"
            }
          }
        }
      }
    },
    "/staff/activatestaff": {
      "put": {
        "summary": "deactivatestaff",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "name for the deactivatestaff",
            "schema": {
              "$ref": "#/definitions/deactivatestaffmember"
            }

          },


        ],
        "produces": ["application/json"],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/deactivatestaffmember"
            }
          }
        }
      }
    },
    "/staff/updatestaffrole": {
      "put": {
        "summary": "updatestaffrole",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "name for the updatestaffrole",
            "schema": {
              "$ref": "#/definitions/updatestaffmember"
            }

          },


        ],
        "produces": ["application/json"],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/updatestaffmember"
            }
          }
        }
      }
    },
    "/staff/searchstaffmember": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "searchquery",
            "in": "query",
            "description": "searchquery"
          },
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby"
          }
        ],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/staff/getroledetails": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "role_name",
            "in": "query",
            "description": "role_name"
          }
        ],
        "tags": ["Admin-Staff-Managment"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/user/activeuser": {
      "post": {
        "summary": "activate user status",
        "produces": [
          "application/json"
        ],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/admin/createauction": {
      "post": {
        "summary": "Create a new auction for the specified item",
        "tags": ["Admin"],
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "Create an auction",
            "schema": {
              "$ref": "#/definitions/auction"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/auction"
            }
          }
        }
      }
    },
    "/user/getallfaqs": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "category_id",
            "in": "query",
            "description": "category_id"
          }
        ],
        "tags": ["Users"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/user/getfaqscategories": {
      "get": {
        "summary": "Get All FAQs categories",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Users"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/config/getallfaqs": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "category_id",
            "in": "query",
            "description": "category_id"
          }
        ],
        "tags": ["Admin-Config"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/admin/config/addfaq": {
      "post": {
        "summary": "Add FAQ",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Config"
        ],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/addfaq"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/config/updatefaqbyid": {
      "put": {
        "summary": "Update FAQ By ID",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Config"
        ],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/updatefaq"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/config/getnewsfeed": {
      "get": {
        "summary": "Get newsFeed",
        "produces": [
          "application/json"
        ],
        "tags": ["Admin-Config"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json"
          }
        }
      }
    },
    "/admin/config/searchnewsfeed": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "title",
            "in": "query",
            "description": "title"
          }
        ],
        "tags": ["Admin-Config"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/admin/config/deletenewsfeed": {
      "put": {
        "summary": "Delete news feed",
        "tags": [
          "Admin-Config"
        ],
        "description": "Delete news feed",
        "parameters": [
          {
            "name": "id",
            "in": "body",
            "description": "Delete news feed",
            "schema": {
              "$ref": "#/definitions/deletenewsfeed"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/admin/config/createnewsfeed": {
      "post": {
        "summary": "creating a newsfeed",
        "parameters": [
          {
            "name": "title",
            "in": "formData",
            "description": "title",
            "type": "string"

          },
          {
            "name": "description",
            "in": "formData",
            "description": "description",
            "type": "string"

          },
          {
            "name": "short_description",
            "in": "formData",
            "description": "short_description",
            "type": "string"

          },
          {
            "name": "image_url",
            "in": "formData",
            "description": "image_url",
            "type": "file"
          },
          {
            "name": "link",
            "in": "formData",
            "description": "link",
            "type": "string"
          },
          {
            "name": "deeplink",
            "in": "formData",
            "description": "deeplink",
            "type": "string"
          },
          {
            "name": "release_date",
            "in": "formData",
            "description": "release_date",
            "type": "string"
          },
          {
            "name": "expiry_date",
            "in": "formData",
            "description": "expiry_date",
            "type": "string"
          },
          {
            "name": "device",
            "in": "formData",
            "description": "device",
            "type": "string"
          },

        ],
        "produces": ["multipart/form-data"],
        "tags": ["Admin-Config"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "multipart/form-data",
          }
        }
      }
    },
    "/admin/config/updatenewsfeed": {
      "put": {
        "summary": "creating a newsfeed",
        "parameters": [
          {
            "name": "id",
            "in": "formData",
            "description": "id",
            "type": "number"

          },
          {
            "name": "title",
            "in": "formData",
            "description": "title",
            "type": "string"

          },
          {
            "name": "description",
            "in": "formData",
            "description": "description",
            "type": "string"

          },
          {
            "name": "short_description",
            "in": "formData",
            "description": "short_description",
            "type": "string"

          },
          {
            "name": "image_url",
            "in": "formData",
            "description": "image_url",
            "type": "file"
          },
          {
            "name": "link",
            "in": "formData",
            "description": "link",
            "type": "string"
          },
          {
            "name": "deeplink",
            "in": "formData",
            "description": "deeplink",
            "type": "string"
          },
          {
            "name": "release_date",
            "in": "formData",
            "description": "release_date",
            "type": "string"
          },
          {
            "name": "expiry_date",
            "in": "formData",
            "description": "expiry_date",
            "type": "string"
          },
          {
            "name": "device",
            "in": "formData",
            "description": "device",
            "type": "string"
          },

        ],
        "produces": ["multipart/form-data"],
        "tags": ["Admin-Config"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "multipart/form-data",
          }
        }
      }
    },
    "/admin/config/getfaqscategories": {
      "get": {
        "summary": "Get All FAQs categories",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Config"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/config/deletefaqbyid": {
      "put": {
        "summary": "Update FAQ By ID",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Config"
        ],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/deletefaq"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/marketplace/artworkbyartist": {
      "get": {
        "summary": "Get artwork",
        "tags": ["Marketplace"],
        "description": "Get artwork assets",
        "parameters": [
          {
            "name": "filterby",
            "in": "query",
            "description": "filterby (trending,onsale,onauction,soldout)"
          },
          {
            "name": "pricerange",
            "in": "query",
            "description": "price range filter"
          },
          {
            "name": "sortby",
            "in": "query",
            "description": "sortby filter (pricehightolow, pricelowtohigh)"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "total result size to pull"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pagination number"
          },
          {
            "name": "curation",
            "in": "query",
            "description": "curation filter - multiple curation separated by comma"
          },
          {
            "name": "artist",
            "in": "query",
            "description": "artist filter - multiple artist separated by comma"
          },
          {
            "name": "collection",
            "in": "query",
            "description": "collection filter - multiple artist separated by comma"
          },
          {
            "name": "artistid",
            "in": "query",
            "description": "artistid"
          }
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      }
    },
    "/user/getcards": {
      "get": {
        "summary": "Get cards",
        "tags": ["Marketplace"],
        "description": "Get cards",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      }
    },
    "/user/addcard": {
      "post": {
        "summary": "Add cards",
        "tags": ["Marketplace"],
        "description": "Get cards",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body ",
            "schema": {
              "$ref": "#/definitions/addcard"
            }
          },
        ],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      }
    },
    "/user/createpaymentintent": {
      "post": {
        "summary": "create payment intent for an amount and card",
        "tags": ["Marketplace"],
        "description": "Get cards",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "query",
            "description": "body ",
            "schema": {
              "$ref": "#/definitions/createintent"
            }
          },
        ],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      }
    },
    "/user/confirmintent": {
      "post": {
        "summary": "confirmintent payment intent for an amount and card and order id",
        "tags": ["Marketplace"],
        "description": "Get cards",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "query",
            "description": "body ",
            "schema": {
              "$ref": "#/definitions/confirmintent"
            }
          },
        ],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      },

    },

    "/admin/config/getnewsfeedbyid": {
      "get": {
        "summary": "Get Staff members",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "id"
          }
        ],
        "tags": ["Admin-Config"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        }
      }
    },
    "/marketplace/comicredirect": {
      "get": {
        "summary": "redirect recieved from comics api",
        "tags": ["Marketplace"],
        "description": "redirect recieved from comics api",
        "parameters": [
          {
            "name": "t",
            "in": "query",
            "description": "jwt token",
          },
          {
            "name": "tokenID",
            "in": "query",
            "description": "tokenID of Item Sku",
          },
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/user/deletecard": {
      "post": {
        "summary": "Delete card",
        "tags": ["Marketplace"],
        "description": "Get cards",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body ",
            "schema": {
              "$ref": "#/definitions/addcard"
            }
          },
        ],
        "responses": {
          "200": {
            "description": "Artwork Marketplace"
          }
        }
      }
    },
    "/admin/genericpasswordchange": {
      "post": {
        "summary": " reseting the password",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "genericpassword",
            "in": "body",
            "description": "reseting the password of the admin",
            "schema": {
              "$ref": "#/definitions/genericpassword"
            }
          }
        ],
        "tags": ["Admin"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
            "schema": {
              "$ref": "#/definitions/genericpassword"
            }
          }
        }
      }
    },
    "/admin/campaign/createcampaign": {
      "post": {
        "summary": "createcampaign",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Campaign"
        ],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/createcampaign"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/campaign/campaigntype": {
      "get": {
        "summary": "campaigntype",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Campaign"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      },
    },

    "/admin/assetsforcampaign": {
      "get": {
        "summary": "get asset for ongoing campaign",
        "tags": ["Admin"],
        "description": "get asset for ongoing campaign",
        "parameters": [
          {
            "name": "brand",
            "in": "query",
            "description": "brand of Item Sku",
          },
          {
            "name": "edition",
            "in": "query",
            "description": "edition of Item Sku",
          },
          {
            "name": "series",
            "in": "query",
            "description": "series of Item Sku",
          },
          {
            "name": "release",
            "in": "query",
            "description": "release of Item Sku",
          },
          {
            "name": "rarity",
            "in": "query",
            "description": "rarity of Item Sku",
          },
          {
            "name": "type",
            "in": "query",
            "description": "type of Item Sku",
          },
          {
            "name": "itemid",
            "in": "query",
            "description": "itemid of Item Sku",
          },
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        },
      }
    },

    "/admin/transactions": {
      "get": {
        "summary": "Get Transaction",
        "description": "",
        "tags": ["Admin-Transaction"],
        "parameters": [
          {
            "name": "type",
            "in": "query",
          },
          {
            "name": "status",
            "in": "query",
          },
          {
            "name": "payment_type",
            "in": "query",
          },
          {
            "name": "page_no",
            "in": "query",
          },
          {
            "name": "page_size",
            "in": "query",
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Get Transactions Success",
            "schema": {
              "$ref": "#/definitions/transactions"
            }
          }
        }
      }
    },

    "/admin/campaign/campaigns": {
      "get": {
        "summary": "Get Campaigns List",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Campaign"
        ],
        "parameters": [
          {
            "name": "is_publish",
            "in": "query",
            "description": "0 or 1",
          },
          {
            "name": "type",
            "in": "query",
            "description": "1 for Redeem 2 for Promotion",
          },
          {
            "name": "page_no",
            "in": "query",
          },
          {
            "name": "page_size",
            "in": "query",
          }
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      },
    },

    "/admin/campaign/criteria": {
      "get": {
        "summary": "Get criteria against a campaign ",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
          }

        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      },
    },
    "/admin/campaign/publishcampaign": {
      "put": {
        "summary": "Publish campaigns",
        "tags": [
          "Admin-Campaign"
        ],
        "description": "Publish campaigns",
        "parameters": [
          {
            "name": "id",
            "in": "body",
            "description": "id of campaign",
            "schema": {
              "$ref": "#/definitions/publishcampaign"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/admin/campaign/unpublishcampaign": {
      "put": {
        "summary": "unPublish campaigns",
        "tags": [
          "Admin-Campaign"
        ],
        "description": "unPublish campaigns",
        "parameters": [
          {
            "name": "id",
            "in": "body",
            "description": "id of campaign",
            "schema": {
              "$ref": "#/definitions/publishcampaign"
            }
          }
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",

          }
        },
      }
    },
    "/marketplace/auctionlanding": {
      "get": {
        "summary": "It returns the auctions of the user",
        "parameters": [
          {
            "name": "pageno",
            "in": "query",
            "description": "page no",
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "page size",
          }
        ],
        "tags": ["Auctions"],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      }
    },
    "/admin/campaign/campaign-detail": {
      "get": {
        "summary": "Get campain detail",
        "produces": [
          "application/json"
        ],
        "tags": [
          "Admin-Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "campaign id"
          }

        ],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      },
    },
    "/marketplace/getpendingpayments": {
      "get": {
        "summary": "Get pending payments",
        "produces": [
          "application/json"
        ],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      },
    },
    "/marketplace/addpromocode": {
      "post": {
        "summary": "add promo code for checkout",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body"
          }
        ],
        "tags": ["Marketplace"],
        "responses": {
          "200": {
            "description": "Success Response",
            "content": "application/json",
          }
        }
      },
    },
    "/admin/users-transactions": {
      "get": {
        "summary": "Get Users Transaction",
        "description": "",
        "tags": ["Admin-Transaction"],
        "parameters": [
          {
            "name": "page_no",
            "in": "query",
          },
          {
            "name": "page_size",
            "in": "query",
          },
        ],
        "produces": [
          "application/json"
        ],
        "responses": {
          "200": {
            "description": "Get Transactions Success",
          }
        }
      }
    },
    "/user/addnotification": {
      "post": {
        "summary": "Add Notification",
        "tags": ["Users"],
        "description": "add notification",
        "parameters": [
          {
            "name": "email",
            "in": "body",
            "description": "email of a user",
            "schema": {
              "$ref": "#/definitions/AddNotification",
            },
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User Dashboard",
          },
        },
      },
    },
    "/user/getusernotifications": {
      "get": {
        "summary": "get Notification",
        "tags": ["Users"],
        "description": "get notification",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User Dashboard",
            "schema": {
              "$ref": "#/definitions/SaveEmail",
            },
          },
        },
      },
    },
    "/user/markasread": {
      "get": {
        "summary": "read Notification",
        "tags": ["Users"],
        "description": "read notification",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User Dashboard",
            "schema": {
              "$ref": "#/definitions/SaveEmail",
            },
          },
        },
      },
    },
    "/user/marksingleasread": {
      "get": {
        "summary": "read single Notification",
        "tags": ["Users"],
        "description": "read single notification",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "id of a notification",
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "User Dashboard",
            "schema": {
              "$ref": "#/definitions/SaveEmail",
            },
          },
        },
      },
    },
    "/user/addfunds": {
      "post": {
        "summary": "add funds in wallet",
        "tags": ["Users"],
        "description": "add funds in wallet",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/addfunds",
            },
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Add Funds",
            "schema": {
              "$ref": "#/definitions/addfunds",
            },
          },
        },
      },
    },
    "/user/isblockchainlinked": {
      "get": {
        "summary": "isblockchainlinked",
        "tags": ["Users"],
        "description": "isblockchainlinked",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "isblockchainlinked",
          },
        },
      },
    },
    "/user/linkethereum": {
      "post": {
        "summary": "linkethereum",
        "tags": ["Users"],
        "description": "linkethereum",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "linkethereum",
          },
        },
      },
    },
    "/marketplace/mintassets": {
      "get": {
        "summary": "mintassets",
        "tags": ["Marketplace"],
        "description": "mintassets",
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "mintassets",
          },
        },
      },
    },
    "/comic/item": {
      "post": {
        "summary": "User Dashboard",
        "tags": ["Marketplace"],
        "description": "Api for comic reader integration",
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/comicreaderItem",
            },
          },
        ],
        "produces": ["application/json"],
        "responses": {
          "200": {
            "description": "Comic Reader integration api response",
            "schema": {
              "$ref": "#/definitions/comicreaderItemresponse"
            }
          },
          "500": {
            "description": "Internal Server Error"
          },
        }
      }
    },
    "/marketplace/transferblockchaineye": {
      "get": {
        "summary": "transferblockchaineye",
        "tags": ["Marketplace"],
        "description": "transferblockchaineye",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/transferblockchaineye",
            },
          },
        ],
        "responses": {
          "200": {
            "description": "transferblockchaineye",
          },
        },
      },
    },
    "/marketplace/mintblockchaineye": {
      "get": {
        "summary": "mintblockchaineye",
        "tags": ["Marketplace"],
        "description": "mintblockchaineye",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "body",
            "schema": {
              "$ref": "#/definitions/transferblockchaineye",
            },
          },
        ],
        "responses": {
          "200": {
            "description": "mintblockchaineye",
          },
        },
      },
    },
    "/admin/blockchain-transfer": {
      "post": {
        "summary": "Blockchain Transfer Admin",
        "tags": ["Admin"],
        "description": "mintblockchaineye",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "id",
            "in": "body",
            "description": "SKU id"
          },
          {
            "name": "user_id",
            "in": "body",
            "description": "User id"
          },
        ],
        "responses": {
          "200": {
            "description": "mintblockchaineye",
          },
        },
      },
    },
    "/marketplace/getopenessitems": {
      "get": {
        "summary": "get assets",
        "tags": ["Marketplace"],
        "description": "get assets",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "description": "status"
          },
          {
            "name": "pageno",
            "in": "query",
            "description": "pageno"
          },
          {
            "name": "pagesize",
            "in": "query",
            "description": "pagesize"
          }
        ],
        "responses": {
          "200": {
            "description": "mintblockchaineye",
          },
        },
      },
    },
    "/marketplace/openess": {
      "post": {
        "summary": "open item or close",
        "tags": ["Marketplace"],
        "description": "open item or close",
        "produces": ["application/json"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "skuid and export",
            "schema": {
              "$ref": "#/definitions/openess",
            },
          }
        ],
        "responses": {
          "200": {
            "description": "mintblockchaineye",
          },
        },
      },
    },
  },
  "definitions": {
    "comicreaderItem": {
      "properties": {
        "t": {
          "type": "string"
        },
        "tokenID": {
          "type": "string"
        }
      }
    },
    "comicreaderItemresponse": {
      "properties": {
        "status": {
          "type": "string",
        },
        "message": {
          "type": "string"
        },
        "payload": {
          "type": "object"
        }
      }
    },
    "assets": {
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "slug": {
          "type": "string"
        }
      }
    },
    "myAvatarResponse": {
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "slug": {
          "type": "string"
        }
      }
    },
    "UserEmail": {
      "properties": {
        "email": {
          "type": "string"
        }
      }
    },
    "Validate": {
      "properties": {
        "jwt_token": {
          "type": "string"
        }
      }
    },
    "User": {
      "properties": {
        "userName": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    },
    "ArworkGalleryUser": {
      "properties": {
        "username": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    },
    "ArworkGalleryUserResponse": {
      "properties": {
        "status": {
          "type": "string"
        },
        "message": {
          "type": "string"
        },
        "payload": {
          "type": "object"
        }
      }
    },
    "ArworkGalleryGetWishlist": {
      "properties": {
        "action": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "page": {
          "type": "number"
        },
        "limit": {
          "type": "number"
        },
        "sorting": {
          "type": "string"
        },
        "sort_type": {
          "type": "string"
        },
        "item_detail_id": {
          "type": "number"
        }
      }
    },

    "ArworkGalleryRefreshToken": {
      "properties": {
        "refreshToken": {
          "type": "string"
        }
      }
    },
    "UserMetamask": {
      "properties": {
        "metamaskwallet": {
          "type": "string"
        }
      }
    },
    "UserRegister": {
      "properties": {
        "userName": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string"
        },
        "gender": {
          "type": "string"
        },
        "is_gdpr": {
          "type": "boolean"
        },
        "phoneNumber": {
          "type": "string"
        },
        "password": {
          "type": "string"
        },
        "thumbnail_url": {
          "type": "string"
        }
      }
    },
    "UserMobileRegister": {
      "properties": {
        "username": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "country_id": {
          "type": "string"
        },
        "is_gdpr": {
          "type": "boolean"
        },
        "itemId": {
          "type": "number"
        },
        "password": {
          "type": "string"
        }
      }
    },
    "ForgotPassword": {
      "properties": {
        "email": {
          "type": "string"
        }
      }
    },
    "ForgotMobilePassword": {
      "properties": {
        "username": {
          "type": "string"
        }
      }
    },
    "canceluserallauctions": {
      "properties": {
        "userid": {
          "type": "string"
        }

      }
    },
    "Offersall": {
      "properties": {
        "pageno": {
          "type": "string"
        },
        "pagesize": {
          "type": "string"
        },
        "status": {
          "type": "string"
        }


      }
    },
    "ResetJwt": {
      "properties": {
        "jwt_token": {
          "type": "string"
        }
      }
    },
    "ResetPassword": {
      "properties": {
        "jwt_token": {
          "type": "string"
        },
        "password": {
          "type": "string"
        },
        "confirm_password": {
          "type": "string"
        }
      }
    },
    "placebid": {
      "properties": {
        "auctionid": {
          "type": "string"
        },
        "price": {
          "type": "string"
        }

      }
    },
    "placeoffer": {
      "properties": {
        "item_sku_id": {
          "type": "string"
        },
        "offered_price": {
          "type": "string"
        }

      }
    },
    "lookups": {
      "properties": {
        "action": {
          "type": "string"
        },
        "code": {
          "type": "string"
        }

      }
    },

    "ChangePassword": {
      "properties": {
        "password": {
          "type": "string"
        },
        "confirm_password": {
          "type": "string"
        },
        "id": {
          "type": "string"
        }
      }
    },
    "ChangeMobilePassword": {
      "properties": {
        "oldPassword": {
          "type": "string"
        },
        "newPassword": {
          "type": "string"
        }
      }
    },
    "UserManagement": {
      "properties": {
        "userName": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "displayName": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "dateOfBirth": {
          "type": "string"
        },
        "gender": {
          "type": "string"
        },
        "phoneNumber": {
          "type": "string"
        },
        "role_id": {
          "type": "number"
        }
      }
    },
    "cancelauction": {
      "properties": {
        "itemskuid": {
          "type": "string"
        },
        "itemid": {
          "type": "string"
        }

      }
    },
    "trans": {
      "properties": {
        "skuid": {
          "type": "string"
        },
        "serialnumber": {
          "type": "string"
        },
        "itemtype": {
          "type": "string"
        },
        "fromacount": {
          "type": "string"
        },
        "transactiontype": {
          "type": "string"
        },
        "transactionvalue": {
          "type": "string"
        },
        "paymenttype": {
          "type": "string"
        }
      }
    },
    "acceptoffer": {
      "properties": {
        "offerId": {
          "type": "string"
        },
        "itemtype": {
          "type": "string"
        }
      }
    },
    "checkout": {
      "properties": {
        "skuid": {
          "type": "Array"
        },
        "serialnumber": {
          "type": "Array"
        },
        "item": {
          "type": "Array"
        },
        "itemtype": {
          "type": "string"
        },
        "fromacount": {
          "type": "string"
        },
        "sales_tax": {
          "type": "string"
        },
        "item_value": {
          "type": "string"
        },
        "transactiontype": {
          "type": "string"
        },
        "transactionvalue": {
          "type": "string"
        },
        "paymenttype": {
          "type": "string"
        }
      }
    },
    "trade": {
      "properties": {
        "type": {
          "type": "string"
        },
        "skuid": {
          "type": "string"
        },
        "itemid": {
          "type": "string"
        },
        "saleprice": {
          "type": "string"
        }
      }
    },
    "resetpassword": {
      "properties": {
        "newPassword": {
          "type": "string"
        },
        "resetCode": {
          "type": "string"
        }
      }
    },
    "Username": {
      "properties": {
        "userName": {
          "type": "string"
        }
      }
    },
    "auction": {
      "properties": {

        "id": {
          "type": "string"
        },
        "skuid": {
          "type": "string"
        },
        "serialnumber": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "buyprice": {
          "type": "string"
        },
        "image": {
          "type": "string"
        },
        "orderId": {
          "type": "string"
        },
        "reserveprice": {
          "type": "string"
        },
        "startprice": {
          "type": "string"
        },
        "duration": {
          "type": "string"
        }

      }
    },
    "wishlist": {
      "properties": {
        "item_sku_id": {
          "type": "string"
        },
        "item_id": {
          "type": "string"
        },
        "item_type": {
          "type": "string"
        }
      }
    },
    "redeemcollection": {
      "properties": {
        "id": {
          "type": "string"
        }
      }
    },
    "orderid": {
      "properties": {
        "orderid": {
          "type": "string"
        },
        "auctionid": {
          "type": "string"
        }

      }
    },
    "adminlogin": {
      "properties": {
        "email": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    },
    "tfa": {
      "properties": {
        "status": {
          "type": "boolean"
        }
      }
    },
    "otp": {
      "properties": {
        "email": {
          "type": "string"
        },
        "otp": {
          "type": "string"
        }
      }
    },
    "adminvalidate": {
      "properties": {
        "jwttoken": {
          "type": "string"
        }
      }
    },
    "adminemail": {
      "properties": {
        "email": {
          "type": "string"
        }
      }
    },
    "ArworkGalleryFb": {
      "properties": {
        "token": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        }
      }
    },
    "artworkgallery": {
      "properties": {
        "sort_type": {
          "type": "string"
        },
        "sorting": {
          "type": "string"
        },
        "limit": {
          "type": "string"
        },
        "page": {
          "type": "string"
        },
        "artist_id": {
          "type": "string"
        },
        "art_collection_id": {
          "type": "string"
        },
        "lobby": {
          "type": "string"
        },
        "action": {
          "type": "string"
        },
      }
    },
    "changepassword": {
      "properties": {
        "authkey": {
          "type": "string"
        },
        "password": {
          "type": "string"
        },
        "confirmpassword": {
          "type": "string"
        }
      }
    },
    "counteroffer": {
      "properties": {
        "offerid": {
          "type": "string"
        },
        "counteroffer": {
          "type": "string"
        }
      }
    },
    "categories": {
      "properties": {}
    },
    "refreshtoken": {
      "properties": {
        "refreshtoken": {
          "type": "string"
        }
      }
    },
    "deleteItemSku": {
      "properties": {
        "serialno": {
          "type": "string"
        }
      }
    },
    "addnewrole": {
      "properties": {
        "name": {
          "type": "string"
        },
        "permissions": {
          "type": "array",
          "items": {
            "type": "object"
          }
        },
      }
    },
    "updaterole": {
      "properties": {
        "name": {
          "type": "string"
        },
        "role_id": {
          "type": "number"
        },
        "permissions": {
          "type": "array",
          "items": {
            "type": "object"
          }

        },


      }
    },
    "addnewstaffmember": {
      "properties": {
        "name": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "role_id": {
          "type": "number"
        }
      }
    },
    "deactivatestaffmember": {
      "properties": {
        "name": {
          "type": "string"
        }
      }
    },
    "addfeedback": {
      "properties": {
        "title": {
          "type": "string"
        },
        "message": {
          "type": "string"
        },
        "platform": {
          "type": "string"
        }
      }
    },
    "resendotp": {
      "properties": {
        "userName": {
          "type": "string"
        }
      }
    },
    "updatestaffmember": {
      "properties": {
        "name": {
          "type": "string"
        },
        "role_id": {
          "type": "number"
        }
      }
    },
    "updatefaq": {
      "properties": {
        "id": {
          "type": "string"
        },
        "question": {
          "type": "string"
        },
        "answer": {
          "type": "string"
        },
        "category_id": {
          "type": "number"
        }
      }
    },
    "addfaq": {
      "properties": {
        "question": {
          "type": "string"
        },
        "answer": {
          "type": "string"
        },
        "category_id": {
          "type": "number"
        }
      }
    },
    "deletenewsfeed": {
      "properties": {
        "id": {
          "type": "number"
        },

      }
    },
    "deletefaq": {
      "properties": {
        "id": {
          "type": "string"
        }
      }
    },
    "addcard": {
      "properties": {
        "cardid": {
          "type": "string"
        }
      }
    },
    "createintent": {
      "properties": {
        "cardid": {
          "type": "string"
        },
        "amount": {
          "type": "string"
        }
      }
    },
    "confirmintent": {
      "properties": {
        "paymentintentid": {
          "type": "string"
        },
        "orderid": {
          "type": "string"
        }
      }
    },
    "genericpassword": {
      "properties": {
        "authkey": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    },
    "createcampaign": {
      "properties": {
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "type": {
          "type": "string"
        },
        "discount": {
          "type": "number"
        },
        "usageLimit": {
          "type": "number"
        },
        "startDate": {
          "type": "string"
        },
        "endDate": {
          "type": "string"
        },
        "codeCount": {
          "type": "number"
        },
        "codeLength": {
          "type": "number"
        },
        "prefix": {
          "type": "string"
        },
        "sufix": {
          "type": "string"
        },
        "characterSet": {
          "type": "string"
        },
        "category": {
          "type": "string"
        },
        "campaign_type_id": {
          "type": "number"
        },
        "promo_code": {
          "type": "string"
        },
        "brand": {
          "type": "number"
        },
        "edition": {
          "type": "number"
        },
        "series": {
          "type": "number"
        },
        "release_type": {
          "type": "string"
        },
        "rarity": {
          "type": "number"
        },
        "item_id": {
          "type": "number"
        },
        "artist": {
          "type": "number"
        },
        "publisher": {
          "type": "number"
        },



      }
    },
    "publishcampaign": {
      "properties": {
        "id": {
          "type": "string"
        }
      }
    },
    "AddNotification": {
      "properties": {
        "receiverusername": {
          "type": "string",
        },
        "receiverid": {
          "type": "string",
        },
        "type": {
          "type": "string",
        },
        "message": {
          "type": "string",
        },
        "actiontitle": {
          "type": "string",
        },
        "content": {
          "type": "string",
        }
      },
    },
    "addfunds": {
      "properties": {
        "amount": {
          "type": "string",
        },
        "cardid": {
          "type": "string",
        },
      }
    },
    "transferblockchaineye": {
      "properties": {
        "logs": {
          "type": "array",
          "items": {
            "type": "object"
          }
        },
      }
    },
    "openess": {
      "properties": {
        "skuids": {
          "type": "string",
        },
        "export": {
          "type": "boolean"
        }
      }
    },

  }
}