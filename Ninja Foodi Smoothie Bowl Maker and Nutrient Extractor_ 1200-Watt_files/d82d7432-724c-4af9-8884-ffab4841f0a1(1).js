// Copyright 2006-2023 ClickTale Ltd., US Patent Pending

window.ClickTaleGlobal = window.ClickTaleGlobal || {};
window.ClickTaleSettings = window.ClickTaleSettings || {};

ClickTaleGlobal.init = ClickTaleGlobal.init || {};
ClickTaleGlobal.scripts = ClickTaleGlobal.scripts || {};
ClickTaleGlobal.scripts.versions = {"wr": "bridge-WR110.js", "pcc": "d82d7432-724c-4af9-8884-ffab4841f0a1.js?DeploymentConfigName=Release_20230626&Version=2"};
(function (d) {
	var dom="h",
		spe=[92,94,36,46,124,63,42,43,40,41,91,123],
		rep=[98,100,102,104,106,108,110,112,114,116,118,119];
	for(var v,c,i=0,len=d.length;i<len,c=d.charCodeAt(i);i++){		
		if(c>=97&c<=122){v=c+7;v=v>122?v-26:v;v=v%2==0?v-32:v;}
		else if(c>=48&c<=57){v=69+(c-48)*2}
		else if(c==45){v=65}
		else if(spe.indexOf(c)>=0){v=rep[spe.indexOf(c)]}
		else{v=c}
		dom+=String.fromCharCode(v);
	}

	ClickTaleGlobal.init.isAllowed = (function() {
						var doms = ["RVosZhJVT","RVosZLJVTTLyJLhJVT","ThRVosZhJVT","TAZaHNLhRVosZLJVTTLyJLhJVT","VwPuPVusHihJVT","RVosZhJVT"];
			if(location.protocol == "file:") return false;
			for(var i=0, curr; i < doms.length, curr = doms[i]; i++) {
								if(new RegExp("h" + curr + "$", "i").test(dom))
									return true;
			}
			return false;
					})()
})(window.location.host.toLowerCase().replace(/^((www)?\.)/i, ""));

