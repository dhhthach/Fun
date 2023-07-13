$module('addToCart', function (log, api, module, Kjs) {
    $load.css('/cnc/media/css/addtocart.css');
    // Load HTML templates
    $tmpl.load('/cnc/media/javascript/app/addtocart/tpl.addToCart.js'); 


    var _openATCPanel = function(cartItem,cartLabels){
        console.log(cartItem.itemProperties.image);
        Kjs.addToCart.panel.render({ "cartLabels": cartLabels, "cartItem":cartItem });

        $modal.open({
            href: '#atc-confirm',
            showClose: false			
        }); 

        $(".atc-panel").css("display","inline-grid")
       
    },
    
    _closeATCPanel = function(){
        $modal.close();
    },
    _ajaxPostCallTimeout = function (url, data, timeout, callback) {
        $.ajax({
            contentType: 'application/json',
            data: data ? data : '',
            dataType: 'json',
            error: function (data, textStatus, jqXHR) {
                log.error('Post Ajx call failed');
                callback(data, textStatus, jqXHR);
            },
            success: function(data, textStatus, jqXHR) {
                callback(data, textStatus, jqXHR);
            },
            timeout: timeout,
            type: 'POST',
            url: url
        });
    },
    _toCncPage = function(){
        window.location = "/checkout/shopping_cart.jsp";
    },
    _action = function(inputData, callback){
        var addtoBagUrl = '/cnc/checkout/cartItems/addItemToCart',
        //May need to change to configruable value
        timeout = 12000;
        _ajaxPostCallTimeout(addtoBagUrl, JSON.stringify(inputData), timeout, function (data, textStatus, jqXHR) {
            if (textStatus && textStatus == 'success' && data && data.status === 'Success') {

                var item = inputData.cartItems[0],
                sku = item.skuId,
                cartItem = data.cartItems.filter(function(itItem){return itItem.skuId == sku});

                //console.log(cartItem);
                _loadMiniShoppingBag('.mini-cart-header');
                _openATCPanel(cartItem[0],data.trLabels);
                _syncRespBag(data);
            }
            if(callback){
                callback(data, textStatus, jqXHR);
            }
        });
    },
    //start for resBag cookie code
    responsiveStoredCartDefaultValues = {
        isGift: 0,
        collId: '-1',
        isBopusItem: 0,
        storeNum: '-1',
        bagItemId: 'null',
        isBossItem : 0
    },
    defaultHybridBagEntryValues = {
        bagItemId: 0,
        isGift: false,
        itemOffers: [],
        quantity: 0,
        storeNum: "",
        isBopusItem: false,
        isBossItem: false
    },
    responsiveStoredCartKey = 'resBag',
    storedLocalBagKey = 'KOHLS-BAG',
    _createResponsiveCartEntryString = function (cartEntry, shipmentInfo, addressDetails, bagItemId){    
        var isGift =  cartEntry.giftInfo && cartEntry.giftInfo.isGiftSelected ? 1 : responsiveStoredCartDefaultValues.isGift;
        var collId = cartEntry.collId ? cartEntry.collId : responsiveStoredCartDefaultValues.collId;
        var shipmentRefId = cartEntry.shippingInfo && cartEntry.shippingInfo.shipmentRefId;
        var isBopusItem = responsiveStoredCartDefaultValues.isBopusItem,
            isBossItem = responsiveStoredCartDefaultValues.isBossItem,
            storeNum= responsiveStoredCartDefaultValues.storeNum,
            shippingMethod='',addressId='';
        if (shipmentInfo) {
            for (var i = 0; i < shipmentInfo.length; i++) {
                var shipmentId = shipmentInfo[i].shipmentId;
                shippingMethod = shipmentInfo[i].shippingMethod;
                if (shipmentRefId === shipmentId ) {
                    if(shippingMethod === 'BOPUS'){
                        isBopusItem = 1;
                        shippingMethod = -1;
                        addressId = shipmentInfo[i].shippingAddressRefId;
                    }else if(shippingMethod === 'BOSS'){
                        isBossItem = 1;
                        shippingMethod = -1;
                        addressId = shipmentInfo[i].shippingAddressRefId;
                    }else if(shippingMethod === 'STD' || shippingMethod === 'AKH'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 0;
                    } else if( shippingMethod === 'ODD'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 1;
                    } else if(shippingMethod === 'TDD'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 2;
                    } else if(shippingMethod === 'LTL_C'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 3;
                    } else if(shippingMethod === 'LTL_R'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 4;
                    } else if(shippingMethod === 'LTL_T'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 5;
                    } else if(shippingMethod === 'LTL_W'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        shippingMethod = 6;
                    } else {
                        //vgc
                    }
                    break;
                }
            }
        }

        if(isBopusItem === 1 || isBossItem === 1){
            if (addressDetails && addressDetails.storeAddress && addressDetails.storeAddress.length > 0){
                for (var j = 0; j < addressDetails.storeAddress.length; j++) {
                    var address = addressDetails.storeAddress[j];
                    if(address &&  address.id == addressId){
                        storeNum=address.storeId;
                        break;
                    }
                }
            }
        }

        return `${cartEntry.skuId}|${cartEntry.productId}|${cartEntry.quantity}|${isGift}|${collId}|${isBopusItem}|${storeNum}|${bagItemId}|${isBossItem}|${shippingMethod}`;

    },
    _getResponsiveCartStringFromArray = function(cartEntryArr, shipmentInfo, addressDetails) {
        var bagItemId = 1;
        var responsiveRawCartArr = cartEntryArr.map(cartEntry => _createResponsiveCartEntryString(cartEntry, shipmentInfo, addressDetails, bagItemId++));
        return JSON.stringify(responsiveRawCartArr);
    },
    _setCookieValue = function (name, value, exp, isSecure) {
        if (name) {
            if (value) {
                var expiration = (typeof exp === 'undefined') ? '' : exp;
                var cookieString = `${name}=${value}; path=/;expires=${expiration}`;

                if (isSecure && location.protocol === 'https:') {
                    cookieString + ';secure'
                }
                document.cookie = cookieString;
            } else {
                document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
            }
        }
    },
    _getLocalCartArrayFromArray = function(cartEntryArr, shipmentInfo, addressDetails) {
        var localCartEntryArr = cartEntryArr.map(cartEntry => _getLocalCartEntry(cartEntry, shipmentInfo, addressDetails));
        return JSON.stringify(_generateIdsForBagItems(localCartEntryArr));
    },
    _getLocalCartEntry = function (cartEntry, shipmentInfo, addressDetails) {
    
        var localCartEntry = Object.assign({}, defaultHybridBagEntryValues);

        var isGift =  cartEntry.giftInfo && cartEntry.giftInfo.isGiftSelected ? cartEntry.giftInfo.isGiftSelected : defaultHybridBagEntryValues.isGift;
        var collId = cartEntry.collId ? cartEntry.collId : defaultHybridBagEntryValues.collId;

        var shipmentRefId = cartEntry.shippingInfo && cartEntry.shippingInfo.shipmentRefId;
        var isBopusItem = defaultHybridBagEntryValues.isBopusItem,
            isBossItem = defaultHybridBagEntryValues.isBossItem,
            storeNum= defaultHybridBagEntryValues.storeNum,
            defaultToShippingMethod='', addressId='';

        if (shipmentInfo) {
            for (var i = 0; i < shipmentInfo.length; i++) {
                var shipmentId = shipmentInfo[i].shipmentId;
                var shippingMethod = shipmentInfo[i].shippingMethod;
                if (shipmentRefId === shipmentId ) {
                    if(shippingMethod === 'BOPUS'){
                        isBopusItem = true;
                        addressId = shipmentInfo[i].shippingAddressRefId;
                    }else if(shippingMethod === 'BOSS'){
                        isBossItem= true;
                        addressId = shipmentInfo[i].shippingAddressRefId;
                    }else if(shippingMethod === 'STD'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        defaultToShippingMethod = 'USSTD';
                    } else if(shippingMethod === 'ODD' || shippingMethod === 'TDD'){
                        addressId = shipmentInfo[i].shippingAddressRefId;
                        defaultToShippingMethod = shippingMethod;
                    } else {
                        //vgc
                    }
                    break;
                }
            }
        }

        if(isBopusItem || isBossItem){
            if (addressDetails && addressDetails.storeAddress && addressDetails.storeAddress.length > 0){
                for (var j = 0; j < addressDetails.storeAddress.length; j++) {
                    var address = addressDetails.storeAddress[j];
                    if(address && address.id == addressId){
                        storeNum=address.storeId;
                        break;
                    }
                }
            }
        }

        localCartEntry['skuCode'] = cartEntry.skuId;
        localCartEntry['webID'] = cartEntry.productId;
        localCartEntry['quantity'] = cartEntry.quantity;
        localCartEntry['isGift'] = isGift;
        localCartEntry['collId'] = collId;
        localCartEntry['isBopusItem'] = isBopusItem;
        localCartEntry['storeNum'] = storeNum;
        localCartEntry['defaultToShippingMethod'] = defaultToShippingMethod ? defaultToShippingMethod : (isBopusItem || isBossItem) ? false : '';
        localCartEntry['isBossItem'] = isBossItem;
        if (cartEntry.itemProperties) {
            localCartEntry['title'] = cartEntry.itemProperties.productTitle ? cartEntry.itemProperties.productTitle : '';
        }
        return _normalizeCartEntry(localCartEntry);
    },        
    _normalizeCartEntry = function(cartEntry){
        var entry = Object.assign({}, cartEntry);

        for(var key in entry) {
            if(entry.hasOwnProperty(key)){
                var currentVal = cartEntry[key];
                if(key === 'isGift' || key === 'isBopusItem' || key === 'isBossItem'){
                    entry[key] = _convertBoolean(entry[key]);
                }else if (key === 'quantity'){
                    entry[key] = _getNumericFromString(entry[key]);
                }else if(key === 'storeNum' && (currentVal === '-1' || !currentVal)){
                    entry[key] = '';
                }else if(key === 'bagItemId' && currentVal === 'null'){
                    entry[key] = 0;
                }
            }
        }

        return entry;
    },
    _getNumericFromString = function(numberString){
        var defaultNumber = 0;
        if (numberString){
            var number = parseInt(numberString);
            return isNaN(number) ? defaultNumber :  number;
        }
        return defaultNumber;
    },
    _convertBoolean = function (bool){
        if (bool === true){
            return bool;
        }
        return 'true' === bool;
    },
    _putInLocalStorage = function (key, obj){
        if (key) {
            if (obj) {
                localStorage.setItem(key, obj);
            } else {
                localStorage.removeItem(key);
            }
        }
    },
    _getNextBagItemId = function (currentBagItemId, cart){
		var existingBagItemIds = _getExistingBagItemIds(cart);
		var newBagItemId = currentBagItemId;
		while(existingBagItemIds.indexOf('' +newBagItemId) > -1){
			newBagItemId++;
		}
		return newBagItemId;
	},
	_getExistingBagItemIds = function (cart){
		var existingBagItemIds = [];
		cart.map(currentCartItem => {
			if (typeof currentCartItem.bagItemId !== 'undefined'){
			existingBagItemIds.push('' + currentCartItem.bagItemId);
		}
		});
		return existingBagItemIds;
	},
    _generateIdsForBagItems = function (cart){
        var newBagItemId = 1;
        cart.map(cartEntry => {
            if (!cartEntry.bagItemId || cartEntry.bagItemId === '0'){
            newBagItemId = _getNextBagItemId(newBagItemId, cart);
            cartEntry.bagItemId = '' + newBagItemId;
            }
        });
        return cart;
    },
    _loadMiniShoppingBag = function(element){
        try{
            //This function uses VisitorBagTotals cookie to update header cart
            var cartbagCountDetails = Kjs.cookie.get('VisitorBagTotals');
            
            var subtotalElement = $(element + ' .subtotal');
            var itemNumberElement = $(element + ' .number-items');

            if(cartbagCountDetails == ''){
                itemNumberElement.html('0');
                subtotalElement.html('$0.00');
            }else{
                cartbagCountDetails = cartbagCountDetails.split('|');
                if(cartbagCountDetails[1] > 99){
                    itemNumberElement.html('99+');
                }else{
                    itemNumberElement.html(cartbagCountDetails[1]);
                }                
                var totalPrice = cartbagCountDetails[0];                
                if(totalPrice){                    
                    if(totalPrice.length > 9){  /// For more then $9,999.99
                        var value = totalPrice.slice(0,7);
                        value = value + '..';
                        value = value.replace(/,/g, '');
                        subtotalElement.text(value);
                        subtotalElement.prop('title',totalPrice); // Showing total price in title since otherwise it is trimmed
                    }else{
                        subtotalElement.html(totalPrice);
                    }
                }
            }
        }
        catch(e){
            log.error(e.message, e);
        }
    },            
    _syncRespBag = function (cartJsonData) {
            try {
                if (cartJsonData && cartJsonData.cartItems && cartJsonData.cartItems.length > 0) {
                    if (cartJsonData.isGuest === 'true') {
                        var responseCartString = _getResponsiveCartStringFromArray(cartJsonData.cartItems, cartJsonData.shipmentInfo, cartJsonData.addressDetails);
                        _setCookieValue(responsiveStoredCartKey, responseCartString);
                    }
    
                    var localCartString = _getLocalCartArrayFromArray(cartJsonData.cartItems, cartJsonData.shipmentInfo, cartJsonData.addressDetails);
                    _putInLocalStorage(storedLocalBagKey, localCartString)
                }
            } catch(err) {
                console.error('Error occured in _syncRespBag' + err);
            }
    }
    //end for resBag cookie code
    ;

    api.panel = $panel({
        tplId: 'tpl-addToCart-template'
    }).bind('close-atc-modal','click', _closeATCPanel)
    .bind('atc-cont-shopping','click', _closeATCPanel)
    .bind('atc-view-cart','click', _toCncPage);
    api.action = _action;
    api.show = _openATCPanel;
});

