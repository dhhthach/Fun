/*!
 * piq.view.js
 * Client-side view module for promote-iq view
 */
$module('promoteiqView', function(log, api, module, Kjs) {
	// Load template helper
	$requires([
		'app/piq/piq.helper.js',
		'external/slick-slider.js',
	]);

	api.productClickEvent = function(){
		var _this = $(this), clickTrackerUrl, redirectUrl, impressionTrackerUrl;
		clickTrackerUrl = _this.attr('data-clickTracker');
		if(_this.hasClass('impression-tracker')){
			impressionTrackerUrl = _this.attr('data-impressionTracker');
			$requires(impressionTrackerUrl);
		}

		if($env.enableApolloAnalytics && Kjs.apolloService) {
			var found = _this.attr('href').match(/(?:prd-)(.*)(?=\/)/i);
			var productID = found && found.length ? found[1] : '';
			Kjs.apolloService.relatedProductClickedAnalytics(productID);
		}

		$requires(clickTrackerUrl, {
			onLoad: function() {
				redirectUrl = _this.attr('href');
				window.location.href = redirectUrl;
			}
		});
	};

	var

		_carouselConfig = [{
			breakpoint: 1320,
			settings: {
			  slidesToShow: 5,
			  slidesToScroll: 5
			}
		},{
  			breakpoint: 1064,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4
			}
	  	},{
			breakpoint: 848,
			settings: {
			slidesToShow: 3,
			slidesToScroll: 3
			}
	  	},{
			breakpoint: 520,
			settings: {
			slidesToShow: 2,
			slidesToScroll: 2
			}
	  	}],

		// Apply the carousel controls to the thumbnail list
		_activateThumbnailSlider = function(panel) {
			panel.elem('piq-slider').slick({
				infinite: true,
				slidesToShow: 6,
				slidesToScroll: 6,
				responsive: _carouselConfig,
				centerPadding:'13px'
			});

			$(".slick-active").addClass("viewed");
			panel.elem('piq-slider').on("beforeChange", function (event, slick, currentSlide, nextSlide) {
				$(".slick-active").addClass("viewed");
			});

			panel.elem('piq-slider').on("afterChange", function (event, slick, currentSlide, nextSlide) {
				$(".slick-active:not(.viewed) .piq-prod_ratingBlock").each(function(i, e){
					var impTracker = e.getAttribute("data-impressiontracker");
					if (impTracker) {
						$requires(impTracker);
					}
				})
     			});
		},

		_onActivate = function() {
			var panel = this;
			_activateThumbnailSlider(panel);
			Kjs.lazy.scroll({
				sel: '.slick-active .piq-prod_ratingBlock',
				dataName: 'impressionTracker',
				onDisplay: function(elem){
					var ctx = elem[0];
					if(ctx && ctx.dataset && ctx.dataset.impressiontracker){
						$requires(ctx.dataset.impressiontracker)
					}
				}
			});
			$(document)
			.off("click", "#promote-iq-main .piq-slider-container a", api.productClickEvent)
			.on("click", "#promote-iq-main .piq-slider-container a", api.productClickEvent);
		},
		_onDeactivate = function() {
			$(document)
			.off("click", "#promote-iq-main .piq-slider-container a", api.productClickEvent);
		};

	$init(function _$init_promoteiqView($) {
		// Load templates
		$tmpl.load('app/piq/piq.view.html');
		// Define a panel on the view's API
		api.panel = $panel({
			tplId: 'tpl-promoteiq-main',
            key: 'promoteiqPanel',
            selem: '#promote-iq-main',
			helper: Kjs.promoteiqHelper,
			onActivate: _onActivate,
			onDeactivate: _onDeactivate
		})
	});
});