ClickTaleSettings.Proxy = {
	WR: "ing-district.clicktale.net/ctn_v2/",
	ImageFlag: "ing-district.clicktale.net/ctn_v2/"
}
ClickTaleSettings.Protocol = {
	Method: "ImpactRecorder"
}
ClickTaleGlobal.diagnostics=function(){function n(n,t,o){if(n&&t)for(var r in T){var e=T[r];e.collect(t)&&e.errors.push({message:n,url:t,lineno:o})}return!!S&&S(n,t,o)}function t(n){return"function"==typeof n}function o(){return performance?performance.now():Date.now()}function r(n){++n.sampled>n.repeats?g(n.name):e(n)}function e(n){var t=n.reporter()||{},o=n.errors.splice(0),r=n.level,e=n.url,l={loaded:n.loaded,ready:n.ready,started:n.started,level:o.length?"error":r,errors:encodeURIComponent(JSON.stringify(o))};e&&r!==k&&(n.timeToLoad>0&&(l.timeToLoad=n.timeToLoad),a(n,i(i(e+"?t=log&p="+n.pid,l),t),o))}function i(n,t){for(var o in t)n+="&"+I[o]+"="+t[o];return n}function a(n,o,r){var e=L.sendBeacon,i=function(n){n.errors=r.concat(n.errors)};if(t(e))e.call(L,o)||i(n);else{var a=new Image;a.onerror=a.ontimeout=function(){i(n)},a.timeout=3e4,a.src=o}}function l(n){T[n]&&(T[n].ready=!0)}function c(n){var t=T[n];t&&(t.loaded=!0,t.timeToLoad=t.loadStart?o()-t.loadStart:0),T[n]=t}function d(n){T[n]&&(T[n].loading=!0,T[n].loadStart=o())}function u(n){T[n]&&(T[n].started=!0)}function f(n){T[n]&&(T[n].starting=!0)}function s(n,o,r){var e=window.ClickTaleMonitor;e&&(I.monitorState=40,I.isMonitoring=42,t(e.getPid)&&v(M,e.getPid(),n||"https://conductor.clicktale.net/monitor",/\/monitor-(latest|[\d\.]+).*\.js$/i,function(){var n=t(e.getState)&&e.getState();return!this.errors.length&&n.match(/^(chunk|end)$/i)&&(this.level=k),{monitorState:n,isMonitoring:t(e.isMonitoring)&&e.isMonitoring()}},o||5e3,r||1))}function m(){g(M)}function v(t,o,r,e,i,a,l){T[t]=T[t]||new p(t,o,r,e,i,a,l),y||(S=window.onerror,window.onerror=n,y=!0)}function g(n){var t=T[n];t&&(clearInterval(t.sampler),delete T[n]);for(var o in T)return;y=!1}function p(n,t,o,e,i,a,l){var c=this;c.url=o,c.pid=t,c.errors=[],c.name=n,c.level="alert",c.repeats=l,c.loadStart=c.sampled=c.timeToLoad=0,c.loading=c.loaded=c.starting=c.started=c.ready=!1,c.reporter=function(){return i.call(c)},c.collect=function(n){return!!n.match(e)},c.sampler=setInterval(function(){r(c)},a)}function h(n,t,o){var r=n&&n.name,e=T[r];if(e){var i=e[t];"function"==typeof i&&i.apply(this,o)}}function w(n,t,o){return{on:t,off:o,onready:function(){l(n)},onloaded:function(){c(n)},onloading:function(){d(n)},onstarted:function(){u(n)},onstarting:function(){f(n)}}}var y,S,T={},L=navigator,k="info",M="monitor",I={level:0,loaded:2,ready:4,started:6,errors:8,timeToLoad:12};return{monitor:w(M,s,m),invoke:h}}();

ClickTaleGlobal.scripts.filter = ClickTaleGlobal.scripts.filter || (function () {
	var recordingThreshold = Math.random() * 100;

	return {
		isRecordingApproved: function(percentage) {
			return recordingThreshold <= percentage;
		}
	}
})();
	
		
// Copyright 2006-2023 ClickTale Ltd., US Patent Pending
// PID: 24
// WR destination: www47
// WR version: 17.0
// Recording ratio: 0.5

(function (){
	var dependencyCallback;
        var scriptSyncTokens = ["wr"];
        var ct2Callback, isRecorderReady;
    var dependencies = scriptSyncTokens.slice(0);
    var clickTaleOnReadyList = window.ClickTaleOnReadyList || (window.ClickTaleOnReadyList = []);
    var indexOf = (function(){if(Array.prototype.indexOf){return function(array,value){return array.indexOf(value)}}return function(array,value){var length=array.length;for(var i=0;i<length;i++){if(array[i]===value){return i}}return -1}})();
    function isValidToken(token) {
        if (indexOf(scriptSyncTokens, token) > -1) {
            var index = indexOf(dependencies, token);

            if (index > -1) {
                dependencies.splice(index, 1);
                return true;
            }
        }

        return false;
    }

    clickTaleOnReadyList.push(function () {
        if (ct2Callback) {
            ct2Callback();
        }

        isRecorderReady = true;
    });

    ClickTaleGlobal.scripts.dependencies = {
        setDependencies: function (deps) {
            scriptSyncTokens = deps;
        },
        onDependencyResolved: function (callback) {
            dependencyCallback = callback;
        },
        notifyScriptLoaded: function (token) {
            if (isValidToken(token)) {
                if (dependencies.length === 0 && typeof dependencyCallback === "function") {
                    dependencyCallback();
                }
            }
        }
    };

    ClickTaleGlobal.scripts.integration = {
        onReady: function (callback) {
            if (isRecorderReady) {
                callback();
            }
            else {
                ct2Callback = callback;
            }
        }
    };
})();



	ClickTaleSettings.Integration = ClickTaleSettings.Integration || {};
	ClickTaleSettings.Integration.ProjectType = 3;

