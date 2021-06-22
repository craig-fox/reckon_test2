const http = require('http')
const fetch = require('node-fetch');
const axios = require('axios')
const hostname = 'localhost'
const port = 9999
const textEndpoint =  "https://join.reckon.com/test2/textToSearch";
const subTextsEndpoint = "https://join.reckon.com/test2/subTexts";
const submitEndpoint = " https://join.reckon.com/test2/submitResults";
const app = http.createServer((req, res) => {});

async function retry(endpoint, n=10) {
    for (let i = 0; i < n; i++) {
        try {
            return await fetch(endpoint);
        } catch {}
    }

    throw new Error(`Failed retrying ${n} times`);
}

function findMatchResults(text, subTexts) {
    let textToSearch = text.toLowerCase();
    let matchResults = [];
    subTexts.forEach(sub => {
        const subText = sub.toLowerCase();
        const subTextLength = subText.length;
        let matchIndexes = [];
        for(let i=0; i <= textToSearch.length - subTextLength; i++) {
            let slice = textToSearch.slice(i, i+subTextLength);
            const matches = slice === subText;
            if(matches) {
                matchIndexes.push(i);
            }
        }
        let match = Object.create({});
        match['subtext'] = sub;
        match['result'] = matchIndexes.length > 0 ? matchIndexes.join() : "<No Output>";
        matchResults.push(match);
    })
    return matchResults;
}

(async function() {
    await app.listen(port, hostname, () => {
        console.log(`Running at http://${hostname}:${port}/`)
    });
    const resText = await retry(textEndpoint);
    const resSubTexts = await retry(subTextsEndpoint);
    const textJson = await resText.json()
    const subTextsJson = await resSubTexts.json();
    const textToParse = textJson["text"];
    const subTexts = subTextsJson["subTexts"];
    let results = findMatchResults(textToParse, subTexts)
    console.log(results);
    let response = Object.create({});
    response['candidate'] = "Craig Fox";
    response['text'] = textToParse;
    response['results'] = results;

    axios
        .post(submitEndpoint, response)
        .then(res => {
            console.log(`status: ${res.statusText}`)
        })
        .catch(error => {
            console.error(error)
        })

})()