const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

exports.randomSixDigit = () => {
    return Math.floor(100000 + Math.random() * 900000)
};

exports.replaceNullToBlankString = async (obj) => {
    await Object.keys(obj).forEach(key => {
        if (obj[key] == null) {
            obj[key] = "";
        }
    });
    return obj;
};

exports.encryptStringCrypt = async (string_value) => {
    let encryptedString = cryptr.encrypt(string_value);
    return encryptedString;
};

exports.CryptrdecryptStringCrypt = async (string_value) => {
    let decryptedString = cryptr.decrypt(string_value);
    return decryptedString;
};

exports.matchPassword = async (password, encryptedPassword) => {
    let decryptedString = cryptr.decrypt(encryptedPassword);
    return decryptedString === password;
};

exports.netHourlyPay = async (gross_pay, hours_worked, mileage) => {
    let hours = hours_worked == 0 ? 1 : hours_worked
    console.log("netHourlyPay hours : ", hours)
    const mileageDet = (0.585 * mileage)
    const netHourlyPay = (gross_pay - mileageDet) / hours
    return netHourlyPay;
}

exports.futureHourlyPay = async (gross_pay, hours_worked, mileage, currentHourly) => {
    let hours = hours_worked == 0 ? 1 : hours_worked
    console.log("futureHourlyPay hours : ", hours)
    const mileageDet = (0.585 * mileage)
    const netHourlyPay = (gross_pay - mileageDet) / hours
    const Total = (netHourlyPay + currentHourly) / 2;
    return Total

}


exports.previousTenDays = async () => {

    var result = [];
    for (var i = 0; i < 10; i++) {
        var d = new Date();
        d.setDate(d.getDate() - 10);
        d.setDate(d.getDate() + i);
        result.push(formatDate(d))
    }
    return result;
};

function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }
    date = yyyy + '-' + mm + '-' + dd;

    return {
        date: date,
        count: 0
    }
}

