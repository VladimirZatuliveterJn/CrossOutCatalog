
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

    item = findObjectByName(jsonData, itemName)
    
    if (item === null || item === undefined)
        throw new Error(`Object '${itemName}' is not found in the file '${fileName}'.`)
    
    console.log('findObjectByName returned itemName = ', itemName, ', object =', item)

    item.iron = item.iron ?? 0
    item.cuprum = item.cuprum ?? 0
    item.plastic = item.plastic ?? 0
    item.wire = item.wire ?? 0
    item.shell = item.shell ?? 0
    item.battery = item.battery ?? 0

    if (item.dependency === undefined)
    {
        return item
    }

    for (const dependency of item.dependency)
    {
        console.log("dependecny:", dependency)
        
        // example: "common/cabin/eger"
        let parts = dependency.split('/'); // Split the string by '/'
        objectName = parts.pop(); // Remove the last element from the array
        
        childFileName = parts.join('/') + '.json'
        
        child = await getItemWithChilds(childFileName, objectName)

        item.iron += child.iron ?? 0
        item.cuprum += child.cuprum ?? 0
        item.plastic += child.plastic ?? 0
        item.wire += child.wire ?? 0
        item.shell += child.shell ?? 0
        item.battery += child.battery ?? 0
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

async function onSelect() {
    var cards = document.getElementById("cards");
    cards.innerHTML = "";
    
    rarity = getSelectedValue("rarity")
    moduleType = getSelectedValue("moduleType")
    
    dataFileName = `${rarity}/${moduleType}.json`

    json = await getData(dataFileName)

    console.log(dataFileName)

    for (const item of json) {
        img = `./img/${rarity}/${moduleType}/${item.name}.webp`
        
        console.log(item.name)

        fullItem = await getItemWithChilds(dataFileName, item.name)

        console.log('getItemWithChilds dataFileName = ', dataFileName, ', itemName = ', item.name, ', fullItem =', fullItem)

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
                        <li>Гильзы: ${fullItem.shell}</li>

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
