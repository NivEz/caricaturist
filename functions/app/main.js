const functions = require('firebase-functions');
const axios = require('axios');
const cheerio = require('cheerio');

const config = functions.config();

const url = 'https://www.calcalist.co.il/home/0,7340,L-3837,00.html';

// scraper
const getImageData = async () => {
    this.name = 'getImageData';
    try {
        const res = await axios.get(url);
        let $ = cheerio.load(res.data);
        let imgObj = $('img[class=Caricat-picture]')[0].attribs;
        return {
            imgUrl: imgObj.src,
            imgTitle: imgObj.title
        }
    } catch (error) {
        sendErrorMessage(`An error has occurred at ${this.name}`)
        functions.logger.error(`An error has occurred at ${this.name}`);
        functions.logger.error(error.response)
    }
}


// checks if the image is from today
const checkIfFromToday = (imgTitle) => {
    const re = /\d+\.\d+\.\d+/g;
    let imgDate = imgTitle.match(re);
    if (!imgDate || imgDate.length !== 1) {
        throw 'Invalid image date';
    }
    let imgDateArr = imgDate[0].split('.');
    // adds 0 before single digit in the day and month section (2021.6.9 => 2021.06.09)
    for (let i = 0; i < 1; i++) {
        if (imgDateArr[i].length === 1) {
            imgDateArr[i] = '0' + imgDateArr[i]
        }
    }
    // converts 21 to 2021
    if (imgDateArr[2].length === 2) {
        imgDateArr[2] = '20' + imgDateArr[2];
    }

    imgDate = imgDateArr.join('.');

    let today = new Date().getTime();
    today = new Intl.DateTimeFormat('he-IL').format(today);

    return imgDate === today; // true or false
}


// sending photo via telegram
const sendPhoto = async (imgUrl, caption) => {
    this.name = 'sendPhoto'
    try {
        await axios({
            method: "POST",
            url: `https://api.telegram.org/bot${config.telegram.token}/sendPhoto`,
            data: {
                chat_id: config.telegram.chat_id,
                photo: imgUrl,
                caption
            }
        });
    } catch (error) {
        sendErrorMessage(`An error has occurred at ${this.name}`)
        functions.logger.error(`An error has occurred at ${this.name}`);
        functions.logger.error(error.response)
    }
}


// telegram error message (only for me)
const sendErrorMessage = async (errorMessage) => {
    await axios({
        method: "POST",
        url: `https://api.telegram.org/bot${config.telegram.token}/sendMessage`,
        data: {
            chat_id: config.telegram.my_chat_id,
            text: errorMessage
        }
    })
}


exports.main = async () => {
    const {imgUrl, imgTitle} = await getImageData();
    if (checkIfFromToday(imgTitle)) {
        sendPhoto(imgUrl, imgTitle)
    }
}