window.ClickTaleIsXHTMLCompliant = true;
if (typeof (ClickTaleCreateDOMElement) != "function")
{
	ClickTaleCreateDOMElement = function(tagName)
	{
		if (document.createElementNS)
		{
			return document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
		}
		return document.createElement(tagName);
	}
}

if (typeof (ClickTaleAppendInHead) != "function")
{
	ClickTaleAppendInHead = function(element)
	{
		var parent = document.getElementsByTagName('head').item(0) || document.documentElement;
		parent.appendChild(element);
	}
}

if (typeof (ClickTaleXHTMLCompliantScriptTagCreate) != "function")
{
	ClickTaleXHTMLCompliantScriptTagCreate = function(code)
	{
		var script = ClickTaleCreateDOMElement('script');
		script.setAttribute("type", "text/javascript");
		script.text = code;
		return script;
	}
}	



// Start of user-defined pre WR code (PreLoad)
//PTC Code Version 10.1

window.ClickTaleSettings = window.ClickTaleSettings || {};
ClickTaleSettings.PTC = ClickTaleSettings.PTC || {};
ClickTaleSettings.Compression = ClickTaleSettings.Compression || {};
ClickTaleSettings.Compression.Method = function () {
    return "deflate";
};
ClickTaleSettings.Transport = ClickTaleSettings.Transport || {};
(function () {
    var Tr = ClickTaleSettings.Transport;
    Tr.Legacy = false;
    Tr.MaxConcurrentRequests = 1;
    Tr.BigBuffer = 120000;
})();
ClickTaleSettings.Protocol = ClickTaleSettings.Protocol || {};
ClickTaleSettings.Protocol.Method = "ImpactRecorder";

if (document.readyState === "complete") {
    window.ClickTaleIncludedOnWindowLoad = true;
}
window.ClickTaleIncludedOnDOMReady = true;

window.ClickTaleSettings.PTC.IsMobile = false;

ClickTaleSettings.LocRefRew = function (url) {
    if (!!window.ClickTaleSettings.PTC.applyFlowId) {
        url += window.ClickTaleSettings.PTC.applyFlowId;
        window.ClickTaleSettings.PTC.applyFlowId = "";
    }
    return url;
};
ClickTaleSettings.LocationRewriter = window.ClickTaleSettings.LocRefRew;
ClickTaleSettings.ReferrerRewriter = window.ClickTaleSettings.LocRefRew;

ClickTaleSettings.CheckAgentSupport = function (f, v) {
    if (v.t == v.ED) {
        ClickTaleSettings.Compression.Async = false;
    }
    if (v.m) {
        ClickTaleSettings.PTC.IsMobile = true;
    }
    var fv = f(v);
    ClickTaleSettings.PTC.okToRunPCC = fv;
    return fv;
};

ClickTaleSettings.DOM = ClickTaleSettings.DOM || {};

