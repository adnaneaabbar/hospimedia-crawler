const {
    loadPage, getTotalPages,
    getContactList, getContactPanel, getContactId,
    getFullName, getOccupation, getPhoneNumber, getEmailAddress,
    isValid
} = require("./helpers/helpers")
const fs = require("fs")
const converter = require("json-2-csv");
const sleep = require("util").promisify(setTimeout);

let main = async () => {
    console.log("Script started..")

    let $ = await loadPage({pageNumber: 1})
    let totalPages = getTotalPages($)
    let data = []
    
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        console.log(`Page: ${pageNumber}/${totalPages}...`)

        try {
            let $ = await loadPage({pageNumber})
            let contactList = getContactList($)

            for(let contact of contactList) {
                let name = getFullName($, contact)
                let {work, company, address} = getOccupation($, contact)
                let phone = getPhoneNumber($, contact)
                let email = getEmailAddress($, contact)
                let contactId = getContactId($, contact)
                let contactData = {name, work, company, address, phone, email, contactId}
                data.push({...contactData, "isValid": isValid(contactData)})
            }
        } catch (error) {
            console.log(`Issue on page: ${pageNumber}/${totalPages}...`)
            continue
        }
        
        await sleep(3000)
    }

    console.log(`Collected data length: ${data.length}...`)

    let count = 1
    for (let contact of data) {
        console.log(`Processed contacts: ${count++}/${data.length}...`)
        try {
            if (contact.isValid) continue
            let contactId = contact.contactId
            let $ = await loadPage({contactId})
            let contactPanel = getContactPanel($)
            let {work, company, address} = getOccupation($, contactPanel)
            contact.work = work
            contact.company = company
            contact.address = address
            contact.phone = getPhoneNumber($, contactPanel)
            contact.email = getEmailAddress($, contactPanel)
        } catch (error) {
            console.log(`Issue on contact: ${contact.contactId}...`)
            continue
        }

        if (count % 50 == 0) await sleep(2000)
    }

    data = data.map(contact => {
        return {
            "Nom": contact.name,
            "Fonction": contact.work,
            "Societe": contact.company,
            "Adresse": contact.address,
            "Telephone": contact.phone,
            "Email": contact.email
        }
    })

    let csv = await converter.json2csvAsync(data);
    fs.writeFile(`./data/hospimedia.csv`, csv, function (err) {
      if (err) throw err;
    });
}

main()