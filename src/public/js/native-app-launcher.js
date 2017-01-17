var NativeAppLauncher = (function () {
    var timers = [];
    var userAgent = window.navigator.userAgent;
    var isAndroid = function () {
        return /Android/.test(userAgent);
    };
    var isIOS = function () {
        return /(?:i(?:Phone|P(?:o|a)d))/.test(userAgent);
    };
    var iOSVersion = function() {
        return parseFloat( 
            ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
            .replace('undefined', '3_2').replace('_', '.').replace('_', '') ) || false;
    };
    var isChrome = function() {
    // Opera (OPR) also identifies itself as Chrome and has to be corrected for.
    // OPR is used on Android but on iOS it is OPiOS where Opera does NOT identify as Chrome. Go figure!
    // Probably because on iOS it is Opera Mini and has all browser have to be based on Safari/WebKit.
        return /Chrome/.test(userAgent) && !/OPR/.test(userAgent);
    };

    function openWithAppStore(storeURI) {
        timers.push(window.setTimeout(function () {
            //alert('Launching App Store: ' + storeURI);
            document.location.href = storeURI;
        }, 1000));
    }

    function openWithiOSStrategy(deeplink, storeURI) {
        document.getElementById('loader').src = deeplink;
        openWithAppStore(storeURI);
    }

    function openWithiOS9Strategy(deeplink, storeURI) {
        openWithAppStore(storeURI);
        document.location.href = deeplink;
        //alert("Test");
    }

    function openWithAndroidStrategy(deeplink, storeURI) {
        document.location.href = deeplink;
        openWithAppStore(storeURI);
    }

    function openWithDesktopStrategy(deeplink) {
        document.location.href = deeplink;
    }

    return {
        // Stop any running timers.
        clearTimers: function () {
            console.log("Clearing timers: [" + timers.join(', ') + ']');
            timers.map(clearTimeout);
            timers = [];
        },
        openApp: function (deeplink, storeURI) {

            if (isIOS() && iOSVersion() < 9.0) {
                openWithiOSStrategy(deeplink, storeURI);
            } else if (isIOS()) {
                openWithiOS9Strategy(deeplink, storeURI);
            } else if (isAndroid()) {
                openWithAndroidStrategy(deeplink, storeURI);
            } else {
                openWithDesktopStrategy(deeplink);
            }

        },
        // Try to launch the native app on iOS/Android. Redirect to the app store if launch fails.
        init: function () {
            var launcher = this;
            var events = ["pagehide", "blur"];
            if (isIOS() || (isAndroid() && !isChrome())) {
              events.push("beforeunload");
            }
            console.log("Listening window events: " + events.join(", "));
            $(window).on(events.join(" "), function (e) {
              console.log("Window event: " + e.type);
              launcher.clearTimers();
            });
        }
    };
})();
