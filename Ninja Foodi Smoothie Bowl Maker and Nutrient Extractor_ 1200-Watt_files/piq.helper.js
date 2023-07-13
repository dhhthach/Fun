/*!
 * piq.helper.js
 * Helper functions for use in templates in the promote-iq view
 */
$module('promoteiqHelper', function(log, api, module, Kjs) {
	api.productImageParam = function (imageURL, WH) {
		var imgURL = imageURL.split('wid=');
		WH = WH || 1000;
		imgURL = imageURL.indexOf('wid=') > -1 ? imgURL[0] + 'wid=' + WH + '&hei=' + WH + '&op_sharpen=1' : imgURL[0] + '?wid=' + WH + '&hei=' + WH + '&op_sharpen=1';
		return imgURL;
	},
    api.handleRatingImage = function(value){
		value = value && value.toString().split(".");
		if(value){
			if(value[0] && value[1]){
				return value[0]+"-"+value[1];
			}else{
				return value[0]+"-"+0;
			}
		}
	},
	api.formatPrice = function (price) {
		var priceInStr = price.toString();
		// eslint-disable-next-line no-useless-escape
		priceInStr = priceInStr.replace(/\,/g, '');
		var splitPrice = priceInStr.split('.');
		var wholeNo = splitPrice[0];
		var decimalPart = '';
		if (splitPrice.length > 1) {
			decimalPart = '.' + splitPrice[1];
			if (splitPrice[1].length <= 1) {
				decimalPart += '0';
			}
		} else {
			decimalPart = '.00';
		}
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(wholeNo)) {
			wholeNo = wholeNo.replace(rgx, '$1' + ',' + '$2');
		}
		var formattedPrice = wholeNo + decimalPart;
		return formattedPrice;
	},
	api.priceStr = function (price) {
		if (typeof price == undefined || price == null || typeof price.minPrice == undefined || price.minPrice == null) {
			return '';
		}
		if (typeof price.maxPrice == undefined || price.maxPrice == null) {
			return '$' + api.formatPrice(price.minPrice);
		} else {
			return '$' + api.formatPrice(price.minPrice) + ' - ' + '$' + api.formatPrice(price.maxPrice);
		}
	},
	api.priceLabel = function (label, priceObj) {
		if (label.replace(/\s/g, '').toLowerCase() == 'sale+clearance') {
			return 'mixed';
		} else if (label.toLowerCase() == 'mixed' || label.replace(/\s/g, '').toLowerCase() == 'regular+original') {
			return '';
		} else {
			return label;
		}
	},
	api.emptyCheck = function (val) {
		return val || '';
	},
	api.getPricing = function (prices) {
		if (prices && prices.length > 0) {
			return {
				'salePriceLabel': api.priceLabel(api.emptyCheck(prices[0].salePriceStatus), prices[0]),
				'salePrice': api.priceStr(prices[0].salePrice),
				'regularPrice': api.priceStr(prices[0].regularPrice),
				'regularPriceLabel': api.priceLabel(api.emptyCheck(prices[0].regularPriceType), prices[0])
			};

		}
	},
	api.piqProdPricingData = function(prices){
		var pricing = api.getPricing(prices)
		var priceLabelStyle = priceAmountStyle = priceLabel = priceAmount = priceOriginal = '';
		if (pricing.salePrice != "" && pricing.regularPriceLabel.toLowerCase() != "mixed") {
			if (pricing.regularPriceLabel == 'Regular') priceOriginal = pricing.regularPriceLabel+ " " + pricing.regularPrice;
			else priceOriginal = pricing.regularPriceLabel + " " + pricing.regularPrice;
		}
		else if (pricing.salePrice != "") {
			priceOriginal = pricing.regularPrice;
		}
		if (!pricing.isSuppressed) {
			if (pricing.salePriceLabel != "" || pricing.salePriceLabel.toLowerCase() == "mixed") {
				priceLabelStyle = priceAmountStyle = 'piq-red-color';
			}
			if (pricing.salePriceLabel != "" && pricing.salePriceLabel.toLowerCase() != "mixed") {
				priceLabel = pricing.salePriceLabel;
			}
			else if (pricing.salePrice == "" && pricing.regularPriceLabel.toLowerCase() != "mixed") {
				priceLabel = pricing.regularPriceLabel;
			}
			if (pricing.salePriceLabel.toLowerCase() == "mixed") {
				priceAmount = pricing.salePrice;
			}
			else if (pricing.salePrice != "") {
				priceAmount = pricing.salePrice;
			}
			else if (pricing.regularPrice != "") {
				priceAmount = pricing.regularPrice;
			}
		}
		
		return {
			"priceLabelStyle": priceLabelStyle,
			"priceAmountStyle": priceAmountStyle,
			"priceLabel": priceLabel,
			"priceAmount": priceAmount,
			"priceOriginal": priceOriginal
		}
	},
	api.renderHomePIQBanners = function(bannersData){
		if(bannersData){
			if(bannersData.topBanners && bannersData.topBanners.length > 0){
				bannersData.topBanners.forEach(function(banner, index){
					var topBannerhtml = '<div class="piq_top_banner"><a href='+banner.clickthru+' class="piq_banner_top_link impression-tracker" data-impressionTracker='+banner.impression_tracker+' data-clickTracker='+banner.click_tracker+' onclick="return false"><img src='+banner.asset_url+' alt="" title="" /></a></div>'
					$('.piq_banner_top')[index].innerHTML = topBannerhtml;
					window.scrollBy(0,1);
				});
			}
			if(bannersData.bottomBanners && bannersData.bottomBanners.length > 0){
				bannersData.bottomBanners.forEach(function(banner, index){
					bottomBannerhtml = '<div id="piq_bottom_banner"><a href='+banner.clickthru+' class="piq_banner_bottom_link impression-tracker" data-impressionTracker='+banner.impression_tracker+' data-clickTracker='+banner.click_tracker+' onclick="return false"><img src='+banner.asset_url+' alt="" title="" /></a></div>'
					$('.piq_banner_bottom')[index].innerHTML = bottomBannerhtml;
					window.scrollBy(0,1);
				});
			}
		}
	},
	api.bindBannerEvents = function(){
		$('.piq_super_leaderboard_row_link, .piq_marquee_row_link, .piq_banner_top_link, .piq_banner_bottom_link').on('click', Kjs.promoteiqView.productClickEvent);
		Kjs.lazy.scroll({
			sel: '.piq_super_leaderboard_row_link, .piq_marquee_row_link, .piq_banner_top_link, .piq_banner_bottom_link',
			dataName: 'impressionTracker',
			dwell:1000,
			margin: ($env.page == "homePage") ? 350: -50,
			onDisplay: function(elem){
				var ctx = elem[0];
				if(ctx && ctx.dataset && ctx.dataset.impressiontracker){
					$requires(ctx.dataset.impressiontracker)
					ctx.classList.remove('impression-tracker');
				}
			}
		});
	};
});
