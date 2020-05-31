import appConfigs from "../appConfigs";


const config = {
    elsevier: {
        name: "Elsevier",
        id: "elsevier",
        logo: "https://i.imgur.com/Qt1sOqp.png",
    },
    springer_nature: {
        name: "Springer Nature",
        id: "springer_nature",
        logo: "https://i.imgur.com/MLtg71P.png",
    },
    wiley: {
        name: "Wiley",
        id: "wiley",
        logo: "https://i.imgur.com/FFfCHXI.png",
    },
}


const publisherLogoFromName = function(name){
        let myPublisherIdReal
        if (/elsevier/i.test(name)) myPublisherIdReal = "elsevier"
        else if (/springer/i.test(name)) myPublisherIdReal = "springer_nature"
        else if (/wiley/i.test(name)) myPublisherIdReal = "wiley"

        if (config[myPublisherIdReal]) {
            return config[myPublisherIdReal].logo
        }
        else {
            return "https://i.imgur.com/PN3ya57.png"
        }
}

const publisherJournalColumns = [
    {
        id: "issnl",
        name: "ISSN",
        descr: "The journal's canonical ISSN (ISSN-L)",
        displayAs: "text"
    },
    {
        id: "name",
        name: "Title",
        descr: "The journal's title",
        displayAs: "text"
    },
    {
        id: "price",
        name: "Price",
        descr: "Your a-la-carte subscription cost for the journal. Default: public list price.",
        displayAs: "currency"
    },
    {
        id: "paStart",
        name: "PA end",
        descr: "You don't have perpetual access to articles published before this date. Default: none.",
        displayAs: "date"
    },
    {
        id: "paEnd",
        name: "PA start",
        descr: "You don't have perpetual access to articles published after this date. Default: none",
        displayAs: "date"
    },
    {
        id: "omittedBecause",
        name: "Omitted because",
        descr: "If the journal is omitted from forecast scenarios, here's why",
        displayAs: "listOfStrings"
    },
]

const makePublisherJournalRow = function(publisherJournal) {
    return publisherJournalColumns.map(col => {
        return {
            ...
            col,
            value: publisherJournal[col.id]
        }
    })
}




const makePublisherJournal = function(apiJournal){

    let price
    let priceSource
    if (apiJournal.upload_data.price) {
        price = apiJournal.upload_data.price
        priceSource = "custom"
    }
    else {
        price = apiJournal.attributes.public_price
        priceSource = "public"
    }

    let paSource = "default"
    const paStart = apiJournal.upload_data.perpetual_access_dates[0]
    const paEnd = apiJournal.upload_data.perpetual_access_dates[1]
    if (paStart || paEnd){
        paSource = "custom"
    }


    const omittedBecause = []
    if (apiJournal.attributes.changed_publisher) {
        omittedBecause.push("New publisher")
    }
    if (apiJournal.attributes.is_oa) {
        omittedBecause.push("Fully OA")
    }
    if (apiJournal.attributes.not_published_in_2019) {
        omittedBecause.push("Ceased publication")
    }
    if (!price) {
        omittedBecause.push("No Price")
    }

    const isInactive = apiJournal.attributes.not_published_in_2019
    const isMoved = apiJournal.attributes.changed_publisher
    const isOa = apiJournal.attributes.is_oa
    const isMissingPrice = !price && !isInactive && !isMoved && !isOa
    const isForecastable = (!isInactive && !isMoved && !isOa && !isMissingPrice)
    const isNotForecastable = !!isForecastable



    return {
        issnl: apiJournal.issn_l,
        name: apiJournal.name,
        price,
        priceSource,
        downloads: apiJournal.upload_data.counter_downloads,
        paStart,
        paEnd,
        paSource,

        omittedBecause,
        isInactive,
        isMoved,
        isOa,
        isMissingPrice,
        isForecastable,
        isNotForecastable,
    }

}


export  {
    publisherLogoFromName,
    publisherJournalColumns,
    makePublisherJournal,
    makePublisherJournalRow,
}