(function () {
    var selectorForBoth =
        'div#pickupstorename span, div[id^="bopusorder-review"] span,div#orderConfirm span.bbold,div.KAS-CheckoutBopus-text-state_msg span,p.name-mail-para>span,form#signInForm-softlogin span.mL15,div.kohls-charge-not-qualified-status-page-container span>i,span.first-name,ul.shippingAddress_fields>li,li.shippingAddress_name h3,div.pcaitem,div.pcaitem *,div#shippingAddressesContainer li,div.col_custaddress *,textarea,div#paymentMethodsContainer p,ul.shippingAddreswrap li,div.paymentInformationContainer p,div.paymentInformationContainer span,div.reg_user_email_address,div.paymentAddressContainer li,div.verify-address-box span,div.display-name-rewards,span[class^="commonForm"],div.cust-info-container span,ul#order_confirmShippingDetails p,ul#order_confirmShippingDetails strong,li.shippingMethodEmailConfirm,ol[id^="order_confirmNotify"] b,p.tce-bar-in-account-greeting>b, div.contact-signed-in-block *,span.address-saved-block *,span.payment-card-saved-block *,div.saved-address *, span.order-confirmation-email, div.pickup-common-sub-header';
    var placeHolder = "input#search";
    var onlyTextSelector = '#firstNameConfirm, #contactConfirm, #addressConfirmLn1, #addressConfirm,  #CYIHeader, #rsvpDisplayUnboxed, #verifRSVPConfirm, div.display-name-rewards>h2,span.display-rewards-number,div#listPurchaseHistory td.column-order-no a,span.trackingnumber,div.order-detail-info-content *,span[title="User Name"],span[title="Email"],div[class^="cust-"]>span,p[class^="rewards-information-"],div.address-block *,div.phone-number-block *,p.name-mail-para>span,span.displayRewardsNumber, .order-detail-link-panel li:nth-child(1) span:not([class]) b, #orderSummaryDetails .order-summary>div[id^="panel"]>div.order-summary-hr-cards+div.cart-block-item>span.cart-block-item-name, .kohls-charge-head-saved-card,.kohls-charge-text-saved-card, p.gift-card-bottom-text';
    var onlyNumbersSelector = "#personalDisplay li";
    onlyTextSelector += ",span.bi-first-name,span.bi-validation-contact-email,select#birthMonth>option:nth-of-type(n+2),select#birthDay>option:nth-of-type(n+2),span#bi-confirmationemail-name,div#sephoraCreateAccount div.name-email,div#sephora-confirmation div.title,span#bi-otp-email-recipient,div.sephora-otp-title";
    selectorForBoth += ", div#pickupPanelContainerDiv";
    selectorForBoth += ", #militaryFirstName, #militaryLastName, #zipCodeMilitary, #militaryAdd1, #militaryPhone";
    selectorForBoth += ", #billingMilitaryFirstName, #billingMilitaryLastName, #zipCodeBillingMilitary, #tr_billing_add_apo_add1, #billingMilitaryPhone";

    //SUP-8297
    selectorForBoth += ", #kiosk_loginEmail, #kiosk_loginPassword, #rd-password, #txtemail_sign, #firstnameField, #lastnameField";

    //SUP-8253
    selectorForBoth += ", #cardholderName, #panel1107, #panel1108, #firstName, #lastName, #phoneNumber, #billingFirstName, #billingLastName, .cardNumber, #billingPhoneNumber, #tr_billing_add_us_city, #tr_billing_add_us_state, #tr_billing_add_us_zipcode, #tr_billing_add_us_address2, #tr_billing_add_us_address1, [name='expMonth'], [name='cvv'], [name='cardNum'], [name='nameOnCard'], #tr_add_us_address1, #tr_add_us_address2, #tr_add_us_zipcode, #tr_add_us_city, #tr_add_us_state";
    /**
     *
     * @param {!string} value - attribute value || textContent
     * @param {!Node} node
     * @param {!string} rule - css selector
     * @param {!number} type - 0 - text, 1 - attribute
     * @returns {!string}
     */
    function transform(value, node, rule, type) {
        var reg = /\w|[^\x00-\x7F]/g;

        if (rule.rule == "#personalDisplay li") {
            return value.replace(/[0-9]/g, "-");
        }
        return value.replace(reg, "-");
    }

    ClickTaleSettings.DOM.PII = {
        Text: [selectorForBoth, onlyTextSelector, onlyNumbersSelector],
        Attributes: [{
            rule: selectorForBoth,
            attr: "value",
        },
        {
            rule: placeHolder,
            attr: "placeholder",
        },
        ],
        Transform: transform,
    };

    /**
     *
     * @param {!CSSStyleSheet} adoptedStyleSheets
     */
    function getSerializedNode(adoptedStyleSheets) {
        var textArray = [];
        adoptedStyleSheets.forEach(function (sheet) {
            var rules = /** @type{!CSSRuleList} */ (sheet.cssRules);
            for (let i = 0; i < rules.length; i++) {
                var rule = rules[i];
                if (rule && rule.cssText) {
                    textArray.push(rule.cssText);
                }
            }
        });
        if (textArray.length) {
            return {
                nodeType: 1,
                tagName: "style",
                attributes: {
                    "data-addoptedCSS": "true",
                },
                childNodes: [{
                    nodeType: 3,
                    textContent: textArray.join("\r\n"),
                },],
            };
        }
        return null;
    }

    /**
     *
     * @param {!(DocumentOrShadowRoot|Element)} root
     */
    function addSerializedNode(root, serializeAPI) {
        var serializeNode,
            parentNode = root,
            adoptedStyleSheets;
        switch (root.nodeType) {
            case 11:
                if ((adoptedStyleSheets = /** @type{!CSSStyleSheet} */ (root.adoptedStyleSheets)) && adoptedStyleSheets.length) {
                    serializeNode = getSerializedNode(adoptedStyleSheets);
                }
                break;
            case 1:
                if (typeof root.getRootNode === "function") {
                    root = root.getRootNode();
                    addSerializedNode(root, serializeAPI);
                }
                break;
            case 9:
                if ((adoptedStyleSheets = /** @type{!CSSStyleSheet} */ (root.adoptedStyleSheets)) && adoptedStyleSheets.length) {
                    serializeNode = getSerializedNode(adoptedStyleSheets);
                    parentNode = document.head || document.documentElement;
                }
                break;
        }
        if (serializeNode && parentNode) {
            serializeAPI.addChild(parentNode, null, serializeNode);
        }
    }

    ClickTaleSettings.DOM.Serializer = ClickTaleSettings.DOM.Serializer || {};

    ClickTaleSettings.DOM.Serializer.OnAfterSerialize = function (serializeAPI) {
        var allObservableRoots;

        //ComputedStyle code
        var dataStyledComponents = document.querySelectorAll("link[href*='rating']");
        if (!!dataStyledComponents) {
            var cssRulesString = "";
            Array.prototype.forEach.call(dataStyledComponents, function (el, ind) {
                if (!!el && el.sheet && (el.sheet.rules || el.sheet.cssRules)) {
                    var cssRulesObj = !!el.sheet.rule ? el.sheet.rules : el.sheet.cssRules;
                    for (var i in cssRulesObj) {
                        if (cssRulesObj[i]["cssText"]) {
                            cssRulesString += cssRulesObj[i]["cssText"] + " ";
                        }
                    }
                }
            });
            serializeAPI.addChild(document.head, null, {
                nodeType: 1,
                tagName: "style",
                attributes: {
                    computedStyle: "",
                },
                childNodes: [{
                    nodeType: 3,
                    textContent: cssRulesString,
                },],
            });
        }
        //end computedStyle code

        if ("adoptedStyleSheets" in Document.prototype && window.ClickTaleGlobal && ClickTaleGlobal.symbols && ClickTaleGlobal.symbols.rootsManager && typeof ClickTaleGlobal.symbols.rootsManager.getAllObservableRoots === "function" && Array.isArray((allObservableRoots = /** @type{!Array.<DocumentOrShadowRoot|Element>} */ (ClickTaleGlobal.symbols.rootsManager.getAllObservableRoots())))) {
            allObservableRoots.forEach(function (root) {
                addSerializedNode(root, serializeAPI);
            });
        }
    };

    var locationRules = [];

    locationRules.forEach(function (rule) {
        if (rule.location) {
            var prop = rule.location.prop;
            var search = rule.location.search;
            if (search.test(location[prop])) {
                var Attributes = rule.Attributes;
                var selector = rule.selector;
                var Text = rule.Text;
                var PII = ClickTaleSettings.DOM.PII;
                if (Text) {
                    PII.Text.push(selector);
                }
                if (Array.isArray(Attributes)) {
                    Attributes.forEach(function (attr) {
                        PII.Attributes.push({
                            rule: selector,
                            attr: attr,
                        });
                    });
                }
            }
        }
    });
})();

