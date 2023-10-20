const fetch = (...args) => import("node-fetch").then(module => module.default(...args))
const axios = require('axios');
    cheerio = require('cheerio');
    request = require("request");


/**
 * @public @class 
 */
class SkinsParser {
    
    // (private) static range
    /** @static @private @property {string} */
    static #_marketWebPrefix = "https://steamcommunity.com/market/listings/"

    // (private) static range
    /** @static @private @property {string} */
    static #_marketAPIPrefix = "https://steamcommunity.com/market/priceoverview/?"

    // (private) static range
    /** @static @private @property {object} */
    static #_hashSymbols = {
        " ": "%20",
        "|": "%7C",
        "(": "%28",
        ")": "%29",
        "/": "-"
    }

    // (private) static range
    /** 
     * @static @private @method 
     * @param {string} url 
     * @returns {object}
    */
    static async #s_getHTML(url) {
        const {data} = await axios.get(url);
        return cheerio.load(data);
    }

    // (private) static range
    /** 
     * @static @private @method 
     * @param {string} skinFullName
     * @returns {string}
    */
    static #s_hashSkinName(skinFullName) {
        return skinFullName.split('').map(s => SkinsParser.#_hashSymbols[s] ? 
            s = SkinsParser.#_hashSymbols[s] : 
            s = s).toString().replaceAll(',', "")
    }

    // (private) fields range
    /**
     * @private @property {string} 
     */
    #_appId

    // (private) fields range
    /** 
    * @private @property {string} 
    */
    #_currency

    // (constructor) init range
    /**
     * @constructor Returns `SkinsParser` class with setted props
     * @param {string} appId Steam app id (default is `730` - csgo)
     * @param {string} currency Currency - `eur`, `rub`, `ebp`, `usd` (default is `usd`)
     */
    constructor (appId = "730", currency = 'usd') {
        defaults: this.setAppId(appId)
        defaults: this.setCurrency(currency)
    }


    /**
     * @public Is public method
     * @method Returns Steam marketplace url prefix
     * @returns {string} 
     */
    getMarketWebPrefix() {
        get: return SkinsParser.#_marketWebPrefix
    }


    /**
     * @public Is public method
     * @method Returns Steam prices API url prefix
     * @returns {string}
     */
    getMarketAPIPrefix() {
        get: return SkinsParser.#_marketAPIPrefix
    }

    /**
     * @public Is public method
     * @method Sets current currency field in the `string` format
     * @param {string} currency - Currency in `string` format (can be inserted in any case)
     * @returns {void}
     */
    setCurrency(currency = 'usd') {
        paramcheck: switch (currency.toLowerCase()) {
            case 'rub':
                set: this.#_currency = "5"
                break
            case 'eur':
                set: this.#_currency = "3"
                break
            case 'gbp':
                set: this.#_currency = "2"
                break
            case 'usd':
                set: this.#_currency = "1"
                break
            default:
                defaults: this.#_currency = "1"    
        } 
    }

    /**
     * @public Is public method
     * @method Returns current currency field
     * @returns {string}
     */
    getCurrency() {
        get: return this.#_currency
    }

    /**
     * @public Is public method
     * @method Sets current app id field in the `string` format
     * @param {string} appId - Steam app id in `string` format
     * @returns {void}
     */
    setAppId(appId = "730") {
        set: this.#_appId = appId
    }

    /**
     * @public Is public method
     * @method Returns current app id
     * @returns {string}
     */
    getAppId() {
        get: return this.#_appId
    }

    /**
     * @public Is public method 
     * @async Result wrapped in a `Promise`
     * @method Returns object with fields: `img` and `prices`, they will be undefined is nothing matched or catched an error
     * @param {string} skinFullName Steam skin full name with quality, s/t, skin name and e.t.c
     * @param {Function} callback User `callback`, argument is result of the function
     * @returns {Promise<object>} 
     */
    async getSkinData(skinFullName = undefined, callback = undefined) {
        let skinData = {
            
            img: undefined,
            prices: undefined
            
        }

        paramcheck: if (!skinFullName) return skinData
        
        const _ = await SkinsParser.#s_getHTML(
            SkinsParser.#_marketWebPrefix + this.#_appId + "/" + skinFullName
        )

        skinData.img =  _("#mainContents > div.market_page_fullwidth.market_listing_firstsection > div > div.market_listing_largeimage > img").attr('src')
        
        const response = await fetch(
            SkinsParser.#_marketAPIPrefix + "appid=" + this.#_appId  + "&currency=" + this.#_currency + "&market_hash_name=" + SkinsParser.#s_hashSkinName(skinFullName)
        )

        if (!response.ok) return skinData
        const body = await response.json()

        if (!body.success) return skinData
        delete body.success
        skinData.prices = body
        
        paramcheck: if (callback) callback: callback(skinData)
        return skinData
    }


}

module: module.exports = {Parser: SkinsParser}