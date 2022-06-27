const cheerio = require("cheerio")
const { first } = require("cheerio/lib/api/traversing")
const request = require("requestretry").defaults({jar: true, fullResponse: false})

let token = "Q-TVbuLlfr5Dv3B_4sykrA"
let loadPage = async (params) => {
    let {pageNumber, contactId} = params
    let url = ""
    if (pageNumber) {
        url = `https://app.nominations.hospimedia.fr/advanced-searches/results/page/${pageNumber}/per-page/50?alerts%5Bdepartments%5D%5B%5D=21-75&alerts%5Bdepartments%5D%5B%5D=21-77&alerts%5Bdepartments%5D%5B%5D=21-78&alerts%5Bdepartments%5D%5B%5D=21-91&alerts%5Bdepartments%5D%5B%5D=21-92&alerts%5Bdepartments%5D%5B%5D=21-93&alerts%5Bdepartments%5D%5B%5D=21-94&alerts%5Bdepartments%5D%5B%5D=21-95&alerts%5Bentity_types%5D%5B%5D=chr&alerts%5Bentity_types%5D%5B%5D=private_group&alerts%5Bentity_types%5D%5B%5D=ght&alerts%5Bentity_types%5D%5B%5D=ars&alerts%5Bentity_types%5D%5B%5D=f_1104&alerts%5Bentity_types%5D%5B%5D=f_1103_1111&alerts%5Bentity_types%5D%5B%5D=f_2205&alerts%5Bentity_types%5D%5B%5D=f_1107_1109&alerts%5Bentity_types%5D%5B%5D=f_4301&alerts%5Bentity_types%5D%5B%5D=f_4401&alerts%5Bentity_types%5D%5B%5D=f_4101_4105&alerts%5Bentity_types%5D%5B%5D=f_4604&alerts%5Bentity_types%5D%5B%5D=others&alerts%5Bgroups%5D%5B%5D=sanitary&alerts%5Bgroups%5D%5B%5D=medico_social&alerts%5Brange_bed_options%5D%5Bvalue_from%5D=0&alerts%5Brange_bed_options%5D%5Bvalue_to%5D=2000&alerts%5Brange_employee_options%5D%5Bvalue_from%5D=0&alerts%5Brange_employee_options%5D%5Bvalue_to%5D=10000&alerts%5Bsectors%5D%5B%5D=104-0&alerts%5Bsectors%5D%5B%5D=104-1&alerts%5Bsectors%5D%5B%5D=104-2&alerts%5Bsimplified_positions%5D%5B%5D=24-3&alerts%5Bsimplified_positions%5D%5B%5D=24-15&alerts%5Bsimplified_positions%5D%5B%5D=24-1&alerts%5Bsimplified_positions%5D%5B%5D=24-18&alerts%5Bsimplified_positions%5D%5B%5D=24-5&alerts%5Bsimplified_positions%5D%5B%5D=24-8&alerts%5Bsimplified_positions%5D%5B%5D=24-12&button=&utf8=%E2%9C%93`
    }

    if (contactId) {
        url = `https://app.nominations.hospimedia.fr/people/${contactId}`
    }

    const cj = request.jar()
    cj.setCookie(request.cookie(`remember_token=${token}`), url)
    let html = await request.get(url, {jar: cj})

    return cheerio.load(html)
}

let getTotalPages = (cheerioObject) => {
    return Math.ceil(Number.parseInt(cheerioObject(".fh-title-page.fh-search").parent().text().trim().split(' ')[0]) / 50)
}

let getContactList = (cheerioObject) => {
    return cheerioObject("#search-results").children()
}

let getContactPanel = (cheerioObject) => {
    return cheerioObject(".panel-avatar")
}

let getContactId = (cheerioObject, contact) => {
    return cheerioObject(contact).find("div > div > form").attr("id")
}

let getFullName = (cheerioObject, contact) => {
    return cheerioObject(contact).find("h3 > a").text().trim()
}

let getOccupation = (cheerioObject, contact) => {
    let content = cheerioObject(contact).children(".panel-avatar--content")
    let work = cheerioObject(content).find("p > b").first().text().trim()
    let company = cheerioObject(content).find(".text-medium > a").first().text().trim()
    let address = cheerioObject(content).find(".text-medium").first().text().replace(company, '').replace(" -", '').trim()

    return {work, company, address}
}

let getPhoneNumber = (cheerioObject, contact) => {
    return cheerioObject(contact).find(".fas.fa-phone").first().parent().text().trim()
}

let getEmailAddress = (cheerioObject, contact) => {
    return cheerioObject(contact).find(".fas.fa-at").first().parent().text().trim()
}

let isValid = (data) => {
    return !(data.work === "" || data.company === "" || data.address === "" || data.phone === "" || data.email === "")
}

module.exports = {
    loadPage, getTotalPages,
    getContactList, getContactPanel, getContactId,
    getFullName, getOccupation, getPhoneNumber, getEmailAddress,
    isValid
}