(function () {
    if (typeof window.ClickTalePIISelector === "string" && ClickTalePIISelector != "") {
        try {
            var domNodes = document.querySelector(ClickTalePIISelector);
            var PII = ClickTaleSettings.DOM.PII;
            PII.Text.push(ClickTalePIISelector);
            PII.Attributes.push({
                rule: ClickTalePIISelector,
                attr: "value",
            });
        } catch (err) {
            if (typeof ClickTaleNote === "function") {
                ClickTaleNote("Bad PII selector: " + encodeURIComponent(ClickTalePIISelector));
            }
        }
    }
})();

ClickTaleSettings.PTC.doOnlyWhen = function (toDoHandler, toCheckHandler, interval, times, failHandler) {
    if (!toDoHandler || !toCheckHandler) return;
    if (typeof interval == "undefined") interval = 100;
    if (typeof times == "undefined") times = 10;
    if (--times < 0) {
        if (typeof failHandler === "function") {
            failHandler();
        }
        return;
    }
    if (toCheckHandler()) {
        toDoHandler();
        return;
    }
    setTimeout(function () {
        ClickTaleSettings.PTC.doOnlyWhen(toDoHandler, toCheckHandler, interval, times, failHandler);
    }, interval);
};

function ClickTaleOnRecording() {
    (function () {
        function init() {
            var uxaGet = _uxa.push(["getSessionData"]);
            if (uxaGet && uxaGet.projectId) {
                var checkIfCSisRecording = _uxa.push(["isRecording"]);
                var playerType = "";

                if (checkIfCSisRecording) {
                    playerType = "&recordingType=cs";
                }

                var pid = uxaGet.projectId;
                var uu = uxaGet.userId;
                var sn = uxaGet.sessionNumber;
                var pvid = uxaGet.pageNumber;
                if (pid && uu && sn && pvid) {
                    var intLink = "https://app.contentsquare.com/quick-playback/index.html?pid=" + pid + "&uu=" + uu + "&sn=" + sn + "&pvid=" + pvid + playerType + "&vd=csrl";
                    window.ClicktaleReplayLink = function () {
                        return intLink;
                    };
                    if (window.CS_CONF) {
                        CS_CONF.replaylink = intLink;
                    }
                }
            }
        }

        function callback(context) {
            if (!disableCallback) {
                disableCallback = true;
                init(context);
            }
        }
        var disableCallback = false;
        window._uxa = window._uxa || [];
        _uxa.push(["afterPageView", callback]);
    })();
}
// End of user-defined pre WR code


