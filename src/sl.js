import { Router } from 'express';
import links from './models/links';
import apps from './models/apps';

export default ({ config, db }) => {
    let sl = Router();

    function getBrowserInfo(req) {
        var userAgent = req.headers['user-agent'];
        var browserInfo = {};
        browserInfo.isAndroid = /Android/i.test(userAgent);
        browserInfo.isiOS = /(?:i(?:Phone|P(?:o|a)d))/i.test(userAgent);
        if (browserInfo.isiOS) {
            browserInfo.iOSVersion = parseFloat( 
            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(userAgent) || [0,''])[1])
            .replace('undefined', '3_2').replace('_', '.').replace('_', '') ) || false;
        }
        browserInfo.isFirefox = /Firefox/i.test(userAgent);
        browserInfo.isChrome = /Chrome/i.test(userAgent) && !/OPR/.test(userAgent);
        return browserInfo;
    }

    function getDeepLink(browserInfo, link, app) {
        var deeplink = "";
        if(browserInfo.isAndroid) {
            deeplink += app.androidScheme + '://' + app.androidHost
        } else if(browserInfo.isiOS) {
        	if (app.iosUniversalUrl && browserInfo.iOSVersion >= 9.0 && app.iosUniversalUrl.length > 0 ) {
                deeplink += app.iosUniversalUrl;
            } else {
                deeplink += app.iosScheme + '://';
            }
        }
        /*
        var deeplink = browserInfo.isAndroid && browserInfo.isFirefox ?
            "intent://twitter.com/_/status/584046346862100481#Intent;package=com.twitter.android;scheme=https;end;" :
            app.appURI + "://";
        */
        if (link.path && link.path.trim().length > 0) {
            deeplink += link.path;
        } 
        return deeplink;
    }

    function getStoreURI(browserInfo, app) {
        return browserInfo.isAndroid ?
            "market://details?id=" + app.androidAppStoreId :
            "https://itunes.apple.com/app/" + app.iosAppStoreId + "?mt=8";
    }

    sl.get('/:link_id', (req, res) => {
        var browserInfo = getBrowserInfo(req);
        var linkId = req.params.link_id;

        let link = links.find( link => link.id===linkId );
        if (!link) {
            res.status(404).send('link not found');
            return;
        }

        let app = apps.find( app => app.id===link.appId );

        res.render('sl', {
            locals: {
                deeplink: getDeepLink(browserInfo, link, app),
                storeURI: getStoreURI(browserInfo, app)
            }
        });
    });

    return sl;
}