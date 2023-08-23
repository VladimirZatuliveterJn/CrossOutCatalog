
async function getData(filePath)
{
    const response = await fetch(`./data/${filePath}`);
    return await response.json();
}

function getSelectedValue(selectId) {
    var rarity = document.getElementById(selectId);
    var selectedIndex = rarity.selectedIndex
    var selectedValue = rarity.options[selectedIndex].value
    return selectedValue
}

async function getItemWithChilds(fileName, itemName) {
    
    jsonData = await getData(fileName)
    
    if (jsonData === undefined)
        throw new Error(`File is not found '${fileName}'.`)

    originalItem = findObjectByName(jsonData, itemName)
    
    if (originalItem === null || originalItem === undefined)
        throw new Error(`Object '${itemName}' is not found in the file '${fileName}'.`)
    
    //console.log('findObjectByName returned itemName = ', itemName, ', object =', item)
    const item = { ...originalItem }; // Create a new object to store the accumulated values
    
    item.iron = item.iron ?? 0
    item.cuprum = item.cuprum ?? 0
    item.plastic = item.plastic ?? 0
    item.wire = item.wire ?? 0
    item.shell = item.shell ?? 0
    item.battery = item.battery ?? 0
    item.electronic = item.electronic ?? 0
    item.uran = item.uran ?? 0

    if (item.dependency === undefined)
    {
        return item
    }

    for (const dep of item.dependency)
    {
        console.log("dependecny:", dep)
        
        // example: "common/cabin/eger"
        let parts = dep.split('/'); // Split the string by '/'
        objectName = parts.pop(); // Remove the last element from the array
        
        childFileName = parts.join('/') + '.json'
        
        child = await getItemWithChilds(childFileName, objectName)

        item.iron += child.iron ?? 0
        item.cuprum += child.cuprum ?? 0
        item.plastic += child.plastic ?? 0
        item.wire += child.wire ?? 0
        item.shell += child.shell ?? 0
        item.battery += child.battery ?? 0
        item.electronic += child.electronic ?? 0
        item.uran += child.uran ?? 0
    }

    return item
}


function findObjectByName(data, name) {
    for (const obj of data) {
        if (obj.name === name) {
            return obj;
        }
    }
    return null; // If the object is not found, return null
}

function getPrices() {
    return {
        iron: 4.0,
        cuprum: 3.5,
        plastic: 32.0,
        wire: 12.0,
        battery: 20.5,
        electronic: 40.0,
        uran: 4550.0,
        shell: 8.5
    }
}

async function onSelect() {
    var cards = document.getElementById("cards");
    cards.innerHTML = "";
    
    rarity = getSelectedValue("rarity")
    moduleType = getSelectedValue("moduleType")
    
    dataFileName = `${rarity}/${moduleType}.json`

    json = await getData(dataFileName)

    console.log(dataFileName)
    
    prices = getPrices();

    for (const item of json) {
        img = `./img/${rarity}/${moduleType}/${item.name}.webp`
        
        console.log(item.name)

        fullItem = await getItemWithChilds(dataFileName, item.name)

        console.log('getItemWithChilds dataFileName = ', dataFileName, ', itemName = ', item.name, ', fullItem =', fullItem)

        gold = fullItem.iron * prices.iron / 100 
            + fullItem.cuprum * prices.cuprum / 100
            + fullItem.plastic / 100 * prices.plastic
            + fullItem.wire / 100 * prices.wire
            + fullItem.battery / 100 * prices.battery
            + fullItem.electronic / 100 * prices.electronic
            + fullItem.uran / 100 * prices.uran
            + fullItem.shell / 100 * prices.shell
    
        cardHtml = `
            <div class="card" style="width: 18rem;">
                <img src="${img}" class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${fullItem.displayName}</h5>
                <p class="card-text">
                    <p>Ресурсы:</p>
                    <ul>    
                        <li>Железо: ${fullItem.iron}</li>
                        <li>Медь: ${fullItem.cuprum}</li>
                        <li>Пластик: ${fullItem.plastic}</li>
                        <li>Провода: ${fullItem.wire}</li>
                        <li>Аккумуляторы: ${fullItem.battery}</li>
                        <li>Электроника: ${fullItem.electronic}</li>
                        <li>Уран: ${fullItem.uran}</li>
                        <li>Гильзы: ${fullItem.shell}</li>
                        <li>Примерно монет: ${gold.toFixed(2)}</li>
                        
                    </ul>
                    <p>Зависит от:</p>
                    <ul>   
                        ${fullItem.dependency?.map(e => `<li>${e}</li>`)?.join('')}                                               
                    </ul>                    
                </p>
            </div>
        `            
        cards.innerHTML += cardHtml
    }
}