var isHttps = document.location.protocol == 'https:',
	scriptSource = window.ClickTaleScriptSource,
	pccSource = scriptSource;

if (!scriptSource) {
	window.ClickTaleScriptSource = isHttps ? 'https://cdnssl.clicktale.net/www/' : 'http://cdn.clicktale.net/www/';
}


if(!ClickTaleGlobal.init.pccRequested) {
		var pccSrc = pccSource ? pccSource : (isHttps ? 'https://cdnssl.clicktale.net/pcc/' : 'http://cdn.clicktale.net/pcc/');
	    pccSrc += 'd82d7432-724c-4af9-8884-ffab4841f0a1.js?DeploymentConfigName=Release_20230626&Version=2';
			var pccScriptElement = ClickTaleCreateDOMElement('script');
	pccScriptElement.type = "text/javascript";
	pccScriptElement.crossOrigin = "anonymous";
		pccScriptElement.async = true;
		if(ClickTaleGlobal.scripts.sri && ClickTaleGlobal.scripts.sri.hashes){
        pccScriptElement.integrity = ClickTaleGlobal.scripts.sri.hashes.pcc;
        pccScriptElement.src = ClickTaleGlobal.scripts.sri.path + "pcc.js";
	}else {
       pccScriptElement.src = pccSrc;
    }
	
	ClickTaleGlobal.init.isAllowed && document.body.appendChild(pccScriptElement);
		ClickTaleGlobal.init.pccRequested = true;
}
	
