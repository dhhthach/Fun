/*!
 * piq.data.js
 * Data controller module for promote-iq app
 */
$module('promoteiqData', function(log, api, module, Kjs) {
    api.getPiqData = function(url, data, callback) {
		$load.json(url, {
            contentType: 'application/json',
            dataType: 'json',
            data: data ? JSON.stringify(data) : '',
            method: 'POST',
            onLoad: function (success, response, json) {
                if (!success) {
                    log.error('Promote IQ call failed');
                    callback(success)
                }
                if(json){
                    callback(null, json.payload);
                }
            }
        });
	};

});
