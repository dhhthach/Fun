/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable indent */
$module("apolloService", function (log, api, module, Kjs) {
  function catcher(fn) {
    return function () {
      try {
        return fn(...arguments);
      } catch (error) {
        console.error("Error at " + fn.name + " analytics.");
      }
    };
  }
  var _getPrimaryPaymentMethod = function () {
    var primaryPaymentMethod = "";
    var trJsonData = window.trJsonData;
    var cartJsonData = window.cartJsonData;
    if (typeof $env.sessionStatus !== "undefined" && $env.sessionStatus) {
      if ($env.sessionStatus === "ANONYMOUS") {
        primaryPaymentMethod = "guest";
      } else {
        if ($env.haveKohlsCharge === "regular" && $env.preferredPaymentType) {
          primaryPaymentMethod = "yes|kohls charge";
        } else if ($env.haveKohlsCharge === "regular") {
          primaryPaymentMethod = "yes|non-KCC";
        } else if ($env.haveKohlsCharge === "elite" && $env.preferredPaymentType) {
          primaryPaymentMethod = "yes|elite kohls charge";
        } else if ($env.haveKohlsCharge === "elite" && !$env.preferredPaymentType) {
          primaryPaymentMethod = "yes|non-KCC";
          if (
            trJsonData &&
            trJsonData.paymentDetails &&
            trJsonData.paymentDetails.creditCardDetails &&
            trJsonData.paymentDetails.creditCardDetails.length
          ) {
            trJsonData.paymentDetails.creditCardDetails.forEach(function (card) {
              if (card.paymentType.toLowerCase() === "kohlscharge" || card.paymentType.toLowerCase() === "kohls charge") {
                primaryPaymentMethod = "yes|kohls charge";
              }
            });
          }
        } else if ($env.eliteCardOnProfile && $env.elitepreferredPaymentTypeSet) {
          primaryPaymentMethod = "yes|elite kohls charge";
        } else if ($env.eliteCardOnProfile && !$env.elitepreferredPaymentTypeSet) {
          primaryPaymentMethod = "yes|non-KCC";
        } else {
          primaryPaymentMethod = "no|no primary";
          if (
            trJsonData &&
            trJsonData.paymentDetails &&
            trJsonData.paymentDetails.creditCardDetails &&
            trJsonData.paymentDetails.creditCardDetails.length
          ) {
            trJsonData.paymentDetails.creditCardDetails.forEach(function (card) {
              if (card.paymentType.toLowerCase() === "visa") {
                primaryPaymentMethod = "no|visa";
              }
            });
          }
        }
      }
    }
    if (cartJsonData && (cartJsonData.userData && cartJsonData.userData.sessionStatus) === "ANONYMOUS") {
      primaryPaymentMethod = "guest";
    } else if (cartJsonData) {
      if (cartJsonData.eliteLoyaltyData.eliteCardOnProfile && cartJsonData.eliteLoyaltyData.elitepreferredPaymentTypeSet) {
        primaryPaymentMethod = "yes|elite kohls charge";
      } else if (cartJsonData.eliteLoyaltyData.kccCardOnProfile && cartJsonData.eliteLoyaltyData.kccPreferredPaymentTypeSet) {
        primaryPaymentMethod = "yes|kohls charge";
      } else if (cartJsonData.eliteLoyaltyData.kccCardOnProfile) {
        primaryPaymentMethod = "yes|non-KCC";
      } else {
        primaryPaymentMethod = "no|no primary";
        if (
          cartJsonData &&
          cartJsonData.paymentTypes &&
          cartJsonData.paymentTypes.creditCards &&
          cartJsonData.paymentTypes.creditCards.length
        ) {
          cartJsonData.paymentTypes.creditCards.forEach(function (card) {
            if (card.type.toLowerCase() === "visa") {
              primaryPaymentMethod = "no|visa";
            }
          });
        }
      }
    }
    return primaryPaymentMethod;
  };
  var trackingState = {
    shippingToPickUpTimesChangedCount: 0,
    sephoraBirthdayOfferClicked: false,
    updateSephoraBirthdayOfferClicked(val) {
      this.sephoraBirthdayOfferClicked = val;
    },
    cartChangeState: { cartTotalTimesChanged: 0 },
    updateCartProductChageState(prodId = "") {
      this.cartChangeState.cartTotalTimesChanged += 1;
      this.cartChangeState[prodId] = { timesChanged: (this.cartChangeState[prodId] && this.cartChangeState[prodId].timesChanged) + 1 || 1 };
      return this.cartChangeState[prodId];
    },
    pmpFilters: {
      defaultFiltersAtLoadArr:
        getParameterByName(location.href, "CN")
          .toLowerCase()
          .match(/\b\w+:[\d\w\s&#]+([^\w+:]|$)/gim) ||
        decodeURIComponent(((window.pmpSearchJsonData || {}).ProcessedData || {}).refinementValues || "").split("+"),
      filtersAtLoadArr: getParameterByName(location.href, "CN").match(/\b\w+:[\d\w\s&#]+([^\w+:]|$)/gim) || [],
      manualFiltersArr: Kjs.session.getItem("manualFiltersArr") || [],
      manualFilterClickHandler(filters = []) {
        this.manualFiltersArr = filters;
        Kjs.session.setItem("manualFiltersArr", this.manualFiltersArr);
      },
    },
  };
  var _arrDiff = function (arr1, arr2) {
    var d = new Set(arr1);
    var diff = new Set();
    for (v of arr2) {
      if (d.has(v)) {
        d.delete(v);
        continue;
      }
      diff.add(v);
    }
    var dArr = Array.from(d);
    var diffArr = Array.from(diff);
    return { intersec: dArr.concat(diffArr), diff: diffArr };
  };
  var _processManualFilters = function () {
    var prevFiltersArr = trackingState.pmpFilters.filtersAtLoadArr.filter(function (f) {
      return !trackingState.pmpFilters.manualFiltersArr.includes(f);
    });
    var currFiltersArr = getParameterByName(location.href, "CN").match(/\b\w+:[\d\w\s&#]+([^\w+:]|$)/gim) || [];
    var diff = _arrDiff(prevFiltersArr, currFiltersArr).diff;
    trackingState.pmpFilters.manualFilterClickHandler.call(trackingState.pmpFilters, diff);
    return trackingState.pmpFilters.manualFiltersArr;
  };
  var _getAllFormInputs = function ({
    formId = "form",
    prop = "className",
    query = "div",
    inputTypesArr = [
      'input:not([type="hidden"]):not([style*="display: none"])',
      'select:not([type="hidden"]):not([style*="display: none"])',
      'textarea:not([type="hidden"]):not([style*="display: none"])',
    ],
  } = {}) {
    var regex = new RegExp("\\w*" + formId + "\\w*", "gmi");
    var output = [];
    for (var i of document.querySelectorAll(query)) {
      if (regex.test(i[prop])) {
        output.push(i);
      }
    }
    return output.reduce(function (acc, curr) {
      curr.querySelectorAll(inputTypesArr.join(",")).forEach(function (input) {
        if (input.id && input.id.trim && input.id.trim().length) {
          acc[input.id] = input;
        }
      });
      return acc;
    }, {});
  };
  var _getVideoNameFromURL = function (url = "") {
    const matchArr = /(\w+).\w+$/i.exec(url);
    return matchArr && matchArr[1];
  };
  var _getEliteData = function () {
    var eliteData = { isSetElite: false, isAddElite: false, isNonElite: false };
    if ($env && $env.eliteProgram && ($env.enableElite || $env.isElite)) {
      if ($env.eliteCardOnProfile && !$env.elitepreferredPaymentTypeSet && $env.eliteSwitchKccBannerEnabled) {
        eliteData.isSetElite = true;
      } else if (!$env.eliteCardOnProfile && $env.eliteKccAdBannerEnabled) {
        eliteData.isAddElite = true;
      }
    } else if ($env && $env.eliteProgram && !$env.isElite && !$env.isMultipleKCCAccounts && $env.eliteSpendAway) {
      eliteData.isNonElite = true;
    }
    return eliteData;
  };
  var _getUserLoginStatus = function () {
    var isLoggedInUser = Kjs.cookie.get("DYN_USER_ID");
    var kohlsLoginStatus = isLoggedInUser
      ? Kjs.cookie.get("SoftLoggedInCookie")
        ? "kohls soft logged in"
        : "kohls logged in"
      : "kohls not logged in";
    return kohlsLoginStatus;
  };
  var _getUserStatus = function () {
    var isLoyaltyUser = Kjs.cookie.get("loyalty_id");
    var loyLoginStatus = isLoyaltyUser ? "loyalty logged in" : "loyalty not logged in";
    return _getUserLoginStatus() + "|" + loyLoginStatus;
  };
  var _getAppliedFilters = function ({ pmpSearchJsonData = {}, keyValSeparator = ":", filterSeparator = "|" }) {
    var decodedFilters = window.decodeURIComponent((pmpSearchJsonData.ProcessedData || {}).refinementValues || "");
    return decodedFilters.replace(/\:/g, keyValSeparator).replace(/\+/g, filterSeparator);
  };
  var _getAppliedSorting = function () {
    return ((pmpSearchJsonData.ProcessedData || {}).viewSortType || "").replace(/\s/g, "~");
  };
  var _getFullAndListPrice = function (productV2JsonData) {
    var price = [];
    var priceInfo = productV2JsonData.price;

    if (priceInfo.salePrice) {
      price.push(priceInfo.salePrice.minPrice);
      price.push(priceInfo.salePrice.maxPrice);
    }

    if (priceInfo.regularPrice) {
      price.push(priceInfo.regularPrice.minPrice);
      price.push(priceInfo.regularPrice.maxPrice);
    }

    var filteredPrice = price.filter(function (p) {
      return p;
    });

    var minPrice = Math.min.apply(this, filteredPrice);
    var maxPrice = Math.max.apply(this, filteredPrice);

    return minPrice && maxPrice ? minPrice.toFixed(2) + "_" + maxPrice.toFixed(2) : "";
  };
  var _getFulfillmentOptions = function (productV2JsonData) {
    var fulfillmentOptions = productV2JsonData.isBopusEligible
      ? productV2JsonData.isShippingNotAvailable
        ? "In Store Only"
        : "In Store or Ship"
      : "Shipped Only";

    return fulfillmentOptions;
  };
  var _pageLoadAnalytics = function ({ category = "", productTitle = "", pageType = "", subsectionData = "", formatCategory = true } = {}) {
    window.appEventData = window.appEventData || [];
    if (window.appEventData._reset) {
      window.appEventData._reset();
    } else {
      window.appEventData = [];
    }
    var currentDate = new Date();
    var date = currentDate.toISOString().split("T")[0];
    var pageName = (productTitle || "").replace(/&#34;/gi, '"');
    var formattedHour = currentDate
      .toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
      .replace(/:\d{2}/, ":00");
    var dayOfWeek = currentDate.toDateString().split(/\s/)[0].toLowerCase();
    var weekdayOrWeekend = currentDate.getDay() % 6 === 0 ? "weekend" : "weekday";
    var pageCategoryFormatted = formatCategory ? category.replace(/(\W+[^\S])|(\s)/gi, "_").toLowerCase() : category;
    window.appEventData.push({
      event: "Page Load Started",
      page: {
        akamaiCookID: Kjs.cookie.get("AKA_RV2"),
        date,
        dayOfWeek,
        hour: dayOfWeek + "|" + weekdayOrWeekend + "|" + formattedHour,
        isIncognitoMode: "<unavailable>", // not available
        releaseVersion: "<unavailable>", // not shipped anymore
        pageCategory: pageCategoryFormatted,
        pageExperience: $env.enableR74changes ? "pmp20" : "pmp19",
        pageName,
        pageType,
        platform: "launch",
        realTimeOfferTest: "<unavailable>", // this is available only on mobile
        riskAssessmentStatus: "<unavailable>", // this is more of an interaction, not something at load event
        subsection: pageCategoryFormatted + (subsectionData ? "|" + subsectionData : ""),
        visitorAPIPresent: "VisitorAPI " + (window.Visitor ? "Present" : "Missing"),
        weekdayOrWeekend,
      },
    });
  };
  var _pageLoadCompleteAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Page Load Completed",
      page: {
        yourPriceCustomers: s.prop74 || "",
      },
    });
  };
  var _locationAnalytics = function (locationId, type = "Location Detected") {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: type,
      locationId: (locationId || "").toString(),
    });
  };
  var _productOfferViewedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Product Offer Viewed",
    });
  };
  var _userSignedInAnalytics = function (userSignedIn = {}) {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "User Signed In",
      user: {
        custKey: Kjs.cookie.get("VisitorId"),
        loginStatus: userSignedIn.loginStatus || _getUserLoginStatus(),
        loyalty: {
          memberId: $env.loyaltyId || "",
        },
        persistedLogin: ($env.keepMeSignedIn || "").toString(),
      },
    });
  };
  var _userSignedOutAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "User Signed Out",
      user: {
        custKey: Kjs.cookie.get("VisitorId"),
        loginStatus: _getUserLoginStatus(),
      },
    });
  };
  var _userDetectedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    var visitorId = Kjs.cookie.get("VisitorId");
    window.appEventData.push({
      event: "User Detected",
      user: {
        affiliateCustomerID: getParameterByName(window.location.href, "affiliateId"),
        anonymousUserID: visitorId,
        custKey: visitorId,
        customerDetails: {
          SUID: visitorId,
        },
        loginStatus: _getUserStatus(),
        loyalty: {
          memberId: $env.loyaltyId || "",
        },
        primaryPaymentMethod: _getPrimaryPaymentMethod(),
        sephora: {
          isInsider: Kjs.cookie.get("sephoraRewards") === "true" ? "y" : "n",
        },
      },
    });
  };
  var _userVisitStartedAnalytics = function (cart_order_sumary) {
    window.appEventData = window.appEventData || [];
    if (Kjs.session.getItem("user_visit_has_started")) return;
    var cartOrderSummary = (Kjs.storage.getData("persistent_bar_components_json_v1") || {}).orderSummary || cart_order_sumary;
    window.appEventData.push({
      event: "User Visit Started",
      user: {
        persistedCartValue: cartOrderSummary ? "" + cartOrderSummary.total : "",
      },
    });
    Kjs.session.setItem("user_visit_has_started", true);
  };
  var _cartViewedAnalytics = function (cartData) {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Cart Viewed",
      cart: {
        cartID: cartData.cartId,
        item: cartData.cartItems.map(function (cartItem) {
          return {
            price: {
              isHidden: Number((cartItem.eligibility || {}).mapEligible || 0),
            },
            productInfo: {
              isOutOfStock: Number((cartItem.inventoryInfo || {}).outOfStock || 0),
              productID: cartItem.productId,
              sku: cartItem.skuId,
            },
          };
        }),
      },
    });
  };
  var _spendTrackerDisplayedAnalytics = function (cartJsonData) {
    window.appEventData = window.appEventData || [];
    var isTrackerDisplayed =
      cartJsonData.purchaseEarnings.kohlsCashEarnings.hasKcc &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings.everyDayKc &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings.everyDayKc.spendAwayEverydayKcc <= cartJsonData.thresholdKohlsMeterValue;
    if (!isTrackerDisplayed) return;
    window.appEventData.push({
      event: "Spend Tracker Displayed",
    });
  };
  var _saveListViewedAnalytics = function (cartJsonData) {
    window.appEventData = window.appEventData || [];
    var isSaveForLaterVisible = $env.ksCnCSaveForLater && cartJsonData.userData && cartJsonData.userData.sessionStatus !== "ANONYMOUS";
    if (!isSaveForLaterVisible) return;
    window.appEventData.push({
      event: "Save List Viewed",
    });
  };
  var _paymentMethodMessageDisplayedAnalytics = function (cartJsonData) {
    window.appEventData = window.appEventData || [];
    var eliteData = _getEliteData();
    var isKohlsChargeSwitch = false;
    var isKohlsChargeUspell = false;
    var isFreeShippingForElite = false;
    if (
      $env.isElite &&
      $env.eliteProgram &&
      cartJsonData &&
      cartJsonData.purchaseEarnings &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings.everyDayKc &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings.everyDayKc.everydayKCDelta > 0
    ) {
      isFreeShippingForElite = true;
    }
    if (
      cartJsonData &&
      cartJsonData.ksCnCLoyaltyKccPaymentSwitchMsg &&
      cartJsonData.purchaseEarnings &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings.everyDayKc &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings.everyDayKc.everydayKCDelta > 0 &&
      cartJsonData.pilotProgram &&
      cartJsonData.ksCnCLoyaltyKccPaymentSwitchMsg &&
      cartJsonData.isGuest === "false" &&
      Kjs.trCommonCheckout &&
      Kjs.trCommonCheckout.getPaymentOrReviewPage() &&
      !$env.isElite &&
      !Kjs.trCommonCheckout.userHasPilotKCC()
    ) {
      isKohlsChargeSwitch = true;
    }
    if (
      cartJsonData &&
      cartJsonData.welcomePilotOverlay &&
      cartJsonData.ksCnCLoyaltyWelcomeOverlayEnabled &&
      cartJsonData.ksCnCLoyaltyShoppingBagUpsellMsg &&
      cartJsonData.purchaseEarnings &&
      cartJsonData.purchaseEarnings.kohlsCashEarnings &&
      !cartJsonData.purchaseEarnings.kohlsCashEarnings.hasKcc &&
      cartJsonData.purchaseEarnings.loyaltyPilotUser
    ) {
      isKohlsChargeUspell = true;
    }
    window.appEventData.push({
      event: "Payment Method Message Displayed",
      message: {
        isAddElite: Number(eliteData.isAddElite),
        isFreeShippingForElite: Number(isFreeShippingForElite),
        isKohlsChargeSwitch: Number(isKohlsChargeSwitch),
        isKohlsChargeUspell: Number(isKohlsChargeUspell),
        isMaintainElite: "<int>",
        isNonElite: Number(eliteData.isNonElite),
        isSetElite: Number(eliteData.isSetElite),
        kohlsChargeAmountAndDate: " <string> ",
      },
      preScreenID: (cartJsonData.prescreenDetails || {}).prescreenOfferId || "",
    });
  };
  var _productAddedToSaveListAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Product Added to Save List",
    });
  };
  var _productRemovedFromCartAnalytics = function (cart, prodData) {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Product Removed from Cart",
      cart: {
        cartID: cart.cartId,
        cartModifications: cart.timesChanged || trackingState.cartChangeState.cartTotalTimesChanged,
      },
      product: [
        {
          productInfo: {
            productID: prodData.productId,
            sku: prodData.skuId,
          },
        },
      ],
    });
  };
  var _productRemovedFromSaveListAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Product Removed from Save List",
    });
  };
  var _kohlsCashAppliedFromWalletAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Kohls Cash Applied from Wallet",
    });
  };
  var _discountCodeViewedInWalletAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Discount Code Viewed In Wallet",
    });
  };
  var _errorMessagePresentedAnalytics = function (errorCode = "") {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Error Message Presented",
      error: {
        errorCode,
      },
    });
  };
  var _discountCodeAppliedFromWalletAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Discount Code Applied From Wallet",
    });
  };
  var _discountCodeEntrySucceededAnalytics = function (discountCode = "") {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Discount Code Entry Succeeded",
      voucherDiscount: {
        discountCode,
      },
    });
  };
  var _discountCodeEntryFailedAnalytics = function (discountCode = "") {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Discount Code Entry Failed",
      voucherDiscount: {
        discountCode,
      },
    });
  };
  var _giftCardAppliedFromWalletAnalytics = function () {
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Gift Card Applied From Wallet",
    });
  };
  var _cartInteractionOccurredAnalytics = function (shippingToPickUpCount = 0) {
    Kjs.apolloService.trackingState.shippingToPickUpTimesChangedCount += 1;
    window.appEventData = window.appEventData || [];
    window.appEventData.push({
      event: "Cart Interaction Occurred",
      cart: {
        item: [
          {
            fulfillment: {
              // this false was required from the events details otherwise it's a integer
              shippingToPickUp: Kjs.apolloService.trackingState.shippingToPickUpTimesChangedCount || shippingToPickUpCount || "false",
            },
          },
        ],
      },
    });
  };
  var _cartPromotionAnalytics = function (eventName, { cartPromotionName = "", sephoraBirthdayOffer = false, cartJsonData }) {
    window.appEventData = window.appEventData || [];
    cartJsonData = cartJsonData || window.cartJsonData || {};
    var bopusIncentive = (window.cncLabels && window.cncLabels["bopus_incentive_evar81"]) || "";
    cartPromotionName = cartPromotionName || bopusIncentive.replace("{0}", (cartJsonData.incentiveDetails || {}).incentiveAmount || 0);
    window.appEventData.push({
      event: eventName,
      cartPromotionName: cartPromotionName.toLowerCase(),
      sephoraBirthdayOffer: sephoraBirthdayOffer || Kjs.apolloService.trackingState.sephoraBirthdayOfferClicked,
    });
  };
  var _cartPromotionClickedAnalytics = function ({ cartPromotionName = "", sephoraBirthdayOffer = false, cartJsonData }) {
    _cartPromotionAnalytics("Cart Promotion Clicked", { cartPromotionName, sephoraBirthdayOffer, cartJsonData });
  };
  var _cartPromotionDisplayedAnalytics = function ({ cartPromotionName = "", sephoraBirthdayOffer = false, cartJsonData }) {
    _cartPromotionAnalytics("Cart Promotion Displayed", { cartPromotionName, sephoraBirthdayOffer, cartJsonData });
  };
  var _productAddedToCartAnalytics = function ({ activeTab, productV2JsonData, cartID }) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Product Added to Cart",
      cart: {
        additionContext: "pdp",
        cartID,
      },
      product: [
        {
          fulfillment: {
            isBopusCartAdd: activeTab === "bopus" ? 1 : 0,
            isBossCartAdd: activeTab === "boss" ? 1 : 0,
            isBopusOnly: productV2JsonData.isBopusEligible && productV2JsonData.isShippingNotAvailable ? 1 : 0,
            method: activeTab,
          },
          price: {
            fullAndListPrice: _getFullAndListPrice(productV2JsonData),
          },
          productInfo: {
            collection: $env.brightTagCollectionID === "N/A" ? "not collection" : $env.brightTagCollectionID,
            isOffer: productV2JsonData && productV2JsonData.productOffers && productV2JsonData.productOffers.length > 0 ? 1 : 0,
            productID: productV2JsonData.webID,
            sku: Kjs.pdpUtils.getProductConfgiuration(productV2JsonData.webID),
            webExclusive: productV2JsonData.onlineExclusive ? "y" : "n",
          },
        },
      ],
    });
  };
  var _productViewedAnalytics = function (productV2JsonData) {
    window.appEventData = window.appEventData || [];
    var boostedIds = "," + getParameterByName(document.referrer, "BST") + ",";
    appEventData.push({
      event: "Product Viewed",
      product: [
        {
          fulfillment: {
            isBopusOnly: productV2JsonData.isBopusEligible && productV2JsonData.isShippingNotAvailable ? 1 : 0,
          },
          isThirdPartyProduct: productV2JsonData.vendorDetails ? 1 : 0,
          price: {
            fullAndListPrice: _getFullAndListPrice(productV2JsonData),
            yourPriceDisplayed: ((productV2JsonData.price || {}).yourPriceInfo || {}).yourPrice ? 1 : 0,
          },
          productInfo: {
            collection:
              productV2JsonData.collectionId ||
              ($env.brightTagCollectionID === "N/A" && "not collection") ||
              $env.brightTagCollectionID ||
              "not collection",
            fulfillmentOptions: _getFulfillmentOptions(productV2JsonData),
            isBoosted: boostedIds.indexOf("," + productV2JsonData.webID + ",") !== -1 ? 1 : 0,
            plainCopyBlockPresent: productV2JsonData.textCopyBlock ? 1 : 0,
            productID: productV2JsonData.webID,
            richCopyBlockPresent: productV2JsonData.richCopyBlock ? 1 : 0,
            webExclusive: productV2JsonData.onlineExclusive ? "y" : "n",
          },
        },
      ],
      productInfo: {
        isBestSeller: productV2JsonData.bestSeller ? 1 : 0,
        isTopRated: productV2JsonData.topRated ? 1 : 0,
      },
      productPageTemplate: productV2JsonData.bdRendering.template,
    });
  };
  var _productCollectionViewedAnalytics = function (collectionJsonData) {
    window.appEventData = window.appEventData || [];
    var activeCollectionProducts = [].concat(collectionJsonData.collection).filter(function (v) {
      return v.isActive;
    });
    var product = activeCollectionProducts.map(function (v) {
      return {
        productInfo: {
          productID: v.webID,
        },
      };
    });
    appEventData.push({
      event: "Product Collection Viewed",
      product,
      productCollection: {
        name: collectionJsonData.productTitle,
      },
      productPageTemplate: collectionJsonData.productDetails,
    });
  };
  var _locationSelectedAnalytics = function (idx = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Location Selected",
      locationId: idx.toString(),
    });
  };
  var _productLocationListingDisplayedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    var filters = _getAppliedFilters({ pmpSearchJsonData });
    var sorting = _getAppliedSorting().toLowerCase();
    appEventData.push({
      event: "Product Location Listing Displayed",
      listingDisplayed: {
        filterList: ("sort:" + sorting + "|" + filters).split("|").sort().join("|").toLowerCase(),
      },
    });
  };
  var _productLocationListingItemClickedAnalytics = function (position) {
    window.appEventData = window.appEventData || [];
    var itemPosition = position || getParameterByName(location.href, "prdPV");
    appEventData.push({
      event: "Product Location Listing Item Clicked",
      listingItemClicked: {
        listing: [
          {
            itemPosition,
          },
        ],
      },
    });
  };
  var _productListingItemClickedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Product Listing Item Clicked",
    });
  };
  var _videoCompletedAnalytics = function (videoUrl) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Video Completed",
      video: {
        videoName: _getVideoNameFromURL(videoUrl) || "",
      },
    });
  };
  var _videoMilestoneReachedAnalytics = function (videoUrl) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Video Milestone Reached",
      video: {
        videoName: _getVideoNameFromURL(videoUrl) || "",
      },
    });
  };
  var _videoStartedAnalytics = function (videoUrl) {
    window.appEventData = window.appEventData || [];

    appEventData.push({
      event: "Video Started",
      video: {
        videoName: _getVideoNameFromURL(videoUrl) || "",
      },
    });
  };
  var _ctaLinkClickedAnalytics = function (linkId = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "CTA Link Clicked",
      linkInfo: {
        linkId,
      },
    });
  };
  var _eventListingDisplayedAnalytics = function (pmpSearchJsonData) {
    window.appEventData = window.appEventData || [];
    var filters = _getAppliedFilters({ pmpSearchJsonData });
    var sorting = _getAppliedSorting();
    appEventData.push({
      event: "Event Listing Displayed",
      listingDisplayed: {
        filterList: ("sort:" + sorting + "|" + filters).split("|").sort().join("|").toLowerCase(),
      },
    });
  };
  var _productListingDisplayedAnalytics = function (pmpSearchJsonData) {
    window.appEventData = window.appEventData || [];
    var manualFiltersArr = _processManualFilters();
    var filters = _getAppliedFilters({ pmpSearchJsonData }).split("|").sort().join("|").toLowerCase();
    var sorting = _getAppliedSorting().toLowerCase();
    var boostedProdsCount = 0;
    var products = pmpSearchJsonData.products || [];
    for (var i = 0; i < products.length; i++) {
      boostedProdsCount += products[i].boosted ? 1 : 0;
    }
    appEventData.push({
      event: "Product Listing Displayed",
      listingDisplayed: {
        copyBlockPresent: document.getElementsByClassName("creative-slot seo-tag-cloud")[0].children.length ? 1 : 0,
        defaultFiltersAppliedAndValues: trackingState.pmpFilters.defaultFiltersAtLoadArr
          .map(function (f) {
            return f.trim();
          })
          .sort()
          .join("|"),
        filterList: ("sort:" + sorting + "|" + filters).split("|").sort().join("|"),
        listing: [
          {
            productInfo: {
              isBoosted: boostedProdsCount,
            },
          },
        ],
        listingPersonalized: 0,
        manualFiltersApplied: manualFiltersArr.length
          ? manualFiltersArr
              .map(function (f) {
                return f.split(":")[0];
              })
              .join("|")
              .toLowerCase()
          : "no refinement",
        manualFiltersAppliedAndValues: manualFiltersArr.length
          ? manualFiltersArr
              .map(function (f) {
                return f.trim();
              })
              .join("|")
              .toLowerCase()
          : "no refinement",
        relatedSearchTermDisplayed: (pmpSearchJsonData.relatedSearchTerms || []).length,
        resultsCount: pmpSearchJsonData.totalRecordsCount,
        sortOrder: sorting,
      },
      listingRefined: {
        allFiltersAppliedAndValues: filters,
      },
    });
  };
  var _productGroupingViewedAnalytics = function (pmpSearchJsonData) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Product Grouping Viewed",
      productGrouping: {
        level1: (pmpSearchJsonData.ProcessedData.department || "").toLowerCase(),
        level2: (pmpSearchJsonData.ProcessedData.subCategory || "").replace(/>/g, "|").toLowerCase(),
      },
    });
  };
  var _locationListingItemClickedAnalytics = function (locationId = "no store") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Location Listing Item Clicked",
      listingItemClicked: {
        locationId,
      },
    });
  };
  var _productCategoryClickedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Product Category Clicked",
    });
  };
  var _productCategoryImpressionAnalytics = function () {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Product Category Impression",
    });
  };
  var _contentListingDisplayedAnalytics = function (contentID = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Content Listing Displayed",
      listingDisplayed: {
        listing: [
          {
            content: {
              contentID,
            },
          },
        ],
      },
    });
  };
  var _onSiteSearchPerformedAnalytics = function (searchTerm = "") {
    window.appEventData = window.appEventData || [];
    var searchAlgorithm = Kjs.cookie.get("relevancyAlgorithm");
    var searchType = getParameterByName(location.href, "submit-search");
    var persistedSuggestions = Kjs.session.getItem("persisted_suggestions");
    var typeAheadSearchDetails = "";
    if (persistedSuggestions && searchTerm) {
      var sugestedTerm = (persistedSuggestions.suggestions[0] || { data: { text: "" } }).data.text;
      var selectedTermIndex = -1;
      persistedSuggestions.suggestions.some(function (el, i) {
        if (el.data.text === searchTerm) {
          selectedTermIndex = i;
          return true;
        }
      });
      typeAheadSearchDetails = [
        persistedSuggestions.lookupText,
        sugestedTerm,
        persistedSuggestions.suggestions.length,
        selectedTermIndex,
      ].join("|");
    }
    appEventData.push({
      event: "Onsite Search Performed",
      listingDisplayed: {
        searchAlgorithm,
      },
      onsiteSearch: {
        isRelatedSearchTerm: (window.pmpSearchJsonData && pmpSearchJsonData.related) || 0,
        keyword: {
          searchTerm,
          searchType,
          typeAheadSearchDetails,
        },
        location: {
          storeSearchParameters: Kjs.cookie.get("K_favstore") || "",
        },
      },
    });
  };
  var _relatedProductClickedAnalytics = function (productID = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Related Product Clicked",
      relatedProducts: {
        item: [
          {
            productInfo: {
              productID: productID,
            },
            recommendationID: "<unavailable>",
          },
        ],
      },
    });
  };
  var _productInteractionOccuredAnalytics = function ({ interactionDetail = "", productV2JsonData }) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Product Interaction Occurred",
      product: [
        {
          productInfo: {
            fulfillmentOptions: _getFulfillmentOptions(productV2JsonData),
            productID: productV2JsonData.webID,
          },
        },
      ],
      productInteraction: {
        interactionDetail: interactionDetail,
      },
    });
  };
  var _navigationLinkClickedAnalytics = function (linkId) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Navigation Link Clicked",
      linkInfo: {
        linkId: linkId,
      },
    });
  };
  var _verifyAddressSuggestionDisplayedAnalytics = function (join = "with") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Verify Address " + join + " Suggestion Displayed",
    });
  };
  var _orderPlacedAnalytics = function (orderDetail) {
    function getFulfillmentSource(value) {
      var evar64Value = "ship to me"; //default value
      if (value.fulfillmentType === "EMAIL") {
        evar64Value = "electronicshippinggroup";
      } else if (value.fulfillmentType === "PICKUP") {
        if (value.shipMethodDetails && value.shipMethodDetails.curbsidePickupSelected) {
          evar64Value = "pick up in store-drive up";
        } else {
          evar64Value = "pick up in store-inside cs";
        }
      } else if (value.fulfillmentType === "BOSS") {
        if (value.shipMethodDetails && value.shipMethodDetails.curbsidePickupSelected) {
          evar64Value = "ship to store-drive up";
        } else {
          evar64Value = "ship to store-inside cs";
        }
      } else if (
        trJsonData &&
        trJsonData.incentiveDetails &&
        trJsonData.incentiveDetails.delayedShip &&
        trJsonData.incentiveDetails.delayedShip.incentiveQualified
      ) {
        evar64Value = "delayed fulfillment";
      }
      return evar64Value;
    }
    function calcItemShippingMethod(fulfillmentType, shipMethodCode, item) {
      if (fulfillmentType === "EMAIL") {
        return "electronicshippinggroup";
      } else if (
        $env.ksAccurateDeliveryDate &&
        (shipMethodCode === "STD" || shipMethodCode === "BOSS") &&
        item.estimatedDeliveryDates &&
        item.estimatedDeliveryDates.optimizedDeliveryDate
      ) {
        if (shipMethodCode == "STD") {
          return "STD-" + item.estimatedDeliveryDates.leadTime;
        } else if (shipMethodCode == "BOSS") {
          return "BOSS-" + item.estimatedDeliveryDates.leadTime;
        }
      } else if (shipMethodCode) {
        return shipMethodCode;
      } else {
        return "";
      }
    }
    function getOrderLevelDiscountCode(promoCodes) {
      return promoCodes.reduce(function (prev, curr) {
        return [prev, curr.id, "_", curr.name, ","].join("");
      }, "");
    }
    function getOfferInfoDetails(offerInfo) {
      return [].concat(offerInfo).reduce(function (prev, offerDetail) {
        if (offerDetail.offerType === "LID" && offerDetail.offerDiscount > 0) {
          prev = prev + offerDetail.offerId + "_" + offerDetail.promoCode + ",";
        }
        return prev;
      }, "");
    }
    function getLoyaltyIdNotProvided(orderDetail) {
      var hasLoyaltyPilotUser =
        orderDetail.orderSummary && orderDetail.orderSummary.purchaseEarnings && orderDetail.orderSummary.purchaseEarnings.loyaltyPilotUser;
      var hasLoyaltyCookies = Kjs.cookie.get("userFormDataLoyaltyId") === "" && Kjs.cookie.get("loyalty_id") === "";
      return hasLoyaltyPilotUser && hasLoyaltyCookies;
    }
    function getPromoCodes(order) {
      var evar60 = "";
      if (order.promoCodes && order.promoCodes.length > 0) {
        for (var i = 0; i < order.promoCodes.length; i++) {
          evar60 += order.promoCodes[i].id + "_" + order.promoCodes[i].name;
          if (i !== order.promoCodes.length - 1) evar60 = evar60 + ",";
        }
      }
      return evar60;
    }
    function getPaymentDetails({ creditCardDetails = [], giftCardDetails = [], kohlsCashDetails = [] } = {}) {
      var paymentsArr = [];
      function mapPaymentDetails(v) {
        if (!v) return {};
        var amount = v.paymentAmount || v.kohlsCashAmountUsed || "value not found";
        var method = v.paymentType || v.paymentMethod || "value not found";
        return {
          paymentAmount: amount.replace("$", "").replace("-", ""),
          paymentMethod: method,
        };
      }
      if (creditCardDetails.length) paymentsArr.push.apply(paymentsArr, creditCardDetails.map(mapPaymentDetails));
      if (giftCardDetails.length) paymentsArr.push.apply(paymentsArr, giftCardDetails.map(mapPaymentDetails));
      if (kohlsCashDetails.length) paymentsArr.push.apply(paymentsArr, kohlsCashDetails.map(mapPaymentDetails));
      return paymentsArr;
    }
    window.appEventData = window.appEventData || [];
    var fulfillmentSource = getFulfillmentSource(orderDetail);
    var fulfillmentMethod = "KF";
    if (((orderDetail.shipmentDetails || [])[0] || {}).itemType === "EFC") {
      fulfillmentMethod = "DS";
    }
    appEventData.push({
      event: "Order Placed",
      cart: {
        cartID: orderDetail.orderId || "",
      },
      eventDetails: {
        loyaltyIDNotProvided: getLoyaltyIdNotProvided(orderDetail),
      },
      transaction: {
        item: orderDetail.shipmentDetails[0].itemsDetails.itemStatus[0].lineItems.map(function (orderItem) {
          var saleUnitprice = orderItem.itemPriceInfo.saleUnitprice.toString().replace("$", "");
          var regularUnitPrice = orderItem.itemPriceInfo.regularUnitPrice.toString().replace("$", "");
          var sellingPrice =
            orderItem.itemPriceInfo.promoAdjustedExtendedPrice.toString().replace("$", "") - orderItem.itemPriceInfo.orderDiscountShare;
          return {
            altPersonPickUp: Boolean(
              orderDetail.alternatePickupDetails && orderDetail.alternatePickupDetails.isAlternatePickup && orderDetail.isBopusOrder
            ),
            fulfillment: {
              isBopus: orderItem.bopus,
              isBopusDriveUp: Boolean(orderDetail.shipmentDetails[0].shipMethodDetails.curbsidePickupSelected),
              method: fulfillmentMethod.toLowerCase(),
              source: fulfillmentSource,
              storeID: orderDetail.shipmentDetails[0].shipmentAddress.storeId || "",
            },
            pickUpTextNotifications: Boolean(
              orderDetail.textNotification && orderDetail.textNotification.sendTextNotification && orderDetail.isBopusOrder
            ),
            price: {
              listPrice: saleUnitprice,
              basePrice: regularUnitPrice, // * orderItem.quantity,
              fullAndListPrice: [saleUnitprice, regularUnitPrice].join("_"),
              sellingPrice: sellingPrice.toFixed(2),
            },
            productInfo: {
              collection: orderItem.collectionId || "not collection",
              isGiftWrapped: orderItem.giftInfoDetails || "",
              productID: orderItem.productId,
              sephoraBirthdayOffer: orderItem.skuType === "SEPHORA_GIFT",
              sku: orderItem.skuNumber,
              thirdyPartyVendorID: "<thirdyPartyVendorID>",
              webExclusive: orderItem.itemProperties.isWebExclusive ? "y" : "n",
            },
            quantity: orderItem.quantity,
            shippingAddress: {
              postalCode: orderDetail.shipmentDetails[0].shipmentAddress.postalCode,
            },
            shippingCost: orderItem.itemPriceInfo.shippingCost,
            shippingMethod: calcItemShippingMethod(
              orderDetail.shipmentDetails[0].fulfillmentType,
              orderDetail.shipmentDetails[0].shipMethodDetails.shipMethodCode,
              orderItem
            ),
            tax: orderItem.itemPriceInfo.itemTax,
            voucherDiscount: {
              orderLevelDiscountAmount: orderItem.itemPriceInfo.orderDiscountShare,
              orderLevelDiscountCode: getOrderLevelDiscountCode(orderDetail.orderSummary.promoCodes),
              productLevelDiscountAmount: orderDetail.orderSummary.promoCodes.length,
              productLevelDiscountCode: getOfferInfoDetails(orderItem.offerInfo),
            },
          };
        }),
        payment: getPaymentDetails(orderDetail.paymentDetails),
        profile: {
          address: {
            stateProvince: orderDetail.paymentDetails.billingAddress.state,
            postalCode: orderDetail.paymentDetails.billingAddress.postalCode,
          },
        },
        purchaseID: orderDetail.orderId || "",
        total: {
          currency: "usd", // hardcoded as usd since we are defining where to get this from (it's a new prop)
          numPayments:
            (orderDetail.paymentDetails &&
              orderDetail.paymentDetails.giftCardDetails &&
              orderDetail.paymentDetails.giftCardDetails.length) ||
            0,
        },
      },
      voucherDiscount: {
        orderLevelDiscountAmount: getPromoCodes(orderDetail.orderSummary),
        orderLevelDiscountCode: getOrderLevelDiscountCode(orderDetail.orderSummary.promoCodes),
        productLevelDiscountAmount: orderDetail.orderSummary.promoCodes.length,
        // productLevelDiscountCode: getOfferInfoDetails(orderItem.offerInfo),
      },
    });
  };
  var _cartPromotionEarnedAnalytics = function (cartPromotionName = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Cart Promotion Earned",
      cartPromotionName,
    });
  };
  var _orderConfirmationInteractionOccuredAnalytics = function (interactionType = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Order Confirmation Interaction Occurred",
      orderConfirmationInteraction: {
        interactionType,
      },
    });
  };
  var _accountLinkFailedAnalytics = function (sephoraEmailNotFound = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Account Link Failed",
      sephoraEmailNotFound,
    });
  };
  var _accountLinkedAnalytics = function (isSephora) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Account Linked",
      accountLinked: {
        sephora: isSephora,
      },
    });
  };
  var _walletItemAddedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Wallet Item Added",
    });
  };
  var _formViewedAnalytics = function (formType = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Form Viewed",
      form: {
        formType,
      },
    });
  };
  var _formAbandonedAnalytics = function (fieldID) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Form Abandoned",
      form: {
        fieldID,
      },
    });
  };
  var _formStartedAnalytics = function ({ formFieldId = "", formType = "", formId, prop, query } = {}) {
    // var fieldsIdArr = Object.keys(_getAllFormInputs({ formId, prop, query }));
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Form Started",
      form: {
        // formFieldId: formFieldId || fieldsIdArr.join(","),
        // formFieldId => form input that has focus on
        formFieldId: formFieldId || "no_field",
        formType,
      },
    });
  };
  var _formSubmissionFailedAnalytics = function ({ formFieldId = "", formId = "", formType = "", prop, query } = {}) {
    var formId = (typeof formId === "string" ? formId : "").replace(/[#|\.]/gim, "");
    var fieldsIdArr = Object.keys(_getAllFormInputs({ formId, prop, query }));
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Form Submission Failed",
      form: {
        formFieldId: formFieldId || fieldsIdArr.join(","),
        formID: formId,
        formType,
      },
    });
  };
  var _formSubmissionSucceededAnalytics = function (formType = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Form Submission Succeeded",
      form: {
        formType,
      },
    });
  };
  var _formFieldEngagedAnalytics = function (formFieldId = "") {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Form Field Engaged",
      form: {
        formFieldId,
      },
    });
  };
  var _fieldEngagedHandler = function (event) {
    _formFieldEngagedAnalytics(event.data.formFieldId);
  };
  var _formValidationCheck = function (event) {
    // I rely on the presence of alert-circle-icon icon to know that validation failed
    // also this is very fragile since I rely on UI
    // timeout it's to execute last on next event loop iteration (after any ui update happens)
    setTimeout(function () {
      var formId = event.data.formId;
      var formType = event.data.type;
      var hasErrors = false;
      hasErrors = !hasErrors && $(formId + " .alert-circle-icon").filter((__, el) => el.style.visibility).length > 0;
      if (hasErrors) {
        _formSubmissionFailedAnalytics({ formType, formId });
      }
    });
  };
  var _formInteractionStarted = function ({ type, formId, prop, query } = {}) {
    var formId = (typeof formId === "string" ? formId : "").replace(/[#|\.]/gim, "");
    var fieldsIdArr = Object.keys(_getAllFormInputs({ formId, prop, query }));
    var focusedFormFieldId = fieldsIdArr.find(function (v) {
      return v === document.activeElement.id;
    });
    _formViewedAnalytics(type);
    _formStartedAnalytics({ formType: type, formFieldId: focusedFormFieldId });
    fieldsIdArr.forEach(function (selector) {
      $("[for=" + selector + "],#" + selector)
        .off("click", _fieldEngagedHandler)
        .on("click", { formFieldId: type + "|" + selector }, _fieldEngagedHandler);
    });
    var safeFormId = formId ? "#" + formId : "form";
    $(safeFormId)
      .off("mouseup", "button.btn-primary , button[type=submit]", _formValidationCheck)
      .on("mouseup", "button.btn-primary , button[type=submit]", { formId: safeFormId, type }, _formValidationCheck);
  };
  var _listingSortOrderChangedAnalytics = function (sortOrder) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Listing Sort Order Changed",
      listingRefined: {
        sortOrder,
      },
    });
  };
  var _listingFilterAddedAnalytics = function (countOfStoresInFilter) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Listing Filter Added",
      listingDisplayed: {
        matrixRefinementConversion: pmpSearchJsonData.ProcessedData.category,
      },
      listingRefined: {
        allFiltersAppliedAndValues: _getAppliedFilters({ pmpSearchJsonData }),
        countOfStoresInFilter: countOfStoresInFilter,
        manualFiltersApplied: pmpSearchJsonData.activeDimensions
          .map(function (d) {
            return d.name;
          })
          .join("|"),
      },
    });
  };
  var _listingFilterRemovedAnalytics = function () {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Listing Filter Removed",
      listingRefined: {
        allFiltersAppliedAndValues: _getAppliedFilters({ pmpSearchJsonData }),
        manualFiltersApplied: pmpSearchJsonData.activeDimensions
          .map(function (d) {
            return d.name;
          })
          .join("|"),
      },
    });
  };
  var _userRegisteredAnalytics = function (userData = {}) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "User Registered",
      user: {
        custKey: Kjs.cookie.get("VisitorId"),
        kohlsAccountRegistrations: "<kohlsAccountRegistrations>",
        loginStatus: userData.loginStatus || _getUserLoginStatus(),
        loyalty: {
          isLoyaltyRegistration: "<isLoyaltyRegistration>",
        },
        sephora: {
          phoneProvided: "<phoneProvided>",
          registration: "<registration>",
          zipProvided: "<zipProvided>",
        },
      },
    });
  };
  var _ctaLinkClickedHandler = function (event) {
    _ctaLinkClickedAnalytics(event.target.id || event.target.className);
  };
  var _listenForCTALinkClick = function (ctaLinksSelectorsArr) {
    var ctaLinksCssSelectorsArr = ctaLinksSelectorsArr || [
      { parent: ".pdp-main-bazarvoice-ratings", el: "#AAQ" },
      { parent: ".pdp-main-bazarvoice-ratings", el: "#WAR" },
      { parent: ".pdp-main-bazarvoice-ratings", el: ".bv_avgRating_component_container , .bv_stars_component_container" },
      { parent: "", el: ".pdp-title-container" },
      { parent: "", el: ".showFindStorelocatoroverlay" },
      { parent: "", el: "#sizeguide" },
    ];
    ctaLinksCssSelectorsArr.forEach(function (cssSelector) {
      var p = cssSelector.parent;
      var el = cssSelector.el;
      if (p) {
        $(p).off("click", el, _ctaLinkClickedHandler).on("click", el, _ctaLinkClickedHandler);
        return;
      }
      $(el).off("click", _ctaLinkClickedHandler).on("click", _ctaLinkClickedHandler);
    });
  };
  var _checkoutInteractionOccuredAnalytics = function (interactionType, driveUpOptionSelected, shippingToPickUp) {
    window.appEventData = window.appEventData || [];
    appEventData.push({
      event: "Checkout Interaction Occurred",
      checkoutInteraction: {
        interactionType: interactionType,
      },
      eventDetails: {
        driveUpOptionSelected: driveUpOptionSelected,
      },
      product: [
        {
          fulfillment: {
            shippingToPickUp: shippingToPickUp,
          },
        },
      ],
    });
  };
  var _checkoutStepEncounteredAnalytics = function () {
    window.appEventData = window.appEventData || [];
    let driveUpOptionDisplayed = "NO";
    if (cartJsonData.shipmentInfo) {
      cartJsonData.shipmentInfo.forEach(function (shipment) {
        if (shipment.shippingMethodDescription.includes("curbside") || shipment.shippingMethodDescription.includes("drive")) {
          driveUpOptionDisplayed = "YES";
        }
      });
    }

    const checkoutMethodMapping = {
      "kohls soft logged in": "single-soft",
      "kohls logged in": "single-logged in",
      "kohls not logged in": "single-guest",
    };

    appEventData.push({
      event: "Checkout Step Encountered",
      checkoutMethod: checkoutMethodMapping[_getUserLoginStatus()],
      eventDetails: {
        driveUpOptionDisplayed: driveUpOptionDisplayed,
      },
    });
  };
  return {
    trackingState,
    userAnalytics: {
      userDataAnalytics: function ({ userSignedIn, userDetected } = {}) {
        catcher(_userSignedInAnalytics)(userSignedIn);
        catcher(_userDetectedAnalytics)(userDetected);
      },
      userSignedInAnalytics: catcher(_userSignedInAnalytics),
      userSignedOutAnalytics: catcher(_userSignedOutAnalytics),
      userDetectedAnalytics: catcher(_userDetectedAnalytics),
      userVisitStartedAnalytics: catcher(_userVisitStartedAnalytics),
      userRegisteredAnalytics: catcher(_userRegisteredAnalytics),
    },
    locationAnalytics: catcher(_locationAnalytics),
    pageLoadAnalytics: catcher(_pageLoadAnalytics),
    pageLoadCompleteAnalytics: catcher(_pageLoadCompleteAnalytics),
    productOfferViewedAnalytics: catcher(_productOfferViewedAnalytics),
    cartViewedAnalytics: catcher(_cartViewedAnalytics),
    spendTrackerDisplayedAnalytics: catcher(_spendTrackerDisplayedAnalytics),
    saveListViewedAnalytics: catcher(_saveListViewedAnalytics),
    paymentMethodMessageDisplayedAnalytics: catcher(_paymentMethodMessageDisplayedAnalytics),
    productAddedToSaveListAnalytics: catcher(_productAddedToSaveListAnalytics),
    productRemovedFromCartAnalytics: catcher(_productRemovedFromCartAnalytics),
    productRemovedFromSaveListAnalytics: catcher(_productRemovedFromSaveListAnalytics),
    kohlsCashAppliedFromWalletAnalytics: catcher(_kohlsCashAppliedFromWalletAnalytics),
    discountCodeViewedInWalletAnalytics: catcher(_discountCodeViewedInWalletAnalytics),
    errorMessagePresentedAnalytics: catcher(_errorMessagePresentedAnalytics),
    discountCodeAppliedFromWalletAnalytics: catcher(_discountCodeAppliedFromWalletAnalytics),
    discountCodeEntrySucceededAnalytics: catcher(_discountCodeEntrySucceededAnalytics),
    discountCodeEntryFailedAnalytics: catcher(_discountCodeEntryFailedAnalytics),
    giftCardAppliedFromWalletAnalytics: catcher(_giftCardAppliedFromWalletAnalytics),
    cartInteractionOccurredAnalytics: catcher(_cartInteractionOccurredAnalytics),
    cartPromotionAnalytics: catcher(_cartPromotionAnalytics),
    cartPromotionClickedAnalytics: catcher(_cartPromotionClickedAnalytics),
    cartPromotionDisplayedAnalytics: catcher(_cartPromotionDisplayedAnalytics),
    productAddedToCartAnalytics: catcher(_productAddedToCartAnalytics),
    productViewedAnalytics: catcher(_productViewedAnalytics),
    locationSelectedAnalytics: catcher(_locationSelectedAnalytics),
    productLocationListingDisplayedAnalytics: catcher(_productLocationListingDisplayedAnalytics),
    productLocationListingItemClickedAnalytics: catcher(_productLocationListingItemClickedAnalytics),
    productListingItemClickedAnalytics: catcher(_productListingItemClickedAnalytics),
    videoStartedAnalytics: catcher(_videoStartedAnalytics),
    videoCompletedAnalytics: catcher(_videoCompletedAnalytics),
    videoMilestoneReachedAnalytics: catcher(_videoMilestoneReachedAnalytics),
    relatedProductClickedAnalytics: catcher(_relatedProductClickedAnalytics),
    productInteractionOccuredAnalytics: catcher(_productInteractionOccuredAnalytics),
    navigationLinkClickedAnalytics: catcher(_navigationLinkClickedAnalytics),
    ctaLinkClickedAnalytics: catcher(_ctaLinkClickedAnalytics),
    eventListingDisplayedAnalytics: catcher(_eventListingDisplayedAnalytics),
    productListingDisplayedAnalytics: catcher(_productListingDisplayedAnalytics),
    productGroupingViewedAnalytics: catcher(_productGroupingViewedAnalytics),
    locationListingItemClickedAnalytics: catcher(_locationListingItemClickedAnalytics),
    productCategoryClickedAnalytics: catcher(_productCategoryClickedAnalytics),
    productCategoryImpressionAnalytics: catcher(_productCategoryImpressionAnalytics),
    contentListingDisplayedAnalytics: catcher(_contentListingDisplayedAnalytics),
    onSiteSearchPerformedAnalytics: catcher(_onSiteSearchPerformedAnalytics),
    verifyAddressSuggestionDisplayedAnalytics: catcher(_verifyAddressSuggestionDisplayedAnalytics),
    orderPlacedAnalytics: catcher(_orderPlacedAnalytics),
    cartPromotionEarnedAnalytics: catcher(_cartPromotionEarnedAnalytics),
    orderConfirmationInteractionOccuredAnalytics: catcher(_orderConfirmationInteractionOccuredAnalytics),
    accountLinkFailedAnalytics: catcher(_accountLinkFailedAnalytics),
    accountLinkedAnalytics: catcher(_accountLinkedAnalytics),
    walletItemAddedAnalytics: catcher(_walletItemAddedAnalytics),
    formViewedAnalytics: catcher(_formViewedAnalytics),
    formAbandonedAnalytics: catcher(_formAbandonedAnalytics),
    formStartedAnalytics: catcher(_formStartedAnalytics),
    formSubmissionFailedAnalytics: catcher(_formSubmissionFailedAnalytics),
    formSubmissionSucceededAnalytics: catcher(_formSubmissionSucceededAnalytics),
    formFieldEngagedAnalytics: catcher(_formFieldEngagedAnalytics),
    formInteractionStarted: catcher(_formInteractionStarted),
    listingSortOrderChangedAnalytics: catcher(_listingSortOrderChangedAnalytics),
    listingFilterAddedAnalytics: catcher(_listingFilterAddedAnalytics),
    listingFilterRemovedAnalytics: catcher(_listingFilterRemovedAnalytics),
    productCollectionViewedAnalytics: catcher(_productCollectionViewedAnalytics),
    listenForCTALinkClick: catcher(_listenForCTALinkClick),
    checkoutInteractionOccuredAnalytics: catcher(_checkoutInteractionOccuredAnalytics),
    checkoutStepEncounteredAnalytics: catcher(_checkoutStepEncounteredAnalytics),
    utils: {
      arrDiff: catcher(_arrDiff),
    },
  };
});
