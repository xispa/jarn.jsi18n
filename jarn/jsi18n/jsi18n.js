define(
    'jarn.jsi18n',
    ['jquery'],
    function($){
        
        var i18njs = {
    
            storage: null,
            catalogs: {},
            currentLanguage: null,
            ttl: 24 * 3600 * 1000,
    
            init: function () {
                // Internet Explorer 8 does not know Date.now() which is used in e.g. loadCatalog, so we "define" it
                if (!Date.now) {
                    Date.now = function() {
                        return new Date().valueOf();
                    }
                }
                
                i18njs.currentLanguage = $('html').attr('lang');
                try {
                    if ('localStorage' in window && window.localStorage !== null && 'JSON' in window && window.JSON !== null) {
                        i18njs.storage = localStorage;
                    }
                } catch (e) {}
            },
    
            setTTL: function (millis) {
                i18njs.ttl = millis;
            },
    
            _setCatalog: function (domain, language, catalog) {
                if (domain in i18njs.catalogs) {
                    i18njs.catalogs[domain][language] = catalog;
                } else {
                    i18njs.catalogs[domain] = {};
                    i18njs.catalogs[domain][language] = catalog;
                }
            },
    
            _storeCatalog: function (domain, language, catalog) {
                var key = domain + '-' + language;
                if (i18njs.storage !== null &&
                    catalog !== null) {
                    i18njs.storage.setItem(key, JSON.stringify(catalog));
                    i18njs.storage.setItem(key + '-updated', Date.now());
                }
            },
    
            loadCatalog: function (domain, language) {
                if (typeof (language) === 'undefined') {
                    language = i18njs.currentLanguage;
                }
                if (i18njs.storage !== null) {
                    var key = domain + '-' + language;
                    if (key in i18njs.storage) {
                        if ((Date.now() - parseInt(i18njs.storage.getItem(key + '-updated'), 10)) < i18njs.ttl) {
                            var catalog = JSON.parse(i18njs.storage.getItem(key));
                            i18njs._setCatalog(domain, language, catalog);
                            return;
                        }
                    }
                }
                var url = window.location.href.split("?")[0];
                if(url.slice(-1) == '/'){
                    url = url.substr(0, url.length -1);
                }
                $.getJSON(url + '/jsi18n?' +
                    'domain=' + domain + '&language=' + language,
                    function (catalog) {
                        if (catalog === null) {
                            return;
                        }
                        i18njs._setCatalog(domain, language, catalog);
                        i18njs._storeCatalog(domain, language, catalog);
                    });
            },
    
            MessageFactory: function (domain, language) {
                language = language || i18njs.currentLanguage;
    
                return function translate (msgid, keywords) {
                    var msgstr;
                    if ((domain in i18njs.catalogs) && (language in i18njs.catalogs[domain]) && (msgid in i18njs.catalogs[domain][language])) {
                        msgstr = i18njs.catalogs[domain][language][msgid];
                    } else {
                        msgstr = msgid;
                    }
                    if (keywords) {
                        var regexp, keyword;
                        for (keyword in keywords) {
                            if (keywords.hasOwnProperty(keyword)) {
                                regexp = RegExp("\\$\\{" + keyword + '\\}', 'g');
                                msgstr = msgstr.replace(regexp, keywords[keyword]);
                            }
                        }
                    }
                    return msgstr;
                };
            }
        };
    
        i18njs.init();
        
        return i18njs;
    
});