window.ClickTalePrevOnReady = typeof window.ClickTaleOnReady == 'function' ? window.ClickTaleOnReady : void 0;

window.ClickTaleOnReady = function() {
	var PID=24, 
		Ratio=0.5, 
		PartitionPrefix="www47",
		SubsId=233441;
	
	if (window.navigator && window.navigator.loadPurpose === "preview") {
       return;
	};
		
	
	// Start of user-defined header code (PreInitialize)
	 window._uxa = window._uxa || [];
window.ClickTaleSettings = window.ClickTaleSettings || {};
window.ClickTaleSettings.PTC = window.ClickTaleSettings.PTC || {};
window.ClickTaleSettings.PTC.CustomVariables = window.ClickTaleSettings.PTC.CustomVariables || [];
window.ClickTaleSettings.PTC.CustomVariables = [
    { displayName: 'Page Name', key: 'pageName', slot: 1, dataSource: 1 },
    { displayName: 'Department Name', key: 'departmentName', slot: 2, dataSource: 2 },
    { displayName: 'Category Name', key: 'categoryName', slot: 3, dataSource: 2 },
    { displayName: 'Subcategory Name', key: 'subcategoryName', slot: 4, dataSource: 2 },
    { displayName: 'PMP Page Name', slot: 5 },
    { displayName: 'Stylitics present', slot: 6, selector: 'div#stylitics-container div.stylitics-widget-outfit-inner' },
    { displayName: 'Page Type', key: 'pageType', slot: 7, dataSource: 1 },
    { displayName: 'Sephora PDP', slot: 8, selector: 'div.sephora-logo' },
    { displayName: 'Marketplace', slot: 9, selector: '[class="badge badge-marketplace"],.market-place-badge' }
];

function sendCVar() {
    var data = window['s'];
    var data2 = !!window['pageData'] && window['pageData']['productDetails'];
    var cVars = window.ClickTaleSettings.PTC.CustomVariables;

    for (var i = 0; i < cVars.length; i++) {
        if (cVars[i].hasOwnProperty('selector') && document.location.href.toLowerCase().indexOf('/product/') > -1) {
            let selector = cVars[i].selector;
            let value = '';
            if (cVars[i].displayName === 'Sephora PDP') {
                value = !!document.querySelector(selector) ? 'true' : ''
            }
            else if (cVars[i].displayName === 'Stylitics present') {
                let styliticEl = document.querySelectorAll(selector);
                value = !!styliticEl.length ? 'Yes' : 'No'
            } else if (cVars[i].displayName === 'Marketplace') {
                value = !!document.querySelector(selector) && 'Y';
            }
            !!value && window._uxa.push(['setCustomVariable', cVars[i].slot, cVars[i].displayName, value]);
        }
        else if (!!data || !!data2) {
            if (!!cVars[i].hasOwnProperty('key')) {
                var currentData = (cVars[i].dataSource == 1) ? data : data2;
                !!currentData && !!currentData[cVars[i].key] && window._uxa.push(['setCustomVariable', cVars[i].slot, cVars[i].displayName, currentData[cVars[i].key]]);
            }
            else if (document.location.href.toLocaleLowerCase().indexOf('/catalog') > -1 && !cVars[i].hasOwnProperty('selector')) {
                var metaData = document.querySelector('meta[name="title"]');
                if (!!metaData && !!metaData.content) {
                    var verifiedData = metaData.content.trim().toLocaleLowerCase();
                    window._uxa.push(['setCustomVariable', cVars[i].slot, cVars[i].displayName, verifiedData]);
                }
            }
        }
    }
}

if ((/apply\.kohls/).test(document.location.href) && !!document.querySelector('.progressBar_section-lable-active')) {
    var step = document.querySelector('.progressBar_section-lable-active').innerText.trim().replace(/\s/g, '_').toLowerCase();
    step = `step=${step}`
    window.ClickTaleSettings.PTC.applyFlowId = window.location.search ? ('&' + step) : ('?' + step);
    window._uxa = window._uxa || [];
    window._uxa.push(['setQuery', window.location.search + window.ClickTaleSettings.PTC.applyFlowId]);
}

window.ClickTaleOnStop = window.ClickTaleOnStop || [];
ClickTaleOnStop.push(sendCVar);
sendCVar();
//IMP-81
if (location.href.indexOf('/checkout/v2/checkout.jsp') > -1) {
    if (!document.querySelector('#checkout-logo-block img[src*="new_checkout"]')) { // IMP-3145
        window._uxa.push(['setQuery', '?__checkoutshipinfo']);
    }
}

//OpinionLab Integration Start
if (ClickTaleSettings.PTC.RecordSurvey === false) {
    return;
}
//OpinionLab Integration End

if (typeof ClickTaleSetAllSensitive === "function") {
    ClickTaleSetAllSensitive();
};

window.ClickTaleSettings.PTC.InitFuncs = window.ClickTaleSettings.PTC.InitFuncs || [];
window.ClickTaleSettings.PTC.InitFuncs.push(function () {
    var pcc = document.querySelector('script[src*="clicktale"][src*="pcc"],script[src*="contentsquare"][src*="pcc"]');
    if (pcc) {
        var versionmatch = pcc.src.match(/DeploymentConfigName=(.+)/i);
        if (versionmatch && typeof ClickTaleExec === 'function') {
            ClickTaleExec("console.info('" + versionmatch[0] + "');");
            ClickTaleEvent("Config: " + versionmatch[1].replace(/\&.+/, ''));
        }
    }
});


//AB Test Integration Timeout
var initFuncs = window.ClickTaleSettings.PTC.InitFuncs;
for (var i = 0, initLen = initFuncs.length; i < initLen; i++) {
    if (typeof initFuncs[i] === 'function') {
        initFuncs[i]();
    }
}

	// End of user-defined header code (PreInitialize)
    
	
	window.ClickTaleIncludedOnDOMReady=true;
	
	ClickTaleGlobal.init.isAllowed && ClickTale(PID, Ratio, PartitionPrefix, SubsId);
	
	if((typeof ClickTalePrevOnReady == 'function') && (ClickTaleOnReady.toString() != ClickTalePrevOnReady.toString()))
	{
    	ClickTalePrevOnReady();
	}
	
	
	// Start of user-defined footer code
	
	// End of user-defined footer code
	
}; 
(function() {
	var div = ClickTaleCreateDOMElement("div");
	div.id = "ClickTaleDiv";
	div.style.display = "none";
	document.body.appendChild(div);

	
		var wrScript = ClickTaleCreateDOMElement("script");
	wrScript.crossOrigin = "anonymous";
	wrScript.type = 'text/javascript';
		wrScript.async = true;
		if(ClickTaleGlobal.scripts.sri && ClickTaleGlobal.scripts.sri.hashes){
        wrScript.integrity = ClickTaleGlobal.scripts.sri.hashes.wr;
        wrScript.src = ClickTaleGlobal.scripts.sri.path + "wr.js";
	}else {
        wrScript.src = window.ClickTaleScriptSource + 'bridge-WR110.js';
    }

	ClickTaleGlobal.init.isAllowed && document.body.appendChild(wrScript);
})();









//Signature:R7Q4fWoAdYW4/QTqnXnM9RkktqA31zQItr5qowooL8QBR3/+rLRxR3d3XK/EHUU82ZjjXMqVVmBCtYTGhPS1un0iHSR9OiaiVolTQ7pMGoKQ6plxjZQ07vHU+Ol2Nt8sPlvOHZE9nZK3ROqWuDJOg51FiGv8RqA4WAcpunlMU/Q=